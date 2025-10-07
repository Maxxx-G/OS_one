'use client';

import { useEffect, useState } from 'react';

export default function FooterStatus(){
  const [txt,setTxt] = useState('Mediated');
  const [prov,setProv] = useState<string>(process.env.NEXT_PUBLIC_PROVIDER || 'OpenAIResponses');
  const [live,setLive] = useState(!!process.env.NEXT_PUBLIC_LIVE_BASE);
  const [ok,setOk] = useState<'?'|'OK'|'ERR'>('?');
  const [stt,setStt] = useState<'?'|'OK'|'ERR'>('?');
  useEffect(()=>{ (async ()=>{
    try{
      const r=await fetch('/api/health'); const j=await r.json();
      setOk(j?.ok && (j.llmOk||j.voice?.llmOk) ? 'OK':'ERR');
      setStt(j?.sttOk ? 'OK' : 'ERR');
    }catch{
      setOk('ERR'); setStt('ERR');
    }
  })(); },[]);
  const mode = process.env.NEXT_PUBLIC_DIRECT_AGENT==='1' ? 'Direct' : 'Mediated';
  return (
    <div className="fixed bottom-2 left-2 text-xs px-2 py-1 rounded bg-neutral-900/90 border border-neutral-700">
      <span>{mode}</span>
      <span className="mx-2">•</span>
      <span>{prov}{live?' (Live)':' (Universe)'}</span>
      <span className={`ml-2 px-1 rounded ${ok==='OK'?'bg-green-700':'bg-red-700'}`}>{ok}</span>
      <span className={`ml-2 px-1 rounded ${stt==='OK'?'bg-green-700':'bg-red-700'}`}>STT: {stt}</span>
    </div>
  );
}
