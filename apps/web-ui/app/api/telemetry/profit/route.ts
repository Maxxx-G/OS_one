export const runtime = 'edge';

const schemaKeys = ['id','ts','tier','feature_id','ethic','action','duration_ms','revenue_impact','source','metadata'];

export async function POST(req: Request) {
  try {
    const ev = await req.json();
    // Validate schema
    for (const k of Object.keys(ev)) if (!schemaKeys.includes(k)) 
      return new Response(JSON.stringify({ ok:false, error:`invalid_field:${k}` }),{ status:400 });
    // Ethics enforcement
    if (['upgrade_prompt'].includes(ev.action) && ev.ethic !== 'PRIMACY')
      return new Response(JSON.stringify({ ok:false, error:'ETHIC_TOO_LOW' }),{ status:403 });
    const fs = require('fs');
    const dir = './telemetry/profit'; if (!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
    fs.appendFileSync(`${dir}/${new Date().toISOString().slice(0,10)}.log`, JSON.stringify(ev)+'\n');
    return new Response(JSON.stringify({ ok:true }),{ status:200 });
  } catch(e:any){ return new Response(JSON.stringify({ ok:false, error:e.message }),{ status:500 }); }
}
