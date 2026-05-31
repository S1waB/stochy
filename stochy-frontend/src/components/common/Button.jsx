export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'font-medium rounded-lg px-4 py-2.5 transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm';
  const variants = {
    primary: 'bg-[#2E5FA3] hover:bg-[#1A3C6E] text-white shadow-sm',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
    ghost: 'hover:bg-gray-100 text-gray-600',
    success: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
