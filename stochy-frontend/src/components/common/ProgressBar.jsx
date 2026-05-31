export default function ProgressBar({ value = 0, max = 100, color, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color || (pct < 70 ? 'bg-emerald-500' : pct < 90 ? 'bg-amber-500' : 'bg-red-500');
  return (
    <div className={`w-full bg-gray-100 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
