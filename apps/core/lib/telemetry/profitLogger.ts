// add export for schemaKeys so validator scripts can import same list
export const profitSchemaKeys = ['id','ts','tier','feature_id','ethic','action','duration_ms','revenue_impact','source','metadata'];

export interface ProfitEvent {
  id: string; ts: string; tier: string; feature_id: string;
  ethic: 'PRIMACY'|'SECONDARY'|'GUARDIAN';
  action: string; duration_ms?: number; revenue_impact?: number;
  source?: string; metadata?: Record<string,any>;
}

export function logProfit(ev: ProfitEvent) {
  // Client-side: queue for API endpoint (future)
  if (typeof window !== 'undefined') {
    console.log('[PROFIT]', ev);
    return true;
  }
  // Server-side: write to filesystem
  try {
    const fs = require('fs');
    const dir = './telemetry/profit';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const line = JSON.stringify(ev) + '\n';
    fs.appendFileSync(`${dir}/${new Date().toISOString().slice(0,10)}.log`, line);
    return true;
  } catch(e){ console.error('Profit log failed', e); return false; }
}
