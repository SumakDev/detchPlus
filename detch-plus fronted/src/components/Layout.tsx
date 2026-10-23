"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
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
  ChevronDown,
  Apple,
  LogOut,
  Package2,
  UserCog,
  Users2,
  UserSquare,
  Store,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, updateSettings } = useAccessibility();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Stock", href: "/stock", icon: Package },
    { name: "Ventas", href: "/ventas", icon: ShoppingCart },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Reportes", href: "/reportes", icon: FileText },
    { name: "Productos", href: "/productos", icon: Package2 },
    { name: "Servicio Técnico", href: "/servicio-tecnico", icon: Settings },
    { name: "Técnicos", href: "/tecnicos", icon: UserCog },
    { name: "Usuarios", href: "/usuarios", icon: UserSquare },
    
  ];


  // Derivar estilos desde accesibilidad
  const fontClass =
    settings.fontSize === "small"
      ? "text-[14px]"
      : settings.fontSize === "large"
      ? "text-[17px]"
      : "text-[15px]";

  const motionClass = settings.reduceMotion ? "transition-none" : "transition-colors duration-200";

  const theme = useMemo(
    () =>
      settings.highContrast
        ? {
            // Alto contraste
            bg: "bg-gray-50",
            panel: "bg-white border border-gray-200",
            text: "text-gray-900",
            subtext: "text-gray-600",
            brand: "from-gray-900 to-gray-800",
            brandText: "text-white",
            link: "text-gray-800 hover:bg-gray-100",
            active: "bg-gray-900 text-white",
            activeBorder: "border-l-4 border-l-blue-500",
            crumbBg: "bg-white/90 backdrop-blur",
          }
        : {
            // Estilo coherente con el resto (tonos grises/azules suaves)
            bg: "bg-gradient-to-br from-gray-50 to-blue-50/20",
            panel: "bg-white/90 border border-gray-100 backdrop-blur",
            text: "text-gray-900",
            subtext: "text-gray-600",
            brand: "from-gray-900 to-gray-800",
            brandText: "text-white",
            link: "text-gray-700 hover:bg-gray-100",
            active: "bg-blue-50 text-blue-700",
            activeBorder: "border-l-4 border-l-blue-600",
            crumbBg: "bg-white/80 backdrop-blur",
          },
    [settings.highContrast]
  );

  const pageTitle = useMemo(() => {
    const titles: Record<string, string> = {
      dashboard: "Dashboard Principal",
      stock: "Control de Inventario",
      ventas: "Punto de Venta",
      clientes: "Gestión de Clientes",
      reportes: "Métricas & Reportes",
      productos: "Catálogo de Productos",
      "servicio-tecnico": "Servicio Técnico & Taller",
      tecnicos: "Equipo Técnico",
      usuarios: "Control de Usuarios & Roles",
      perfil: "Mi Perfil",
    };
    const key = pathname.split("/").filter(Boolean).pop() || "dashboard";
    return titles[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }, [pathname]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserName(u?.nombres || u?.usuario || "");
      }
    } catch {}
  }, []);

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.replace("/");
  }

  return (
    <div className={`min-h-screen ${theme.bg} flex ${fontClass} w-full overflow-x-hidden relative`}>
      {/* Backdrop overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 max-w-[82vw] bg-white border-r border-gray-200 shadow-2xl transform ${motionClass} ease-in-out z-50 lg:static lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className={`bg-gradient-to-r ${theme.brand} ${theme.brandText} px-4 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            <span className="font-semibold">DetchPlus</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User quick info */}
        <div className={`px-4 py-3 ${theme.panel}`}>
          <p className="text-sm font-medium truncate">
            {userName ? `Hola, ${userName}` : "Bienvenido"}
          </p>
          <p className={`text-xs ${theme.subtext}`}>Panel de administración</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 bg-white">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`group relative flex items-center gap-3 rounded-md px-3 py-2 ${motionClass} ${
                  isActive ? `${theme.active} ${theme.activeBorder}` : theme.link
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "" : "text-gray-500 group-hover:text-gray-700"}`} />
                <span className="text-sm font-medium">{item.name}</span>
                {isActive && (
                  <span className="absolute right-3 h-2 w-2 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}

          <div className="pt-3 mt-3 border-t border-gray-200/80">
            <Link
              href="/"
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 ${motionClass}`}
            >
              <Store className="h-5 w-5 text-gray-500 group-hover:text-blue-600 flex-shrink-0" />
              <span className="text-sm font-medium">Ver Tienda Online</span>
            </Link>
          </div>
        </nav>

        {/* Accesibilidad (compacto y claro) */}
        <div className="px-3 py-4 border-t border-gray-200 bg-white">
          <Button
            variant="outline"
            onClick={() => setSettingsOpen((v) => !v)}
            className={`w-full justify-between text-sm ${motionClass}`}
          >
            <span className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Accesibilidad
            </span>
            <ChevronDown className={`h-4 w-4 ${motionClass} ${settingsOpen ? "rotate-180" : ""}`} />
          </Button>

          {settingsOpen && (
            <div className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-white p-3">
              {/* Alto contraste */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Alto contraste</label>
                <button
                  aria-label="Alternar alto contraste"
                  onClick={() => updateSettings({ highContrast: !settings.highContrast })}
                  className={`w-12 h-6 rounded-full ${motionClass} ${settings.highContrast ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 ${motionClass} ${settings.highContrast ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>

              {/* Tamaño de fuente */}
              <div>
                <label className="text-sm font-medium block mb-1">Tamaño de fuente</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: e.target.value as any })}
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
                  aria-label="Alternar animaciones"
                  onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
                  className={`w-12 h-6 rounded-full ${motionClass} ${settings.reduceMotion ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full mt-1 ${motionClass} ${settings.reduceMotion ? "translate-x-7" : "translate-x-1"}`} />
                </button>
              </div>

              <div className="text-xs text-gray-600 pt-2 border-t">
                <p>Estado actual:</p>
                <ul className="space-y-1 mt-1">
                  <li>Contraste: {settings.highContrast ? "Alto" : "Normal"}</li>
                  <li>Fuente: {settings.fontSize}</li>
                  <li>Animaciones: {settings.reduceMotion ? "Reducidas" : "Normales"}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen w-full min-w-0 overflow-x-hidden">
        {/* Topbar (mobile) */}
        <header className={`lg:hidden ${theme.panel} shadow-sm px-3 sm:px-4 py-2.5`}>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="p-2 h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-1.5">
              <Apple className="h-5 w-5 text-gray-800" />
              <h1 className="text-base font-bold tracking-tight">DetchPlus</h1>
            </div>
            <div className="w-9" />
          </div>
        </header>

        {/* Breadcrumb + actions */}
        <nav className={`${theme.crumbBg} border-b px-3 sm:px-4 py-2`}>
          <div className="flex items-center justify-between gap-2">
            <ol className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm shrink min-w-0">
              <li>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Inicio
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium capitalize truncate max-w-[130px] sm:max-w-none">{pageTitle}</li>
            </ol>
            <div className="flex items-center gap-2 shrink-0">
              {userName && (
                <span className="hidden md:inline text-xs sm:text-sm text-gray-600 truncate max-w-[120px]">Hola, {userName}</span>
              )}
              <Button variant="outline" size="sm" onClick={logout} className={`${motionClass} text-xs px-2.5 py-1 h-8`}>
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 w-full min-w-0 overflow-x-hidden">{children}</main>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur border-t p-3 text-center text-xs text-gray-600">
          <p>DetchPlus © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}