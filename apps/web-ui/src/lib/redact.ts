// Minimal local redaction: emails, phones, CC-like, IPv4, JWT-ish, window captions key
// Replace with deterministic placeholders: [EMAIL#1], [PHONE#1], etc.
export type RedactionReport = { text: string; hitCounts: Record<string, number> };

const R = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
  cc: /\b(?:\d[ -]*?){13,19}\b/g, // crude; catches long digit runs
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  jwt: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
  path: /[A-Z]:\\[^\s]+/gi, // Windows paths
  window: /\[WINDOW:[^\]]+\]/g, // already-labeled window titles (if present)
};

function maskAll(input: string, re: RegExp, label: string, counts: Record<string, number>) {
  return input.replace(re, () => {
    const n = (counts[label] ?? 0) + 1;
    counts[label] = n;
    return `[${label.toUpperCase()}#${n}]`;
  });
}

export function redactText(input: string): RedactionReport {
  let text = input ?? '';
  const hitCounts: Record<string, number> = {};
  for (const [label, re] of Object.entries(R)) {
    text = maskAll(text, re, label, hitCounts);
  }
  // Normalize excessive whitespace newlines after masking
  text = text.replace(/[ \t]+\n/g, '\n').trim();
  return { text, hitCounts };
}
