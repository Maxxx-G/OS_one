'use client';
import { useEffect } from 'react';

/**
 * DOM-level alphabetical sort for any container with data-sort="alpha".
 * Sorts direct child elements by their visible textContent (case-insensitive).
 * Safe no-op if nothing matches.
 */
export default function AlphaSort() {
  useEffect(() => {
    const containers = Array.from(document.querySelectorAll<HTMLElement>('[data-sort="alpha"]'));
    containers.forEach((node) => {
      const children = Array.from(node.children) as HTMLElement[];
      if (children.length < 2) return;
      const sorted = [...children].sort((a, b) =>
        (a.textContent || '').trim().localeCompare((b.textContent || '').trim(), undefined, {
          sensitivity: 'base',
          numeric: true,
        }),
      );
      // Re-append in order if changed
      sorted.forEach((el) => node.appendChild(el));
    });
  }, []);
  return null;
}
