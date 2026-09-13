import { Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { bastlyPublicConfig, bastlyWhatsAppUrl } from '../../config/publicConfig';

const whatsappMessage =
  'Hi Bastly Academy, I would like to ask about your courses.';

export default function Footer() {
  return (
    <footer className="bg-[#041632] text-white/65">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] py-8 lg:w-[min(1200px,calc(100%-4rem))] lg:py-10">
        <div className="grid gap-8 border-b border-white/10 pb-7 md:grid-cols-[1.45fr_0.7fr_0.55fr] md:gap-12 lg:gap-16">
          <div className="max-w-[390px]">
            <Link
              to="/"
              className="mb-5 inline-flex items-center"
              aria-label="Bastly Academy home"
            >
              <img
                src="/brand/bastly-logo.webp"
                alt=""
                width="1254"
                height="1254"
                className="size-16 rounded-2xl object-contain"
              />
            </Link>
            <p className="mb-0 max-w-[360px] text-sm leading-7">
              Courses, learning, tracking, and rewards built around a smarter student experience.
            </p>
          </div>

          <div>
            <p className="mb-4 font-heading text-sm font-bold text-white">Help</p>
            <div className="grid gap-3 text-sm">
              <Link to="/faq" className="w-fit no-underline transition hover:text-white">
                FAQ
              </Link>
              <Link to="/privacy" className="w-fit no-underline transition hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="w-fit no-underline transition hover:text-white">
                Terms & Conditions
              </Link>
            </div>
          </div>


          <div>
            <p className="mb-4 font-heading text-sm font-bold text-white">Socials</p>
            <div className="flex items-center gap-3">
              <a
                href={bastlyPublicConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Bastly Academy on Instagram"
                title="Instagram"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-white/30 hover:bg-white/8 hover:text-white"
              >
                <Instagram size={20} aria-hidden="true" />
              </a>
              <a
                href={bastlyWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noreferrer"
                aria-label="Contact Bastly Academy on WhatsApp"
                title="WhatsApp"
                className="grid size-11 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-white/30 hover:bg-white/8 hover:text-white"
              >
                <MessageCircle size={20} aria-hidden="true" />
              </a>
            </div>
          </div>        </div>

        <div className="pt-4 text-xs">
          <p className="mb-0">© {new Date().getFullYear()} Bastly Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
