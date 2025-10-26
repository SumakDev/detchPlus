"use client";

import { useAuth } from "@/hooks/useAuth";

export default function PerfilPage() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-6">Cargando…</div>;
  if (!user) return <div className="p-6">Inicia sesión para ver tu perfil.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Mi perfil</h1>
      <div className="space-y-2">
        <div><b>Usuario:</b> {user.USR_USU}</div>
        <div><b>Nombre:</b> {[user.NOM_USU, user.APE_USU].filter(Boolean).join(" ")}</div>
        <div><b>Email:</b> {user.COR_USU}</div>
        <div><b>Rol:</b> {user.ID_ROL}</div>
      </div>
    </div>
  );
}