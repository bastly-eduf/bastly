import { ChevronLeft, ChevronRight } from 'lucide-react';

function toDate(value) {
  return new Date(`${value}T00:00:00Z`);
}

function inputValue(date) {
  return date.toISOString().slice(0, 10);
}

export default function WeekPicker({ value, onChange }) {
  const shift = (days) => {
    const date = toDate(value);
    date.setUTCDate(date.getUTCDate() + days);
    onChange(inputValue(date));
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white p-1 shadow-soft">
      <button type="button" onClick={() => shift(-7)} className="grid size-9 place-items-center rounded-full text-bastly-navy hover:bg-surface" aria-label="Previous week">
        <ChevronLeft size={17} />
      </button>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent px-1 text-xs font-extrabold text-bastly-navy outline-none"
      />
      <button type="button" onClick={() => shift(7)} className="grid size-9 place-items-center rounded-full text-bastly-navy hover:bg-surface" aria-label="Next week">
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
