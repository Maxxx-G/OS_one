export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const schemaKeys = ['id','ts','tier','feature_id','ethic','action','duration_ms','revenue_impact','source','metadata'];

export async function POST(req: NextRequest) {
  try {
    const ev = await req.json();
    // Validate schema
    for (const k of Object.keys(ev)) if (!schemaKeys.includes(k)) 
      return NextResponse.json({ ok:false, error:`invalid_field:${k}` },{ status:400 });
    // Ethics enforcement
    if (['upgrade_prompt'].includes(ev.action) && ev.ethic !== 'PRIMACY')
      return NextResponse.json({ ok:false, error:'ETHIC_TOO_LOW' },{ status:403 });
    const fs = require('fs');
    const dir = './telemetry/profit'; if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
    fs.appendFileSync(`${dir}/${new Date().toISOString().slice(0,10)}.log`, JSON.stringify(ev)+'\n');
    return NextResponse.json({ ok:true });
  } catch(e:any){ return NextResponse.json({ ok:false, error:e.message },{ status:500 }); }
}
