"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Apple, Mail, CheckCircle2, ArrowLeft, ExternalLink } from "lucide-react";
import { forgotPasswordApi } from "@/lib/api/auth";

type ForgotPasswordModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpenLogin?: () => void;
};

export default function ForgotPasswordModal({ open, setOpen, onOpenLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [emailPreview, setEmailPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await forgotPasswordApi(email);
      setSuccessMsg(res.message);
      if (res.emailPreview) {
        setEmailPreview(res.emailPreview);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setErrorMsg(null);
      setSuccessMsg(null);
      setEmailPreview(null);
      setEmail("");
    }, 200);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader className="items-center">
          <div className="flex justify-center mb-2">
            <Apple className="h-6 w-6 text-gray-900" />
            <span className="font-semibold text-gray-900">&nbsp;DetchPlus</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            Recuperar Contraseña
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Ingresa el correo electrónico asociado a tu cuenta para recibir un enlace de restablecimiento.
          </DialogDescription>
        </DialogHeader>

        {successMsg ? (
          <div className="space-y-5 py-3">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-900 mb-1">Enlace enviado</p>
                <p>{successMsg}</p>
              </div>
            </div>

            {emailPreview && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-900 space-y-2">
                <p className="font-semibold flex items-center gap-1.5 text-blue-950">
                  <Mail className="h-4 w-4" /> Entorno de pruebas (Ethereal)
                </p>
                <p className="text-xs text-blue-800">
                  Como el backend está en modo desarrollo sin SMTP de producción, puedes abrir directamente el correo de prueba generado aquí:
                </p>
                <a
                  href={emailPreview}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 underline mt-1"
                >
                  Abrir correo en Ethereal <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <DialogFooter className="flex flex-col gap-2 pt-2 sm:flex-col">
              <Button
                type="button"
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300"
                onClick={() => {
                  handleClose();
                  onOpenLogin?.();
                }}
              >
                Volver a Iniciar Sesión
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="forgot-email" className="font-semibold text-gray-700">
                Correo Electrónico
              </Label>
              <div className="relative mt-1">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {errorMsg && <p className="text-sm text-red-600 font-medium">{errorMsg}</p>}

            <DialogFooter className="flex flex-col gap-3 items-stretch sm:flex-col">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md"
              >
                {loading ? "Enviando enlace..." : "Enviar Enlace de Recuperación"}
              </Button>

              <button
                type="button"
                className="flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => {
                  handleClose();
                  onOpenLogin?.();
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Volver al Inicio de Sesión
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
