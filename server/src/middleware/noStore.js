export function noStore(req, res, next) {
  res.set(
    'Cache-Control',
    'private, no-store, max-age=0',
  );
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  return next();
}
