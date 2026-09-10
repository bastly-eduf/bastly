import {
  Bell,
  CheckCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, apiErrorMessage } from '../../services/api';

export default function NotificationBell() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadCount = useCallback(async () => {
    try {
      const { data } = await api.get(
        '/notifications/unread-count',
      );
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // The bell is supplemental; never crash a role dashboard for it.
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/notifications', {
        params: { limit: 20 },
      });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not load notifications.',
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCount();

    const timer = window.setInterval(loadCount, 60000);
    return () => window.clearInterval(timer);
  }, [loadCount]);

  useEffect(() => {
    if (!open) return undefined;

    loadNotifications();

    const onPointerDown = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener('pointerdown', onPointerDown);

    return () =>
      window.removeEventListener(
        'pointerdown',
        onPointerDown,
      );
  }, [open, loadNotifications]);

  const markOneRead = async (notification) => {
    if (!notification.readAt) {
      try {
        await api.patch(
          `/notifications/${notification._id}/read`,
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  readAt: new Date().toISOString(),
                }
              : item,
          ),
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1),
        );
      } catch {
        // Navigation should still work even if marking read fails.
      }
    }

    setOpen(false);

    if (notification.href) {
      navigate(notification.href);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');

      const now = new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          readAt: item.readAt || now,
        })),
      );
      setUnreadCount(0);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not mark notifications as read.',
        ),
      );
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 place-items-center rounded-xl border border-line bg-white text-bastly-navy transition hover:border-bastly-blue/25 hover:text-bastly-blue-dark"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-bastly-blue px-1.5 py-0.5 text-[0.58rem] font-extrabold leading-4 text-white shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[72px] z-[70] overflow-hidden rounded-[24px] border border-line bg-white shadow-[0_28px_90px_rgba(4,22,50,0.22)] sm:absolute sm:left-auto sm:right-0 sm:top-[48px] sm:w-[390px]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <p className="mb-0 font-heading text-base font-bold text-bastly-navy">
                Notifications
              </p>
              <p className="mb-0 text-[0.65rem] text-muted">
                {unreadCount} unread
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-2.5 text-[0.68rem] font-extrabold text-bastly-blue-dark hover:bg-bastly-blue-pale"
                >
                  <CheckCheck size={14} />
                  Read all
                </button>
              )}

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-xl text-muted hover:bg-surface hover:text-bastly-navy"
                aria-label="Close notifications"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="max-h-[min(520px,70vh)] overflow-y-auto">
            {loading ? (
              <div className="grid min-h-[180px] place-items-center">
                <div className="size-7 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
              </div>
            ) : error ? (
              <p className="m-4 rounded-2xl bg-[#fff0ef] px-3 py-3 text-xs font-bold text-[#a83d36]">
                {error}
              </p>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  onClick={() =>
                    markOneRead(notification)
                  }
                  className={[
                    'flex w-full items-start gap-3 border-b border-line px-4 py-4 text-left transition last:border-b-0',
                    notification.readAt
                      ? 'bg-white'
                      : 'bg-bastly-blue-pale/45',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-1 size-2 shrink-0 rounded-full',
                      notification.readAt
                        ? 'bg-line'
                        : 'bg-bastly-blue',
                    ].join(' ')}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-extrabold text-bastly-navy">
                      {notification.title}
                    </p>
                    <p className="mb-1 text-xs leading-5 text-muted">
                      {notification.message}
                    </p>
                    <p className="mb-0 text-[0.62rem] text-muted">
                      {relativeTime(notification.createdAt)}
                    </p>
                  </div>

                  {notification.href && (
                    <ChevronRight
                      size={15}
                      className="mt-1 shrink-0 text-muted"
                    />
                  )}
                </button>
              ))
            ) : (
              <div className="px-5 py-10 text-center">
                <Bell
                  size={22}
                  className="mx-auto mb-3 text-bastly-blue"
                />
                <p className="mb-1 font-heading text-sm font-bold text-bastly-navy">
                  You're all caught up.
                </p>
                <p className="mb-0 text-xs text-muted">
                  Important Bastly updates will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function relativeTime(value) {
  const date = new Date(value);
  const seconds = Math.max(
    0,
    Math.round((Date.now() - date.getTime()) / 1000),
  );

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-GB');
}
