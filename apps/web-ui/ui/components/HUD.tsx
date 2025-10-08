'use client';
import { FeaturePill } from './FeaturePill';
import { BadgeEthic } from './BadgeEthic';
import { emitProfit } from '@/lib/telemetry/emitter';

export function HUD({ ethic='SECONDARY' }:{ ethic?: 'PRIMACY'|'SECONDARY'|'GUARDIAN' }) {
  const handleUse = (id:string) => {
    emitProfit({ id:`hud-${id}-${Date.now()}`, ts:new Date().toISOString(), tier:document.cookie.match(/osone_tier=([A-Z]+)/)?.[1]||'CORE', feature_id:id, ethic, action:'use', source:'hud' });
  };
  return (
    <div className="fixed bottom-3 right-3 flex gap-2 z-50">
      <BadgeEthic level={ethic} />
      <FeaturePill id="calendar"><span onClick={()=>handleUse('calendar')}>Calendar</span></FeaturePill>
      <FeaturePill id="timeManager"><span onClick={()=>handleUse('timeManager')}>TimeMgr</span></FeaturePill>
      <FeaturePill id="voiceSync"><span onClick={()=>handleUse('voiceSync')}>Voice</span></FeaturePill>
    </div>
  );
}
