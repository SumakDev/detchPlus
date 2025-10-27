"use client";

import Link from "next/link";
import { User2 } from "lucide-react";

type Props = {
  user: {
    ID_USU: number;
    ID_ROL: number;
    USR_USU?: string;
    COR_USU?: string;
    NOM_USU?: string;
    APE_USU?: string;
  };
  onLogout: () => void;
};

export default function UserMenu({ user, onLogout }: Props) {
  if (!user) return null;

  const nombre =
    [user.NOM_USU, user.APE_USU].filter(Boolean).join(" ").trim() ||
    user.USR_USU ||
    user.COR_USU ||
    `Usuario #${user.ID_USU}`;

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/perfil"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-800 hover:bg-gray-50"
        title="Ir a mi perfil"
      >
        <User2 className="h-4 w-4" />
        <span className="max-w-[180px] truncate">{nombre}</span>
      </Link>
      <button
        onClick={onLogout}
        className="text-gray-600 hover:text-gray-900 text-sm"
        title="Cerrar sesión"
      >
        Cerrar sesión
      </button>
    </div>
  );
}