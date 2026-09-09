const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeVideoId(value) {
  const input = String(value || '').trim();

  if (!input) return '';

  if (VIDEO_ID_PATTERN.test(input)) {
    return input;
  }

  let url;

  try {
    url = new URL(input);
  } catch {
    return '';
  }

  const hostname = url.hostname.replace(/^www\./, '').toLowerCase();

  let candidate = '';

  if (hostname === 'youtu.be') {
    candidate = url.pathname.split('/').filter(Boolean)[0] || '';
  } else if (
    hostname === 'youtube.com' ||
    hostname === 'm.youtube.com' ||
    hostname === 'music.youtube.com'
  ) {
    candidate = url.searchParams.get('v') || '';

    if (!candidate) {
      const parts = url.pathname.split('/').filter(Boolean);
      const markerIndex = parts.findIndex((part) =>
        ['embed', 'shorts', 'live'].includes(part),
      );

      if (markerIndex >= 0) {
        candidate = parts[markerIndex + 1] || '';
      }
    }
  }

  candidate = candidate.split(/[?&#]/)[0];

  return VIDEO_ID_PATTERN.test(candidate) ? candidate : '';
}

export function youtubeEmbedUrl(videoId) {
  if (!VIDEO_ID_PATTERN.test(String(videoId || ''))) {
    return '';
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}
