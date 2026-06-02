export default function ProgressBar({ value = 0, max = 100, color, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color || (pct < 70 ? 'bg-emerald-400' : pct < 90 ? 'bg-amber-400' : 'bg-rose-400');
  return (
    <div className={`w-full bg-white/5 rounded-full h-3 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
