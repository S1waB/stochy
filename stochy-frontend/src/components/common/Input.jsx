import { forwardRef } from 'react';
const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>}
    <input ref={ref} className={`input-field ${error ? 'border-red-400 ring-red-400' : ''} ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
  </div>
));
Input.displayName = 'Input';
export default Input;
