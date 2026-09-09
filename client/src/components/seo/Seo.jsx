import { useEffect } from 'react';

const DEFAULT_TITLE = 'Bastly Academy';
const DEFAULT_DESCRIPTION =
  'Bastly Academy — courses, expert instructors, quizzes, homework, attendance tracking, progress, and rewards in one student-friendly platform.';

function upsertMeta(name, content) {
  let element = document.head.querySelector(`meta[name="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

function upsertCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }

  link.setAttribute('href', url);
}

export default function Seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '/',
  noIndex = false,
}) {
  useEffect(() => {
    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (siteUrl) {
      upsertCanonical(new URL(canonicalPath, siteUrl).toString());
    }
  }, [title, description, canonicalPath, noIndex]);

  return null;
}
