import { NextResponse } from 'next/server';

const SYSTEM_CONSTANTS = {
  project: 'OS One Universe - Phase 1',
  guardrails: { redactionDefault: true, directDefault: false },
  files: {
    systemInstructions: 'user.chatgpt5.os1p1.system-instructions-block.v2025.09.17.md',
    verbsReference: 'user.chatgpt5.os1p1.verbs-reference.v2025.09.26.md',
    stbTemplate: 'user.chatgpt5.os1p1.single-task-block.v2025.09.23.md',
  },
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: Date.now(),
    system: SYSTEM_CONSTANTS,
  });
}
