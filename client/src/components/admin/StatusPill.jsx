const styles = {
  active: 'bg-[#eef8f1] text-[#18764a]',
  paid: 'bg-[#eef8f1] text-[#18764a]',
  published: 'bg-[#eef8f1] text-[#18764a]',
  pending: 'bg-[#fff6df] text-[#9a6510]',
  draft: 'bg-[#eef3f8] text-[#536579]',
  unregistered: 'bg-[#fff0ef] text-[#a83d36]',
  archived: 'bg-[#fff0ef] text-[#a83d36]',
  paused: 'bg-[#fff6df] text-[#9a6510]',
  expired: 'bg-[#eef3f8] text-[#536579]',
  assigned: 'bg-bastly-blue-pale text-bastly-blue-dark',
  redeemed: 'bg-[#eef8f1] text-[#18764a]',
};

export default function StatusPill({ value }) {
  const normalized = String(value || '').toLowerCase();

  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold capitalize',
        styles[normalized] || 'bg-bastly-blue-pale text-bastly-blue-dark',
      ].join(' ')}
    >
      {value}
    </span>
  );
}
