import {
  CheckCircle2,
  Copy,
  Gift,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { api, apiErrorMessage } from '../../services/api';

export default function StudentRewardsPage() {
  const [data, setData] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  const load = useCallback(async () => {
    try {
      const { data: response } = await api.get('/student/rewards');
      setData(response);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load Bastly Rewards.'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const wheelItems = useMemo(() => {
    const rewards = data?.wheelRewards || [];
    if (!rewards.length) return [];

    if (rewards.length >= 6) return rewards;

    const repeated = [];
    while (repeated.length < 6) {
      repeated.push(...rewards);
    }
    return repeated.slice(0, 6);
  }, [data]);

  const spin = async () => {
    if (spinning || !data?.availableSpinCount) return;

    setSpinning(true);
    setWinner(null);
    setError('');

    try {
      const { data: response } = await api.post('/student/rewards/spin');

      const prize = response.assignment;
      const rewardId = String(prize.rewardCard);
      const winningIndex = Math.max(
        0,
        wheelItems.findIndex(
          (item) => String(item._id) === rewardId,
        ),
      );

      const segment = 360 / Math.max(wheelItems.length, 1);
      const centerOfSegment = winningIndex * segment + segment / 2;
      const extraTurns = 6 * 360;
      const nextRotation =
        rotation + extraTurns + (360 - centerOfSegment);

      setRotation(nextRotation);

      window.setTimeout(async () => {
        setWinner(prize);
        setSpinning(false);
        await load();
      }, 2600);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not use your Bastly Spin.'));
      setSpinning(false);
    }
  };

  const redeem = async (assignmentId) => {
    const confirmed = window.confirm(
      'Mark this Bastly Card as used? You cannot undo this action.',
    );

    if (!confirmed) return;

    try {
      await api.post(
        `/student/rewards/assignments/${assignmentId}/redeem`,
      );
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not mark this card as used.'));
    }
  };

  const copyCode = async (assignment) => {
    const code = assignment.rewardSnapshot?.redemptionCode;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(assignment._id);
      window.setTimeout(() => setCopied(''), 1500);
    } catch {
      setCopied('');
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7">
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
          Bastly Rewards
        </p>
        <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
          Spin & Win ✨
        </h1>
        <p className="mb-0 max-w-[760px] text-sm leading-6 text-muted">
          Earn one Bastly Spin for a week when every required quiz you were assigned that week gets a Star score of 90% or higher.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[30px] border border-line bg-white p-5 shadow-card sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                Your wheel
              </p>
              <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                {data?.availableSpinCount || 0}{' '}
                {(data?.availableSpinCount || 0) === 1 ? 'spin' : 'spins'} ready
              </h2>
            </div>

            <span className="grid size-12 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
              <Sparkles size={20} />
            </span>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[470px]">
            <div
              className="absolute inset-0 rounded-full border-[12px] border-bastly-navy shadow-[0_28px_80px_rgba(4,22,50,0.22)] transition-transform duration-[2500ms] ease-[cubic-bezier(.15,.85,.16,1)]"
              style={{
                transform: `rotate(${rotation}deg)`,
                background:
                  wheelItems.length > 0
                    ? buildWheelGradient(wheelItems.length)
                    : '#eaf5fd',
              }}
            >
              {wheelItems.map((item, index) => {
                const angle =
                  index * (360 / wheelItems.length) +
                  180 / wheelItems.length;

                return (
                  <div
                    key={`${item._id}-${index}`}
                    className="absolute left-1/2 top-1/2 w-[38%] origin-left text-center"
                    style={{
                      transform: `rotate(${angle}deg) translateX(18%)`,
                    }}
                  >
                    <div
                      className="truncate rounded-full bg-white/90 px-2 py-1 text-[0.58rem] font-extrabold text-bastly-navy shadow-sm sm:text-[0.68rem]"
                      style={{
                        transform: 'rotate(0deg)',
                      }}
                    >
                      {item.partnerName}
                    </div>
                  </div>
                );
              })}

              <div className="absolute left-1/2 top-1/2 grid size-[28%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[8px] border-white bg-bastly-navy text-center text-white shadow-xl">
                <div>
                  <Gift className="mx-auto mb-1" size={24} />
                  <p className="mb-0 text-[0.65rem] font-extrabold uppercase tracking-[0.08em]">
                    Bastly
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-[-6px] z-20 -translate-x-1/2">
              <div className="h-0 w-0 border-l-[14px] border-r-[14px] border-t-[30px] border-l-transparent border-r-transparent border-t-bastly-blue drop-shadow-md" />
            </div>
          </div>

          <button
            type="button"
            onClick={spin}
            disabled={
              spinning ||
              !data?.availableSpinCount ||
              !(data?.wheelRewards || []).length
            }
            className="mt-7 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-bastly-blue px-5 text-base font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Sparkles size={18} />
            {spinning
              ? 'Spinning…'
              : data?.availableSpinCount
                ? 'Use Bastly Spin'
                : 'No spin available yet'}
          </button>

          {(data?.availableSpinCount || 0) > 0 &&
            (data?.wheelRewards || []).length === 0 && (
              <p className="mt-3 mb-0 text-center text-xs leading-5 text-muted">
                Your spin is safe. Bastly needs active reward inventory before you can use it.
              </p>
            )}

          <p className="mt-4 mb-0 text-center text-[0.68rem] leading-5 text-muted">
            The server chooses and reserves your real reward before this wheel moves. The animation only reveals the result.
          </p>
        </section>

        <section className="grid content-start gap-4">
          <div className="rounded-[26px] bg-bastly-navy p-5 text-white shadow-card sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/10">
                <Ticket size={18} />
              </span>
              <div>
                <p className="mb-0 text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-[#82c8ff]">
                  How to earn
                </p>
                <p className="mb-0 font-heading text-lg font-bold">
                  Star every required quiz.
                </p>
              </div>
            </div>
            <p className="mb-0 text-sm leading-7 text-white/65">
              There is a maximum of one Bastly Spin per student per week — even if you study more than one course. Homework and attendance affect your weekly performance, but not Spin eligibility.
            </p>
          </div>

          <div className="rounded-[26px] border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 font-heading text-xl font-bold tracking-[-0.035em] text-bastly-navy">
              Recent spin weeks
            </p>

            <div className="grid gap-2">
              {(data?.credits || []).slice(0, 6).map((credit) => (
                <div
                  key={credit._id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-4 py-3"
                >
                  <div>
                    <p className="mb-0 text-sm font-bold text-bastly-navy">
                      Week of{' '}
                      {new Date(credit.weekStart).toLocaleDateString(
                        'en-GB',
                      )}
                    </p>
                    <p className="mb-0 text-[0.67rem] text-muted">
                      {credit.eligibilitySnapshot?.quizCount || 0}{' '}
                      required quiz
                      {(credit.eligibilitySnapshot?.quizCount || 0) === 1
                        ? ''
                        : 'zes'}
                    </p>
                  </div>

                  <span
                    className={[
                      'rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold',
                      credit.status === 'earned'
                        ? 'bg-[#fff6df] text-[#9a6510]'
                        : 'bg-[#eef8f1] text-[#18764a]',
                    ].join(' ')}
                  >
                    {credit.status === 'earned' ? 'Ready' : 'Used'}
                  </span>
                </div>
              ))}

              {data && data.credits?.length === 0 && (
                <p className="mb-0 text-sm leading-6 text-muted">
                  Your first all-Star quiz week will appear here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {winner && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-[#041632]/70 p-4 backdrop-blur-md">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setWinner(null)}
            aria-label="Close reward"
          />

          <div className="relative z-10 w-full max-w-[520px] overflow-hidden rounded-[30px] bg-white text-center shadow-[0_36px_120px_rgba(0,0,0,0.35)]">
            {winner.rewardSnapshot?.rewardImageUrl && (
              <div className="aspect-[8/5] overflow-hidden bg-surface">
                <img
                  src={winner.rewardSnapshot.rewardImageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
            <span className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-bastly-blue-pale text-bastly-blue">
              <Sparkles size={28} />
            </span>
            <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
              You won!
            </p>
            <h2 className="mb-2 font-heading text-3xl font-bold tracking-[-0.045em] text-bastly-navy">
              {winner.rewardSnapshot?.title}
            </h2>
            <p className="mb-1 font-extrabold text-bastly-blue-dark">
              {winner.rewardSnapshot?.offer}
            </p>
            <p className="mb-6 text-sm text-muted">
              from {winner.rewardSnapshot?.partnerName}
            </p>

            <button
              type="button"
              onClick={() => setWinner(null)}
              className="min-h-11 w-full rounded-full bg-bastly-navy px-5 font-extrabold text-white"
            >
              See my Bastly Card
            </button>
            </div>
          </div>
        </div>
      )}

      <section className="mt-7">
        <div className="mb-4">
          <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
            My rewards
          </p>
          <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
            Bastly Cards
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {(data?.assignments || []).map((assignment) => (
            <article
              key={assignment._id}
              className={[
                'overflow-hidden rounded-[26px] border bg-white shadow-soft',
                assignment.status === 'assigned'
                  ? 'border-bastly-blue/20'
                  : 'border-line',
              ].join(' ')}
            >
              {assignment.rewardSnapshot?.rewardImageUrl && (
                <div className="aspect-[8/5] overflow-hidden bg-surface">
                  <img
                    src={assignment.rewardSnapshot.rewardImageUrl}
                    alt=""
                    className="size-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="bg-bastly-navy p-5 text-white">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white">
                    {assignment.rewardSnapshot?.partnerLogoUrl ? (
                      <img
                        src={assignment.rewardSnapshot.partnerLogoUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <Gift className="text-bastly-blue" size={20} />
                    )}
                  </span>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] font-extrabold capitalize">
                    {assignment.status}
                  </span>
                </div>

                <p className="mb-1 text-xs font-bold text-white/55">
                  {assignment.rewardSnapshot?.partnerName}
                </p>
                <h3 className="mb-2 font-heading text-2xl font-bold tracking-[-0.04em]">
                  {assignment.rewardSnapshot?.title}
                </h3>
                <p className="mb-0 font-extrabold text-[#82c8ff]">
                  {assignment.rewardSnapshot?.offer}
                </p>
              </div>

              <div className="p-5">
                {assignment.rewardSnapshot?.description && (
                  <p className="mb-4 text-sm leading-6 text-muted">
                    {assignment.rewardSnapshot.description}
                  </p>
                )}

                {assignment.rewardSnapshot?.redemptionCode && (
                  <div className="mb-4 rounded-2xl bg-surface p-3">
                    <p className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                      Code
                    </p>
                    <div className="flex items-center justify-between gap-3">
                      <code className="font-heading text-lg font-bold text-bastly-navy">
                        {assignment.rewardSnapshot.redemptionCode}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyCode(assignment)}
                        className="grid size-9 place-items-center rounded-xl bg-white text-bastly-blue shadow-soft"
                        aria-label="Copy code"
                      >
                        {copied === assignment._id ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {assignment.rewardSnapshot?.instructions && (
                  <p className="mb-4 text-xs leading-6 text-muted">
                    {assignment.rewardSnapshot.instructions}
                  </p>
                )}

                {assignment.expiresAt && (
                  <p className="mb-4 text-[0.68rem] font-bold text-muted">
                    Valid until{' '}
                    {new Date(assignment.expiresAt).toLocaleDateString(
                      'en-GB',
                    )}
                  </p>
                )}

                {assignment.status === 'assigned' && (
                  <button
                    type="button"
                    onClick={() => redeem(assignment._id)}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-line text-sm font-extrabold text-bastly-navy"
                  >
                    <CheckCircle2 size={16} />
                    Mark as used
                  </button>
                )}
              </div>
            </article>
          ))}

          {data && data.assignments?.length === 0 && (
            <div className="rounded-[24px] border border-line bg-white p-10 text-center text-sm text-muted shadow-soft lg:col-span-2 xl:col-span-3">
              Your won Bastly Cards will live here.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function buildWheelGradient(count) {
  const palette = [
    '#237FD1',
    '#061F49',
    '#86C7F2',
    '#0A2A5C',
    '#55A9E6',
    '#1766B0',
    '#BDE5FF',
    '#102E59',
  ];

  const segment = 360 / count;
  const stops = [];

  for (let index = 0; index < count; index += 1) {
    const start = index * segment;
    const end = start + segment;
    stops.push(
      `${palette[index % palette.length]} ${start}deg ${end}deg`,
    );
  }

  return `conic-gradient(${stops.join(',')})`;
}
