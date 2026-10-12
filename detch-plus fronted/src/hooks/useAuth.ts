"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, type MeUser } from "@/lib/api/auth/me";

export function useAuth() {
  const [user, setUser] = useState<MeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (!storedToken) {
        setUser(null);
        setToken(null);
        return;
      }
      setToken(storedToken);
      const { user } = await getMe();
      setUser(user);
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function loginWithToken(newToken: string) {
    if (typeof window !== "undefined") localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    await load();
  }

  function logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    setUser(null);
    setToken(null);
  }

  return { user, token, loading, loginWithToken, logout, reload: load };
}