import React, { useMemo, useState } from 'react';
import { useAuth } from '../state/AuthContext';
import { useProfile } from '../hooks/useProfile';

export const ProfilePanel: React.FC = () => {
  const { token } = useAuth();
  const { profile, loading, update } = useProfile();

  const [tone, setTone] = useState(profile?.tone || 'neutral');
  const [fmt, setFmt] = useState(() => JSON.stringify(profile?.formatting_prefs || {}, null, 2));
  const [dos, setDos] = useState((profile?.do_list || []).join(', '));
  const [donts, setDonts] = useState((profile?.dont_list || []).join(', '));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'err'>('idle');

  React.useEffect(() => {
    setTone(profile?.tone || 'neutral');
    setFmt(JSON.stringify(profile?.formatting_prefs || {}, null, 2));
    setDos((profile?.do_list || []).join(', '));
    setDonts((profile?.dont_list || []).join(', '));
  }, [profile]);

  const disabled = !token || loading || status === 'saving';
  const parsedFmt = useMemo(() => {
    try {
      return JSON.parse(fmt || '{}');
    } catch {
      return null;
    }
  }, [fmt]);

  const onApply = async () => {
    if (!parsedFmt) {
      setStatus('err');
      return;
    }
    setStatus('saving');
    const result = await update({
      tone,
      formatting_prefs: parsedFmt,
      do_list: dos
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      dont_list: donts
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setStatus(result.ok ? 'saved' : 'err');
    setTimeout(() => setStatus('idle'), 1200);
  };

  return (
    <div className="grid gap-2 p-2 border rounded">
      <div className="text-sm font-medium">Profile (mirroring)</div>
      <div className="grid gap-2">
        <label className="text-xs">Tone</label>
        <input
          className="border rounded px-2 py-1"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="neutral|concise|friendly|formal"
        />
        <label className="text-xs">Formatting Prefs (JSON)</label>
        <textarea
          className="border rounded p-2 text-xs min-h-[100px]"
          value={fmt}
          onChange={(e) => setFmt(e.target.value)}
        />
        <label className="text-xs">Do List (comma-separated)</label>
        <input
          className="border rounded px-2 py-1"
          value={dos}
          onChange={(e) => setDos(e.target.value)}
        />
        <label className="text-xs">Don't List (comma-separated)</label>
        <input
          className="border rounded px-2 py-1"
          value={donts}
          onChange={(e) => setDonts(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          className="border rounded px-2 py-1 text-sm disabled:opacity-50"
          disabled={disabled || !parsedFmt}
          onClick={onApply}
        >
          {status === 'saving' ? 'Saving…' : 'Apply'}
        </button>
        {!token && (
          <span className="text-xs text-gray-500">paste a JWT in AuthBar to enable saves</span>
        )}
        {status === 'saved' && <span className="text-xs text-green-700">saved</span>}
        {status === 'err' && <span className="text-xs text-red-700">error</span>}
      </div>
    </div>
  );
};
