'use client';
type Row = { label: string; value: string };
export default function AdvancedParams() {
  const rows: Row[] = [
    { label: 'Stream Chat Response', value: 'Default' },
    { label: 'Stream Delta Chunk Size', value: 'Default' },
    { label: 'Function Calling', value: 'Default' },
    { label: 'Reasoning Tags', value: 'Default' },
  ];
  return (
    <section aria-label="Advanced Params" className="card">
      <h3 className="card-title">Advanced Params</h3>
      <ul className="list">
        {rows.map((r, i) => (
          <li key={i} className="kv-row">
            <span>{r.label}</span>
            <span className="opacity-60">{r.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
