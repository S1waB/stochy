export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-[#2E5FA3]/10 text-[#2E5FA3]'
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>{children}</span>;
}
