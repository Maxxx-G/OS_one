/**
 * Overwatch Store - Voice Phase 5 Real Actions
 * Lightweight state management for Overwatch pause/resume
 */

import { useState, useEffect } from 'react';

type OverwatchState = {
  active: boolean;
  pause: () => void;
  resume: () => void;
};

// Global state (singleton pattern)
let overwatchActive = true;
const listeners = new Set<(active: boolean) => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn(overwatchActive));
}

export const overwatchStore = {
  getState: () => ({ active: overwatchActive }),
  pause: () => {
    overwatchActive = false;
    notifyListeners();
  },
  resume: () => {
    overwatchActive = true;
    notifyListeners();
  },
  subscribe: (listener: (active: boolean) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/**
 * React hook for Overwatch state
 */
export function useOverwatch(): OverwatchState {
  const [active, setActive] = useState(overwatchActive);

  useEffect(() => {
    const unsubscribe = overwatchStore.subscribe(setActive);
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    active,
    pause: overwatchStore.pause,
    resume: overwatchStore.resume,
  };
}
