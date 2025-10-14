"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cliente, ClienteFormData } from "@/types/client";
import { Plus, Users, UserCheck, UserX } from "lucide-react";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);

  // Datos de ejemplo - reemplazar con llamadas a API
  useEffect(() => {
    const clientesEjemplo: Cliente[] = [
      {
        CED_CLI: "1234567890",
        NOM_CLI: "Juan",
        APE_CLI: "Pérez",
        DIR_CLI: "Av. Principal 123",
        COR_CLI: "juan.perez@email.com",
        NUM_CLI: "0999999999",
        DIF_CLI: "MEDIA",
        ACTIVO: true,
        FECHA_REGISTRO: "2024-01-15T10:30:00Z"
      },
      {
        CED_CLI: "0987654321",
        NOM_CLI: "María",
        APE_CLI: "González",
        DIR_CLI: "Calle Secundaria 456",
        COR_CLI: "maria.gonzalez@email.com",
        NUM_CLI: "0988888888",
        DIF_CLI: "BAJA",
        ACTIVO: true,
        FECHA_REGISTRO: "2024-02-20T14:15:00Z"
      },
      {
        CED_CLI: "1122334455",
        NOM_CLI: "Carlos",
        APE_CLI: "Rodriguez",
        DIR_CLI: "",
        COR_CLI: "",
        NUM_CLI: "0977777777",
        DIF_CLI: "ALTA",
        ACTIVO: false,
        FECHA_REGISTRO: "2024-03-10T09:45:00Z"
      }
    ];
    setClientes(clientesEjemplo);
  }, []);

  const handleCreateCliente = (data: ClienteFormData) => {
    const nuevoCliente: Cliente = {
      ...data,
      FECHA_REGISTRO: new Date().toISOString()
    };
    
    setClientes(prev => [...prev, nuevoCliente]);
    setShowForm(false);
    // Aquí harías la llamada a la API para crear el cliente
  };

  const handleUpdateCliente = (data: ClienteFormData) => {
    if (!editingCliente) return;
    
    setClientes(prev => 
      prev.map(cliente => 
        cliente.CED_CLI === editingCliente.CED_CLI 
          ? { ...cliente, ...data }
          : cliente
      )
    );
    setEditingCliente(null);
    // Aquí harías la llamada a la API para actualizar el cliente
  };

  const handleDeleteCliente = (cedula: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      setClientes(prev => prev.filter(cliente => cliente.CED_CLI !== cedula));
      // Aquí harías la llamada a la API para eliminar el cliente
    }
  };

  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.ACTIVO).length,
    inactivos: clientes.filter(c => !c.ACTIVO).length,
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
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>

        {/* Stats Cards */}
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

        {/* Formulario */}
        {(showForm || editingCliente) && (
          <ClientForm
            cliente={editingCliente || undefined}
            onSubmit={editingCliente ? handleUpdateCliente : handleCreateCliente}
            onCancel={() => {
              setShowForm(false);
              setEditingCliente(null);
            }}
            isEditing={!!editingCliente}
          />
        )}

        {/* Vista detallada del cliente */}
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
                  <strong>Fecha de Registro:</strong> {new Date(viewingCliente.FECHA_REGISTRO).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de clientes */}
        {!showForm && !editingCliente && !viewingCliente && (
          <ClientTable
            clientes={clientes}
            onEdit={setEditingCliente}
            onDelete={handleDeleteCliente}
            onView={setViewingCliente}
          />
        )}
      </div>
    </Layout>
  );
}