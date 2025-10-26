"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerApi, loginApi } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Apple } from "lucide-react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenLogin?: () => void;
  onSuccess?: (data: { token?: string; user?: any }) => void;
  autoLogin?: boolean;
};

export default function RegisterModal({ open, setOpen, onOpenLogin, onSuccess, autoLogin = true }: Props) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (password !== password2) return setErrorMsg("Las contraseñas no coinciden");
    if (!aceptaTerminos) return setErrorMsg("Debes aceptar los términos y condiciones");
    setLoading(true);
    try {
      const res = await registerApi({ usuario, email, password, nombres, apellidos, aceptaTerminos });

      // Caso 1: backend retorna token tras registrar (rol web por defecto)
      if (res.token) {
        localStorage.setItem("auth_token", res.token);
        if (res.user) localStorage.setItem("auth_user", JSON.stringify(res.user));
        onSuccess?.({ token: res.token, user: res.user });
        setOpen(false);
        // Usuario web → quedarse en la misma página
        router.refresh();
        return;
      }

      // Caso 2: si no retorna token, hacemos autoLogin (opcional)
      if (autoLogin) {
        const { token, user } = await loginApi(usuario, password);
        localStorage.setItem("auth_token", token);
        if (user) localStorage.setItem("auth_user", JSON.stringify(user));
        onSuccess?.({ token, user });
        setOpen(false);

        const rol = user?.ID_ROL ?? user?.rol;
        if (rol && Number(rol) !== 4) {
          router.push("/dashboard");
        } else {
          router.refresh();
        }
        return;
      }

      // Si no hay token ni autologin, cerrar y abrir login
      setOpen(false);
      onOpenLogin?.();
    } catch (err: any) {
      setErrorMsg(err?.message || "Error al registrar");
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
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Crear cuenta</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Registra un usuario para acceder al sistema.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="usuario">Usuario</Label>
            <Input id="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nombres">Nombres</Label>
              <Input id="nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password2">Repite contraseña</Label>
            <Input id="password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
            Acepto los términos y condiciones
          </label>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <DialogFooter className="flex flex-col gap-3 items-stretch sm:flex-col">
            <Button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md">
              {loading ? "Registrando..." : "Registrarme"}
            </Button>
            <button type="button" className="text-sm text-gray-600 hover:text-gray-900 self-center"
              onClick={() => { setOpen(false); onOpenLogin?.(); }}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}