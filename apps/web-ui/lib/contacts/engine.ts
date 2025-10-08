import { redactObject } from '@/lib/privacy/redactor';
import { isPublic } from '@/lib/privacy/public-mode';

export type ConsentRef = { id: string; subject: string; scopes: string[]; issued_at: number; ttl_ms?: number };
export type Contact = {
  id: string; display_name: string;
  emails?: string[]; phones?: string[];
  addresses?: string[]; tags?: string[]; notes?: string;
  consent_ref?: string; created_at: number; sensitivity: 'P2';
};

const consents = new Map<string, ConsentRef>(); // consent_id -> consent
const contacts = new Map<string, Contact>();    // contact_id -> contact

function now() { return Date.now(); }
function expOk(c: ConsentRef) { return !c.ttl_ms || now() - c.issued_at < c.ttl_ms; }

export function issueConsent(subject: string, scopes: string[], ttl_ms?: number): ConsentRef {
  const id = `consent:${subject}:${now()}`;
  const ref: ConsentRef = { id, subject, scopes, issued_at: now(), ttl_ms };
  consents.set(id, ref);
  return ref;
}

export function hasConsent(consent_ref?: string, needed: string[] = []): boolean {
  if (!consent_ref) return false;
  const c = consents.get(consent_ref);
  if (!c || !expOk(c)) return false;
  return needed.every(s => c.scopes.includes(s));
}

export function upsertContact(session_id: string, payload: Omit<Contact,'id'|'created_at'|'sensitivity'>) {
  // Public-mode blocks P2 writes unless explicitly allowed & not public
  if (isPublic(session_id)) {
    throw new Error('PUBLIC_MODE_BLOCK');
  }
  // Require consent for P2 (emails/phones/addresses)
  if (!hasConsent(payload.consent_ref, ['contact.basic'])) {
    throw new Error('CONSENT_REQUIRED');
  }
  const safe = redactObject(payload) as any; // belt-and-braces
  const id = payload.display_name ? `contact:${payload.display_name.toLowerCase()}:${now()}` : `contact:${now()}`;
  const record: Contact = { ...safe, id, created_at: now(), sensitivity: 'P2' };
  contacts.set(id, record);
  return record;
}

export function listContacts() {
  return Array.from(contacts.values()).sort((a,b)=> a.created_at - b.created_at);
}
