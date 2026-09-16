import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  MessageCircle,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { api, apiErrorMessage } from '../../services/api';

export default function ParentAccessCard() {
  const [data, setData] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const { data: response } = await api.get('/student/parent-access');
    setData(response);
    return response;
  };

  useEffect(() => {
    let alive = true;

    api
      .get('/student/parent-access')
      .then(({ data: response }) => {
        if (alive) setData(response);
      })
      .catch((requestError) => {
        if (alive) {
          setError(
            apiErrorMessage(
              requestError,
              'Could not load parent access right now.',
            ),
          );
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  const linkedParents = data?.linkedParents || [];
  const pendingInvite = data?.pendingInvite || null;
  const buttonLabel = linkedParents.length
    ? 'Invite another parent'
    : 'Invite your parent';

  const whatsappHref = useMemo(() => {
    if (!inviteUrl) return '';

    const text = [
      'Join my Bastly parent account and follow my learning progress:',
      inviteUrl,
      '',
      'This private link works once and expires after 72 hours.',
    ].join('\n');

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [inviteUrl]);

  const generateInvite = async () => {
    setBusy(true);
    setError('');
    setCopied(false);

    try {
      const { data: response } = await api.post(
        '/student/parent-invitations',
      );

      setInviteUrl(response.inviteUrl);
      setExpiresAt(response.expiresAt || null);
      await load();
    } catch (requestError) {
      setError(
        apiErrorMessage(
          requestError,
          'Could not create the parent invite link.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. Select the link and copy it manually.');
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
            <Users size={19} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
              Parent access
            </p>
            <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">
              {linkedParents.length
                ? 'Your parent account is connected.'
                : 'Keep your parent in the loop.'}
            </h2>
            <p className="mb-0 max-w-[680px] text-sm leading-6 text-muted">
              {linkedParents.length
                ? 'Linked parents can follow the academic information Bastly makes available to them. You can securely invite another parent or guardian at any time.'
                : 'Create a private link and send it to your parent or guardian. They enter their own details, so you do not need to know them during signup.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={generateInvite}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-blue px-5 text-sm font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Link2 size={16} aria-hidden="true" />
          )}
          {busy ? 'Creating link…' : buttonLabel}
        </button>
      </div>

      {linkedParents.length > 0 && (
        <div className="grid gap-3 border-t border-line bg-surface/60 px-5 py-4 sm:grid-cols-2 sm:px-6">
          {linkedParents.map((parent) => (
            <div
              key={parent.relationshipId}
              className="rounded-2xl border border-line bg-white px-4 py-3"
            >
              <p className="mb-1 font-heading text-sm font-bold text-bastly-navy">
                {parent.fullName}
              </p>
              <p className="mb-0 break-all text-xs text-muted">
                {parent.email}
              </p>
            </div>
          ))}
        </div>
      )}

      {(inviteUrl || pendingInvite) && (
        <div className="border-t border-line bg-bastly-blue-pale/45 px-5 py-5 sm:px-6">
          {inviteUrl ? (
            <div className="grid gap-3">
              <div>
                <p className="mb-1 font-heading font-bold text-bastly-navy">
                  Your private parent link is ready.
                </p>
                <p className="mb-0 text-xs leading-5 text-muted">
                  Send it only to your parent or guardian. It works once and expires after 72 hours
                  {expiresAt
                    ? ` (${new Date(expiresAt).toLocaleString()}).`
                    : '.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 md:flex-row">
                <input
                  value={inviteUrl}
                  readOnly
                  aria-label="Parent invitation link"
                  className="min-h-11 min-w-0 flex-1 rounded-2xl border border-line bg-white px-4 text-xs text-bastly-navy outline-none"
                  onFocus={(event) => event.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={copyInvite}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-extrabold text-bastly-navy"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 text-sm font-extrabold text-white no-underline"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  Share on WhatsApp
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1 font-heading text-sm font-bold text-bastly-navy">
                  A parent invite link is still active.
                </p>
                <p className="mb-0 text-xs leading-5 text-muted">
                  Bastly stores only a secure hash, so the original link cannot be shown again. If you no longer have it, create a new link above and the old one will stop working.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="border-t border-[#d1605a]/20 bg-[#fff0ef] px-5 py-3 text-sm font-bold text-[#a83d36] sm:px-6">
          {error}
        </div>
      )}
    </section>
  );
}
