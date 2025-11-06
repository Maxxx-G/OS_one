export function emitProfit(event:any){
  try{
    const payload=JSON.stringify(event);
    if(typeof navigator!=='undefined' && navigator.sendBeacon){
      const blob=new Blob([payload],{type:'application/json'});
      navigator.sendBeacon('/api/telemetry/profit',blob);
      return;
    }
    fetch('/api/telemetry/profit',{method:'POST',headers:{'Content-Type':'application/json'},body:payload});
  }catch(e){console.error('emitProfit failed',e);}
}
