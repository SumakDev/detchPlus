"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-4 space-y-4" aria-label="Sidebar">
        <h2 className="text-xl font-bold mb-4">Sistema iPhone</h2>
        <nav className="space-y-2" aria-label="Main navigation">
          <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-200">
            Dashboard
          </Link>

          <Link href="/stock" className="block p-2 rounded hover:bg-gray-200">
          stock
          </Link>

          <Link href="/ventas" className="block p-2 rounded hover:bg-gray-200">
            Ventas
          </Link>

          <Link href="/clientes" className="block p-2 rounded hover:bg-gray-200">
            Clientes
          </Link>

          <Link href="/reportes" className="block p-2 rounded hover:bg-gray-200">
            Reportes
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Dashboard */}
        <section id="dashboard">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-500">iPhones en stock</p>
                <p className="text-2xl font-bold">150</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-500">Ventas hoy</p>
                <p className="text-2xl font-bold">$2,500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-gray-500">Clientes nuevos</p>
                <p className="text-2xl font-bold">5</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stock */}
        <section id="stock">
          <h1 className="text-xl font-semibold mb-2">Gestión de Stock</h1>
          <Button className="mb-4">Agregar iPhone</Button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Modelo</th>
                  <th className="p-2">Color</th>
                  <th className="p-2">Capacidad</th>
                  <th className="p-2">Precio</th>
                  <th className="p-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">iPhone 15</td>
                  <td className="p-2">Azul</td>
                  <td className="p-2">128 GB</td>
                  <td className="p-2">$1200</td>
                  <td className="p-2">10</td>
                </tr>
                <tr>
                  <td className="p-2">iPhone 14</td>
                  <td className="p-2">Negro</td>
                  <td className="p-2">256 GB</td>
                  <td className="p-2">$1100</td>
                  <td className="p-2">5</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Ventas */}
        <section id="ventas">
          <h1 className="text-xl font-semibold mb-2">Gestión de Ventas</h1>
          <form className="space-y-4 bg-white p-4 shadow rounded">
            <div>
              <Label>Cliente</Label>
              <Input placeholder="Seleccionar Cliente" />
            </div>
            <div>
              <Label>Producto</Label>
              <Input placeholder="iPhone 15 - 128GB" />
            </div>
            <div>
              <Label>Cantidad</Label>
              <Input type="number" placeholder="1" />
            </div>
            <p className="text-right font-bold">Total: $3,500</p>
            <Button>Generar Factura</Button>
          </form>
        </section>

        {/* Clientes */}
        <section id="clientes">
          <h1 className="text-xl font-semibold mb-2">Gestión de Clientes</h1>
          <Button className="mb-4">Agregar Cliente</Button>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="p-2">Nombre</th>
                  <th className="p-2">Cédula/RUC</th>
                  <th className="p-2">Teléfono</th>
                  <th className="p-2">Correo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">Juan Pérez</td>
                  <td className="p-2">1234567890</td>
                  <td className="p-2">099999999</td>
                  <td className="p-2">jp@mail.com</td>
                </tr>
                <tr>
                  <td className="p-2">María Gómez</td>
                  <td className="p-2">0987654321</td>
                  <td className="p-2">098888888</td>
                  <td className="p-2">mg@mail.com</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
