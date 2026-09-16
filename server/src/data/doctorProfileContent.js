function unique(values = []) {
  return [
    ...new Set(
      values
        .map((value) => String(value || '').trim())
        .filter(Boolean),
    ),
  ];
}

export function doctorEditorialFields(doctor) {
  const bio = String(doctor?.bio || '').trim();

  return {
    bio:
      bio ||
      `${doctor.displayName} teaches ${doctor.subject} at Bastly Academy.`,
    qualifications: unique(doctor?.qualifications || []),
    experience: unique(doctor?.experience || []),
  };
}

export function isSeedLikeDoctorBio(doctor, currentBio) {
  const normalized = String(currentBio || '').trim();
  const canonical = String(doctor?.bio || '').trim();
  const simpleSeedBio = `${doctor.displayName} teaches ${doctor.subject} at Bastly Academy.`;

  return (
    !normalized ||
    normalized === simpleSeedBio ||
    normalized === canonical
  );
}
