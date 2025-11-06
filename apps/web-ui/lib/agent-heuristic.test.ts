import { describe, it, expect } from 'vitest';
import { scoreAgents } from './agent-heuristic';

describe('scoreAgents', () => {
  it('favors codex for api telemetry routing', () => {
    const result = scoreAgents('refactor api telemetry routing');
    expect(result.chosen).toBe('codex');
    expect(result.scores.codex).toBeGreaterThanOrEqual(result.scores.claude);
    expect(result.scores.codex).toBeGreaterThanOrEqual(result.scores.copilot);
  });

  it('favors copilot for button css/tsx', () => {
    const result = scoreAgents('rename button css and fix tsx');
    expect(result.chosen).toBe('copilot');
  });

  it('favors claude for spec audit', () => {
    const result = scoreAgents('audit spec security edge cases');
    expect(result.chosen).toBe('claude');
  });

  it('stable tie-break: codex > claude > copilot', () => {
    const result = scoreAgents('neutral task');
    // With no matches, all scores are 0, so tie-break should favor codex
    expect(result.chosen).toBe('codex');
  });

  it('normalizes scores in [0,1]', () => {
    const result = scoreAgents('any task');
    Object.values(result.scores).forEach(score => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
