'use client';

import React from 'react';

const AURL = process.env.NEXT_PUBLIC_ARCHON_URL || 'http://localhost:7700';

export default function OverwatchQueuePanel() {
  const [items, setItems] = React.useState<any[]>([]);
  const [runner, setRunner] = React.useState<'codex' | 'copilot' | 'api'>('api');
  const [job, setJob] = React.useState<any | null>(null);
  const [jobLog, setJobLog] = React.useState<string[]>([]);
  const [sel, setSel] = React.useState<string | null>(null);
  const [detail, setDetail] = React.useState<any | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${AURL}/v1/overwatch/queue`);
        const j = await r.json();
        setItems(j?.items || []);
      } catch {
        /* ignore */
      }
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  async function openItem(id: string) {
    setSel(id);
    const r = await fetch(`${AURL}/v1/overwatch/item?id=${encodeURIComponent(id)}`);
    const j = await r.json();
    setDetail(j?.item || null);
    setJob(null);
    setJobLog([]);
  }

  async function dispatchSelected(mode: 'dry' | 'apply' = 'apply') {
    if (!sel) return;
    (window as any).os1Audit?.log?.('ow-dispatch', { taskId: sel, runner, mode });
    const r = await fetch(`${AURL}/v1/executors/dispatch`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taskId: sel, runner, mode }),
    });
    const j = await r.json();
    if (j?.jobId) {
      const id = j.jobId;
      setJob({ id });
      // poll logs briefly
      const poll = async () => {
        const rr = await fetch(`${AURL}/v1/executors/logs?jobId=${encodeURIComponent(id)}`);
        const jj = await rr.json();
        if (jj?.job) {
          setJob(jj.job);
          setJobLog(jj.job.logs || []);
        }
      };
      await poll();
      setTimeout(poll, 1200);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    (window as any).os1Audit?.log?.('ow-copy', { bytes: text.length });
  }

  return (
    <div className="card">
      <div className="card-title">Overwatch Queue</div>
      <div style={{ maxHeight: 400, overflow: 'auto' }}>
        {items.map((it) => (
          <div
            key={it.id}
            className="file-row"
            onClick={() => openItem(it.id)}
            style={{ cursor: 'pointer', background: sel === it.id ? '#f0f9ff' : undefined }}
          >
            <span>{it.title || it.id}</span>
          </div>
        ))}
      </div>
      {detail && (
        <div className="stb-preview">
          <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 6 }}>
            <label className="muted">Runner</label>
            <select value={runner} onChange={(e) => setRunner(e.target.value as any)}>
              <option value="codex">codex (agentic)</option>
              <option value="copilot">copilot (agentic)</option>
              <option value="api">api (deterministic)</option>
            </select>
            <button className="btn sm" onClick={() => dispatchSelected('dry')} data-hotkey="">
              Dry-run
            </button>
            <button className="btn sm" onClick={() => dispatchSelected('apply')} data-hotkey="">
              Dispatch
            </button>
            <span className="spacer" />
            <button className="btn sm" onClick={() => copy(detail.stbB || '')}>
              Copy STB-B
            </button>
            <button className="btn sm" onClick={() => copy(detail.stbA || '')}>
              Copy STB-A
            </button>
          </div>
          <pre className="mono">{(detail.stbB || '').slice(0, 2000)}</pre>
          <pre className="mono">{(detail.stbA || '').slice(0, 2000)}</pre>
          {job && (
            <div className="mono" style={{ marginTop: 6 }}>
              <div>
                <strong>Job:</strong> {job.id} <span className="muted">[{job.status || '…'}]</span>
              </div>
              {jobLog.map((l, i) => (
                <div key={i}>• {l}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
