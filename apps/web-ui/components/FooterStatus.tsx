'use client';

import { useEffect, useState } from 'react';

export default function FooterStatus(){
  const [txt,setTxt] = useState('Mediated');
  const [prov,setProv] = useState<string>(process.env.NEXT_PUBLIC_PROVIDER || 'OpenAIResponses');
  const [live,setLive] = useState(!!process.env.NEXT_PUBLIC_LIVE_BASE);
  const [ok,setOk] = useState<'?'|'OK'|'ERR'>('?');
  const [stt,setStt] = useState<'?'|'OK'|'ERR'>('?');
  const [failCount, setFailCount] = useState(0);
  const [animateOk, setAnimateOk] = useState(false);
  const [animateStt, setAnimateStt] = useState(false);

  const probe = async () => {
    try{
      const r = await fetch('/api/health');
      const j = await r.json();
      const newOk = j?.ok && (j.llmOk || j.voice?.llmOk) ? 'OK' : 'ERR';
      const newStt = j?.sttOk ? 'OK' : 'ERR';
      
      // Trigger animation on state change
      if (newOk !== ok) setAnimateOk(true);
      if (newStt !== stt) setAnimateStt(true);
      
      setOk(newOk);
      setStt(newStt);
      setFailCount(0); // Reset on success
    } catch {
      setOk('ERR');
      setStt('ERR');
      setFailCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    probe();
    
    // Auto-refresh every 30s unless degraded (3+ consecutive failures)
    const interval = setInterval(() => {
      if (failCount < 3) {
        probe();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [failCount]);

  // Clear animation classes after transition
  useEffect(() => {
    if (animateOk) {
      const timer = setTimeout(() => setAnimateOk(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animateOk]);

  useEffect(() => {
    if (animateStt) {
      const timer = setTimeout(() => setAnimateStt(false), 300);
      return () => clearTimeout(timer);
    }
  }, [animateStt]);

  const mode = process.env.NEXT_PUBLIC_DIRECT_AGENT==='1' ? 'Direct' : 'Mediated';
  return (
    <div className="fixed bottom-2 left-2 text-xs px-2 py-1 rounded bg-neutral-900/90 border border-neutral-700">
      <span>{mode}</span>
      <span className="mx-2">•</span>
      <span>{prov}{live?' (Live)':' (Universe)'}</span>
      <span 
        className={`ml-2 px-1 rounded transition-all ${animateOk ? 'scale-110' : ''} ${ok==='OK'?'bg-green-700':'bg-red-700'}`}
      >
        {ok}
      </span>
      <span 
        className={`ml-2 px-1 rounded transition-all ${animateStt ? 'scale-110' : ''} ${stt==='OK'?'bg-green-700':'bg-red-700'}`}
      >
        STT: {stt}
      </span>
      {failCount >= 3 && <span className="ml-2 text-red-400 text-[10px]">(paused)</span>}
    </div>
  );
}
