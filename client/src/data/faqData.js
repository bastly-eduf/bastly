export const faqSections = [
  {
    title: 'Enrollment & access',
    items: [
      {
        question: 'How do I enroll in a Bastly course?',
        answer:
          'Open the course you want and use the WhatsApp enrollment button. Bastly confirms the current price, payment details, and available group before access is activated.',
      },
      {
        question: 'When does my course become available?',
        answer:
          'Your Bastly account may exist before your course is unlocked. Course access starts after the academy confirms payment and activates your enrollment.',
      },
      {
        question: 'How long does course access stay active?',
        answer:
          'Each enrollment stores an explicit access end date for the relevant academic cohort, typically through the end of June. Bastly can also unregister an enrollment earlier when needed.',
      },
      {
        question: 'Can I join more than one Bastly course?',
        answer:
          'Yes. Your student account can hold multiple active courses, and each course keeps its own lessons, group, assessments, attendance, and weekly performance.',
      },
    ],
  },
  {
    title: 'Learning & assessments',
    items: [
      {
        question: 'How do quizzes work?',
        answer:
          'Bastly quizzes support multiple-choice and True/False questions. Each quiz allows exactly one submitted attempt, enforced by the server.',
      },
      {
        question: 'How does homework work?',
        answer:
          'Homework uses the same question types but allows unlimited attempts for practice. Bastly shows your improvement, while weekly performance uses the first submitted homework attempt.',
      },
      {
        question: 'How is weekly performance calculated?',
        answer:
          'The standard weighting is 50% quizzes, 30% attendance, and 20% homework. If a category was not assigned that week, Bastly removes it and proportionally normalizes the remaining weights instead of giving the student a zero.',
      },
      {
        question: 'Does marking a lesson complete affect my grade?',
        answer:
          'No. Lesson completion is a personal learning-progress marker. It does not change quiz scores, homework scores, attendance, weekly performance, or Bastly Spin eligibility.',
      },
      {
        question: 'How are videos delivered?',
        answer:
          'Published lessons can stream an instructor-provided YouTube Unlisted video inside the protected student area. Unlisted video reduces casual discovery, but it is not DRM and cannot completely prevent sharing or screen recording.',
      },
    ],
  },
  {
    title: 'Attendance, parents & rewards',
    items: [
      {
        question: 'How is attendance recorded?',
        answer:
          'The doctor records attendance after the class session. Bastly V1 uses Present or Absent, and only finalized attendance sessions count toward weekly performance.',
      },
      {
        question: 'Can my parent see my progress?',
        answer:
          'Yes. A verified linked parent account can see the child’s courses, quiz and homework results, finalized attendance, weekly performance, and learning progress.',
      },
      {
        question: 'How do I earn a Bastly Spin?',
        answer:
          'A student can earn a maximum of one Bastly Spin per week. At least one required quiz must exist for that week, and every required quiz assigned to that student across their active courses must earn Star at 90% or higher.',
      },
      {
        question: 'Do homework and attendance affect Bastly Spin eligibility?',
        answer:
          'No. Homework and attendance affect weekly performance, but the Spin rule is intentionally based on required quiz results only.',
      },
      {
        question: 'What happens when I win a Bastly Card?',
        answer:
          'The server reserves an available partner reward before the wheel animation reveals it. Your won card then appears in Bastly with its offer, instructions, code when applicable, expiry date, and redemption status.',
      },
    ],
  },
];

export const homeFaqItems = faqSections
  .flatMap((section) => section.items)
  .slice(0, 5);
