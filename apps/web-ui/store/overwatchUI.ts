// minimal UI store (no deps)
let open = false;
const subs = new Set<() => void>();

export const overwatchUI = {
  get: () => open,
  set: (v: boolean) => {
    open = v;
    subs.forEach((fn) => fn());
  },
  toggle: () => overwatchUI.set(!open),
  subscribe: (fn: () => void) => (subs.add(fn), () => subs.delete(fn)),
};
