"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "./ImageUploader";
import { fetchCategorias, fetchMarcas, fetchModelosByMarca } from "@/lib/api/catalogos";
import { Link as LinkIcon, Upload, Trash2, CheckCircle2 } from "lucide-react";

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
    PRECIO_VENTA: "" as string | number,
    ACT_PRO: true,
    imageMode: "url" as "file" | "url",
    imageFile: null as File | null,
    imageUrl: "",
    removeImage: false,
  });

  const [categorias, setCategorias] = useState<Array<{ ID_CAT: number; NOM_CAT: string }>>([]);
  const [marcas, setMarcas] = useState<Array<{ ID_MAR: number; NOM_MAR: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ ID_MOD: string; NOM_MOD: string }>>([]);
  const [existingImg, setExistingImg] = useState<string | undefined>(undefined);
  const [urlImgValid, setUrlImgValid] = useState<boolean | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
      const isHttp = /^https?:\/\//i.test(producto.IMG_URL || "");
      setForm({
        COD_BAR_PRO: producto.COD_BAR_PRO || "",
        IME_PRO: producto.IME_PRO || "",
        ID_CAT: producto.ID_CAT ?? "",
        ID_MAR: producto.ID_MAR ?? "",
        ID_MOD: producto.ID_MOD ?? "",
        DES_PRO: producto.DES_PRO || "",
        ORG_PRO: producto.ORG_PRO || "COMPRA_NUEVA",
        EST_PRO: producto.EST_PRO || "NUEVO",
        PRECIO_VENTA: producto.PRECIO_VENTA !== undefined ? producto.PRECIO_VENTA : (producto.VAL_PRE ?? ""),
        ACT_PRO: producto.ACT_PRO !== undefined ? !!producto.ACT_PRO : true,
        imageMode: isHttp ? "url" : "file",
        imageFile: null,
        imageUrl: isHttp ? producto.IMG_URL : "",
        removeImage: false,
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
    if (submittingRef.current || isSubmitting) return;

    try {
      submittingRef.current = true;
      setIsSubmitting(true);

      const fd = new FormData();
      if (form.COD_BAR_PRO) fd.append("COD_BAR_PRO", form.COD_BAR_PRO);
      if (form.IME_PRO) fd.append("IME_PRO", form.IME_PRO);
      fd.append("ID_CAT", String(form.ID_CAT));
      fd.append("ID_MAR", String(form.ID_MAR));
      if (form.ID_MOD) fd.append("ID_MOD", String(form.ID_MOD));
      if (form.DES_PRO) fd.append("DES_PRO", form.DES_PRO);
      fd.append("ORG_PRO", form.ORG_PRO);
      fd.append("EST_PRO", form.EST_PRO);
      if (form.PRECIO_VENTA !== "" && form.PRECIO_VENTA !== undefined) {
        fd.append("PRECIO_VENTA", String(form.PRECIO_VENTA));
      }
      fd.append("ACT_PRO", String(!!form.ACT_PRO));

      // Lógica híbrida para la imagen
      if (form.removeImage) {
        fd.append("removeImage", "true");
      } else if (form.imageMode === "file" && form.imageFile) {
        fd.append("image", form.imageFile);
      } else if (form.imageMode === "url" && form.imageUrl.trim()) {
        fd.append("IMG_URL", form.imageUrl.trim());
      }

      await onSubmit(fd);
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="COD_BAR_PRO">Código/Barcode</Label>
          <Input id="COD_BAR_PRO" name="COD_BAR_PRO" value={form.COD_BAR_PRO} onChange={handleChange} placeholder="COD-123" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="PRECIO_VENTA" className="text-emerald-700 font-semibold flex items-center gap-1">
            <span>Precio Venta ($)</span>
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="PRECIO_VENTA"
            name="PRECIO_VENTA"
            type="number"
            step="0.01"
            min="0"
            value={form.PRECIO_VENTA}
            onChange={handleChange}
            placeholder="0.00"
            className="font-bold border-emerald-300 focus:border-emerald-500 text-emerald-900 bg-emerald-50/20"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="IME_PRO">IMEI (opcional)</Label>
          <Input id="IME_PRO" name="IME_PRO" value={form.IME_PRO} onChange={handleChange} />
        </div>
        <div className="grid gap-2">
          <Label>Estado / Condición</Label>
          <select name="EST_PRO" value={form.EST_PRO} onChange={handleChange} className="border rounded px-2 py-2 text-sm">
            <option value="NUEVO">Nuevo</option>
            <option value="USADO_EXCELENTE">Usado - Excelente</option>
            <option value="USADO_BUENO">Usado - Bueno</option>
            <option value="USADO_REGULAR">Usado - Regular</option>
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

      {/* Selector Híbrido de Imagen */}
      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <Label className="text-sm font-semibold text-gray-800">Imagen del Producto</Label>
            <p className="text-xs text-gray-500">Puedes pegar un enlace web directo o subir un archivo</p>
          </div>

          {/* Toggle de Modo */}
          <div className="flex items-center gap-1 bg-gray-200/70 p-1 rounded-lg self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, imageMode: "url", removeImage: false }));
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                form.imageMode === "url"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" /> Enlace Web (URL)
            </button>
            <button
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, imageMode: "file", removeImage: false }));
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition ${
                form.imageMode === "file"
                  ? "bg-white text-gray-900 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" /> Subir Archivo
            </button>
          </div>
        </div>

        {/* Input según el modo seleccionado */}
        {form.imageMode === "url" ? (
          <div className="space-y-2">
            <div className="relative">
              <Input
                type="url"
                placeholder="https://ejemplo.com/imagenes/iphone-15.jpg"
                value={form.imageUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((p) => ({ ...p, imageUrl: val, removeImage: false }));
                  setUrlImgValid(null);
                  if (val.trim()) setExistingImg(undefined);
                }}
                className="text-xs bg-white pr-9"
              />
              {urlImgValid && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Ideal para imágenes alojadas en internet (Apple, Sony, Unsplash, Imgur, etc.). No se borran con reinicios de servidor.
            </p>

            {/* Preview de URL */}
            {form.imageUrl.trim() && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
                <img
                  src={form.imageUrl.trim()}
                  alt="Vista previa URL"
                  className="h-16 w-16 object-contain rounded border bg-gray-50 shrink-0"
                  onLoad={() => setUrlImgValid(true)}
                  onError={() => setUrlImgValid(false)}
                />
                <div className="text-xs overflow-hidden">
                  <p className="font-semibold text-gray-800">Vista previa del enlace</p>
                  {urlImgValid === false ? (
                    <p className="text-amber-600 text-[11px]">No se pudo cargar la imagen desde este enlace.</p>
                  ) : (
                    <p className="text-emerald-600 text-[11px]">Imagen cargada correctamente.</p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setForm((p) => ({ ...p, imageUrl: "", removeImage: true }));
                      setUrlImgValid(null);
                    }}
                    className="text-red-600 hover:underline text-[11px] font-medium mt-1 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar este enlace
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ImageUploader
            value={form.imageFile}
            onChange={(f) => {
              setForm((p) => ({ ...p, imageFile: f, removeImage: false }));
              if (f) setExistingImg(undefined);
            }}
          />
        )}

        {/* Imagen Actual (si existe en BD y no ha sido reemplazada ni borrada) */}
        {existingImg && !form.removeImage && (
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={existingImg}
                alt="Imagen actual"
                className="h-14 w-14 object-contain rounded border bg-white p-1"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.endsWith("/images/iphone15.jpg")) {
                    target.src = "/images/iphone15.jpg";
                  }
                }}
              />
              <div>
                <p className="text-xs font-semibold text-gray-800">Imagen registrada actualmente</p>
                <p className="text-[11px] text-gray-500 truncate max-w-xs">{existingImg}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setForm((p) => ({ ...p, removeImage: true, imageUrl: "", imageFile: null }));
                setExistingImg(undefined);
              }}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Quitar imagen
            </Button>
          </div>
        )}

        {form.removeImage && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center justify-between">
            <span>La imagen actual será eliminada al guardar cambios.</span>
            <button
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, removeImage: false }));
                if (producto?.IMG_URL) setExistingImg(producto.IMG_URL);
              }}
              className="text-xs font-semibold text-amber-900 underline ml-2"
            >
              Deshacer
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" name="ACT_PRO" checked={!!form.ACT_PRO} onChange={handleChange} disabled={isSubmitting} />
          Activo
        </label>
        <div className="grow" />
        <Button variant="outline" type="button" disabled={isSubmitting} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gray-900 text-white hover:bg-gray-800 font-semibold transition"
        >
          {isSubmitting
            ? (isEditing ? "Guardando cambios..." : "Creando producto...")
            : (isEditing ? "Guardar cambios" : "Crear producto")}
        </Button>
      </div>
    </form>
  );
}