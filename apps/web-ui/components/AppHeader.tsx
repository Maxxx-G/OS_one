'use client';
import React from 'react';

export default function AppHeader() {
  return (
    <div role="banner" className="flex h-12 items-center justify-between border-b px-3">
      <div className="flex items-center gap-2">
        <label htmlFor="app-search" className="sr-only">
          Search
        </label>
        <div className="flex items-center gap-2 rounded-md border px-2 py-1">
          <span className="text-xs uppercase tracking-wide">Search</span>
          <input
            id="app-search"
            placeholder="Search"
            className="h-7 w-64 border-none text-sm outline-none"
          />
          <button type="button" aria-label="Clear search" className="text-xs uppercase opacity-60">
            Clear
          </button>
        </div>
      </div>
      <div className="text-sm font-semibold">OS One Universe</div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-md border px-2 py-1 text-sm"
        >
          Alerts
        </button>
        <button
          type="button"
          aria-label="User menu"
          className="h-8 w-8 rounded-full border text-sm"
        >
          Me
        </button>
      </div>
    </div>
  );
}
