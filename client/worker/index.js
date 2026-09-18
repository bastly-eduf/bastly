const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' 'unsafe-inline'; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.r2.cloudflarestorage.com; frame-src https://www.youtube.com https://www.youtube-nocookie.com; worker-src 'self' blob:; manifest-src 'self'; media-src 'self' https:; upgrade-insecure-requests",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security':
    'max-age=31536000; includeSubDomains',
};

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
};

const API_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
};

const PUBLIC_404_HEADERS = {
  'Cache-Control': 'public, max-age=0, must-revalidate',
  'X-Robots-Tag': 'noindex, nofollow',
};

const PRIVATE_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/check-email',
  '/invite/doctor',
  '/invite/parent',
]);

const PRIVATE_PREFIXES = [
  '/student',
  '/parent',
  '/doctor',
  '/admin',
];

function isPrivatePath(pathname) {
  if (PRIVATE_EXACT_PATHS.has(pathname)) {
    return true;
  }

  return PRIVATE_PREFIXES.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );
}

function isNavigationRequest(request) {
  const fetchMode = request.headers.get('Sec-Fetch-Mode');
  const accept = request.headers.get('Accept') || '';

  return (
    fetchMode === 'navigate' ||
    accept.includes('text/html')
  );
}

function copyResponseWithHeaders(response, extraHeaders = {}) {
  const headers = new Headers(response.headers);

  // Preserve multiple Set-Cookie values exactly when cloning an API response.
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [];

  if (setCookies.length) {
    headers.delete('Set-Cookie');
    for (const cookie of setCookies) {
      headers.append('Set-Cookie', cookie);
    }
  }

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }

  for (const [name, value] of Object.entries(extraHeaders)) {
    headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function configurationError() {
  return copyResponseWithHeaders(
    new Response(
      JSON.stringify({
        error: 'Frontend proxy is not configured.',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    ),
    API_HEADERS,
  );
}

async function proxyApi(request, env) {
  if (!env.BACKEND_URL) {
    return configurationError();
  }

  let backendOrigin;

  try {
    backendOrigin = new URL(env.BACKEND_URL).origin;
  } catch {
    return configurationError();
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    `${backendOrigin}/`,
  );
  const upstreamRequest = new Request(upstreamUrl, request);

  let upstreamResponse;

  try {
    upstreamResponse = await fetch(upstreamRequest, {
      cache: 'no-store',
    });
  } catch {
    return copyResponseWithHeaders(
      new Response(
        JSON.stringify({
          error: 'Upstream service unavailable.',
        }),
        {
          status: 502,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
        },
      ),
      API_HEADERS,
    );
  }

  return copyResponseWithHeaders(upstreamResponse, API_HEADERS);
}

async function privateShell(request, env) {
  const privateUrl = new URL('/private.html', request.url);
  const response = await env.ASSETS.fetch(privateUrl);
  return copyResponseWithHeaders(response, PRIVATE_HEADERS);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname === '/api' ||
      url.pathname.startsWith('/api/')
    ) {
      return proxyApi(request, env);
    }

    if (isPrivatePath(url.pathname)) {
      return privateShell(request, env);
    }

    // Preserve the previous Bastly behavior for unknown client-side routes:
    // navigation requests receive the private SPA shell and stay noindex.
    if (isNavigationRequest(request)) {
      return privateShell(request, env);
    }

    const response = await env.ASSETS.fetch(request);

    return copyResponseWithHeaders(
      response,
      response.status === 404 ? PUBLIC_404_HEADERS : {},
    );
  },
};
