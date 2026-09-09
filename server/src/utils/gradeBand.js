export function gradeBandFromPercentage(value) {
  const score = Number(value || 0);
  if (score >= 90) return 'Star';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  return 'C';
}
