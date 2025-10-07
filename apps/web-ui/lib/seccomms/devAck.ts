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
  // Only run in browser
  if (typeof window === 'undefined') return undefined;

  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const devFlag = process.env.NEXT_PUBLIC_SEC_COMMS_DEV === '1';

  // Only auto-ack in local development or with explicit override
  if (!isLocal && !devFlag) return undefined;

  const ack = () => {
    window.dispatchEvent(new Event('os1:seccomms:ack'));
  };

  // Acknowledge immediately on init (covers first Start click)
  queueMicrotask(ack);

  // Auto-ack any subsequent SEC-COMMS requirements
  const onRequire = () => {
    ack();
  };

  window.addEventListener('os1:seccomms:require', onRequire);

  // Return cleanup function for HMR/unmount patterns
  return () => {
    window.removeEventListener('os1:seccomms:require', onRequire);
  };
}
