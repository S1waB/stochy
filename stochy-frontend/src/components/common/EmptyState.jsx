import { Inbox } from 'lucide-react';
export default function EmptyState({ title = 'Aucune donnée', message = '', icon: Icon = Inbox }) {
  return (
    <div className="glass-card flex flex-col items-center justify-center py-12 text-center">
      <Icon size={48} className="text-slate-200 mb-4" />
      <h3 className="text-lg font-medium text-slate-100">{title}</h3>
      {message && <p className="text-sm text-slate-300 mt-1">{message}</p>}
    </div>
  );
}
