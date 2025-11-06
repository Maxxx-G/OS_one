import { NextResponse } from 'next/server';

type Params = { target: 'openai' | 'ollama' };

export async function GET(_: Request, { params }: { params: Params }) {
  const { target } = params;
  return NextResponse.json({
    ok: true,
    target,
    ts: Date.now(),
    mode: 'stub',
  });
}
