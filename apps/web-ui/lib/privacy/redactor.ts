const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /\b(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{3}[-.\s]?\d{3,4}\b/;
const DOB = /\b(19|20)\d{2}[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/;
const TIME = /\b([01]?\d|2[0-3]):[0-5]\d\b/;
const IDLIKE = /\b[A-Z]{2}\d{6,}\b/;
// naive address token (street number + word)
const ADDRESS = /\b\d{1,5}\s+[A-Za-z]{2,}[\w\s]*\b/;

export function redactPII(input: string): string {
  return input
    .replace(EMAIL, '[REDACTED:EMAIL]')
    .replace(PHONE, '[REDACTED:PHONE]')
    .replace(DOB, '[REDACTED:DOB]')
    .replace(TIME, '[REDACTED:TIME]')
    .replace(IDLIKE, '[REDACTED:ID]')
    .replace(ADDRESS, '[REDACTED:ADDRESS]');
}

export function redactObject(obj: any): any {
  try {
    const s = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const r = redactPII(s);
    return typeof obj === 'string' ? r : JSON.parse(r);
  } catch {
    return obj;
  }
}
