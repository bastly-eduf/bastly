import { useEffect } from 'react';

const DEFAULT_TITLE = 'Bastly Academy';
const DEFAULT_DESCRIPTION =
  'Bastly Academy — courses, expert instructors, quizzes, homework, attendance tracking, progress, and rewards in one student-friendly platform.';

function upsertMeta(selector, attribute, key, content) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function removeMeta(selector) {
  document.head.querySelector(selector)?.remove();
}

function upsertNamedMeta(name, content) {
  upsertMeta(
    `meta[name="${name}"]`,
    'name',
    name,
    content,
  );
}

function upsertPropertyMeta(property, content) {
  upsertMeta(
    `meta[property="${property}"]`,
    'property',
    property,
    content,
  );
}

function upsertCanonical(url) {
  let link = document.head.querySelector(
    'link[rel="canonical"]',
  );

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

function removeCanonical() {
  document.head
    .querySelector('link[rel="canonical"]')
    ?.remove();
}

function updateStructuredData(schema) {
  const existing = document.head.querySelector(
    'script[data-bastly-schema="true"]',
  );

  if (!schema) {
    existing?.remove();
    return;
  }

  const script =
    existing || document.createElement('script');

  script.type = 'application/ld+json';
  script.dataset.bastlySchema = 'true';
  script.textContent = JSON.stringify(schema);

  if (!existing) {
    document.head.appendChild(script);
  }
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  noIndex = false,
  image = '/brand/icon-512.png',
  type = 'website',
  schema = null,
}) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    const canonicalUrl =
      siteUrl && canonicalPath
        ? new URL(canonicalPath, siteUrl).toString()
        : '';

    const imageUrl =
      siteUrl && image
        ? new URL(image, siteUrl).toString()
        : image || '';

    document.title = title;

    upsertNamedMeta('description', description);
    upsertNamedMeta(
      'robots',
      noIndex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large',
    );

    upsertPropertyMeta('og:site_name', 'Bastly Academy');
    upsertPropertyMeta('og:title', title);
    upsertPropertyMeta('og:description', description);
    upsertPropertyMeta('og:type', type);

    upsertNamedMeta(
      'twitter:card',
      'summary_large_image',
    );
    upsertNamedMeta('twitter:title', title);
    upsertNamedMeta(
      'twitter:description',
      description,
    );

    if (canonicalUrl) {
      upsertCanonical(canonicalUrl);
      upsertPropertyMeta('og:url', canonicalUrl);
    } else {
      removeCanonical();
      removeMeta('meta[property="og:url"]');
    }

    if (imageUrl) {
      upsertPropertyMeta('og:image', imageUrl);
      upsertNamedMeta('twitter:image', imageUrl);
    } else {
      removeMeta('meta[property="og:image"]');
      removeMeta('meta[name="twitter:image"]');
    }

    updateStructuredData(schema);
  }, [
    title,
    description,
    canonicalPath,
    noIndex,
    image,
    type,
    schema,
  ]);

  return null;
}
