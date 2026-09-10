import fs from 'node:fs/promises';
import path from 'node:path';

const cwd = process.cwd();
const distDir = path.join(cwd, 'dist');
const baseHtmlPath = path.join(distDir, 'index.html');

function parseEnv(text) {
  const values = {};

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) continue;

    const match = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/,
    );

    if (!match) continue;

    let value = match[2].trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[match[1]] = value;
  }

  return values;
}

async function loadBuildEnv() {
  const filenames = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
  ];

  const loaded = {};

  for (const filename of filenames) {
    try {
      const content = await fs.readFile(
        path.join(cwd, filename),
        'utf8',
      );
      Object.assign(loaded, parseEnv(content));
    } catch {
      // Optional env file.
    }
  }

  return {
    ...loaded,
    ...process.env,
  };
}

function normalizeUrl(value) {
  if (!value) return '';

  try {
    const url = new URL(value);
    return url.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeScriptJson(value) {
  return JSON.stringify(value).replaceAll(
    '</script>',
    '<\\/script>',
  );
}

function absoluteUrl(siteUrl, value) {
  if (!value) return '';

  try {
    return new URL(value, `${siteUrl}/`).toString();
  } catch {
    return value;
  }
}

function routeUrl(siteUrl, routePath) {
  return new URL(
    routePath || '/',
    `${siteUrl}/`,
  ).toString();
}

function stripExistingSeo(html) {
  return html
    .replace(
      /<link[^>]+rel=["']canonical["'][^>]*>\s*/gi,
      '',
    )
    .replace(
      /<meta[^>]+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|robots)["'][^>]*>\s*/gi,
      '',
    )
    .replace(
      /<script[^>]+data-bastly-schema=["']true["'][^>]*>[\s\S]*?<\/script>\s*/gi,
      '',
    );
}

function createRouteHtml(
  baseHtml,
  {
    title,
    description,
    canonical,
    image,
    type = 'website',
    noIndex = false,
    schema = null,
  },
) {
  let html = stripExistingSeo(baseHtml);

  html = html.replace(
    /<title>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(title)}</title>`,
  );

  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(
      description,
    )}" />`,
  );

  const tags = [
    `<meta name="robots" content="${
      noIndex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large'
    }" />`,
    '<meta property="og:site_name" content="Bastly Academy" />',
    `<meta property="og:title" content="${escapeHtml(
      title,
    )}" />`,
    `<meta property="og:description" content="${escapeHtml(
      description,
    )}" />`,
    `<meta property="og:type" content="${escapeHtml(
      type,
    )}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(
      title,
    )}" />`,
    `<meta name="twitter:description" content="${escapeHtml(
      description,
    )}" />`,
  ];

  if (canonical) {
    tags.push(
      `<link rel="canonical" href="${escapeHtml(
        canonical,
      )}" />`,
      `<meta property="og:url" content="${escapeHtml(
        canonical,
      )}" />`,
    );
  }

  if (image) {
    tags.push(
      `<meta property="og:image" content="${escapeHtml(
        image,
      )}" />`,
      `<meta name="twitter:image" content="${escapeHtml(
        image,
      )}" />`,
    );
  }

  if (schema) {
    tags.push(
      `<script type="application/ld+json" data-bastly-schema="true">${escapeScriptJson(
        schema,
      )}</script>`,
    );
  }

  return html.replace(
    '</head>',
    `    ${tags.join('\n    ')}\n  </head>`,
  );
}

async function writeRoute(routePath, html) {
  if (routePath === '/') {
    await fs.writeFile(baseHtmlPath, html, 'utf8');
    return;
  }

  const directory = path.join(
    distDir,
    routePath.replace(/^\/+|\/+$/g, ''),
  );

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(
    path.join(directory, 'index.html'),
    html,
    'utf8',
  );
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function sitemapXml(siteUrl, routes) {
  const urls = routes.map((route) => {
    const loc = routeUrl(siteUrl, route.path);
    const lastmod = route.lastmod
      ? `<lastmod>${xmlEscape(route.lastmod)}</lastmod>`
      : '';

    return `  <url><loc>${xmlEscape(
      loc,
    )}</loc>${lastmod}</url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

const env = await loadBuildEnv();
const vercelProductionUrl =
  env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '';

const siteUrl = normalizeUrl(
  env.VITE_SITE_URL || vercelProductionUrl,
);

const backendUrl = normalizeUrl(
  env.BACKEND_URL,
);

const apiUrl = normalizeUrl(
  env.SEO_API_URL ||
    (backendUrl
      ? `${backendUrl}/api`
      : env.VITE_API_URL),
);

const isVercelPreview =
  Boolean(env.VERCEL_ENV) &&
  env.VERCEL_ENV !== 'production';

const indexable =
  Boolean(siteUrl) &&
  !isVercelPreview &&
  !/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(
    siteUrl,
  );

const strictDynamicSeo =
  env.SEO_STRICT === 'true' ||
  env.VERCEL_ENV === 'production';

if (strictDynamicSeo && !apiUrl) {
  throw new Error(
    '[Bastly SEO] Production build needs BACKEND_URL or SEO_API_URL so published Doctor/Course routes can be discovered.',
  );
}

const originalBaseHtml = await fs.readFile(
  baseHtmlPath,
  'utf8',
);

const fixedRoutes = [
  {
    path: '/',
    title:
      'Bastly Academy | Study Smarter. Aim Higher.',
    description:
      'Explore Bastly Academy courses, meet expert instructors, learn through lessons and quizzes, track progress, and earn Bastly rewards.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Bastly Academy',
      ...(siteUrl ? { url: `${siteUrl}/` } : {}),
    },
  },
  {
    path: '/courses',
    title:
      'Bastly Academy Courses | IGCSE & School Learning',
    description:
      'Explore published Bastly Academy courses by subject, level and instructor. View course details and enroll directly through WhatsApp.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Bastly Academy Courses',
    },
  },
  {
    path: '/doctors',
    title:
      'Bastly Academy Instructors | Meet the Teaching Team',
    description:
      'Meet Bastly Academy instructors across Biology, Chemistry, Physics, ICT, Mathematics, English, Business, Psychology and more.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Bastly Academy Instructors',
    },
  },
  {
    path: '/about',
    title:
      'About Bastly Academy | One Smarter Learning Experience',
    description:
      'Learn how Bastly Academy connects lessons, assessments, attendance, parent visibility, weekly performance, and rewards in one student-focused platform.',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Bastly Academy',
    },
  },
  {
    path: '/faq',
    title:
      'Bastly Academy FAQ | Enrollment, Learning & Rewards',
    description:
      'Answers about Bastly enrollment, course access, quizzes, homework, attendance, weekly performance, parent accounts, video lessons, and Bastly Spin rewards.',
  },
  {
    path: '/contact',
    title:
      'Contact Bastly Academy | Enrollment & Course Help',
    description:
      'Contact Bastly Academy through WhatsApp, phone, or Instagram for course enrollment, prices, group availability, payment, and account support.',
  },
];

const publicRoutes = [...fixedRoutes];

if (apiUrl) {
  try {
    const [doctorResponse, courseResponse] =
      await Promise.all([
        fetchJson(`${apiUrl}/public/doctors`),
        fetchJson(`${apiUrl}/public/courses`),
      ]);

    for (const doctor of doctorResponse.doctors || []) {
      publicRoutes.push({
        path: `/doctors/${doctor.slug}`,
        title: `${doctor.displayName} | Bastly Academy`,
        description:
          doctor.bio ||
          `Learn with ${doctor.displayName}, ${doctor.subject} instructor at Bastly Academy. Explore their profile and published courses.`,
        image: doctor.imageUrl || '/brand/icon-512.png',
        type: 'profile',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: doctor.displayName,
          jobTitle: `${doctor.subject} Instructor`,
          description:
            doctor.bio ||
            `${doctor.displayName} teaches ${doctor.subject} at Bastly Academy.`,
          worksFor: {
            '@type': 'EducationalOrganization',
            name: 'Bastly Academy',
          },
        },
      });
    }

    for (const course of courseResponse.courses || []) {
      publicRoutes.push({
        path: `/courses/${course.slug}`,
        title: `${course.title} | Bastly Academy`,
        description:
          course.description ||
          `Study ${course.title} with ${course.doctorProfile?.displayName || 'Bastly Academy'}. View course details and enroll through WhatsApp.`,
        image:
          course.doctorProfile?.imageUrl ||
          '/brand/icon-512.png',
        schema: {
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: course.title,
          description:
            course.description ||
            `${course.title} at Bastly Academy.`,
          provider: {
            '@type': 'EducationalOrganization',
            name: 'Bastly Academy',
          },
          instructor: {
            '@type': 'Person',
            name: course.doctorProfile?.displayName,
          },
          educationalLevel: course.level,
          ...(course.priceConfirmed
            ? {
                offers: {
                  '@type': 'Offer',
                  price: course.price,
                  priceCurrency:
                    course.currency || 'EGP',
                  availability:
                    'https://schema.org/InStock',
                },
              }
            : {}),
        },
      });
    }
  } catch (error) {
    const message =
      `[Bastly SEO] Public API was not reachable during build: ${error.message}`;

    if (strictDynamicSeo) {
      throw new Error(message);
    }

    console.warn(
      `${message}. Dynamic doctor/course HTML shells were skipped.`,
    );
  }
}

const uniqueRoutes = [
  ...new Map(
    publicRoutes.map((route) => [route.path, route]),
  ).values(),
];

for (const route of uniqueRoutes) {
  const canonical = siteUrl
    ? routeUrl(siteUrl, route.path)
    : '';

  const image =
    siteUrl && route.image
      ? absoluteUrl(siteUrl, route.image)
      : '';

  const html = createRouteHtml(originalBaseHtml, {
    title: route.title,
    description: route.description,
    canonical,
    image,
    type: route.type || 'website',
    noIndex: !indexable,
    schema: route.schema || null,
  });

  await writeRoute(route.path, html);
}

const privateHtml = createRouteHtml(
  originalBaseHtml,
  {
    title: 'Bastly Academy',
    description:
      'Private Bastly account area.',
    canonical: '',
    image: '',
    type: 'website',
    noIndex: true,
    schema: null,
  },
);

await fs.writeFile(
  path.join(distDir, 'private.html'),
  privateHtml,
  'utf8',
);

const robots = indexable
  ? `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`
  : `User-agent: *
Disallow: /
`;

await fs.writeFile(
  path.join(distDir, 'robots.txt'),
  robots,
  'utf8',
);

const sitemap = indexable
  ? sitemapXml(
      siteUrl,
      uniqueRoutes.map((route) => ({
        path: route.path,
      })),
    )
  : `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>
`;

await fs.writeFile(
  path.join(distDir, 'sitemap.xml'),
  sitemap,
  'utf8',
);

console.log(
  `[Bastly SEO] Generated ${uniqueRoutes.length} public route HTML shell(s), private.html, robots.txt, and sitemap.xml.`,
);

if (!indexable) {
  console.warn(
    '[Bastly SEO] This build is intentionally noindex because it is local, missing a canonical site URL, or a Vercel preview build.',
  );
}
