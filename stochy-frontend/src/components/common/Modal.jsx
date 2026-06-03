import { X } from 'lucide-react';
export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-[rgba(15,23,42,0.75)] backdrop-blur-sm" />
      <div className={`relative glass-panel w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-in`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--surface-border)]">
          <h2 className="text-lg font-semibold text-[var(--text-color)]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"><X size={20} className="text-[var(--text-muted)]" /></button>
        </div>
        <div className="p-6 text-[var(--text-color)]">{children}</div>
      </div>
    </div>
  );
}
