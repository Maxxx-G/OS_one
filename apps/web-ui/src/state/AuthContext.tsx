import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthState = {
  userId: string | null;
  token: string | null;
  setUserId: (v: string) => void;
  setToken: (v: string) => void;
};

const Ctx = createContext<AuthState | null>(null);

const LS_ID = 'os1:user_id';
const LS_TK = 'os1:user_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof window !== 'undefined' ? window.localStorage.getItem(LS_ID) : null;
    const tk = typeof window !== 'undefined' ? window.localStorage.getItem(LS_TK) : null;
    if (id) setUserIdState(id);
    if (tk) setTokenState(tk);
    // hydrate globals for existing adapters
    (globalThis as any).os1_user_id = id || null;
    (globalThis as any).os1_user_token = tk ? `Bearer ${tk}` : null;
  }, []);

  const setUserId = (v: string) => {
    setUserIdState(v || null);
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_ID, v || '');
    (globalThis as any).os1_user_id = v || null;
  };

  const setToken = (v: string) => {
    setTokenState(v || null);
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_TK, v || '');
    (globalThis as any).os1_user_token = v ? `Bearer ${v}` : null;
  };

  return <Ctx.Provider value={{ userId, token, setUserId, setToken }}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthContext missing');
  return v;
};
