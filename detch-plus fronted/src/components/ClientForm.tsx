"use client";

import { useEffect, useState } from "react";
import { Cliente, ClienteFormData } from "@/types/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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
    }
  }, [cliente]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isEditing && (
        <div className="grid gap-2">
          <Label htmlFor="CED_CLI">Cédula/RUC</Label>
          <Input
            id="CED_CLI"
            name="CED_CLI"
            value={form.CED_CLI}
            onChange={handleChange}
            placeholder="1234567890"
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="NOM_CLI">Nombres</Label>
          <Input id="NOM_CLI" name="NOM_CLI" value={form.NOM_CLI} onChange={handleChange} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="APE_CLI">Apellidos</Label>
          <Input id="APE_CLI" name="APE_CLI" value={form.APE_CLI} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="DIR_CLI">Dirección</Label>
        <Input id="DIR_CLI" name="DIR_CLI" value={form.DIR_CLI} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="COR_CLI">Correo</Label>
          <Input id="COR_CLI" name="COR_CLI" type="email" value={form.COR_CLI} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="NUM_CLI">Teléfono</Label>
          <Input id="NUM_CLI" name="NUM_CLI" value={form.NUM_CLI} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Dificultad</Label>
          <Select
            value={form.DIF_CLI}
            onValueChange={(v) => setForm((p) => ({ ...p, DIF_CLI: v as "BAJA" | "MEDIA" | "ALTA" }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">BAJA</SelectItem>
              <SelectItem value="MEDIA">MEDIA</SelectItem>
              <SelectItem value="ALTA">ALTA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between border rounded-md p-3">
          <Label htmlFor="ACTIVO" className="mr-4">
            Activo
          </Label>
          <Switch
            id="ACTIVO"
            checked={!!form.ACTIVO}
            onCheckedChange={(v) => setForm((p) => ({ ...p, ACTIVO: v }))}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? "Guardar cambios" : "Crear cliente"}</Button>
      </div>
    </form>
  );
}