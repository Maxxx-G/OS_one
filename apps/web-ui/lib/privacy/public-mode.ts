const publicSessions = new Set<string>();

export function setPublicMode(session_id: string, on: boolean) {
  if (on) publicSessions.add(session_id);
  else publicSessions.delete(session_id);
}

export function isPublic(session_id: string): boolean {
  return publicSessions.has(session_id);
}
