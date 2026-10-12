"use client";

import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Link from "next/link";
import { User, Shield, Mail, Key, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PerfilPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-500">Cargando perfil...</div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="p-8 text-center space-y-4">
          <p className="text-gray-600">Debes iniciar sesión para consultar tu información de perfil.</p>
          <Link href="/">
            <Button>Ir al Inicio</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const roleName = (() => {
    switch (Number(user.ID_ROL)) {
      case 1:
        return "Administrador del Sistema";
      case 2:
        return "Supervisor / Cajero";
      case 3:
        return "Técnico Especialista";
      case 4:
        return "Cliente Web";
      default:
        return `Rol #${user.ID_ROL}`;
    }
  })();

  const nombreCompleto = [user.NOM_USU, user.APE_USU].filter(Boolean).join(" ").trim() || user.USR_USU || "Usuario";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
            <p className="text-gray-500 text-sm">Gestiona la información personal y credenciales de tu cuenta</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Resumen / Avatar */}
          <Card className="md:col-span-1 shadow-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-gray-900 to-gray-700 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-md">
                {nombreCompleto.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{nombreCompleto}</h3>
                <p className="text-xs text-gray-500 font-mono">@{user.USR_USU || "usuario"}</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-100">
                  <Shield className="w-3.5 h-3.5" /> {roleName}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Detallada */}
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Información de Cuenta</CardTitle>
              <CardDescription>Datos registrados en la plataforma DetchPlus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Nombre Completo</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{nombreCompleto}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium">Usuario / Alias</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{user.USR_USU || "—"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" /> Correo Electrónico
                  </span>
                  <p className="font-semibold text-gray-900 mt-0.5">{user.COR_USU || user.EMAIL || "—"}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Estado de Cuenta
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold mt-0.5">
                    <CheckCircle2 className="w-4 h-4" /> Activo & Verificado
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Seguridad & Contraseña</h4>
                  <p className="text-xs text-gray-500">¿Deseas actualizar tu contraseña de acceso?</p>
                </div>
                <Link href="/reset-password">
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Cambiar clave
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}