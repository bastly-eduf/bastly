const DEFAULT_WHATSAPP = '201000883609';
const DEFAULT_PHONE_DISPLAY = '01000883609';
const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/bastly.eduf/';

function digitsOnly(value, fallback) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits || fallback;
}

function safeInstagramUrl(value) {
  try {
    const url = new URL(value || DEFAULT_INSTAGRAM_URL);
    if (url.protocol !== 'https:' || !/(^|\.)instagram\.com$/i.test(url.hostname)) {
      return DEFAULT_INSTAGRAM_URL;
    }
    return url.toString();
  } catch {
    return DEFAULT_INSTAGRAM_URL;
  }
}

const whatsappNumber = digitsOnly(
  import.meta.env.VITE_BASTLY_WHATSAPP_NUMBER,
  DEFAULT_WHATSAPP,
);
const phoneDisplay =
  String(import.meta.env.VITE_BASTLY_PHONE_DISPLAY || '').trim() ||
  DEFAULT_PHONE_DISPLAY;
const instagramUrl = safeInstagramUrl(
  import.meta.env.VITE_BASTLY_INSTAGRAM_URL,
);
function deriveInstagramHandle(url) {
  try {
    const segment = new URL(url).pathname.split('/').filter(Boolean)[0];
    return segment ? `@${segment}` : 'Instagram';
  } catch {
    return 'Instagram';
  }
}

export const bastlyPublicConfig = Object.freeze({
  whatsappNumber,
  phoneDisplay,
  phoneE164: `+${whatsappNumber}`,
  phoneHref: `tel:+${whatsappNumber}`,
  instagramUrl,
  instagramHandle: deriveInstagramHandle(instagramUrl),
});

export function bastlyWhatsAppUrl(message = '') {
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${whatsappNumber}${query}`;
}
