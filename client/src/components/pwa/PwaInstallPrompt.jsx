import {
  Download,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'bastly-pwa-install-dismissed-at';
const DISMISS_DAYS = 14;

function recentlyDismissed() {
  try {
    const value = Number(
      window.localStorage.getItem(DISMISS_KEY) || 0,
    );

    return (
      value > 0 &&
      Date.now() - value <
        DISMISS_DAYS * 24 * 60 * 60 * 1000
    );
  } catch {
    return false;
  }
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)')
      ?.matches ||
    window.navigator.standalone === true
  );
}

function isCanonicalInstallOrigin() {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol !== 'https:') return false;

  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    if (!siteUrl) return false;

    return window.location.origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState(null);
  const [iosHint, setIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  const isIos = useMemo(() => {
    if (typeof navigator === 'undefined') return false;

    return /iphone|ipad|ipod/i.test(
      navigator.userAgent,
    );
  }, []);

  useEffect(() => {
    if (
      !isCanonicalInstallOrigin() ||
      isStandalone() ||
      recentlyDismissed()
    ) {
      return undefined;
    }

    let iosTimer;

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setInstallEvent(null);
      setIosHint(false);
    };

    window.addEventListener(
      'beforeinstallprompt',
      onBeforeInstallPrompt,
    );
    window.addEventListener(
      'appinstalled',
      onInstalled,
    );

    if (isIos) {
      iosTimer = window.setTimeout(() => {
        if (!isStandalone()) {
          setIosHint(true);
          setVisible(true);
        }
      }, 5000);
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        onBeforeInstallPrompt,
      );
      window.removeEventListener(
        'appinstalled',
        onInstalled,
      );
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, [isIos]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(
        DISMISS_KEY,
        String(Date.now()),
      );
    } catch {
      // The banner can still be dismissed for this session.
    }

    setVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      setInstallEvent(null);
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-[520px] rounded-[24px] border border-white/15 bg-[#041632]/95 p-4 text-white shadow-[0_28px_90px_rgba(4,22,50,0.32)] backdrop-blur-xl sm:left-auto sm:right-5 sm:mx-0">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white">
          <img
            src="/brand/bastly-logo.webp"
            alt=""
            className="size-full object-contain"
          />
        </span>

        <div className="min-w-0 flex-1">
          <p className="mb-1 font-heading text-sm font-bold">
            Add Bastly to your device
          </p>
          <p className="mb-3 text-xs leading-5 text-white/60">
            {iosHint && !installEvent
              ? 'On iPhone or iPad, tap Share in Safari, then choose Add to Home Screen.'
              : 'Install Bastly for a faster app-like launch from your home screen.'}
          </p>

          {installEvent ? (
            <button
              type="button"
              onClick={install}
              className="inline-flex min-h-9 items-center gap-2 rounded-full bg-bastly-blue px-3 text-xs font-extrabold text-white"
            >
              <Download size={14} />
              Install Bastly
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-[#82c8ff]">
              <Share2 size={14} />
              Share → Add to Home Screen
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="grid size-8 shrink-0 place-items-center rounded-xl text-white/55 hover:bg-white/8 hover:text-white"
          aria-label="Dismiss install prompt"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
}
