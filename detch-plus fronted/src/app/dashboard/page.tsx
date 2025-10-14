"use client";

import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import ClientForm from "@/components/ClientForm";
import ClientTable from "@/components/ClientTable";
import StatsCards from "@/components/statsCards";
import SearchBar from "@/components/SearchBar";
import { Cliente, ClienteFormData } from "@/types/client";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [viewingCliente, setViewingCliente] = useState<Cliente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ dificultad: "all", activo: "all" });

  // Datos de ejemplo
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

  // Resto de la lógica...
  const filteredClientes = useMemo(() => {
    return clientes.filter((cliente) => {
      const matchesSearch = 
        cliente.NOM_CLI.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.APE_CLI.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.CED_CLI.includes(searchTerm) ||
        (cliente.COR_CLI && cliente.COR_CLI.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDificultad = filters.dificultad === "all" || cliente.DIF_CLI === filters.dificultad;
      const matchesActivo = filters.activo === "all" || 
        (filters.activo === "true" && cliente.ACTIVO) ||
        (filters.activo === "false" && !cliente.ACTIVO);

      return matchesSearch && matchesDificultad && matchesActivo;
    });
  }, [clientes, searchTerm, filters]);

  const handleCreateCliente = (data: ClienteFormData) => {
    const nuevoCliente: Cliente = {
      ...data,
      FECHA_REGISTRO: new Date().toISOString()
    };
    setClientes(prev => [...prev, nuevoCliente]);
    setShowForm(false);
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
  };

  const handleDeleteCliente = (cedula: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      setClientes(prev => prev.filter(cliente => cliente.CED_CLI !== cedula));
    }
  };

  const handleExport = () => {
    const csv = [
      ['Cédula', 'Nombre', 'Apellido', 'Correo', 'Teléfono', 'Estado', 'Dificultad'],
      ...filteredClientes.map(cliente => [
        cliente.CED_CLI,
        cliente.NOM_CLI,
        cliente.APE_CLI,
        cliente.COR_CLI || '',
        cliente.NUM_CLI || '',
        cliente.ACTIVO ? 'Activo' : 'Inactivo',
        cliente.DIF_CLI
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.ACTIVO).length,
    inactivos: clientes.filter(c => !c.ACTIVO).length,
    nuevosEsteMes: clientes.filter(c => {
      const fecha = new Date(c.FECHA_REGISTRO);
      const hoy = new Date();
      return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    }).length,
  };

  return (
    <Layout>
      {/* Container sin padding extra */}
      <div className="space-y-4 max-w-7xl mx-auto"> {/* Reducido de space-y-6 a space-y-4 */}
        
        {/* Header compacto */}
        <div className="mb-4"> {/* Añadido mb-4 para control específico */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Clientes</h1> {/* Reducido de text-3xl */}
          <p className="text-gray-600 text-sm">Administra la información de tus clientes</p>
        </div>

        {/* Estadísticas */}
        <StatsCards 
          totalClientes={stats.total}
          clientesActivos={stats.activos}
          clientesInactivos={stats.inactivos}
          nuevosEsteMes={stats.nuevosEsteMes}
        />

        {/* Barra de búsqueda y filtros */}
        <SearchBar
          onSearch={setSearchTerm}
          onFilterChange={setFilters}
          onExport={handleExport}
          onAddClient={() => setShowForm(true)}
          totalResults={filteredClientes.length}
        />

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Detalles del Cliente</h3>
                <button 
                  onClick={() => setViewingCliente(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Cédula/RUC:</strong> {viewingCliente.CED_CLI}</div>
                <div><strong>Nombre:</strong> {viewingCliente.NOM_CLI} {viewingCliente.APE_CLI}</div>
                <div><strong>Correo:</strong> {viewingCliente.COR_CLI || "No especificado"}</div>
                <div><strong>Teléfono:</strong> {viewingCliente.NUM_CLI || "No especificado"}</div>
                <div><strong>Dirección:</strong> {viewingCliente.DIR_CLI || "No especificada"}</div>
                <div><strong>Dificultad:</strong> {viewingCliente.DIF_CLI}</div>
                <div><strong>Estado:</strong> {viewingCliente.ACTIVO ? "Activo" : "Inactivo"}</div>
                <div><strong>Fecha de Registro:</strong> {new Date(viewingCliente.FECHA_REGISTRO).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de clientes */}
        {!showForm && !editingCliente && (
          <ClientTable
            clientes={filteredClientes}
            onEdit={setEditingCliente}
            onDelete={handleDeleteCliente}
            onView={setViewingCliente}
          />
        )}
      </div>
    </Layout>
  );
}