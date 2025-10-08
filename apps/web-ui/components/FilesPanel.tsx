'use client';
export default function FilesPanel() {
  // Phase-1 placeholder list; replace with real data in Phase-2.
  const files = [
    { name: 'launch_openwebui.vbs', size: '399.0 B' },
    { name: 'docker_compose_archon_base.yml', size: '561.0 B' },
  ];
  return (
    <section aria-label="Files Panel" className="card">
      <h3 className="card-title">Files</h3>
      <ul className="space-y-1 text-sm" data-sort="alpha">
        {files.map((f, i) => (
          <li key={i} className="file-row">
            <span>{f.name}</span>
            <span className="opacity-60">{f.size}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
