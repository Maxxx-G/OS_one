/**
 * Voice Actions - Voice Phase 5 Real Actions
 * Execute voice intents locally (no API calls)
 */

import { overwatchStore } from '../../store/overwatch';

export type ActionResult = {
  ok: boolean;
  uiHint?: string;
};

/**
 * Perform a voice action based on classified intent
 * @param intent - The classified intent (e.g., 'overwatch.pause')
 * @param transcript - Original user transcript (for context)
 * @returns Action result with success status and optional UI hint
 */
export async function performVoiceAction(
  intent: string,
  transcript: string,
): Promise<ActionResult> {
  switch (intent) {
    case 'overwatch.pause':
      overwatchStore.pause();
      return { ok: true, uiHint: 'Overwatch paused' };

    case 'overwatch.resume':
      overwatchStore.resume();
      return { ok: true, uiHint: 'Overwatch resumed' };

    case 'open.settings':
      // Emit custom event for settings panel to listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('os1:open-settings', { detail: { transcript } }));
      }
      return { ok: true, uiHint: 'Opening settings' };

    default:
      // Intent not recognized or no action available
      return { ok: false };
  }
}
