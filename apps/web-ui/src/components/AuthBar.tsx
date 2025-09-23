import React, { useState } from 'react';
import { useAuth } from '../state/AuthContext';

export const AuthBar: React.FC = () => {
  const { userId, token, setUserId, setToken } = useAuth();
  const [id, setId] = useState(userId || '');
  const [tk, setTk] = useState(token || '');

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label>User ID</label>
      <input
        className="border rounded px-2 py-1 w-48"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="uuid-from-auth"
      />
      <label>JWT</label>
      <input
        className="border rounded px-2 py-1 w-96"
        value={tk}
        onChange={(e) => setTk(e.target.value)}
        placeholder="paste user JWT (no 'Bearer' prefix)"
      />
      <button
        className="border rounded px-2 py-1"
        onClick={() => {
          setUserId(id.trim());
          setToken(tk.trim());
        }}
        title="Save to localStorage and hydrate globals for DB adapter"
      >
        Apply
      </button>
    </div>
  );
};
