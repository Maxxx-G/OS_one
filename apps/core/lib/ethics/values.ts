export interface EthicsSignal {
  level: 'PRIMACY' | 'SECONDARY' | 'GUARDIAN';
  source: string;
  context: string;
}

export function tagDecision(context: string, level: EthicsSignal['level']): EthicsSignal {
  // attach an ethics tag to any task/agent decision
  return { level, source: 'ethics-core', context };
}

export function resolveConflict(primary: EthicsSignal, secondary: EthicsSignal): EthicsSignal {
  // placeholder: in later builds this will favor human-protective outcomes
  return primary.level === 'PRIMACY' ? primary : secondary;
}
