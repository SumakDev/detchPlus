"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  totalClientes: number;
  clientesActivos: number;
  clientesInactivos: number;
  nuevosEsteMes?: number;
}

export default function StatsCards({ 
  totalClientes, 
  clientesActivos, 
  clientesInactivos,
  nuevosEsteMes = 0 
}: StatsCardsProps) {
  const stats = [
    {
      title: "Total Clientes",
      value: totalClientes,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Todos los clientes registrados"
    },
    {
      title: "Clientes Activos",
      value: clientesActivos,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Clientes con estado activo"
    },
    {
      title: "Clientes Inactivos",
      value: clientesInactivos,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Clientes desactivados"
    },
    {
      title: "Nuevos este mes",
      value: nuevosEsteMes,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Clientes registrados este mes"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
              </div>
              
              {/* Barra de progreso para porcentaje */}
              {stat.title !== "Nuevos este mes" && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        stat.title === "Clientes Activos" ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ 
                        width: `${totalClientes > 0 ? (stat.value / totalClientes) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalClientes > 0 ? Math.round((stat.value / totalClientes) * 100) : 0}% del total
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}