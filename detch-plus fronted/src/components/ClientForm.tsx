"use client";

import { useEffect, useState } from "react";
import { Cliente, ClienteFormData } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  validarFormularioCliente,
  validarCedulaRucEcuador,
  validarTextoNombre,
  validarTelefonoEcuador,
  validarCorreo,
} from "@/lib/validators/clientValidator";
import { AlertCircle, CheckCircle } from "lucide-react";

type Props = {
  cliente?: Cliente;
  isEditing?: boolean;
  onSubmit: (data: ClienteFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function ClientForm({ cliente, isEditing, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ClienteFormData>({
    CED_CLI: "",
    NOM_CLI: "",
    APE_CLI: "",
    DIR_CLI: "",
    COR_CLI: "",
    NUM_CLI: "",
    DIF_CLI: "BAJA",
    ACTIVO: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cliente) {
      setForm({
        CED_CLI: cliente.CED_CLI,
        NOM_CLI: cliente.NOM_CLI,
        APE_CLI: cliente.APE_CLI,
        DIR_CLI: cliente.DIR_CLI ?? "",
        COR_CLI: cliente.COR_CLI ?? "",
        NUM_CLI: cliente.NUM_CLI ?? "",
        DIF_CLI: cliente.DIF_CLI,
        ACTIVO: cliente.ACTIVO,
      });
      setFieldErrors({});
    }
  }, [cliente]);

  // Manejo de Cédula/RUC: solo dígitos, máximo 13 caracteres
  function handleCedulaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 13);
    setForm((prev) => ({ ...prev, CED_CLI: digitsOnly }));

    if (fieldErrors.CED_CLI) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.CED_CLI;
        return next;
      });
    }
  }

  // Manejo de Nombres: filtra automáticamente números y caracteres prohibidos
  function handleNombreChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "");
    setForm((prev) => ({ ...prev, NOM_CLI: clean }));

    if (raw !== clean) {
      setFieldErrors((prev) => ({
        ...prev,
        NOM_CLI: "No se permiten números ni caracteres especiales en nombres",
      }));
    } else if (fieldErrors.NOM_CLI) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.NOM_CLI;
        return next;
      });
    }
  }

  // Manejo de Apellidos: filtra automáticamente números y caracteres prohibidos
  function handleApellidoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const clean = raw.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g, "");
    setForm((prev) => ({ ...prev, APE_CLI: clean }));

    if (raw !== clean) {
      setFieldErrors((prev) => ({
        ...prev,
        APE_CLI: "No se permiten números ni caracteres especiales en apellidos",
      }));
    } else if (fieldErrors.APE_CLI) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.APE_CLI;
        return next;
      });
    }
  }

  // Manejo de Teléfono: solo dígitos, máximo 10
  function handleTelefonoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, NUM_CLI: digitsOnly }));

    if (fieldErrors.NUM_CLI) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.NUM_CLI;
        return next;
      });
    }
  }

  function handleGenericChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Ejecutar validaciones exhaustivas de dominio
    const validation = validarFormularioCliente(
      {
        CED_CLI: form.CED_CLI,
        NOM_CLI: form.NOM_CLI,
        APE_CLI: form.APE_CLI,
        NUM_CLI: form.NUM_CLI,
        COR_CLI: form.COR_CLI,
        DIR_CLI: form.DIR_CLI,
      },
      isEditing
    );

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstMessage = Object.values(validation.errors)[0];
      setError(firstMessage || "Por favor corrige los campos señalados.");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message || "Error al procesar el cliente");
    } finally {
      setLoading(false);
    }
  }

  // Validación en tiempo real para indicador de cédula
  const cedulaValidation = !isEditing && form.CED_CLI.length >= 10 ? validarCedulaRucEcuador(form.CED_CLI) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {!isEditing && (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="CED_CLI" className="font-semibold text-gray-700">
              Cédula / RUC (Ecuador)
            </Label>
            {cedulaValidation && (
              <span
                className={`text-[11px] font-medium flex items-center gap-1 ${
                  cedulaValidation.isValid ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {cedulaValidation.isValid ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    {form.CED_CLI.length === 10 ? "Cédula Válida" : "RUC Válido"}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Identificación Inválida
                  </>
                )}
              </span>
            )}
          </div>
          <Input
            id="CED_CLI"
            name="CED_CLI"
            value={form.CED_CLI}
            onChange={handleCedulaChange}
            placeholder="Ej: 1710034065 o RUC"
            maxLength={13}
            required
            className={fieldErrors.CED_CLI ? "border-rose-500 focus-visible:ring-rose-500" : ""}
          />
          {fieldErrors.CED_CLI ? (
            <p className="text-xs text-rose-600 font-medium">{fieldErrors.CED_CLI}</p>
          ) : (
            <p className="text-[11px] text-gray-500">10 dígitos para cédula o 13 dígitos para RUC (solo números)</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="NOM_CLI" className="font-semibold text-gray-700">
            Nombres
          </Label>
          <Input
            id="NOM_CLI"
            name="NOM_CLI"
            value={form.NOM_CLI}
            onChange={handleNombreChange}
            placeholder="Solo letras y espacios"
            required
            className={fieldErrors.NOM_CLI ? "border-rose-500 focus-visible:ring-rose-500" : ""}
          />
          {fieldErrors.NOM_CLI && <p className="text-xs text-rose-600 font-medium">{fieldErrors.NOM_CLI}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="APE_CLI" className="font-semibold text-gray-700">
            Apellidos
          </Label>
          <Input
            id="APE_CLI"
            name="APE_CLI"
            value={form.APE_CLI}
            onChange={handleApellidoChange}
            placeholder="Solo letras y espacios"
            required
            className={fieldErrors.APE_CLI ? "border-rose-500 focus-visible:ring-rose-500" : ""}
          />
          {fieldErrors.APE_CLI && <p className="text-xs text-rose-600 font-medium">{fieldErrors.APE_CLI}</p>}
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="DIR_CLI" className="font-semibold text-gray-700">
          Dirección
        </Label>
        <Input
          id="DIR_CLI"
          name="DIR_CLI"
          value={form.DIR_CLI}
          onChange={handleGenericChange}
          placeholder="Calle principal, secundaria y número de casa"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="COR_CLI" className="font-semibold text-gray-700">
            Correo Electrónico
          </Label>
          <Input
            id="COR_CLI"
            name="COR_CLI"
            type="email"
            value={form.COR_CLI}
            onChange={handleGenericChange}
            placeholder="cliente@ejemplo.com"
            className={fieldErrors.COR_CLI ? "border-rose-500 focus-visible:ring-rose-500" : ""}
          />
          {fieldErrors.COR_CLI && <p className="text-xs text-rose-600 font-medium">{fieldErrors.COR_CLI}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="NUM_CLI" className="font-semibold text-gray-700">
            Teléfono / Celular
          </Label>
          <Input
            id="NUM_CLI"
            name="NUM_CLI"
            value={form.NUM_CLI}
            onChange={handleTelefonoChange}
            placeholder="0991234567"
            maxLength={10}
            className={fieldErrors.NUM_CLI ? "border-rose-500 focus-visible:ring-rose-500" : ""}
          />
          {fieldErrors.NUM_CLI && <p className="text-xs text-rose-600 font-medium">{fieldErrors.NUM_CLI}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label className="font-semibold text-gray-700">Dificultad de Atención</Label>
          <Select
            value={form.DIF_CLI}
            onValueChange={(v) => setForm((p) => ({ ...p, DIF_CLI: v as "BAJA" | "MEDIA" | "ALTA" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione dificultad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">BAJA</SelectItem>
              <SelectItem value="MEDIA">MEDIA</SelectItem>
              <SelectItem value="ALTA">ALTA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between border rounded-lg p-3 bg-gray-50/50">
          <div>
            <Label htmlFor="ACTIVO" className="font-semibold text-gray-800 block cursor-pointer">
              Cliente Activo
            </Label>
            <span className="text-xs text-gray-500">Habilitado para compras y servicios</span>
          </div>
          <Switch
            id="ACTIVO"
            checked={!!form.ACTIVO}
            onCheckedChange={(v) => setForm((p) => ({ ...p, ACTIVO: v }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="rounded-lg">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cliente"}
        </Button>
      </div>
    </form>
  );
}