export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'font-semibold rounded-2xl px-5 py-3 transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm';
  const variants = {
    primary: 'bg-gradient-to-r from-brand-light to-accent text-slate-950 shadow-[0_20px_60px_rgba(240,165,0,0.18)]',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    outline: 'border border-[var(--surface-border)] bg-[var(--surface-muted)] text-[var(--text-color)] hover:bg-[var(--surface-border)]/50',
    ghost: 'bg-transparent text-[var(--text-color)] hover:bg-[var(--surface-muted)]',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
