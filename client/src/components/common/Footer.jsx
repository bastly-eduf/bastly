import { Link } from 'react-router-dom';

const whatsappMessage = encodeURIComponent(
  'Hi Bastly Academy, I would like to ask about your courses.',
);

export default function Footer() {
  return (
    <footer className="bg-[#041632] text-white/65">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] py-12 lg:w-[min(1200px,calc(100%-4rem))] lg:py-16">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.2fr_repeat(3,0.65fr)]">
          <div className="max-w-[340px]">
            <Link to="/" className="mb-5 inline-flex items-center" aria-label="Bastly Academy home">
              <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white">
                <img src="/brand/bastly-logo.webp" alt="" className="size-full object-contain" />
              </span>
            </Link>
            <p className="mb-0 text-sm leading-7">
              Courses, learning, tracking, and rewards — built around a smarter student experience.
            </p>
          </div>

          <div>
            <p className="mb-4 font-heading text-sm font-bold text-white">Explore</p>
            <div className="grid gap-3 text-sm">
              <Link to="/courses" className="w-fit no-underline transition hover:text-white">Courses</Link>
              <Link to="/doctors" className="w-fit no-underline transition hover:text-white">Doctors</Link>
              <Link to="/about" className="w-fit no-underline transition hover:text-white">About</Link>
              <Link to="/faq" className="w-fit no-underline transition hover:text-white">FAQ</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 font-heading text-sm font-bold text-white">Account</p>
            <div className="grid gap-3 text-sm">
              <Link to="/login" className="w-fit no-underline transition hover:text-white">Log in</Link>
              <Link to="/register" className="w-fit no-underline transition hover:text-white">Create account</Link>
              <Link to="/contact" className="w-fit no-underline transition hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <p className="mb-4 font-heading text-sm font-bold text-white">Contact</p>
            <div className="grid gap-3 text-sm">
              <a
                href={`https://wa.me/201000883609?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-fit no-underline transition hover:text-white"
              >
                WhatsApp
              </a>
              <a href="tel:+201000883609" className="w-fit no-underline transition hover:text-white">
                01000883609
              </a>
              <a
                href="https://www.instagram.com/bastly.eduf/"
                target="_blank"
                rel="noreferrer"
                className="w-fit no-underline transition hover:text-white"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="mb-0">© {new Date().getFullYear()} Bastly Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
