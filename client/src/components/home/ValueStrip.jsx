import './ValueStrip.css';

const values = [
  {
    key: 'instructors',
    value: '18',
    label: 'Expert instructors',
    detail: 'Different subjects, levels, and learning styles.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.2V18a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v1.2M9.5 11A3.5 3.5 0 1 0 9.5 4a3.5 3.5 0 0 0 0 7ZM16 5.5h4M18 3.5v4" />
      </svg>
    ),
  },
  {
    key: 'practice',
    value: 'Quiz + Homework',
    label: 'Practice that sticks',
    detail: 'MCQ and True/False built right into your course.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.5h10.5L20 7v13.5H6zM16.5 3.5V7H20M9 11h8M9 14.5h8M9 18h5" />
      </svg>
    ),
  },
  {
    key: 'tracking',
    value: 'Live Progress',
    label: 'Parents stay in the loop',
    detail: 'Quiz grades, attendance, and weekly performance in one place.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.5h16M6.5 16V11M11.5 16V6.5M16.5 16V9M20 4l-4.2 4.2-3-2.2L8 10.5" />
      </svg>
    ),
  },
  {
    key: 'rewards',
    value: 'Bastly Cards',
    label: 'Good work gets rewarded',
    detail: 'Earn spins through strong quiz performance and unlock partner rewards.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h16v11H4zM4 11h16M8 7.5c-1.8 0-3-1-3-2.2C5 4 6 3.2 7.2 3.2 9.2 3.2 12 7.5 12 7.5S10.2 3.2 8 3.2M16 7.5c1.8 0 3-1 3-2.2C19 4 18 3.2 16.8 3.2 14.8 3.2 12 7.5 12 7.5v11" />
      </svg>
    ),
  },
];

export default function ValueStrip() {
  return (
    <section className="value-strip" aria-label="Why students choose Bastly">
      <div className="container value-strip__grid">
        {values.map((item) => (
          <article className="value-strip__item" key={item.key}>
            <div className="value-strip__icon">{item.icon}</div>

            <div className="value-strip__copy">
              <p className="value-strip__value">{item.value}</p>
              <h2>{item.label}</h2>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
