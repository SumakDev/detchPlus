"use client";

import { useCallback, useEffect, useState } from "react";
import { getMe, type MeUser } from "@/lib/api/auth/me";

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

  async function loginWithToken(token: string) {
    localStorage.setItem("auth_token", token);
    await load();
  }

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user"); // importante para no dejar residuos
    setUser(null);
  }

  return { user, loading, loginWithToken, logout, reload: load };
}