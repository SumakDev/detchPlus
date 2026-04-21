"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMe, type MeUser } from "@/lib/api/auth/me";
import { logoutApi } from "@/lib/api/auth";

// Ajusta el TTL de caché de /me (ms). Evita pedir /me en cada navegación.
const ME_CACHE_TTL = 60_000; // 60s

function readLocal<T = any>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: string, value: any | null) {
  if (typeof window === "undefined") return;
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

export function useAuth() {
  // 1) Hidrata inmediatamente desde localStorage para pintar el menú sin esperar a /me
  const initialUser = (typeof window !== "undefined" ? readLocal<MeUser>("auth_user") : null) || null;

  const [user, setUser] = useState<MeUser | null>(initialUser);
  const [loading, setLoading] = useState<boolean>(() => {
    // Si ya tenemos user en cache, no bloquees el UI; validamos en background
    return false;
  });

  const tokenExists = typeof window !== "undefined" && !!localStorage.getItem("auth_token");
  const meValidatingRef = useRef<Promise<void> | null>(null);

  const setUserAndCache = useCallback((u: MeUser | null) => {
    setUser(u);
    writeLocal("auth_user", u);
  }, []);

  const validateMe = useCallback(async () => {
    if (!tokenExists) {
      setUserAndCache(null);
      return;
    }

    // Respeta TTL para evitar pedir /me en cada render/navegación
    const last = (typeof window !== "undefined" && Number(localStorage.getItem("me_last_validated"))) || 0;
    const now = Date.now();
    if (now - last < ME_CACHE_TTL && user) return;

    // Evita validaciones concurrentes
    if (meValidatingRef.current) return meValidatingRef.current;

    const run = (async () => {
      try {
        const { user } = await getMe();
        setUserAndCache(user);
        if (typeof window !== "undefined") localStorage.setItem("me_last_validated", String(Date.now()));
      } catch {
        // Si falla /me, considera la sesión inválida
        setUserAndCache(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("session_id");
        }
      }
    })();

    meValidatingRef.current = run.finally(() => {
      meValidatingRef.current = null;
    });

    return meValidatingRef.current;
  }, [tokenExists, user, setUserAndCache]);

  // 2) Valida en background en el primer render de cada página
  useEffect(() => {
    validateMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3) Sincroniza cambios de sesión entre pestañas/ventanas
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "auth_user") {
        const u = readLocal<MeUser>("auth_user");
        setUser(u);
      }
      if (e.key === "auth_token") {
        if (!localStorage.getItem("auth_token")) {
          // Se cerró sesión en otra pestaña
          setUserAndCache(null);
        } else {
          // Se inició sesión en otra pestaña
          validateMe();
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [setUserAndCache, validateMe]);

  // 4) API del hook
  async function loginWithToken(token: string, sessionId?: string, userSnapshot?: MeUser) {
    localStorage.setItem("auth_token", token);
    if (sessionId) localStorage.setItem("session_id", sessionId);
    // Si recibes el usuario en el login, úsalo para render inmediato
    if (userSnapshot) setUserAndCache(userSnapshot);
    await validateMe();
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {}
    localStorage.removeItem("auth_token");
    localStorage.removeItem("session_id");
    localStorage.removeItem("me_last_validated");
    setUserAndCache(null);
  }

  return {
    user,
    loading, // ya no bloquea el menú; lo dejamos por si quieres mostrar skeletons
    loginWithToken,
    logout,
    reload: validateMe,
  };
}