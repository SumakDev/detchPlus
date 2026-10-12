"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Apple } from "lucide-react";
import { loginApi } from "@/lib/api/auth";

type LoginModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: (data: { token?: string; user?: any }) => void;
  onOpenRegister?: () => void;
  onOpenForgotPassword?: () => void;
};

export default function LoginModal({ open, setOpen, onOpenRegister, onOpenForgotPassword, onSuccess }: LoginModalProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { token, user } = await loginApi(usuario, password);
      // Guarda sesión
      localStorage.setItem("auth_token", token);
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      // Notifica al padre (Home) para que useAuth recargue y esconda botones
      onSuccess?.({ token, user });
      setOpen(false);

      // Redirección condicional:
      // - Rol 4 (usuario web): quedarse en la misma página (no navegar)
      // - Otros roles: ir al dashboard
      const rol = user?.ID_ROL ?? user?.rol;
      if (rol && Number(rol) !== 4) {
        router.push("/dashboard");
      } else {
        // Fuerza refresco suave de la página para pintar el UserMenu si lo necesitas
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader className="items-center">
          <div className="flex justify-center mb-2">
            <Apple className="h-6 w-6" />
            <span>&nbsp;DetchPlus</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Ingresa tus credenciales para acceder al sistema.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="usuario" className="font-semibold text-gray-700">Usuario o Correo</Label>
            <Input id="usuario" type="text" placeholder="Tu usuario o email" className="mt-1" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="font-semibold text-gray-700">Contraseña</Label>
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors font-medium"
                onClick={() => {
                  setOpen(false);
                  onOpenForgotPassword?.();
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <Input id="password" type="password" placeholder="••••••••" className="mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <DialogFooter className="flex flex-col gap-3 items-stretch sm:flex-col pt-2">
            <Button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md">
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => { setOpen(false); onOpenRegister?.(); }}
            >
              ¿No tienes cuenta? Crear cuenta
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}