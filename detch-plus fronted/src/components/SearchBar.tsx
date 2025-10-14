"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Download, Plus } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: { dificultad: string; activo: string }) => void;
  onExport?: () => void;
  onAddClient: () => void;
  totalResults: number;
}

export default function SearchBar({ 
  onSearch, 
  onFilterChange, 
  onExport,
  onAddClient,
  totalResults 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ dificultad: "all", activo: "all" });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { dificultad: "all", activo: "all" };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setSearchTerm("");
    onSearch("");
  };

  const hasActiveFilters = filters.dificultad !== "all" || filters.activo !== "all" || searchTerm;

  return (
    <div className="space-y-4">
      {/* Barra principal de búsqueda */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por nombre, cédula o correo..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              aria-label="Buscar clientes"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            aria-expanded={showFilters}
            aria-controls="filter-section"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">
                {Object.values(filters).filter(v => v !== "all").length + (searchTerm ? 1 : 0)}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {onExport && (
            <Button
              variant="outline"
              onClick={onExport}
              className="flex items-center gap-2"
              aria-label="Exportar datos de clientes"
            >
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          )}
          
          <Button
            onClick={onAddClient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Cliente
          </Button>
        </div>
      </div>

      {/* Sección de filtros expandible */}
      {showFilters && (
        <div 
          id="filter-section"
          className="bg-gray-50 rounded-lg p-4 space-y-4 border"
          role="region"
          aria-label="Filtros de búsqueda"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filter-dificultad" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Dificultad
              </label>
              <Select 
                value={filters.dificultad} 
                onValueChange={(value) => handleFilterChange("dificultad", value)}
              >
                <SelectTrigger id="filter-dificultad">
                  <SelectValue placeholder="Todas las dificultades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las dificultades</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="filter-estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado del Cliente
              </label>
              <Select 
                value={filters.activo} 
                onValueChange={(value) => handleFilterChange("activo", value)}
              >
                <SelectTrigger id="filter-estado">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Activos</SelectItem>
                  <SelectItem value="false">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {totalResults === 1 
            ? "1 cliente encontrado" 
            : `${totalResults} clientes encontrados`
          }
        </span>
        
        {hasActiveFilters && (
          <span className="text-blue-600">
            • Filtros aplicados
          </span>
        )}
      </div>
    </div>
  );
}