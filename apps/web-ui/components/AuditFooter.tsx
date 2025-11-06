import React from 'react';

type Props = { mode?: 'Mediated' | 'Direct' };
/**
 * Phase-1 skeleton: visual-only audit footer.
 * Phase-2: bind to real session state + audit sink.
 */
export default function AuditFooter({ mode = 'Mediated' }: Props) {
  const cls = mode === 'Direct' ? 'audit-footer direct' : 'audit-footer mediated';
  return (
    <div className={cls} role="status" aria-live="polite" aria-label="Conversation mode">
      <span className="label">{mode}</span>
    </div>
  );
}
