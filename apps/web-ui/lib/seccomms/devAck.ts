/**
 * SEC-COMMS Development Auto-Acknowledge
 * 
 * Automatically acknowledges SEC-COMMS prompts when running on localhost
 * or when NEXT_PUBLIC_SEC_COMMS_DEV=1 is set.
 * 
 * This eliminates the blocking consent popup during local development,
 * allowing the Reasoning loop to start immediately.
 */

export function initSecCommsDevAck(): (() => void) | undefined {
  if (typeof window === 'undefined') return;
  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const devFlag = process.env.NEXT_PUBLIC_SEC_COMMS_DEV === '1';
  if (!isLocal && !devFlag) return;

  const ack = () => window.dispatchEvent(new Event('os1:seccomms:ack'));

  // Burst (microtask + two timers) to win race vs initial prompt
  queueMicrotask(ack);
  setTimeout(ack, 0);
  setTimeout(ack, 25);

  // Short retry window (1.5s) re-acking every 100ms for late mounts
  const start = Date.now();
  const iv = setInterval(() => {
    ack();
    if (Date.now() - start > 1500) clearInterval(iv);
  }, 100);

  // Re-ack whenever an explicit require event fires
  const onRequire = () => ack();
  window.addEventListener('os1:seccomms:require', onRequire);

  // Also re-ack when tab becomes visible again (focus/visibility change)
  const onVisibility = () => {
    if (!document.hidden) ack();
  };
  window.addEventListener('visibilitychange', onVisibility);

  return () => {
    clearInterval(iv);
    window.removeEventListener('os1:seccomms:require', onRequire);
    window.removeEventListener('visibilitychange', onVisibility);
  };
}
