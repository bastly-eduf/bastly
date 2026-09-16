import { initialDoctorCatalog as legacyInitialDoctorCatalog } from './initialCatalog.js';

const ACADEMIC_YEAR = '2026/2027';
const ACCESS_END_DATE = '2027-06-30T23:59:59.999Z';

const legacyBySlug = new Map(
  legacyInitialDoctorCatalog.map((doctor) => [doctor.slug, doctor]),
);

function course({
  title,
  subject,
  level,
  curriculum,
}) {
  return {
    title,
    subject,
    level,
    curriculum,
    academicYear: ACADEMIC_YEAR,
    accessEndDate: ACCESS_END_DATE,
    description: '',
    price: 0,
    priceConfirmed: false,
    status: 'published',
    featured: false,
  };
}

const SOURCE_PROFILES = [
  {
    slug: 'dr-asmaa-zakaria',
    displayName: 'Dr. Asmaa Zakaria',
    subject: 'Biology',
    levels: ['O Level', 'A Level'],
    bio: 'Experienced IGCSE Biology educator with over 15 years of teaching expertise, specializing in O Level and A Level Biology.',
    qualifications: [
      "Bachelor's degree in Veterinary Medicine — Cairo University.",
      'Diploma in Microbiology — Cairo University.',
      "Master's degree in International Education — American International College.",
    ],
    experience: [
      'Over 15 years of teaching expertise in IGCSE Biology, specializing in O Level and A Level.',
      'Uses structured instruction, continuous student monitoring, and rigorous assessment strategies to support sustained academic achievement.',
      'Enriches learning through extracurricular initiatives such as the BioDragon competition, fostering critical thinking, collaboration, and deeper understanding of biological concepts.',
    ],
    courses: [
      course({
        title: 'Biology O Level',
        subject: 'Biology',
        level: 'O Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Biology A Level',
        subject: 'Biology',
        level: 'A Level',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-farah-bahnasawy',
    displayName: 'Dr. Farah Bahnasawy',
    subject: 'Psychology',
    levels: ['O Level'],
    bio: 'Psychology IGCSE O Level educator for OxfordAQA with six years of teaching experience, including English teaching, and counseling experience under supervision.',
    qualifications: [
      "Bachelor's in Psychology — The British University in Egypt (BUE).",
      'International Postgraduate Certificate in Education (PGCE) diploma — Liverpool John Moores University.',
    ],
    experience: [
      'Six years of teaching experience, including teaching English.',
      'Counselor under supervision.',
      'Former IGCSE student.',
    ],
    courses: [
      course({
        title: 'Psychology O Level',
        subject: 'Psychology',
        level: 'O Level',
        curriculum: 'OxfordAQA',
      }),
    ],
  },
  {
    slug: 'dr-jana-kotb',
    displayName: 'Dr. Jana Kotb',
    subject: 'Chemistry',
    levels: ['O Level'],
    bio: 'IGCSE Chemistry educator with seven years of teaching experience across Cambridge, Edexcel, and Oxford boards, also teaching Year 9 and the Chemistry component of Combined Science.',
    qualifications: [
      'IGCSE graduate — Class of 2021.',
      'Pharmacy and Biotechnology graduate — German University in Cairo, Class of 2026.',
    ],
    experience: [
      'Seven years of teaching experience.',
      'Teaches O Level Chemistry across Cambridge, Edexcel, and Oxford boards.',
      'Teaches Year 9 and the Chemistry component of Combined Science.',
    ],
    courses: [
      course({
        title: 'Chemistry O Level',
        subject: 'Chemistry',
        level: 'O Level',
        curriculum: 'Cambridge, Edexcel & Oxford',
      }),
      course({
        title: 'Combined Science — Chemistry',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-jana-maher',
    displayName: 'Dr. Jana Maher',
    subject: 'Physics',
    levels: ['IGCSE'],
    bio: 'Cambridge IGCSE Physics and Combined Science educator with five years of teaching experience, focused on simplifying challenging topics and building exam confidence.',
    qualifications: [],
    experience: [
      'Five years of teaching experience.',
      'Dedicated educator in Cambridge IGCSE Physics and Combined Science.',
      'Uses a results-driven approach that develops critical thinking, exam-question mastery, and step-by-step performance improvement.',
    ],
    courses: [
      course({
        title: 'Physics IGCSE',
        subject: 'Physics',
        level: 'IGCSE',
        curriculum: 'Cambridge',
      }),
      course({
        title: 'Combined Science — Physics',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-mohamed-emad',
    displayName: 'Dr. Mohamed Emad',
    subject: 'Physics',
    levels: ['O Level', 'Year 9'],
    bio: 'IGCSE Physics teacher specializing in Cambridge O Level Physics (Core & Extended), Year 9 Core, and the Physics component of Combined Science, with over five years of teaching experience.',
    qualifications: [],
    experience: [
      'Over five years of teaching experience.',
      'Specializes in Cambridge O Level Physics (Core & Extended) and the Physics component of Combined Science.',
      'Uses clear explanations and exam-focused preparation, emphasizing conceptual understanding, problem-solving skills, and student confidence.',
    ],
    courses: [
      course({
        title: 'Physics O Level',
        subject: 'Physics',
        level: 'O Level',
        curriculum: 'Cambridge',
      }),
      course({
        title: 'Physics Year 9 Core',
        subject: 'Physics',
        level: 'Year 9',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Combined Science — Physics',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-mohamed-habib',
    displayName: 'Dr. Mohamed Habib',
    subject: 'Chemistry',
    levels: ['O Level', 'A Level'],
    bio: 'IGCSE Chemistry teacher with over 10 years of experience across Cambridge and Edexcel curricula, specializing in Cambridge Core, O Level, A Level, and Combined Science.',
    qualifications: [],
    experience: [
      'Over 10 years of experience as an IGCSE Chemistry teacher.',
      'Teaches Cambridge and Edexcel curricula.',
      'Specializes in Cambridge Core, O Level, and A Level Chemistry.',
      'Extensive experience teaching Combined Science, helping students build strong scientific understanding and achieve excellent examination results.',
    ],
    courses: [
      course({
        title: 'Chemistry O Level',
        subject: 'Chemistry',
        level: 'O Level',
        curriculum: 'Cambridge & Edexcel',
      }),
      course({
        title: 'Chemistry A Level',
        subject: 'Chemistry',
        level: 'A Level',
        curriculum: 'Cambridge',
      }),
      course({
        title: 'Combined Science — Chemistry',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-namaa-kotb',
    displayName: 'Dr. Namaa Kotb',
    subject: 'Biology',
    levels: ['O Level', 'AS Level'],
    bio: 'IGCSE Biology tutor specializing in Cambridge O Level and AS Level and Pearson Edexcel curricula, known for breaking complex scientific concepts into clear, digestible ideas.',
    qualifications: [],
    experience: [
      'Specializes in Cambridge O Level and AS Level and Pearson Edexcel curricula.',
      'Known for breaking complex scientific concepts into crystal-clear, digestible ideas.',
      'Centers her teaching philosophy on making learning engaging, approachable, and understandable rather than based on memorization.',
      'Uses meticulously crafted study notes and a supportive teaching style to help students master the syllabus, build scientific curiosity, and pursue top grades with confidence.',
    ],
    courses: [
      course({
        title: 'Biology O Level',
        subject: 'Biology',
        level: 'O Level',
        curriculum: 'Cambridge & Pearson Edexcel',
      }),
      course({
        title: 'Biology AS',
        subject: 'Biology',
        level: 'AS Level',
        curriculum: 'Cambridge & Pearson Edexcel',
      }),
    ],
  },
  {
    slug: 'dr-omnia-osama',
    displayName: 'Dr. Omnia Osama',
    subject: 'Chemistry',
    levels: ['O Level', 'A Level'],
    bio: 'IGCSE Chemistry O Level/A Level and Combined Science teacher with 8+ years of experience and a strong reputation across several international schools.',
    qualifications: [
      "Bachelor's degree in Pharmacy and Biotechnology — German University in Cairo (GUC).",
    ],
    experience: [
      '8+ years of teaching experience.',
      'Has a strong reputation in several international schools.',
      'Former IGCSE student with a strong ability to simplify complex material and patiently ensure students grasp the information.',
      'Keeps students motivated and in high spirits through her teaching approach.',
    ],
    courses: [
      course({
        title: 'Chemistry O Level',
        subject: 'Chemistry',
        level: 'O Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Chemistry A Level',
        subject: 'Chemistry',
        level: 'A Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Combined Science — Chemistry',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-osama-aboelnour',
    displayName: 'Dr. Osama Aboelnour',
    subject: 'English as a Second Language',
    levels: ['IGCSE'],
    bio: 'IGCSE English as a Second Language lecturer for OxfordAQA and Cambridge, with 20 years of experience teaching English across First, Second, and A-Level.',
    qualifications: [
      'PhD in English Language Teaching (TESOL).',
      'OxfordAQA ESL Ambassador.',
      'OxfordAQA and Cambridge ESL Examiner.',
    ],
    experience: [
      '20 years of experience teaching English Language across First, Second, and A-Level.',
      'Uses effective and up-to-date techniques to develop listening, speaking, reading, and writing skills.',
    ],
    courses: [
      course({
        title: 'English as a Second Language',
        subject: 'English',
        level: 'IGCSE',
        curriculum: 'OxfordAQA & Cambridge',
      }),
    ],
  },
  {
    slug: 'dr-radwa-antar',
    displayName: 'Dr. Radwa Antar',
    subject: 'Biology',
    levels: ['O Level'],
    bio: 'Passionate IGCSE Biology educator teaching Cambridge Biology O Level and the Biology component of Combined Science, licensed by Cambridge International.',
    qualifications: [
      'Licensed by Cambridge International.',
    ],
    experience: [
      'Passionate IGCSE Biology educator.',
      'Dedicated to empowering students through high-quality education.',
    ],
    courses: [
      course({
        title: 'Biology O Level',
        subject: 'Biology',
        level: 'O Level',
        curriculum: 'Cambridge',
      }),
      course({
        title: 'Combined Science — Biology',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-rana-monayiri',
    displayName: 'Dr. Rana El Monayiri',
    subject: 'Biology',
    levels: ['O Level', 'A Level'],
    bio: 'Experienced IGCSE Biology teacher with over 10 years of teaching experience, teaching Biology O Level/A Level, Edexcel Human Biology, and the Biology component of Combined Science.',
    qualifications: [
      'Degree in Pharmacy — German University in Cairo (GUC).',
    ],
    experience: [
      'Over 10 years of teaching experience.',
      'Specializes in IGCSE Biology with clear explanations, effective exam preparation, and development of students’ critical-thinking skills.',
    ],
    courses: [
      course({
        title: 'Biology O Level',
        subject: 'Biology',
        level: 'O Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Biology A Level',
        subject: 'Biology',
        level: 'A Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Human Biology O Level',
        subject: 'Human Biology',
        level: 'O Level',
        curriculum: 'Edexcel',
      }),
      course({
        title: 'Combined Science — Biology',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'dr-sherry-kamal',
    displayName: 'Dr. Sherry Kamal',
    subject: 'Chemistry',
    levels: ['O Level'],
    bio: 'IGCSE Chemistry O Level and Combined Science teacher with over 10 years of teaching experience across Cambridge and Edexcel.',
    qualifications: [
      'Graduate of the Faculty of Pharmacy — Ain Shams University.',
      "Master's degree in Biotechnology — The American University in Cairo (AUC).",
    ],
    experience: [
      'Over 10 years of teaching experience.',
      'Teaches IGCSE Chemistry across Cambridge and Edexcel and teaches Combined Science.',
    ],
    courses: [
      course({
        title: 'Chemistry O Level',
        subject: 'Chemistry',
        level: 'O Level',
        curriculum: 'Cambridge & Edexcel',
      }),
      course({
        title: 'Combined Science — Chemistry',
        subject: 'Combined Science',
        level: 'IGCSE',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'eng-amr-zanaty',
    displayName: 'Eng. Amr Zanaty',
    subject: 'Mathematics',
    levels: ['O Level', 'A Level'],
    bio: 'IGCSE Mathematics tutor for O Level and A Level across Cambridge and Edexcel, with eight years of experience and 2,000+ students taught.',
    qualifications: [],
    experience: [
      'Eight years of experience.',
      'Trusted by more than 10 schools across Egypt.',
      '2,000+ students taught and 23 achievers who earned full marks.',
      'Student achievement highlights include Top of World, Top of Egypt, and Top of Alexandria results.',
    ],
    courses: [
      course({
        title: 'Mathematics O Level',
        subject: 'Mathematics',
        level: 'O Level',
        curriculum: 'Cambridge & Edexcel',
      }),
      course({
        title: 'Mathematics A Level',
        subject: 'Mathematics',
        level: 'A Level',
        curriculum: 'Cambridge & Edexcel',
      }),
    ],
  },
  {
    slug: 'eng-maged-wageeh',
    displayName: 'Eng. Maged Wageeh',
    subject: 'Computer Science',
    levels: ['O Level', 'A Level'],
    bio: 'Computer Science educator and academic lead of the Megz Tech Team, teaching IGCSE O Level and A Level with over 10 years of experience.',
    qualifications: [
      "Master's degree in Engineering — Germany.",
    ],
    experience: [
      'Leads a specialized team of engineers teaching IGCSE O Level and A Level Computer Science.',
      'Over 10 years of experience teaching IGCSE O Level and A Level Computer Science.',
      '15+ high achievers in Computer Science O Level and A Level across Egypt and the Gulf.',
      'Provides continuous academic support, progress tracking, exam preparation, and guidance through expert teachers, co-teachers, and mentors.',
    ],
    courses: [
      course({
        title: 'Computer Science O Level',
        subject: 'Computer Science',
        level: 'O Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Computer Science A Level',
        subject: 'Computer Science',
        level: 'A Level',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'eng-mohamed-tarek',
    displayName: 'Eng. Mohamed Tarek',
    subject: 'ICT',
    levels: ['O Level'],
    bio: 'Experienced Cambridge IGCSE ICT O Level teacher with over five years of teaching experience, focused on clear explanations, exam preparation, and strong ICT skills.',
    qualifications: [
      'Studied Computer Engineering at Cairo University.',
    ],
    experience: [
      'Over five years of teaching experience.',
      'Experienced Cambridge IGCSE ICT teacher.',
      'Focuses on clear explanations, effective exam preparation, and developing strong ICT skills.',
    ],
    courses: [
      course({
        title: 'ICT O Level',
        subject: 'ICT',
        level: 'O Level',
        curriculum: 'Cambridge',
      }),
    ],
  },
  {
    slug: 'eng-yehia-badawi',
    displayName: 'Eng. Yehia Badawi',
    subject: 'ICT',
    levels: ['O Level'],
    bio: 'ICT teacher and certified ICT examiner/instructor with 10 years of experience, with a Computer Science and Cyber Security background.',
    qualifications: [
      'Computer Science graduate.',
      'Cyber Security field — Ain Shams University.',
      'Certified ICT Examiner/Instructor.',
    ],
    experience: [
      '10 years of experience teaching ICT.',
    ],
    courses: [
      course({
        title: 'ICT O Level',
        subject: 'ICT',
        level: 'O Level',
        curriculum: 'Cambridge',
      }),
    ],
  },
  {
    slug: 'mr-karim-ashmawy',
    displayName: 'Mr. Karim Ashmawy',
    subject: 'Business Studies',
    levels: ['O Level', 'A Level'],
    bio: 'Certified IGCSE Business O Level and A Level lecturer with more than 10 years of professional teaching experience, currently teaching in more than 10 schools.',
    qualifications: [
      'Graduate of London South Bank University (LSBU).',
      "Bachelor's in International Business.",
      "Master's degree in Higher Education Branding.",
    ],
    experience: [
      'Certified IGCSE O Level and A Level Business lecturer.',
      'More than 10 years of professional teaching experience.',
      'Currently teaching in more than 10 schools.',
    ],
    courses: [
      course({
        title: 'Business Studies O Level',
        subject: 'Business Studies',
        level: 'O Level',
        curriculum: 'IGCSE',
      }),
      course({
        title: 'Business Studies A Level',
        subject: 'Business Studies',
        level: 'A Level',
        curriculum: 'IGCSE',
      }),
    ],
  },
  {
    slug: 'mr-mina-sherif',
    displayName: 'Mr. Mina Sherif',
    subject: 'Travel & Tourism',
    levels: ['O Level'],
    bio: 'Travel and Tourism tutor with a Business Administration background from Nile University and Cambridge IGCSE Travel & Tourism marking and assessment training.',
    qualifications: [
      'Graduate of Nile University — Business Administration.',
      'Attended Cambridge IGCSE Travel & Tourism O Level Marking for Components 1 & 2 (2020–2022) workshop — February 2022.',
      'Participated in Cambridge IGCSE Travel & Tourism O Level Marking for Components 1 & 2 (2024–2026) workshop — March 2024.',
      'Participated in the Cambridge IGCSE Travel and Tourism (0471) 2024–2026 Focus on Assessment course.',
    ],
    experience: [
      'Travel and Tourism tutor.',
      'Professional development focused on Cambridge IGCSE Travel & Tourism marking and assessment.',
    ],
    courses: [
      course({
        title: 'Travel & Tourism O Level',
        subject: 'Travel & Tourism',
        level: 'O Level',
        curriculum: 'Cambridge',
      }),
    ],
  },
];

function preserveLegacyMetadata(sourceProfile) {
  const legacy = legacyBySlug.get(sourceProfile.slug);

  if (!legacy) {
    throw new Error(`Missing legacy catalog metadata for ${sourceProfile.slug}.`);
  }

  const courses = sourceProfile.courses.map((sourceCourse) => {
    const sameTitle = legacy.courses?.filter(
      (candidate) => candidate.title === sourceCourse.title,
    ) || [];

    return {
      ...sourceCourse,
      featured: sameTitle.some((candidate) => candidate.featured),
    };
  });

  return {
    ...legacy,
    displayName: sourceProfile.displayName,
    slug: sourceProfile.slug,
    subject: sourceProfile.subject,
    levels: sourceProfile.levels,
    bio: sourceProfile.bio,
    qualifications: sourceProfile.qualifications,
    experience: sourceProfile.experience,
    courses,
  };
}

export const doctorSourceCatalog = SOURCE_PROFILES.map(
  preserveLegacyMetadata,
);

export const doctorSourceSlugs = Object.freeze(
  doctorSourceCatalog.map((doctor) => doctor.slug),
);
