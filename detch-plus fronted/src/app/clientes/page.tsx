"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import ClientUpsertDialog from "@/components/ClientUpsertDialog";
import ClientTable from "@/components/ClientTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cliente, ClienteFormData } from "@/types/client";
import { Plus, Users, UserCheck, UserX, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchClientes, createCliente, updateCliente, deleteCliente } from "@/lib/api/clients";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openUpsert, setOpenUpsert] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cliente | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteCliente(deleteTarget.CED_CLI);
      setDeleteTarget(null);
      await loadClientes();
    } catch (err: any) {
      alert(err?.message || "Error al dar de baja al cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReactivateCliente = async (cliente: Cliente) => {
    try {
      await updateCliente(cliente.CED_CLI, {
        ...cliente,
        ACTIVO: true,
      });
      await loadClientes();
    } catch (err: any) {
      alert(err?.message || "Error al reactivar cliente");
    }
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

        {/* Detalle */}
        {viewingCliente && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Detalles del Cliente</h3>
                <Button variant="outline" onClick={() => setViewingCliente(null)}>
                  Cerrar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Cédula/RUC:</strong> {viewingCliente.CED_CLI}
                </div>
                <div>
                  <strong>Nombre:</strong> {viewingCliente.NOM_CLI} {viewingCliente.APE_CLI}
                </div>
                <div>
                  <strong>Correo:</strong> {viewingCliente.COR_CLI || "No especificado"}
                </div>
                <div>
                  <strong>Teléfono:</strong> {viewingCliente.NUM_CLI || "No especificado"}
                </div>
                <div>
                  <strong>Dirección:</strong> {viewingCliente.DIR_CLI || "No especificada"}
                </div>
                <div>
                  <strong>Dificultad:</strong> {viewingCliente.DIF_CLI}
                </div>
                <div>
                  <strong>Estado:</strong> {viewingCliente.ACTIVO ? "Activo" : "Inactivo"}
                </div>
                <div>
                  <strong>Fecha de Registro:</strong>{" "}
                  {new Date(viewingCliente.FECHA_REGISTRO).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla */}
        {!loading && !error && !viewingCliente && (
          <ClientTable
            clientes={clientes}
            onEdit={(c) => {
              setEditingCliente(c);
              setOpenUpsert(true);
            }}
            onDelete={(c) => setDeleteTarget(c)}
            onReactivate={handleReactivateCliente}
            onView={setViewingCliente}
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

        {/* Modal Confirmación Eliminación Lógica */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Baja de Cliente
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm text-gray-600">
              <p>
                ¿Estás seguro de que deseas dar de baja al cliente{" "}
                <strong className="text-gray-900">
                  {deleteTarget?.NOM_CLI} {deleteTarget?.APE_CLI}
                </strong>{" "}
                (Cédula: <span className="font-mono">{deleteTarget?.CED_CLI}</span>)?
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex gap-2 items-start">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Eliminación lógica:</strong> El cliente se marcará como <em>Inactivo</em>. No se eliminarán sus facturas ni su historial de compras para preservar la integridad referencial y contable del sistema.
                </span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg"
              >
                {isDeleting ? "Dando de baja..." : "Sí, dar de baja"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}