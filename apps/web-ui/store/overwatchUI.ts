// minimal UI store (no deps)
let open = false;
let snap: 'right' | 'left' | 'top' | 'bottom' = 'right';
const subs = new Set<() => void>();

export const overwatchUI = {
  get: () => open,
  set: (v: boolean) => {
    open = v;
    subs.forEach((fn) => fn());
  },
  toggle: () => overwatchUI.set(!open),
  subscribe: (fn: () => void) => (subs.add(fn), () => subs.delete(fn)),
  getSnap: () => snap,
  setSnap: (s: 'right' | 'left' | 'top' | 'bottom') => {
    snap = s;
    subs.forEach((fn) => fn());
  },
};
