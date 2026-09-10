import {
  CheckCircle2,
  KeyRound,
  Laptop,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../context/AuthContext';
import {
  api,
  apiErrorMessage,
} from '../../services/api';

export default function AccountSettingsPage() {
  const { user, setUser } = useAuth();

  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    school: '',
    academicLevel: '',
  });
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileBusy, setProfileBusy] =
    useState(false);
  const [passwordBusy, setPasswordBusy] =
    useState(false);
  const [sessionsBusy, setSessionsBusy] =
    useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const roleLabel = useMemo(() => {
    const value = user?.role || '';
    return value
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : 'Account';
  }, [user?.role]);

  const loadSettings = async () => {
    setError('');

    try {
      const { data } = await api.get(
        '/account/settings',
      );

      setSettings(data);
      setProfile({
        fullName: data.user?.fullName || '',
        phone: data.user?.phone || '',
        school:
          data.studentProfile?.school || '',
        academicLevel:
          data.studentProfile?.academicLevel || '',
      });
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not load account settings.',
        ),
      );
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileBusy(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        fullName: profile.fullName,
        phone: profile.phone,
        ...(user?.role === 'student'
          ? {
              school: profile.school,
              academicLevel:
                profile.academicLevel,
            }
          : {}),
      };

      const { data } = await api.patch(
        '/account/settings/profile',
        payload,
      );

      setUser(data.user);
      setSettings((current) => ({
        ...current,
        user: data.user,
        studentProfile:
          data.studentProfile ||
          current?.studentProfile ||
          null,
      }));

      setMessage('Account details saved.');
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not save account details.',
        ),
      );
    } finally {
      setProfileBusy(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordBusy(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.post(
        '/account/settings/change-password',
        password,
      );

      setUser(data.user);
      setPassword({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSettings((current) => ({
        ...current,
        user: data.user,
        security:
          data.security || current?.security,
      }));

      setMessage(
        'Password changed. Other existing sessions were signed out.',
      );
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not change your password.',
        ),
      );
    } finally {
      setPasswordBusy(false);
    }
  };

  const invalidateSessions = async () => {
    const confirmed = window.confirm(
      'Sign out Bastly on your other devices? This device will stay logged in.',
    );

    if (!confirmed) return;

    setSessionsBusy(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.post(
        '/account/settings/invalidate-sessions',
      );

      setUser(data.user);
      setMessage(data.message);
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not sign out the other sessions.',
        ),
      );
    } finally {
      setSessionsBusy(false);
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7">
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
          Account settings
        </p>
        <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
          Your Bastly account.
        </h1>
        <p className="mb-0 max-w-[760px] text-sm leading-6 text-muted">
          Update your private account details and control account
          security. Your email stays fixed here because changing
          it safely requires a separate verification flow.
        </p>
      </div>

      {message && (
        <div className="mb-5 flex items-start gap-2 rounded-2xl border border-[#4b9e73]/25 bg-[#eef8f1] px-4 py-3 text-sm font-bold text-[#18764a]">
          <CheckCircle2
            size={17}
            className="mt-0.5 shrink-0"
          />
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
              <UserRound size={18} />
            </span>
            <div>
              <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">
                Profile
              </h2>
              <p className="mb-0 text-xs leading-5 text-muted">
                Private account information used inside Bastly.
              </p>
            </div>
          </div>

          <form
            className="grid gap-4"
            onSubmit={saveProfile}
          >
            <Field
              label="Full name"
              value={profile.fullName}
              onChange={(value) =>
                setProfile({
                  ...profile,
                  fullName: value,
                })
              }
              required
            />

            <Field
              label="Phone"
              value={profile.phone}
              onChange={(value) =>
                setProfile({
                  ...profile,
                  phone: value,
                })
              }
              placeholder="01xxxxxxxxx"
            />

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-bastly-navy">
                Email
              </span>

              <div className="flex min-h-11 items-center gap-2 rounded-2xl border border-line bg-surface px-4">
                <Mail
                  size={15}
                  className="shrink-0 text-muted"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-muted">
                  {settings?.user?.email ||
                    user?.email ||
                    ''}
                </span>
                <span className="rounded-full bg-white px-2 py-1 text-[0.62rem] font-extrabold text-muted">
                  Fixed
                </span>
              </div>
            </label>

            {user?.role === 'student' && (
              <>
                <Field
                  label="School"
                  value={profile.school}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      school: value,
                    })
                  }
                  required
                />

                <Field
                  label="Academic level"
                  value={profile.academicLevel}
                  onChange={(value) =>
                    setProfile({
                      ...profile,
                      academicLevel: value,
                    })
                  }
                  required
                />

                <div className="rounded-2xl bg-surface p-4">
                  <p className="mb-1 text-[0.67rem] font-bold uppercase tracking-[0.06em] text-muted">
                    Student code
                  </p>
                  <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
                    {settings?.studentProfile
                      ?.studentCode || '—'}
                  </p>
                </div>
              </>
            )}

            {user?.role === 'doctor' && (
              <div className="rounded-2xl bg-bastly-blue-pale p-4 text-xs leading-6 text-muted">
                Your private account name is separate from your
                public instructor profile. Bastly Admin controls
                the public profile so course pages stay
                consistent.
              </div>
            )}

            <button
              type="submit"
              disabled={profileBusy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white disabled:opacity-50"
            >
              <Save size={16} />
              {profileBusy
                ? 'Saving…'
                : 'Save account details'}
            </button>
          </form>
        </section>

        <div className="grid content-start gap-6">
          <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">
                  Security
                </h2>
                <p className="mb-0 text-xs leading-5 text-muted">
                  {roleLabel} account protection.
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <SecurityRow
                icon={Mail}
                label="Email verification"
                value={
                  settings?.security?.emailVerified
                    ? 'Verified'
                    : 'Not verified'
                }
              />
              <SecurityRow
                icon={Laptop}
                label="Last login"
                value={formatDateTime(
                  settings?.security?.lastLoginAt,
                )}
              />
              <SecurityRow
                icon={KeyRound}
                label="Password changed"
                value={formatDateTime(
                  settings?.security
                    ?.passwordChangedAt,
                  'Not changed yet',
                )}
              />
            </div>

            <button
              type="button"
              onClick={invalidateSessions}
              disabled={sessionsBusy}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-extrabold text-bastly-navy disabled:opacity-50"
            >
              <Laptop size={16} />
              {sessionsBusy
                ? 'Signing out…'
                : 'Sign out other devices'}
            </button>

            <p className="mt-3 mb-0 text-[0.68rem] leading-5 text-muted">
              This invalidates existing Bastly sessions on other
              devices while issuing a fresh session to this
              device.
            </p>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff6df] text-[#9a6510]">
                <LockKeyhole size={18} />
              </span>
              <div>
                <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">
                  Change password
                </h2>
                <p className="mb-0 text-xs leading-5 text-muted">
                  Changing your password also signs out your
                  other existing sessions.
                </p>
              </div>
            </div>

            <form
              className="grid gap-4"
              onSubmit={changePassword}
            >
              <Field
                label="Current password"
                type="password"
                value={password.currentPassword}
                onChange={(value) =>
                  setPassword({
                    ...password,
                    currentPassword: value,
                  })
                }
                required
              />

              <Field
                label="New password"
                type="password"
                value={password.newPassword}
                onChange={(value) =>
                  setPassword({
                    ...password,
                    newPassword: value,
                  })
                }
                required
              />

              <Field
                label="Confirm new password"
                type="password"
                value={password.confirmPassword}
                onChange={(value) =>
                  setPassword({
                    ...password,
                    confirmPassword: value,
                  })
                }
                required
              />

              <div className="rounded-2xl bg-surface px-4 py-3 text-[0.68rem] leading-5 text-muted">
                Use at least 8 characters with uppercase,
                lowercase, and a number.
              </div>

              <button
                type="submit"
                disabled={passwordBusy}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-navy px-4 text-sm font-extrabold text-white disabled:opacity-50"
              >
                <KeyRound size={16} />
                {passwordBusy
                  ? 'Changing…'
                  : 'Change password'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function SecurityRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-bastly-blue shadow-soft">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="mb-0 text-[0.65rem] font-bold uppercase tracking-[0.05em] text-muted">
          {label}
        </p>
        <p className="mb-0 truncate text-sm font-extrabold text-bastly-navy">
          {value}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
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
        autoComplete={
          type === 'password'
            ? label.startsWith('Current')
              ? 'current-password'
              : 'new-password'
            : undefined
        }
        className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
      />
    </label>
  );
}

function formatDateTime(
  value,
  empty = 'Not available',
) {
  if (!value) return empty;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return empty;
  }

  return date.toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
