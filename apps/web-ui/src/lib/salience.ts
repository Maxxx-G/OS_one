export function scoreSalience(input: { prompt: string; output: string }) {
  const { prompt, output } = input;
  const text = `${prompt}\n${output}`.trim();
  if (!text) return 0;

  const len = Math.min(text.length, 4000);
  const keywords = ['remember', 'always', 'preference', 'policy', 'rule', 'contact', 'deadline'];
  const hits = keywords.reduce((n, k) => n + (text.toLowerCase().includes(k) ? 1 : 0), 0);

  const uniqTokens = new Set(text.toLowerCase().split(/\W+/).filter(Boolean));
  const density = Math.min(uniqTokens.size / 200, 1);

  // simple heuristic blend: length + keyword hits + token diversity
  const raw = (len / 4000) * 0.4 + (Math.min(hits, 5) / 5) * 0.3 + density * 0.3;
  return Math.max(0, Math.min(raw, 1));
}
