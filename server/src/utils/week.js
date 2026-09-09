export function startOfWeekUtc(input = new Date()) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;

  const day = date.getUTCDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + distanceToMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function endOfWeekUtc(input = new Date()) {
  const start = startOfWeekUtc(input);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
}

export function parseWeekStart(value) {
  if (!value) return startOfWeekUtc(new Date());
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00.000Z`);
  return startOfWeekUtc(parsed);
}

export function toDateInputValue(date) {
  return new Date(date).toISOString().slice(0, 10);
}
