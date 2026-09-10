export const featuredCourses = [
  {
    id: 'biology-ol-cambridge',
    title: 'Biology O Level',
    subtitle: 'Cambridge / IGCSE',
    doctor: 'Dr. Radwa Antar',
    doctorSlug: 'dr-radwa-antar',
    image: '/doctors/dr-radwa-antar.webp',
    price: 0,
    currency: 'EGP',
    tags: ['Biology', 'O Level'],
  },
  {
    id: 'physics-igcse',
    title: 'Physics IGCSE',
    subtitle: 'O Level / Year 9 Core',
    doctor: 'Dr. Mohamed Emad',
    doctorSlug: 'dr-mohamed-emad',
    image: '/doctors/dr-mohamed-emad.webp',
    price: 0,
    currency: 'EGP',
    tags: ['Physics', 'IGCSE'],
  },
  {
    id: 'ict-igcse',
    title: 'ICT IGCSE',
    subtitle: 'Cambridge ICT',
    doctor: 'Eng. Yehia Badawi',
    doctorSlug: 'eng-yehia-badawi',
    image: '/doctors/eng-yehia-badawi.webp',
    price: 0,
    currency: 'EGP',
    tags: ['ICT', 'IGCSE'],
  },
];

export const formatCoursePrice = (price, currency = 'EGP') =>
  new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
