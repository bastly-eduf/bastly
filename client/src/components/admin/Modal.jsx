import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-[#041632]/55 p-4 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div className="relative z-10 my-8 w-full max-w-[680px] rounded-[28px] border border-white/30 bg-white p-5 shadow-[0_30px_100px_rgba(4,22,50,0.24)] sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
            {title}
          </h2>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-xl border border-line text-muted transition hover:bg-surface hover:text-bastly-navy"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
