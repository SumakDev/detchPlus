"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Link href="/clientes">
        <Button className="w-full bg-gray-900 hover:bg-gray-800">Agregar cliente</Button>
      </Link>
      <Link href="/ventas">
        <Button variant="outline" className="w-full">
          Registrar venta
        </Button>
      </Link>
      <Link href="/stock">
        <Button variant="outline" className="w-full">
          Ver stock
        </Button>
      </Link>
      <Link href="/reportes">
        <Button variant="outline" className="w-full">
          Generar reportes
        </Button>
      </Link>
      <button
        className="w-full border border-gray-200 rounded-md py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={() => window.location.reload()}
      >
        Refrescar panel
      </button>
    </div>
  );
}