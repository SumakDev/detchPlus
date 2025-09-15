import Image from "next/image";
import Link from "next/link";
export default function Home() {
  return (
<div className="min-h-screen bg-gray-100 flex flex-col">
{/* Barra de navegación superior */}
<header className="bg-white shadow p-4 flex justify-between items-center">
<h1 className="text-xl font-bold">DetchPlus</h1>
<nav className="space-x-4">
<Link href="/clientes" className="hover:text-blue-600">Catalogo</Link>
<Link href="/login" className="hover:text-blue-600">Inicia Sesion</Link>
<Link href="/dashboard" className="hover:text-blue-600">Registrate</Link>
</nav>
</header>


{/* Contenido principal */}
<main className="flex-1 p-6">{}</main>
<footer className="bg-white shadow p-4 text-center">
  <Link href="/ventas" className="hover:text-blue-600">Nosotros</Link>
</footer>
</div>
  );
}
