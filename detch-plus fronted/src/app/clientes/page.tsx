"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ClientUpsertDialog from "@/components/clientes/ClientUpsertDialog";
import ClientTable from "@/components/clientes/ClientTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cliente, ClienteFormData } from "@/types/client";
import { Plus, Users, UserCheck, UserX } from "lucide-react";
import { fetchClientes, createCliente, updateCliente, deleteCliente } from "@/lib/api/clients";
import ClienteDetalleDialog from "@/components/clientes/clienteDetalleDialog";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openUpsert, setOpenUpsert] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  async function loadClientes() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClientes();
      setClientes(data);
    } catch (err: any) {
      setError(err?.message ?? "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, []);

  const stats = useMemo(
    () => ({
      total: clientes.length,
      activos: clientes.filter((c) => c.ACTIVO).length,
      inactivos: clientes.filter((c) => !c.ACTIVO).length,
    }),
    [clientes]
  );

  const handleCreateCliente = async (data: ClienteFormData) => {
    const created = await createCliente(data);
    setClientes((prev) => [created, ...prev]);
  };

  const handleUpdateCliente = async (data: ClienteFormData) => {
    if (!editingCliente) return;
    const updated = await updateCliente(editingCliente.CED_CLI, data);
    setClientes((prev) => prev.map((c) => (c.CED_CLI === updated.CED_CLI ? updated : c)));
    setEditingCliente(null);
  };

  const handleDeleteCliente = async (cedula: string) => {
    if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
    await deleteCliente(cedula);
    setClientes((prev) => prev.filter((c) => c.CED_CLI !== cedula));
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
            <p className="text-gray-600">Administra la información de tus clientes</p>
          </div>
          <Button
            onClick={() => {
              setEditingCliente(null);
              setOpenUpsert(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Activos</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activos}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Inactivos</p>
                  <p className="text-3xl font-bold text-red-600">{stats.inactivos}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estados */}
        {loading && (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Cargando clientes...</p>
            </CardContent>
          </Card>
        )}
        {error && (
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">Error: {error}</p>
              <Button variant="outline" onClick={loadClientes} className="mt-3">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        {!loading && !error && (
          <ClientTable
            clientes={clientes}
            onEdit={(c) => {
              setEditingCliente(c);
              setOpenUpsert(true);
            }}
            onDelete={handleDeleteCliente}
            onView={(c) => {
              setSelected(c);
              setOpenView(true);
            }}
          />
        )}

        {/* Modal crear/editar */}
        <ClientUpsertDialog
          open={openUpsert}
          onOpenChange={(o) => {
            if (!o) setEditingCliente(null);
            setOpenUpsert(o);
          }}
          isEditing={!!editingCliente}
          cliente={editingCliente}
          onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
        />

        {/* Detalle con Observaciones integrado */}
        <ClienteDetalleDialog
          open={openView}
          onOpenChange={(o) => {
            if (!o) setSelected(null);
            setOpenView(o);
          }}
          cliente={selected}
          onEdit={(c) => {
            // Abrir modal de edición desde el detalle
            setSelected(null);
            setOpenView(false);
            setEditingCliente(c);
            setOpenUpsert(true);
          }}
        />
      </div>
    </Layout>
  );
}