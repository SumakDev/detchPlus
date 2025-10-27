"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "./ImageUploader";
import { fetchCategorias, fetchMarcas, fetchModelosByMarca } from "@/lib/api/catalogos";

export default function ProductForm({
  producto,
  isEditing,
  onSubmit,
  onCancel,
}: {
  producto?: any;
  isEditing?: boolean;
  onSubmit: (form: FormData) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    COD_BAR_PRO: "",
    IME_PRO: "",
    ID_CAT: "" as number | "",
    ID_MAR: "" as number | "",
    ID_MOD: "" as string | "",
    DES_PRO: "",
    ORG_PRO: "COMPRA_NUEVA",
    EST_PRO: "NUEVO",
    ACT_PRO: true,
    imageFile: null as File | null,
  });

  const [categorias, setCategorias] = useState<Array<{ ID_CAT: number; NOM_CAT: string }>>([]);
  const [marcas, setMarcas] = useState<Array<{ ID_MAR: number; NOM_MAR: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ ID_MOD: string; NOM_MOD: string }>>([]);
  const [existingImg, setExistingImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchCategorias().then(setCategorias).catch(() => setCategorias([]));
    fetchMarcas().then(setMarcas).catch(() => setMarcas([]));
  }, []);

  useEffect(() => {
    if (form.ID_MAR) {
      fetchModelosByMarca(Number(form.ID_MAR)).then(setModelos).catch(() => setModelos([]));
    } else {
      setModelos([]);
      setForm((p) => ({ ...p, ID_MOD: "" }));
    }
  }, [form.ID_MAR]);

  useEffect(() => {
    if (producto) {
      setForm({
        COD_BAR_PRO: producto.COD_BAR_PRO || "",
        IME_PRO: producto.IME_PRO || "",
        ID_CAT: producto.ID_CAT ?? "",
        ID_MAR: producto.ID_MAR ?? "",
        ID_MOD: producto.ID_MOD ?? "",
        DES_PRO: producto.DES_PRO || "",
        ORG_PRO: producto.ORG_PRO,
        EST_PRO: producto.EST_PRO,
        ACT_PRO: !!producto.ACT_PRO,
        imageFile: null,
      });
      setExistingImg(producto.IMG_URL);
    }
  }, [producto]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") return setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    if (name === "ID_MAR") return setForm((p) => ({ ...p, ID_MAR: value ? Number(value) : "", ID_MOD: "" }));
    if (name === "ID_CAT") return setForm((p) => ({ ...p, ID_CAT: value ? Number(value) : "" }));
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    if (form.COD_BAR_PRO) fd.append("COD_BAR_PRO", form.COD_BAR_PRO);
    if (form.IME_PRO) fd.append("IME_PRO", form.IME_PRO);
    fd.append("ID_CAT", String(form.ID_CAT));
    fd.append("ID_MAR", String(form.ID_MAR));
    if (form.ID_MOD) fd.append("ID_MOD", String(form.ID_MOD));
    if (form.DES_PRO) fd.append("DES_PRO", form.DES_PRO);
    fd.append("ORG_PRO", form.ORG_PRO);
    fd.append("EST_PRO", form.EST_PRO);
    fd.append("ACT_PRO", String(!!form.ACT_PRO));
    if (form.imageFile) fd.append("image", form.imageFile);
    await onSubmit(fd);
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="COD_BAR_PRO">Código/Barcode</Label>
          <Input id="COD_BAR_PRO" name="COD_BAR_PRO" value={form.COD_BAR_PRO} onChange={handleChange} placeholder="COD-123" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="IME_PRO">IMEI (opcional)</Label>
          <Input id="IME_PRO" name="IME_PRO" value={form.IME_PRO} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label>Estado</Label>
          <select name="EST_PRO" value={form.EST_PRO} onChange={handleChange} className="border rounded px-2 py-2 text-sm">
            <option value="NUEVO">NUEVO</option>
            <option value="USADO_EXCELENTE">USADO_EXCELENTE</option>
            <option value="USADO_BUENO">USADO_BUENO</option>
            <option value="USADO_REGULAR">USADO_REGULAR</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Categoría</Label>
          <select name="ID_CAT" value={form.ID_CAT} onChange={handleChange} className="border rounded px-2 py-2 text-sm" required>
            <option value="">Seleccionar</option>
            {categorias.map((c) => (
              <option key={c.ID_CAT} value={c.ID_CAT}>{c.NOM_CAT}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Marca</Label>
          <select name="ID_MAR" value={form.ID_MAR} onChange={handleChange} className="border rounded px-2 py-2 text-sm" required>
            <option value="">Seleccionar</option>
            {marcas.map((m) => (
              <option key={m.ID_MAR} value={m.ID_MAR}>{m.NOM_MAR}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>Modelo</Label>
          <select
            name="ID_MOD"
            value={form.ID_MOD}
            onChange={handleChange}
            className="border rounded px-2 py-2 text-sm"
            disabled={!form.ID_MAR || modelos.length === 0}
          >
            <option value="">(opcional)</option>
            {modelos.map((m) => (
              <option key={m.ID_MOD} value={m.ID_MOD}>{m.NOM_MOD}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="DES_PRO">Descripción</Label>
        <textarea id="DES_PRO" name="DES_PRO" value={form.DES_PRO} onChange={handleChange} className="min-h-[80px] border rounded px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImageUploader
          value={form.imageFile}
          onChange={(f) => {
            setForm((p) => ({ ...p, imageFile: f }));
            if (f) setExistingImg(undefined);
          }}
        />
        {existingImg && (
          <div>
            <Label className="text-sm font-medium text-gray-700">Imagen actual</Label>
            <div className="mt-2">
              <img src={existingImg} alt="actual" className="h-24 w-24 object-cover rounded border" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="ACT_PRO" checked={!!form.ACT_PRO} onChange={handleChange} />
          Activo
        </label>
        <div className="grow" />
        <Button variant="outline" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">{isEditing ? "Guardar cambios" : "Crear producto"}</Button>
      </div>
    </form>
  );
}