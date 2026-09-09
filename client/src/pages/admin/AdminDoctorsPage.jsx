import { Plus, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import { api, apiErrorMessage } from '../../services/api';

const blankForm = {
  displayName: '',
  subject: '',
  levels: '',
  imageUrl: '',
  bio: '',
};

export default function AdminDoctorsPage() {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [inviteProfile, setInviteProfile] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');

  const load = async () => {
    const { data } = await api.get('/admin/academic/doctor-profiles');
    setProfiles(data.doctorProfiles || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createProfile = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api.post('/admin/academic/doctor-profiles', {
        displayName: form.displayName,
        subject: form.subject,
        levels: form.levels
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        imageUrl: form.imageUrl,
        bio: form.bio,
      });

      setForm(blankForm);
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create doctor profile.'));
    } finally {
      setBusy(false);
    }
  };

  const sendInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setInviteUrl('');

    try {
      const { data } = await api.post('/admin/invitations/doctor', {
        fullName: inviteProfile.displayName,
        email: inviteEmail,
        doctorProfileId: inviteProfile._id,
      });

      setInviteUrl(data.developmentInviteUrl || '');
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the doctor invitation.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Doctors"
        description="Public instructor profiles are separate from login accounts. Create the profile first, then send the secure account invitation when you have the doctor's email."
        action={
          <button
            type="button"
            onClick={() => {
              setError('');
              setModalOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            Add doctor
          </button>
        }
      />

      <div className="overflow-hidden rounded-[24px] border border-line bg-white shadow-soft">
        <div className="hidden grid-cols-[1.5fr_1fr_1.2fr_auto] gap-4 border-b border-line bg-surface px-5 py-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted md:grid">
          <span>Doctor</span>
          <span>Subject</span>
          <span>Account</span>
          <span>Action</span>
        </div>

        {profiles.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            No doctor profiles yet. Add the first instructor profile.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile._id}
              className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[1.5fr_1fr_1.2fr_auto] md:items-center md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-bastly-blue-pale font-heading text-xs font-extrabold text-bastly-blue">
                  {profile.imageUrl ? (
                    <img src={profile.imageUrl} alt="" className="size-full object-cover" />
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
                    {profile.levels?.join(' · ') || 'Levels not added yet'}
                  </p>
                </div>
              </div>

              <p className="mb-0 text-sm text-muted">{profile.subject}</p>

              <div>
                {profile.user ? (
                  <div>
                    <StatusPill value={profile.user.status || 'active'} />
                    <p className="mt-1 mb-0 text-xs text-muted">{profile.user.email}</p>
                  </div>
                ) : (
                  <StatusPill value="No account" />
                )}
              </div>

              <div>
                {!profile.user && (
                  <button
                    type="button"
                    onClick={() => {
                      setInviteProfile(profile);
                      setInviteEmail('');
                      setInviteUrl('');
                      setError('');
                    }}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy transition hover:border-bastly-blue/30 hover:text-bastly-blue-dark"
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

      <Modal open={modalOpen} title="Add doctor profile" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4" onSubmit={createProfile}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Display name"
              value={form.displayName}
              onChange={(value) => setForm({ ...form, displayName: value })}
              placeholder="Dr. Name"
            />
            <Field
              label="Subject"
              value={form.subject}
              onChange={(value) => setForm({ ...form, subject: value })}
              placeholder="Biology"
            />
          </div>
          <Field
            label="Levels"
            value={form.levels}
            onChange={(value) => setForm({ ...form, levels: value })}
            placeholder="O Level, A Level, Combined Science"
            hint="Separate levels with commas."
          />
          <Field
            label="Image path"
            value={form.imageUrl}
            onChange={(value) => setForm({ ...form, imageUrl: value })}
            placeholder="/doctors/dr-name.webp"
          />
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">Short bio</span>
            <textarea
              rows="4"
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
            />
          </label>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create profile'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(inviteProfile)}
        title={`Invite ${inviteProfile?.displayName || 'doctor'}`}
        onClose={() => setInviteProfile(null)}
      >
        <form className="grid gap-4" onSubmit={sendInvite}>
          <Field
            label="Doctor email"
            type="email"
            value={inviteEmail}
            onChange={setInviteEmail}
            placeholder="doctor@example.com"
          />

          <p className="mb-0 rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
            The invitation link works once and expires after 48 hours. In local development,
            if Gmail is not configured, the URL is also returned here.
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
            {busy ? 'Creating invite…' : 'Create secure invite'}
          </button>
        </form>
      </Modal>
    </main>
  );
}

function Field({ label, value, onChange, placeholder = '', hint = '', type = 'text' }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
        required={['Display name', 'Subject', 'Doctor email'].includes(label)}
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
      {message}
    </div>
  );
}
