export function upcomingJune30(from = new Date()) {
  const year = from.getFullYear();
  const june30ThisYear = new Date(Date.UTC(year, 5, 30, 23, 59, 59));

  if (from.getTime() <= june30ThisYear.getTime()) {
    return june30ThisYear;
  }

  return new Date(Date.UTC(year + 1, 5, 30, 23, 59, 59));
}

export function academicYearLabel(accessEndDate) {
  const end = new Date(accessEndDate);
  const endYear = end.getUTCFullYear();
  return `${endYear - 1}/${endYear}`;
}
