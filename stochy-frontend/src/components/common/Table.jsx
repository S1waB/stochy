export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-bg)]">
      <table className="w-full text-sm">
        <thead><tr className="bg-[var(--surface-muted)] border-b border-[var(--surface-border)]">
          {columns.map(col => <th key={col.key} className="px-4 py-3 text-left font-semibold text-[var(--text-muted)]">{col.label}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={`border-b border-[var(--surface-border)] hover:bg-[var(--surface-muted)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
              {columns.map(col => <td key={col.key} className="px-4 py-3 text-[var(--text-color)]">{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
