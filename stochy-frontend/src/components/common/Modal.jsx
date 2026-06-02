import { X } from 'lucide-react';
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className={`relative glass-panel w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-in`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"><X size={20} className="text-slate-200" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
