"use client";

import Image from "next/image";
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
import { Search, ShoppingBag, Apple, Star, Sparkles } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function LoginModal({ open, setOpen }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-2xl border border-gray-200">
        <DialogHeader className="items-center">
          {/* Logo DetchPlus */}
          <div className="flex justify-center mb-2">
              <Apple className="h-6 w-6" />
              <span>  DetchPlus</span>
            </div>

          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">Iniciar Sesión</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Ingresa tus credenciales para acceder al sistema.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-5">
          <div>
            <Label htmlFor="usuario" className="font-semibold text-gray-700">Usuario</Label>
            <Input
              id="usuario"
              type="text"
              placeholder="Tu usuario"
              className="mt-1 bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-600"
            />
          </div>

          <div>
            <Label htmlFor="password" className="font-semibold text-gray-700">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="mt-1 bg-white border-gray-300 rounded-lg shadow-sm focus:border-blue-600"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 shadow-md"
            >
              Ingresar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}