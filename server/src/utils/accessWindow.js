export function currentAccessFilter(now = new Date()) {
  return {
    accessEndDate: { $gte: now },
    $or: [
      { accessStartDate: null },
      { accessStartDate: { $exists: false } },
      { accessStartDate: { $lte: now } },
    ],
  };
}

export function accessWindowFilter(start, end) {
  return {
    accessEndDate: { $gte: start },
    $or: [
      { accessStartDate: null },
      { accessStartDate: { $exists: false } },
      { accessStartDate: { $lt: end } },
    ],
  };
}
