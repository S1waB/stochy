export default function Table({ columns, data, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#031024]/50">
      <table className="w-full text-sm">
        <thead><tr className="bg-white/5 border-b border-white/10">
          {columns.map(col => <th key={col.key} className="px-4 py-3 text-left font-semibold text-slate-300">{col.label}</th>)}
        </tr></thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick?.(row)} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
              {columns.map(col => <td key={col.key} className="px-4 py-3 text-slate-200">{col.render ? col.render(row) : row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
