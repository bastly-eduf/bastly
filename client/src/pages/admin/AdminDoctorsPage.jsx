import {
  Edit3,
  ExternalLink,
  Plus,
  Send,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import MediaImageUploader from '../../components/admin/MediaImageUploader';
import Modal from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import {
  api,
  apiErrorMessage,
} from '../../services/api';

const blankForm = {
  displayName: '',
  subject: '',
  levels: '',
  bio: '',
  qualifications: '',
  experience: '',
  isFeatured: false,
  isPublished: true,
};

function lines(value = '') {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function editForm(profile) {
  return {
    displayName: profile.displayName || '',
    subject: profile.subject || '',
    levels: (profile.levels || []).join(', '),
    bio: profile.bio || '',
    qualifications: (profile.qualifications || []).join(
      '\n',
    ),
    experience: (profile.experience || []).join('\n'),
    isFeatured: Boolean(profile.isFeatured),
    isPublished: Boolean(profile.isPublished),
  };
}

export default function AdminDoctorsPage() {
  const [profiles, setProfiles] = useState([]);
  const [mediaConfig, setMediaConfig] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] =
    useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inviteProfile, setInviteProfile] =
    useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const load = async () => {
    const [profilesResponse, mediaResponse] =
      await Promise.all([
        api.get('/admin/academic/doctor-profiles'),
        api.get('/admin/media/config'),
      ]);

    const nextProfiles =
      profilesResponse.data.doctorProfiles || [];

    setProfiles(nextProfiles);
    setMediaConfig(mediaResponse.data || null);

    return nextProfiles;
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingProfile(null);
    setForm(blankForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (profile) => {
    setEditingProfile(profile);
    setForm(editForm(profile));
    setError('');
    setModalOpen(true);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      displayName: form.displayName,
      subject: form.subject,
      levels: lines(form.levels),
      bio: form.bio,
      qualifications: lines(form.qualifications),
      experience: lines(form.experience),
      isFeatured: form.isFeatured,
      isPublished: form.isPublished,
    };

    try {
      if (editingProfile) {
        await api.patch(
          `/admin/academic/doctor-profiles/${editingProfile._id}`,
          payload,
        );
      } else {
        await api.post(
          '/admin/academic/doctor-profiles',
          payload,
        );
      }

      setModalOpen(false);
      setEditingProfile(null);
      setForm(blankForm);
      await load();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          editingProfile
            ? 'Could not update doctor profile.'
            : 'Could not create doctor profile.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const refreshEditingProfile = async () => {
    const nextProfiles = await load();

    if (!editingProfile?._id) return;

    const refreshed = nextProfiles.find(
      (profile) =>
        profile._id === editingProfile._id,
    );

    if (refreshed) {
      setEditingProfile(refreshed);
      setForm(editForm(refreshed));
    }
  };

  const sendInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setInviteUrl('');

    try {
      const { data } = await api.post(
        '/admin/invitations/doctor',
        {
          fullName: inviteProfile.displayName,
          email: inviteEmail,
          doctorProfileId: inviteProfile._id,
        },
      );

      setInviteUrl(data.developmentInviteUrl || '');
      await load();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not create the doctor invitation.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Doctors"
        description="Manage the public instructor profile separately from the doctor's private login account."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            Add doctor
          </button>
        }
      />

      {error && (
        <ErrorBox message={error} className="mb-5" />
      )}

      <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-soft">
        <div className="hidden grid-cols-[1.45fr_0.9fr_1fr_auto] gap-4 border-b border-line bg-surface px-5 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted md:grid">
          <span>Doctor</span>
          <span>Public state</span>
          <span>Account</span>
          <span>Actions</span>
        </div>

        {profiles.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No doctor profiles yet. Add the first instructor
            profile.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile._id}
              className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[1.45fr_0.9fr_1fr_auto] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-bastly-blue-pale font-heading text-xs font-extrabold text-bastly-blue">
                  {profile.imageUrl ? (
                    <img
                      src={profile.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    profile.displayName
                      .split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')
                  )}
                </span>

                <div className="min-w-0">
                  <p className="mb-1 truncate font-heading font-bold text-bastly-navy">
                    {profile.displayName}
                  </p>
                  <p className="mb-0 truncate text-xs text-muted">
                    {profile.subject} ·{' '}
                    {profile.levels?.join(' · ') ||
                      'Levels not added'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <StatusPill
                  value={
                    profile.isPublished
                      ? 'Published'
                      : 'Draft'
                  }
                />
                {profile.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff6df] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#9a6510]">
                    <Star size={12} />
                    Featured
                  </span>
                )}
              </div>

              <div>
                {profile.user ? (
                  <div>
                    <StatusPill
                      value={
                        profile.user.status || 'active'
                      }
                    />
                    <p className="mt-1 mb-0 text-xs text-muted">
                      {profile.user.email}
                    </p>
                  </div>
                ) : (
                  <StatusPill value="No account" />
                )}
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                <button
                  type="button"
                  onClick={() => openEdit(profile)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy"
                >
                  <Edit3 size={14} />
                  Edit
                </button>

                {profile.isPublished && (
                  <Link
                    to={`/doctors/${profile.slug}`}
                    target="_blank"
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-blue-dark no-underline"
                  >
                    <ExternalLink size={14} />
                    Public
                  </Link>
                )}

                {!profile.user && (
                  <button
                    type="button"
                    onClick={() => {
                      setInviteProfile(profile);
                      setInviteEmail('');
                      setInviteUrl('');
                      setError('');
                    }}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy"
                  >
                    <Send size={14} />
                    Invite
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        title={
          editingProfile
            ? `Edit ${editingProfile.displayName}`
            : 'Add doctor profile'
        }
        onClose={() => setModalOpen(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={saveProfile}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(value) =>
                setForm({
                  ...form,
                  displayName: value,
                })
              }
              placeholder="Dr. Name"
              required
            />
            <Field
              label="Subject"
              value={form.subject}
              onChange={(value) =>
                setForm({ ...form, subject: value })
              }
              placeholder="Biology"
              required
            />
          </div>

          <Field
            label="Levels"
            value={form.levels}
            onChange={(value) =>
              setForm({ ...form, levels: value })
            }
            placeholder="O Level, A Level, Combined Science"
            hint="Separate levels with commas."
          />


          {editingProfile ? (
            <MediaImageUploader
              mediaConfig={mediaConfig}
              entityType="doctor"
              entityId={editingProfile._id}
              slot="portrait"
              label="Doctor portrait"
              description="Bastly creates responsive WebP master, profile, card, and thumbnail variants and never enlarges a smaller portrait just to reach a preset size."
              currentUrl={editingProfile.imageUrl || ''}
              onChanged={refreshEditingProfile}
            />
          ) : (
            <div className="rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
              Create the Doctor profile first. Then open Edit to upload the portrait securely to Cloudflare R2.
            </div>
          )}

          <TextArea
            label="Public bio"
            value={form.bio}
            onChange={(value) =>
              setForm({ ...form, bio: value })
            }
            rows={4}
          />

          <TextArea
            label="Qualifications"
            value={form.qualifications}
            onChange={(value) =>
              setForm({
                ...form,
                qualifications: value,
              })
            }
            rows={4}
            hint="One qualification per line."
          />

          <TextArea
            label="Experience highlights"
            value={form.experience}
            onChange={(value) =>
              setForm({ ...form, experience: value })
            }
            rows={4}
            hint="One highlight per line."
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              checked={form.isPublished}
              onChange={(checked) =>
                setForm({
                  ...form,
                  isPublished: checked,
                })
              }
              title="Published"
              text="Visible on the public Doctors pages."
            />
            <Toggle
              checked={form.isFeatured}
              onChange={(checked) =>
                setForm({
                  ...form,
                  isFeatured: checked,
                })
              }
              title="Featured"
              text="Prioritized in public/homepage ordering."
            />
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-60"
          >
            {busy
              ? 'Saving…'
              : editingProfile
                ? 'Save profile'
                : 'Create profile'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(inviteProfile)}
        title={`Invite ${inviteProfile?.displayName || 'doctor'}`}
        onClose={() => setInviteProfile(null)}
      >
        <form
          className="grid gap-4"
          onSubmit={sendInvite}
        >
          <Field
            label="Doctor email"
            type="email"
            value={inviteEmail}
            onChange={setInviteEmail}
            placeholder="doctor@example.com"
            required
          />

          <p className="mb-0 rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
            The invitation works once and expires after 48
            hours. In local development, if Gmail is not
            configured, the URL is also returned here.
          </p>

          {inviteUrl && (
            <div className="rounded-2xl border border-[#4b9e73]/25 bg-[#eef8f1] p-4 text-xs leading-6 text-[#18764a] break-all">
              <strong>Development invite:</strong>
              <br />
              {inviteUrl}
            </div>
          )}

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-60"
          >
            {busy
              ? 'Creating invite…'
              : 'Create secure invite'}
          </button>
        </form>
      </Modal>
    </main>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 accent-[#237fd1]"
      />
      <div>
        <p className="mb-1 text-sm font-extrabold text-bastly-navy">
          {title}
        </p>
        <p className="mb-0 text-xs leading-5 text-muted">
          {text}
        </p>
      </div>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  hint = '',
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
      />
      {hint && (
        <span className="text-xs text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = '',
  hint = '',
  type = 'text',
  required = false,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
      />
      {hint && (
        <span className="text-xs text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

function ErrorBox({
  message,
  className = '',
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]',
        className,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
