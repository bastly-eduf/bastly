import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PreviewCarousel({ children, label }) {
  const railRef = useRef(null);
  const carouselId = useId().replace(/:/g, '');
  const items = Children.toArray(children);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(false);

  const updateControls = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    setCanScrollBack(rail.scrollLeft > 4);
    setCanScrollForward(rail.scrollLeft < maxScrollLeft - 4);
  }, []);

  useEffect(() => {
    updateControls();

    const rail = railRef.current;
    if (!rail || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(updateControls);
    observer.observe(rail);
    Array.from(rail.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [items.length, updateControls]);

  const scroll = (direction) => {
    const rail = railRef.current;
    if (!rail) return;

    const firstItem = rail.querySelector('[data-carousel-item]');
    if (!firstItem) return;

    const itemWidth = firstItem.getBoundingClientRect().width;
    const styles = window.getComputedStyle(rail);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const visibleItems = window.matchMedia('(min-width: 1024px)').matches ? 3 : 1;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    rail.scrollBy({
      left: direction * (itemWidth + gap) * visibleItems,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (!items.length) return null;

  return (
    <div>
      <div
        id={carouselId}
        ref={railRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateControls}
        style={{ scrollbarWidth: 'none' }}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth pb-2 pr-[12%] focus-visible:rounded-[26px] sm:pr-[8%] md:pr-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <div
            key={item.key ?? index}
            data-carousel-item
            className="min-w-0 shrink-0 snap-start basis-[88%] sm:basis-[72%] md:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          aria-label={`Previous ${label}`}
          aria-controls={carouselId}
          disabled={!canScrollBack}
          onClick={() => scroll(-1)}
          className="grid size-11 place-items-center rounded-full border border-line bg-white text-bastly-navy shadow-soft transition hover:-translate-y-0.5 hover:border-bastly-blue/30 hover:bg-bastly-blue-soft disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        <button
          type="button"
          aria-label={`Next ${label}`}
          aria-controls={carouselId}
          disabled={!canScrollForward}
          onClick={() => scroll(1)}
          className="grid size-11 place-items-center rounded-full border border-line bg-white text-bastly-navy shadow-soft transition hover:-translate-y-0.5 hover:border-bastly-blue/30 hover:bg-bastly-blue-soft disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
