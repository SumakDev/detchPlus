"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SessionsTable from "@/components/sesiones/SessionsTable";
import {
  fetchSesiones,
  closeSesion,
  deleteSesion,
  closeTodasSesionesUsuario
  
} from "@/lib/api/sesiones";
import { getMe } from "@/lib/api/auth/me";
import type { SesionUsuario } from "@/types/sesionUsuario";

export default function SesionesAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<SesionUsuario[]>([]);
  const [q, setQ] = useState("");
  const [user, setUser] = useState<string>("");
  const [act, setAct] = useState<"" | "true" | "false">("");
  const [exp, setExp] = useState<"" | "true" | "false">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // NUEVO: almacena al usuario actual y el id de sesión actual (jti)
  const [me, setMe] = useState<{ ID_USU: number; ID_ROL: number } | null>(null);
  const currentSessionId =
    typeof window !== "undefined" ? localStorage.getItem("session_id") : null;

  // Solo admins (1,2). Guarda "me" para comparar luego.
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    getMe()
      .then(({ user }) => {
        if (!user) {
          router.replace("/");
        } else if (![1, 2].includes(Number(user.ID_ROL))) {
          router.replace("/mi-cuenta");
        } else {
          setMe({ ID_USU: Number(user.ID_USU), ID_ROL: Number(user.ID_ROL) });
        }
      })
      .catch(() => router.replace("/"));
  }, [router]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSesiones({
        q,
        user: user ? Number(user) : undefined,
        act: act || undefined,
        exp: exp || undefined,
      });
      setItems(data);
    } catch (e: any) {
      // Si ya estás desautorizado por backend, evita que la UI quede “colgada”
      if (e?.status === 401 || e?.message?.toLowerCase?.().includes("no autenticado")) {
        forceLogout();
        return;
      }
      setError(e?.message || "Error al cargar sesiones");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function forceLogout() {
    // Limpia credenciales y redirige inmediatamente
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_id");
      localStorage.removeItem("auth_user");
    }
    router.replace("/");
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((s) => {
      const uName = s.usuario
        ? [s.usuario.NOM_USU, s.usuario.APE_USU, s.usuario.USR_USU]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
        : "";
      const matchesQ =
        !term ||
        s.ID_SES_USU.toLowerCase().includes(term) ||
        (s.IP_SES_USU || "").toLowerCase().includes(term) ||
        (s.UA_SES_USU || "").toLowerCase().includes(term) ||
        uName.includes(term);
      const matchesUser = !user || String(s.ID_USU) === user;
      const matchesAct = !act || String(s.ACT_SES_USU) === act;
      const isExpired = new Date(s.EXP_SES_USU).getTime() <= Date.now();
      const matchesExp = !exp || (exp === "true" ? isExpired : !isExpired);
      return matchesQ && matchesUser && matchesAct && matchesExp;
    });
  }, [items, q, user, act, exp]);

  return (
    <Layout>
      <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sesiones de usuarios</h1>
            <p className="text-gray-600">Monitorea y gestiona sesiones activas</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={load}>
              Refrescar
            </Button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <Input
              placeholder="Buscar por id, ip, agente o usuario"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64"
            />
            <Input
              placeholder="ID usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-36"
            />
            <select
              value={act}
              onChange={(e) => setAct(e.target.value as any)}
              className="border rounded px-2 py-2 text-sm"
            >
              <option value="">Activa (todas)</option>
              <option value="true">Solo activas</option>
              <option value="false">Solo inactivas</option>
            </select>
            <select
              value={exp}
              onChange={(e) => setExp(e.target.value as any)}
              className="border rounded px-2 py-2 text-sm"
            >
              <option value="">Expirada (todas)</option>
              <option value="true">Solo expiradas</option>
              <option value="false">Solo vigentes</option>
            </select>
            <Button variant="outline" onClick={load}>
              Aplicar
            </Button>
          </div>
        </div>

        {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <SessionsTable
            items={filtered}
            onClose={async (s) => {
              try {
                await closeSesion(s.ID_SES_USU);
              } finally {
                // Si acabas de cerrar tu propia sesión, sal inmediatamente
                if (currentSessionId && s.ID_SES_USU === currentSessionId) {
                  forceLogout();
                  return;
                }
                await load();
              }
            }}
            onDelete={async (s) => {
              if (!confirm(`Eliminar sesión ${s.ID_SES_USU}?`)) return;
              try {
                await deleteSesion(s.ID_SES_USU);
              } finally {
                // Si eliminaste tu propia sesión, sal inmediatamente
                if (currentSessionId && s.ID_SES_USU === currentSessionId) {
                  forceLogout();
                  return;
                }
                await load();
              }
            }}
          />
        )}

        {/* Acción masiva por usuario */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="ID usuario para cerrar todas"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-64"
          />
          <Button
            variant="outline"
            onClick={async () => {
              if (!user) return;
              try {
                await closeTodasSesionesUsuario(Number(user));
              } finally {
                // Si cierras todas las sesiones de TI MISMO, sal inmediatamente
                if (me && Number(user) === Number(me.ID_USU)) {
                  forceLogout();
                  return;
                }
                await load();
              }
            }}
          >
            Cerrar todas del usuario
          </Button>
        </div>
      </main>
    </Layout>
  );
}