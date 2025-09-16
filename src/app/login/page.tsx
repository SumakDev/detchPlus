"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function LoginModal({ open, setOpen }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Iniciar Sesión</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder al sistema.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div>
            <Label htmlFor="usuario">Usuario</Label>
            <Input id="usuario" type="text" placeholder="Tu usuario" />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Ingresar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
