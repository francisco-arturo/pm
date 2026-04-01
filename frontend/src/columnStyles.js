const PALETTE = [
  {
    dot: 'bg-blue-500',
    count: 'bg-blue-500/15 text-blue-400',
    dragOver: 'bg-blue-500/[0.04]',
    border: 'border-t-blue-500',
  },
  {
    dot: 'bg-amber-500',
    count: 'bg-amber-500/15 text-amber-400',
    dragOver: 'bg-amber-500/[0.04]',
    border: 'border-t-amber-500',
  },
  {
    dot: 'bg-emerald-500',
    count: 'bg-emerald-500/15 text-emerald-400',
    dragOver: 'bg-emerald-500/[0.04]',
    border: 'border-t-emerald-500',
  },
  {
    dot: 'bg-violet-500',
    count: 'bg-violet-500/15 text-violet-400',
    dragOver: 'bg-violet-500/[0.04]',
    border: 'border-t-violet-500',
  },
  {
    dot: 'bg-cyan-500',
    count: 'bg-cyan-500/15 text-cyan-400',
    dragOver: 'bg-cyan-500/[0.04]',
    border: 'border-t-cyan-500',
  },
  {
    dot: 'bg-rose-500',
    count: 'bg-rose-500/15 text-rose-400',
    dragOver: 'bg-rose-500/[0.04]',
    border: 'border-t-rose-500',
  },
];

export function getColumnTheme(status) {
  let h = 0;
  const s = String(status);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  const p = PALETTE[Math.abs(h) % PALETTE.length];
  return {
    ...p,
    left: p.border.replace('border-t-', 'border-l-'),
  };
}
