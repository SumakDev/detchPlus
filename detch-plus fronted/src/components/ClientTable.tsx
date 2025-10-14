"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cliente } from "@/types/client";
import { Search, Edit, Trash2, Eye } from "lucide-react";

interface ClientTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (cedula: string) => void;
  onView: (cliente: Cliente) => void;
}

export default function ClientTable({ clientes, onEdit, onDelete, onView }: ClientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDificultad, setFilterDificultad] = useState<string>("all");
  const [filterActivo, setFilterActivo] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch = 
      cliente.NOM_CLI.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.APE_CLI.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.CED_CLI.includes(searchTerm) ||
      (cliente.COR_CLI && cliente.COR_CLI.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDificultad = filterDificultad === "all" || cliente.DIF_CLI === filterDificultad;
    const matchesActivo = filterActivo === "all" || 
      (filterActivo === "true" && cliente.ACTIVO) ||
      (filterActivo === "false" && !cliente.ACTIVO);

    return matchesSearch && matchesDificultad && matchesActivo;
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClientes = filteredClientes.slice(startIndex, startIndex + itemsPerPage);

  const getDificultadBadge = (dificultad: string) => {
    const colors = {
      BAJA: "bg-green-100 text-green-800",
      MEDIA: "bg-yellow-100 text-yellow-800",
      ALTA: "bg-red-100 text-red-800"
    };
    return colors[dificultad as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, cédula o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterDificultad} onValueChange={setFilterDificultad}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="BAJA">Baja</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterActivo} onValueChange={setFilterActivo}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activos</SelectItem>
              <SelectItem value="false">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-3 font-medium text-gray-600">Cédula/RUC</th>
                <th className="text-left p-3 font-medium text-gray-600">Nombre Completo</th>
                <th className="text-left p-3 font-medium text-gray-600">Correo</th>
                <th className="text-left p-3 font-medium text-gray-600">Teléfono</th>
                <th className="text-left p-3 font-medium text-gray-600">Dificultad</th>
                <th className="text-left p-3 font-medium text-gray-600">Estado</th>
                <th className="text-left p-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClientes.map((cliente) => (
                <tr key={cliente.CED_CLI} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">{cliente.CED_CLI}</td>
                  <td className="p-3">{`${cliente.NOM_CLI} ${cliente.APE_CLI}`}</td>
                  <td className="p-3 text-sm text-gray-600">{cliente.COR_CLI || "-"}</td>
                  <td className="p-3 text-sm">{cliente.NUM_CLI || "-"}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDificultadBadge(cliente.DIF_CLI)}`}>
                      {cliente.DIF_CLI}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cliente.ACTIVO ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {cliente.ACTIVO ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(cliente)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(cliente)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(cliente.CED_CLI)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredClientes.length)} de {filteredClientes.length} clientes
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="px-3 py-2 text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}