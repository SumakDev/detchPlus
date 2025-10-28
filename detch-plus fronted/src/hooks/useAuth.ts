"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, type MeUser } from "@/lib/api/auth/me";
import { logoutApi } from "@/lib/api/auth";

export function useAuth() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      if (!localStorage.getItem("auth_token")) {
        setUser(null);
        return;
      }
      const { user } = await getMe();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loginWithToken(token: string, sessionId?: string) {
    localStorage.setItem("auth_token", token);
    if (sessionId) localStorage.setItem("session_id", sessionId);
    await load();
  }

  async function logout() {
    try { await logoutApi(); } catch {}
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    localStorage.removeItem("session_id");
    setUser(null);
  }

  return { user, loading, loginWithToken, logout, reload: load };
}