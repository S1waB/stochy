import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0} className="p-2 rounded-lg hover:bg-[var(--surface-muted)] disabled:opacity-30"><ChevronLeft size={18} /></button>
      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
        const p = totalPages <= 7 ? i : page <= 3 ? i : page >= totalPages - 4 ? totalPages - 7 + i : page - 3 + i;
        return (
          <button key={p} onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[var(--surface-border)] text-[var(--text-color)]' : 'text-[var(--text-color)] hover:bg-[var(--surface-muted)]'}`}>{p + 1}</button>
        );
      })}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className="p-2 rounded-lg hover:bg-[var(--surface-muted)] disabled:opacity-30"><ChevronRight size={18} /></button>
    </div>
  );
}
