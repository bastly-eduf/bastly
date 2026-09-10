import {
  CirclePause,
  CirclePlay,
  Gift,
  PackagePlus,
  Plus,
  TicketCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import { api, apiErrorMessage } from '../../services/api';

const blankReward = {
  partnerName: '',
  partnerLogoUrl: '',
  title: '',
  offer: '',
  description: '',
  instructions: '',
  redemptionCode: '',
  expiresAt: '',
  quantity: 10,
  status: 'active',
};

export default function AdminRewardsPage() {
  const [cards, setCards] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [counts, setCounts] = useState({});
  const [rewardModal, setRewardModal] = useState(false);
  const [restockCard, setRestockCard] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [form, setForm] = useState(blankReward);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [overviewResponse, cardsResponse, assignmentsResponse] =
      await Promise.all([
        api.get('/admin/rewards/overview'),
        api.get('/admin/rewards/cards'),
        api.get('/admin/rewards/assignments'),
      ]);

    setCounts(overviewResponse.data.counts || {});
    setCards(cardsResponse.data.rewardCards || []);
    setAssignments(assignmentsResponse.data.assignments || []);
  }, []);

  useEffect(() => {
    load().catch((err) =>
      setError(apiErrorMessage(err, 'Could not load Bastly Cards.')),
    );
  }, [load]);

  const createReward = async (event) => {
    event.preventDefault();
    setBusy('create');
    setError('');

    try {
      await api.post('/admin/rewards/cards', {
        ...form,
        quantity: Number(form.quantity),
        expiresAt: form.expiresAt
          ? new Date(`${form.expiresAt}T23:59:59Z`).toISOString()
          : null,
      });

      setForm(blankReward);
      setRewardModal(false);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create Bastly Card.'));
    } finally {
      setBusy('');
    }
  };

  const toggleStatus = async (card) => {
    const next = card.status === 'active' ? 'paused' : 'active';
    setBusy(card._id);
    setError('');

    try {
      await api.patch(`/admin/rewards/cards/${card._id}`, {
        status: next,
      });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update reward status.'));
    } finally {
      setBusy('');
    }
  };

  const restock = async (event) => {
    event.preventDefault();
    setBusy('restock');
    setError('');

    try {
      await api.post(`/admin/rewards/cards/${restockCard._id}/restock`, {
        quantity: Number(restockQuantity),
      });

      setRestockCard(null);
      setRestockQuantity(10);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add reward stock.'));
    } finally {
      setBusy('');
    }
  };

  const redemptionRate = useMemo(() => {
    const total = Number(counts.assignedRewards || 0) +
      Number(counts.redeemedRewards || 0);

    if (!total) return 0;

    return Math.round(
      (Number(counts.redeemedRewards || 0) / total) * 100,
    );
  }, [counts]);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Bastly Cards"
        description="Manage the partner rewards students can win. Inventory is consumed server-side before the wheel animation starts."
        action={
          <button
            type="button"
            onClick={() => {
              setError('');
              setRewardModal(true);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            Add reward
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Gift} label="Active cards" value={counts.activeCards ?? '—'} />
        <Metric icon={PackagePlus} label="Stock remaining" value={counts.stockRemaining ?? '—'} />
        <Metric icon={TicketCheck} label="Available spins" value={counts.earnedSpins ?? '—'} />
        <Metric icon={TicketCheck} label="Redemption rate" value={`${redemptionRate}%`} />
      </div>

      <section className="overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
        <div className="border-b border-line bg-surface px-5 py-4">
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
            Inventory
          </p>
          <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
            Reward cards
          </h2>
        </div>

        <div className="divide-y divide-line">
          {cards.map((card) => (
            <div
              key={card._id}
              className="grid gap-4 px-5 py-5 lg:grid-cols-[1.5fr_1fr_0.7fr_auto] lg:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-bastly-blue-pale text-sm font-extrabold text-bastly-blue">
                  {card.partnerLogoUrl ? (
                    <img
                      src={card.partnerLogoUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    card.partnerName
                      .split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')
                  )}
                </span>

                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <p className="mb-0 truncate font-heading font-bold text-bastly-navy">
                      {card.title}
                    </p>
                    <StatusPill value={card.status} />
                  </div>
                  <p className="mb-0 truncate text-xs text-muted">
                    {card.partnerName} · {card.offer}
                  </p>
                  {card.expiresAt && (
                    <p className="mt-1 mb-0 text-[0.68rem] text-muted">
                      Expires {new Date(card.expiresAt).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted">
                  Stock
                </p>
                <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
                  {card.quantityRemaining} / {card.quantityTotal}
                </p>
              </div>

              <div>
                <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-muted">
                  Won / used
                </p>
                <p className="mb-0 text-sm font-bold text-bastly-navy">
                  {card.stats?.assigned || 0} / {card.stats?.redeemed || 0}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRestockCard(card);
                    setRestockQuantity(10);
                    setError('');
                  }}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy"
                >
                  <PackagePlus size={14} />
                  Restock
                </button>

                {card.status !== 'expired' && (
                  <button
                    type="button"
                    disabled={busy === card._id}
                    onClick={() => toggleStatus(card)}
                    className={[
                      'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold disabled:opacity-50',
                      card.status === 'active'
                        ? 'bg-[#fff6df] text-[#9a6510]'
                        : 'bg-[#eef8f1] text-[#18764a]',
                    ].join(' ')}
                  >
                    {card.status === 'active' ? (
                      <CirclePause size={14} />
                    ) : (
                      <CirclePlay size={14} />
                    )}
                    {card.status === 'active' ? 'Pause' : 'Activate'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {cards.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted">
              No Bastly Cards yet. Add a partner reward to create the first wheel inventory.
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
        <div className="border-b border-line bg-surface px-5 py-4">
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
            Recent wins
          </p>
          <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
            Assigned rewards
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Reward</th>
                <th className="px-5 py-3">Spin week</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {assignments.slice(0, 50).map((assignment) => (
                <tr key={assignment._id} className="border-t border-line">
                  <td className="px-5 py-4">
                    <p className="mb-0 text-sm font-bold text-bastly-navy">
                      {assignment.student?.fullName}
                    </p>
                    <p className="mb-0 text-xs text-muted">
                      {assignment.student?.email}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="mb-0 text-sm font-bold text-bastly-navy">
                      {assignment.rewardSnapshot?.title}
                    </p>
                    <p className="mb-0 text-xs text-muted">
                      {assignment.rewardSnapshot?.partnerName}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {assignment.spinCredit?.weekStart
                      ? new Date(assignment.spinCredit.weekStart).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusPill value={assignment.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-muted">
                    {new Date(assignment.assignedAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}

              {assignments.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-sm text-muted">
                    No rewards have been won yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={rewardModal}
        title="Add Bastly Card"
        onClose={() => setRewardModal(false)}
      >
        <form className="grid gap-4" onSubmit={createReward}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Partner"
              value={form.partnerName}
              onChange={(value) => setForm({ ...form, partnerName: value })}
              placeholder="Coffee Lab"
              required
            />
            <Field
              label="Partner logo path / URL"
              value={form.partnerLogoUrl}
              onChange={(value) => setForm({ ...form, partnerLogoUrl: value })}
              placeholder="/rewards/coffee-lab.webp"
            />
          </div>

          <Field
            label="Card title"
            value={form.title}
            onChange={(value) => setForm({ ...form, title: value })}
            placeholder="Free drink"
            required
          />

          <Field
            label="Offer"
            value={form.offer}
            onChange={(value) => setForm({ ...form, offer: value })}
            placeholder="One free small drink"
            required
          />

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">Description</span>
            <textarea
              rows="3"
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">Redemption instructions</span>
            <textarea
              rows="3"
              value={form.instructions}
              onChange={(event) =>
                setForm({ ...form, instructions: event.target.value })
              }
              placeholder="Show this card at the cashier..."
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Redemption code"
              value={form.redemptionCode}
              onChange={(value) =>
                setForm({ ...form, redemptionCode: value })
              }
              placeholder="BASTLY20"
            />
            <Field
              label="Initial quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(value) => setForm({ ...form, quantity: value })}
              required
            />
            <Field
              label="Expiry date"
              type="date"
              value={form.expiresAt}
              onChange={(value) => setForm({ ...form, expiresAt: value })}
            />
          </div>

          <div className="rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
            Students can see the partner/title on the wheel, but the redemption code and instructions stay private until that card is actually won.
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy === 'create'}
            className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
          >
            {busy === 'create' ? 'Creating…' : 'Create Bastly Card'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(restockCard)}
        title={`Restock ${restockCard?.title || ''}`}
        onClose={() => setRestockCard(null)}
      >
        <form className="grid gap-4" onSubmit={restock}>
          <Field
            label="Add quantity"
            type="number"
            min="1"
            value={restockQuantity}
            onChange={setRestockQuantity}
            required
          />

          <p className="mb-0 rounded-2xl bg-surface px-4 py-3 text-xs leading-6 text-muted">
            This adds to both total stock and remaining stock. Existing assigned cards are not changed.
          </p>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy === 'restock'}
            className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
          >
            {busy === 'restock' ? 'Adding…' : 'Add stock'}
          </button>
        </form>
      </Modal>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
        <Icon size={19} />
      </span>
      <p className="mb-1 font-heading text-3xl font-bold tracking-[-0.05em] text-bastly-navy">
        {value}
      </p>
      <p className="mb-0 text-sm text-muted">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  min,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
      />
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
