import { Inbox } from 'lucide-react';
export default function EmptyState({ title = 'Aucune donnée', message = '', icon: Icon = Inbox }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
      <Icon size={48} className="text-[var(--text-muted)] mb-4" />
      <h3 className="text-lg font-medium text-[var(--text-color)]">{title}</h3>
      {message && <p className="text-sm text-[var(--text-muted)] mt-1">{message}</p>}
    </div>
  );
}
