"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "./login/page"; // Asegúrate que la ruta es correcta

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Barra de navegación superior */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">DetchPlus</h1>
        <nav className="space-x-4">
          <Link href="/clientes" className="hover:text-blue-600">
            Catalogo
          </Link>

          {/* Botón para abrir modal */}
          <button
            onClick={() => setIsLoginOpen(true)}
            className="hover:text-blue-600"
          >
            Inicia Sesión
          </button>

          <Link href="/dashboard" className="hover:text-blue-600">
            Registrate
          </Link>
        </nav>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-6">{/* Aquí va el contenido de inicio */}</main>

      {/* Footer */}
      <footer className="bg-white shadow p-4 text-center">
        <Link href="/ventas" className="hover:text-blue-600">
          Nosotros
        </Link>
      </footer>

      {/* Modal de Login */}
      <LoginModal open={isLoginOpen} setOpen={setIsLoginOpen} />
    </div>
  );
}
