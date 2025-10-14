"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useRef, useEffect } from "react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText,
  Menu,
  X,
  Sun,
  Type,
  Zap,
  ChevronDown
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const { settings, updateSettings } = useAccessibility();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Stock", href: "/dashboard/stock", icon: Package },
    { name: "Ventas", href: "/dashboard/ventas", icon: ShoppingCart },
    { name: "Clientes", href: "/dashboard/clientes", icon: Users },
    { name: "Reportes", href: "/dashboard/reportes", icon: FileText },
  ];

  // Debug: mostrar configuraciones actuales
  useEffect(() => {
    console.log('Configuraciones actuales de accesibilidad:', settings);
  }, [settings]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-50 lg:static lg:transform-none flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Sistema iPhone</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Panel de accesibilidad SIMPLIFICADO */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Accesibilidad
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
          </Button>

          {settingsOpen && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border space-y-4">
              
              {/* Alto contraste */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Alto contraste</label>
                <button
                  onClick={() => {
                    console.log('Cambiando alto contraste de', settings.highContrast, 'a', !settings.highContrast);
                    updateSettings({ highContrast: !settings.highContrast });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                    settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
                </button>
              </div>

              {/* Tamaño de fuente */}
              <div>
                <label className="text-sm font-medium block mb-1">Tamaño de fuente</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => {
                    console.log('Cambiando tamaño de fuente a', e.target.value);
                    updateSettings({ fontSize: e.target.value as any });
                  }}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {/* Reducir animaciones */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Reducir animaciones</label>
                <button
                  onClick={() => {
                    console.log('Cambiando animaciones de', settings.reduceMotion, 'a', !settings.reduceMotion);
                    updateSettings({ reduceMotion: !settings.reduceMotion });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.reduceMotion ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                    settings.reduceMotion ? 'translate-x-7' : 'translate-x-1'
                  } mt-1`} />
                </button>
              </div>

              {/* Debug info */}
              <div className="text-xs text-gray-600 pt-2 border-t">
                <p>Estado actual:</p>
                <ul className="space-y-1 mt-1">
                  <li>Contraste: {settings.highContrast ? 'Alto' : 'Normal'}</li>
                  <li>Fuente: {settings.fontSize}</li>
                  <li>Animaciones: {settings.reduceMotion ? 'Reducidas' : 'Normales'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <header className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Sistema iPhone</h1>
            <div className="w-9" />
          </div>
        </header>

        <nav className="bg-white border-b px-4 py-2 flex-shrink-0">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Inicio
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 font-medium capitalize">
              {pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
            </li>
          </ol>
        </nav>

        <main className="flex-1 p-4">
          {children}
        </main>

        <footer className="bg-white border-t p-3 text-center text-xs text-gray-600 flex-shrink-0">
          <p>Sistema iPhone © 2024</p>
        </footer>
      </div>
    </div>
  );
}