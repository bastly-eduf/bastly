import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DirectoryPagination({
  page,
  totalPages,
  onPageChange,
  label,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-10 border-t border-line pt-6 sm:mt-12"
      aria-label={`${label} pagination`}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-extrabold text-bastly-navy transition hover:border-bastly-blue/30 hover:bg-bastly-blue-pale disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <p
          className="mb-0 text-center text-sm font-bold text-muted"
          aria-live="polite"
        >
          Page <span className="text-bastly-navy">{page}</span> of{' '}
          <span className="text-bastly-navy">{totalPages}</span>
        </p>

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="ml-auto inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-extrabold text-bastly-navy transition hover:border-bastly-blue/30 hover:bg-bastly-blue-pale disabled:pointer-events-none disabled:opacity-35"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
