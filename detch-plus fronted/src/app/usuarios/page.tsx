"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UsersTable from "@/components/usuarios/UsersTable";
import UserRoleDialog from "@/components/usuarios/UsersRoleDialog";
import UserStatusDialog from "@/components/usuarios/UsersStatusDialog";
import { fetchUsuarios, updateUsuarioRol, updateUsuarioEstado} from "@/lib/api/usuarios";
import type { Usuario } from "@/types/usuario";
import { getMe } from "@/lib/api/auth/me";
import Layout from "@/components/Layout";

export default function UsuariosPage() {
  const router = useRouter();
  const [items, setItems] = useState<Usuario[]>([]);
  const [q, setQ] = useState("");
  const [rol, setRol] = useState<string>("");
  const [est, setEst] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roleOpen, setRoleOpen] = useState(false);
  const [selUser, setSelUser] = useState<Usuario | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);


  // Protege solo admins (1,2)
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      router.replace("/");
      return;
    }
    getMe()
      .then(({ user }) => {
        if (!user) router.replace("/");
        else if (![1, 2].includes(Number(user.ID_ROL))) router.replace("/mi-cuenta");
      })
      .catch(() => router.replace("/"));
  }, [router]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsuarios({
        q,
        rol: rol ? Number(rol) : undefined,
        est: est || undefined,
      });
      setItems(data);
    } catch (e: any) {
      setError(e?.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((u) => {
      const matchesQ =
        !term ||
        u.USR_USU.toLowerCase().includes(term) ||
        u.COR_USU.toLowerCase().includes(term) ||
        [u.NOM_USU, u.APE_USU].filter(Boolean).join(" ").toLowerCase().includes(term);
      const matchesRol = !rol || String(u.ID_ROL) === rol;
      const matchesEst = !est || u.EST_USU === est;
      return matchesQ && matchesRol && matchesEst;
    });
  }, [items, q, rol, est]);

  return (
    <Layout>
    <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-600">Gestión de roles y estados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load}>
            Refrescar
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex gap-3 items-center">
          <Input
            placeholder="Buscar por usuario, nombre o email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-64"
          />
          <select className="border rounded px-2 py-2 text-sm" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="">Rol (todos)</option>
            <option value="1">SUPERADMIN (#1)</option>
            <option value="2">ADMIN (#2)</option>
            <option value="3">OPERADOR (#3)</option>
            <option value="4">USUARIO_WEB (#4)</option>
            <option value="5">INVITADO (#5)</option>
          </select>
          <select className="border rounded px-2 py-2 text-sm" value={est} onChange={(e) => setEst(e.target.value)}>
            <option value="">Estado (todos)</option>
            <option value="ACTIVO">ACTIVO</option>
            <option value="INACTIVO">INACTIVO</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
            <option value="PEND_VER">PEND_VER</option>
          </select>
          <Button variant="outline" onClick={load}>
            Aplicar
          </Button>
        </div>
      </div>

      {loading && <div className="rounded-md border p-4 bg-white">Cargando…</div>}
      {error && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">Error: {error}</div>}

      {!loading && !error && (
        <UsersTable
          items={filtered}
          onChangeRole={(row) => {
            setSelUser(row);
            setRoleOpen(true);
          }}
            onChangeEstado={(row) => {
              setSelUser(row);
              setStatusOpen(true);
            }}
        />
      )}

      <UserStatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        currentStatus={selUser?.EST_USU ?? "PEND_VER"}
        onSubmit={async (newStatus) => {
          if (!selUser) return;
          await updateUsuarioEstado(selUser.ID_USU, newStatus);
          await load();
        }}
      />

      <UserRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        currentRoleId={selUser?.ID_ROL ?? null}
        onSubmit={async (newRole) => {
          if (!selUser) return;
          await updateUsuarioRol(selUser.ID_USU, newRole);
          await load();
        }}
      />
    </main>
    </Layout>
  );
}