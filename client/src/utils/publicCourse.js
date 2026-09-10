import { bastlyWhatsAppUrl } from '../config/publicConfig';

export function formatCoursePrice(course) {
  if (!course?.priceConfirmed || course.price === null) {
    return 'Price coming soon';
  }

  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: course.currency || 'EGP',
    maximumFractionDigits: 0,
  }).format(course.price);
}

export function courseWhatsAppUrl(course) {
  const doctor = course?.doctorProfile?.displayName
    ? ` with ${course.doctorProfile.displayName}`
    : '';

  const message = [
    'Hi Bastly Academy 👋',
    `I would like to enroll in ${course?.title || 'a course'}${doctor}.`,
    course?.academicYear
      ? `Academic year: ${course.academicYear}.`
      : '',
    'Could you please send me the payment and available group details?',
  ]
    .filter(Boolean)
    .join('\n');

  return bastlyWhatsAppUrl(message);
}
