"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUploader from "./ImageUploader";
import {
  fetchCategorias,
  fetchMarcas,
  fetchModelosByMarca,
  fetchProveedores,
} from "@/lib/api/catalogos";
import type {
  DetalleTelefono,
  DetalleReloj,
  DetalleConsola,
  Proveedor,
  EstadoProducto,
  OrigenProducto,
  DisponibilidadTelefono,
} from "@/types/product";
import { formatEstadoProducto } from "@/types/product";
import {
  Link as LinkIcon,
  Upload,
  Trash2,
  CheckCircle2,
  Plus,
  Copy,
  Smartphone,
  Watch,
  Gamepad2,
  Truck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const STORAGE_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLOR_SUGGESTIONS = [
  "Negro",
  "Blanco",
  "Azul",
  "Azul Medianoche",
  "Dorado",
  "Grafito",
  "Plata",
  "Rosa",
  "Verde",
  "Morado",
  "Rojo",
  "Titanio Natural",
];

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
    ID_CAT: "" as number | "",
    ID_MAR: "" as number | "",
    ID_MOD: "" as string | "",
    ID_PRV: "" as number | "",
    DES_PRO: "",
    ORG_PRO: "COMPRA_NUEVA" as OrigenProducto,
    EST_PRO: "NUEVO" as EstadoProducto,
    PRECIO_VENTA: "" as string | number,
    ACT_PRO: true,
    imageMode: "url" as "file" | "url",
    imageFile: null as File | null,
    imageUrl: "",
    removeImage: false,
  });

  const [detallesTelefono, setDetallesTelefono] = useState<DetalleTelefono[]>([]);
  const [detalleReloj, setDetalleReloj] = useState<DetalleReloj>({
    TAM_REL: "",
    COL_REL: "",
    TIP_REL: "SMART_WATCH",
  });
  const [detalleConsola, setDetalleConsola] = useState<DetalleConsola>({
    CAP_CON: "",
    NUM_CON: 1,
    VER_CON: "",
    EST_CON: "",
  });

  const [expandedDiagIndex, setExpandedDiagIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [categorias, setCategorias] = useState<Array<{ ID_CAT: number; NOM_CAT: string }>>([]);
  const [marcas, setMarcas] = useState<Array<{ ID_MAR: number; NOM_MAR: string }>>([]);
  const [modelos, setModelos] = useState<Array<{ ID_MOD: string; NOM_MOD: string }>>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [existingImg, setExistingImg] = useState<string | undefined>(undefined);
  const [urlImgValid, setUrlImgValid] = useState<boolean | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    fetchCategorias().then(setCategorias).catch(() => setCategorias([]));
    fetchMarcas().then(setMarcas).catch(() => setMarcas([]));
    fetchProveedores().then(setProveedores).catch(() => setProveedores([]));
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
        ID_CAT: producto.ID_CAT ?? "",
        ID_MAR: producto.ID_MAR ?? "",
        ID_MOD: producto.ID_MOD ?? "",
        ID_PRV: producto.ID_PRV ?? "",
        DES_PRO: producto.DES_PRO || "",
        ORG_PRO: (producto.ORG_PRO || "COMPRA_NUEVA") as OrigenProducto,
        EST_PRO: (producto.EST_PRO || "NUEVO") as EstadoProducto,
        PRECIO_VENTA: producto.PRECIO_VENTA !== undefined ? producto.PRECIO_VENTA : (producto.VAL_PRE ?? ""),
        ACT_PRO: producto.ACT_PRO !== undefined ? !!producto.ACT_PRO : true,
        imageMode: isHttp ? "url" : "file",
        imageFile: null,
        imageUrl: isHttp ? producto.IMG_URL : "",
        removeImage: false,
      });
      setExistingImg(producto.IMG_URL);

      if (Array.isArray(producto.detallesTelefono)) {
        setDetallesTelefono(
          producto.detallesTelefono.map((d: any) => ({
            ID_DET_TEL: d.ID_DET_TEL,
            ID_PRO: d.ID_PRO,
            IME_TEL: d.IME_TEL || "",
            COL_TEL: d.COL_TEL || "",
            ALM_TEL: d.ALM_TEL || "128GB",
            EST_FIS_TEL: (d.EST_FIS_TEL || producto.EST_PRO || "NUEVO") as EstadoProducto,
            ORG_TEL: (d.ORG_TEL || producto.ORG_PRO || "COMPRA_NUEVA") as OrigenProducto,
            EST_BAT_TEL: d.EST_BAT_TEL ?? 10,
            EST_PAN_TEL: d.EST_PAN_TEL ?? 10,
            EST_CAR_TEL: d.EST_CAR_TEL ?? 10,
            EST_CAM_TEL: d.EST_CAM_TEL ?? 10,
            EST_SOF_TEL: d.EST_SOF_TEL ?? 10,
            ACC_INC_TEL: d.ACC_INC_TEL || "",
            DIS_TEL: (d.DIS_TEL || "DISPONIBLE") as DisponibilidadTelefono,
          }))
        );
      } else {
        setDetallesTelefono([]);
      }

      if (producto.detalleReloj) {
        setDetalleReloj({
          TAM_REL: producto.detalleReloj.TAM_REL || "",
          COL_REL: producto.detalleReloj.COL_REL || "",
          TIP_REL: producto.detalleReloj.TIP_REL === "FITNESS_BAND" ? "FITNESS_BAND" : "SMART_WATCH",
        });
      } else {
        setDetalleReloj({ TAM_REL: "", COL_REL: "", TIP_REL: "SMART_WATCH" });
      }

      if (producto.detalleConsola) {
        setDetalleConsola({
          CAP_CON: producto.detalleConsola.CAP_CON || "",
          NUM_CON: producto.detalleConsola.NUM_CON ?? 1,
          VER_CON: producto.detalleConsola.VER_CON || "",
          EST_CON: producto.detalleConsola.EST_CON || "",
        });
      } else {
        setDetalleConsola({ CAP_CON: "", NUM_CON: 1, VER_CON: "", EST_CON: "" });
      }
    }
  }, [producto]);

  const selectedCatName = useMemo(() => {
    if (!form.ID_CAT) return "";
    const found = categorias.find((c) => Number(c.ID_CAT) === Number(form.ID_CAT));
    return (found?.NOM_CAT || "").toUpperCase();
  }, [form.ID_CAT, categorias]);

  const isPhoneCategory = useMemo(() => {
    if (!form.ID_CAT) return false;
    return Number(form.ID_CAT) === 1 || selectedCatName === "TELEFONO";
  }, [form.ID_CAT, selectedCatName]);

  const isWatchCategory = useMemo(() => {
    if (!form.ID_CAT) return false;
    return Number(form.ID_CAT) === 2 || selectedCatName === "RELOJ";
  }, [form.ID_CAT, selectedCatName]);

  const isConsoleCategory = useMemo(() => {
    if (!form.ID_CAT) return false;
    return Number(form.ID_CAT) === 3 || selectedCatName === "CONSOLA";
  }, [form.ID_CAT, selectedCatName]);

  // Resumen en vivo de variantes agrupadas por Color + Almacenamiento + Estado
  const liveVariantSummary = useMemo(() => {
    const map = new Map<string, { color: string; almacenamiento: string; estado: string; disponibles: number; total: number }>();
    for (const d of detallesTelefono) {
      const color = (d.COL_TEL || "Sin color").trim() || "Sin color";
      const alm = (d.ALM_TEL || "S/A").trim() || "S/A";
      const est = d.EST_FIS_TEL || "NUEVO";
      const key = `${color.toLowerCase()}__${alm.toLowerCase()}__${est}`;
      if (!map.has(key)) {
        map.set(key, { color, almacenamiento: alm, estado: est, disponibles: 0, total: 0 });
      }
      const item = map.get(key)!;
      item.total += 1;
      if ((d.DIS_TEL || "DISPONIBLE") === "DISPONIBLE") {
        item.disponibles += 1;
      }
    }
    return Array.from(map.values());
  }, [detallesTelefono]);

  const totalDisponiblesTel = useMemo(
    () => detallesTelefono.filter((d) => (d.DIS_TEL || "DISPONIBLE") === "DISPONIBLE").length,
    [detallesTelefono]
  );

  function addPhoneUnit() {
    setDetallesTelefono((prev) => [
      ...prev,
      {
        IME_TEL: "",
        COL_TEL: "",
        ALM_TEL: "128GB",
        EST_FIS_TEL: form.EST_PRO || "NUEVO",
        ORG_TEL: form.ORG_PRO || "COMPRA_NUEVA",
        EST_BAT_TEL: 10,
        EST_PAN_TEL: 10,
        EST_CAR_TEL: 10,
        EST_CAM_TEL: 10,
        EST_SOF_TEL: 10,
        ACC_INC_TEL: "",
        DIS_TEL: "DISPONIBLE",
      },
    ]);
  }

  function duplicatePhoneUnit(index: number) {
    const source = detallesTelefono[index];
    if (!source) return;
    setDetallesTelefono((prev) => [
      ...prev.slice(0, index + 1),
      {
        ...source,
        ID_DET_TEL: undefined,
        IME_TEL: "", // El IMEI es único por teléfono físico
        DIS_TEL: "DISPONIBLE",
      },
      ...prev.slice(index + 1),
    ]);
  }

  function removePhoneUnit(index: number) {
    setDetallesTelefono((prev) => prev.filter((_, i) => i !== index));
    if (expandedDiagIndex === index) setExpandedDiagIndex(null);
  }

  function updatePhoneUnit(index: number, patch: Partial<DetalleTelefono>) {
    setDetallesTelefono((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target as any;
    if (type === "checkbox") return setForm((p) => ({ ...p, [name]: (e.target as HTMLInputElement).checked }));
    if (name === "ID_MAR") return setForm((p) => ({ ...p, ID_MAR: value ? Number(value) : "", ID_MOD: "" }));
    if (name === "ID_CAT") return setForm((p) => ({ ...p, ID_CAT: value ? Number(value) : "" }));
    if (name === "ID_PRV") return setForm((p) => ({ ...p, ID_PRV: value ? Number(value) : "" }));
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current || isSubmitting) return;
    setFormError(null);

    // Validar que no haya IMEIs repetidos en el formulario
    if (isPhoneCategory && detallesTelefono.length > 0) {
      const seen = new Set<string>();
      for (let i = 0; i < detallesTelefono.length; i++) {
        const u = detallesTelefono[i];
        const imei = (u.IME_TEL || "").trim();
        if (imei) {
          if (seen.has(imei.toLowerCase())) {
            setFormError(`El IMEI "${imei}" está duplicado en la unidad #${i + 1}. Cada teléfono físico debe tener un IMEI único.`);
            return;
          }
          seen.add(imei.toLowerCase());
        }
        if (!(u.COL_TEL || "").trim()) {
          setFormError(`Por favor indica el color en la unidad de teléfono #${i + 1}.`);
          return;
        }
      }
    }

    try {
      submittingRef.current = true;
      setIsSubmitting(true);

      const fd = new FormData();
      if (form.COD_BAR_PRO) fd.append("COD_BAR_PRO", form.COD_BAR_PRO);
      fd.append("ID_CAT", String(form.ID_CAT));
      fd.append("ID_MAR", String(form.ID_MAR));
      if (form.ID_MOD) fd.append("ID_MOD", String(form.ID_MOD));
      fd.append("ID_PRV", form.ID_PRV ? String(form.ID_PRV) : "");
      if (form.DES_PRO) fd.append("DES_PRO", form.DES_PRO);
      fd.append("ORG_PRO", form.ORG_PRO);
      fd.append("EST_PRO", form.EST_PRO);
      if (form.PRECIO_VENTA !== "" && form.PRECIO_VENTA !== undefined) {
        fd.append("PRECIO_VENTA", String(form.PRECIO_VENTA));
      }
      fd.append("ACT_PRO", String(!!form.ACT_PRO));

      if (isPhoneCategory) {
        fd.append("DETALLES_TELEFONO", JSON.stringify(detallesTelefono));
      }
      if (isWatchCategory) {
        fd.append("DETALLE_RELOJ", JSON.stringify(detalleReloj));
      }
      if (isConsoleCategory) {
        fd.append("DETALLE_CONSOLA", JSON.stringify(detalleConsola));
      }

      if (form.removeImage) {
        fd.append("removeImage", "true");
      } else if (form.imageMode === "file" && form.imageFile) {
        fd.append("image", form.imageFile);
      } else if (form.imageMode === "url" && form.imageUrl.trim()) {
        fd.append("IMG_URL", form.imageUrl.trim());
      }

      await onSubmit(fd);
    } catch (err: any) {
      setFormError(err?.message || "Error al guardar el producto");
      throw err;
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  }

  return (
    <form onSubmit={submit} className="bg-white border rounded-lg p-4 space-y-4">
      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
          {formError}
        </div>
      )}

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
          <Label>Origen por defecto</Label>
          <select name="ORG_PRO" value={form.ORG_PRO} onChange={handleChange} className="border rounded px-2 py-2 text-sm">
            <option value="COMPRA_NUEVA">Compra Nueva</option>
            <option value="PARTE_PAGO">Parte de Pago</option>
            <option value="CONSIGNACION">Consignación</option>
          </select>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="grid gap-2">
          <Label className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-gray-500" /> Proveedor
          </Label>
          <select
            name="ID_PRV"
            value={form.ID_PRV}
            onChange={handleChange}
            className="border rounded px-2 py-2 text-sm"
          >
            <option value="">(Sin proveedor asignado)</option>
            {proveedores.map((prv) => (
              <option key={prv.ID_PRV} value={prv.ID_PRV}>
                {prv.NOM_PRV} {prv.RUC_PRV ? `(${prv.RUC_PRV})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SECCIÓN FICHA TÉCNICA DE RELOJ / SMARTWATCH (DET_REL) */}
      {isWatchCategory && (
        <div className="border border-purple-200 rounded-xl p-4 bg-purple-50/30 space-y-3">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-purple-600" />
            <Label className="text-sm font-bold text-gray-900">
              Ficha Técnica de Reloj / SmartWatch (DET_REL)
            </Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Tipo de Dispositivo *</Label>
              <select
                value={detalleReloj.TIP_REL || "SMART_WATCH"}
                onChange={(e) =>
                  setDetalleReloj((prev) => ({
                    ...prev,
                    TIP_REL: e.target.value as "SMART_WATCH" | "FITNESS_BAND",
                  }))
                }
                className="h-9 border rounded px-2.5 text-xs bg-white font-medium"
              >
                <option value="SMART_WATCH">SmartWatch (Reloj Inteligente)</option>
                <option value="FITNESS_BAND">Fitness Band (Pulsera Deportiva)</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Tamaño de Caja (TAM_REL)</Label>
              <Input
                value={detalleReloj.TAM_REL || ""}
                onChange={(e) => setDetalleReloj((prev) => ({ ...prev, TAM_REL: e.target.value }))}
                placeholder="Ej. 41mm, 45mm, 49mm Ultra"
                className="h-9 text-xs bg-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Color / Correa (COL_REL)</Label>
              <Input
                list="phone-colors-list"
                value={detalleReloj.COL_REL || ""}
                onChange={(e) => setDetalleReloj((prev) => ({ ...prev, COL_REL: e.target.value }))}
                placeholder="Ej. Medianoche, Estelar, Titanio"
                className="h-9 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN FICHA TÉCNICA DE CONSOLA (DET_CON) */}
      {isConsoleCategory && (
        <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/30 space-y-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-indigo-600" />
            <Label className="text-sm font-bold text-gray-900">
              Ficha Técnica de Consola (DET_CON)
            </Label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Versión / Edición (VER_CON)</Label>
              <Input
                value={detalleConsola.VER_CON || ""}
                onChange={(e) => setDetalleConsola((prev) => ({ ...prev, VER_CON: e.target.value }))}
                placeholder="Ej. Edición Disco, Digital, OLED"
                className="h-9 text-xs bg-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Capacidad (CAP_CON)</Label>
              <Input
                value={detalleConsola.CAP_CON || ""}
                onChange={(e) => setDetalleConsola((prev) => ({ ...prev, CAP_CON: e.target.value }))}
                placeholder="Ej. 512GB, 825GB, 1TB"
                className="h-9 text-xs bg-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Nº de Controles Incluidos</Label>
              <Input
                type="number"
                min={0}
                max={8}
                value={detalleConsola.NUM_CON ?? 1}
                onChange={(e) =>
                  setDetalleConsola((prev) => ({ ...prev, NUM_CON: Math.max(0, Number(e.target.value)) }))
                }
                className="h-9 text-xs bg-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-700">Detalle / Accesorios (EST_CON)</Label>
              <Input
                value={detalleConsola.EST_CON || ""}
                onChange={(e) => setDetalleConsola((prev) => ({ ...prev, EST_CON: e.target.value }))}
                placeholder="Ej. Sellada en caja, cables HDMI originales"
                className="h-9 text-xs bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 1:N UNIDADES INDIVIDUALES DE TELÉFONO (DET_TELE) */}
      {isPhoneCategory && (
        <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-bold text-gray-900">
                  Unidades Individuales de Teléfono (DET_TELE)
                </Label>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                  Stock disponible: {totalDisponiblesTel} {totalDisponiblesTel === 1 ? "unidad" : "unidades"}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Cada fila representa un teléfono físico con su propio IMEI, color, almacenamiento y estado. El stock se sincroniza automáticamente.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={addPhoneUnit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Agregar unidad física
            </Button>
          </div>

          {/* Resumen agrupado por Color + Almacenamiento */}
          {liveVariantSummary.length > 0 && (
            <div className="bg-white border border-blue-100 rounded-lg p-2.5 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 block">
                Conteo por Color y Almacenamiento:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {liveVariantSummary.map((v, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                  >
                    <span className="font-bold text-blue-700">{v.disponibles}x</span>
                    <span>{v.color}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold">{v.almacenamiento}</span>
                    <span className="text-[10px] text-gray-500">({formatEstadoProducto(v.estado)})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <datalist id="phone-colors-list">
            {COLOR_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          {detallesTelefono.length === 0 ? (
            <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
              No hay unidades físicas registradas para este modelo de teléfono. Haz clic en{" "}
              <button type="button" onClick={addPhoneUnit} className="text-blue-600 font-semibold underline">
                + Agregar unidad física
              </button>{" "}
              para registrar IMEI, color y almacenamiento.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {detallesTelefono.map((unit, idx) => {
                const isExpanded = expandedDiagIndex === idx;
                return (
                  <div
                    key={unit.ID_DET_TEL ? `id-${unit.ID_DET_TEL}` : `new-${idx}`}
                    className="bg-white border border-gray-200 rounded-lg p-3 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-gray-700">
                        Unidad #{idx + 1}{" "}
                        {unit.ID_DET_TEL ? (
                          <span className="text-[11px] font-mono text-gray-400 font-normal">
                            (ID #{unit.ID_DET_TEL})
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded ml-1">
                            Nueva
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setExpandedDiagIndex(isExpanded ? null : idx)}
                          className="text-[11px] text-blue-600 hover:bg-blue-50 px-2 py-1 rounded inline-flex items-center gap-1 font-medium"
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          Diagnóstico (Bat: {unit.EST_BAT_TEL ?? 10}/10)
                        </button>
                        <button
                          type="button"
                          title="Duplicar mismo color y almacenamiento para otra unidad"
                          onClick={() => duplicatePhoneUnit(idx)}
                          className="text-[11px] text-gray-600 hover:bg-gray-100 px-2 py-1 rounded inline-flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Duplicar
                        </button>
                        <button
                          type="button"
                          onClick={() => removePhoneUnit(idx)}
                          className="text-[11px] text-rose-600 hover:bg-rose-50 px-2 py-1 rounded inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                      <div>
                        <Label className="text-[11px] text-gray-600">Color *</Label>
                        <Input
                          list="phone-colors-list"
                          value={unit.COL_TEL || ""}
                          onChange={(e) => updatePhoneUnit(idx, { COL_TEL: e.target.value })}
                          placeholder="Ej. Azul, Negro..."
                          className="h-8 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-600">Almacenamiento *</Label>
                        <select
                          value={unit.ALM_TEL || "128GB"}
                          onChange={(e) => updatePhoneUnit(idx, { ALM_TEL: e.target.value })}
                          className="w-full h-8 border rounded px-2 text-xs bg-white"
                        >
                          {STORAGE_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-600">IMEI (único)</Label>
                        <Input
                          value={unit.IME_TEL || ""}
                          onChange={(e) => updatePhoneUnit(idx, { IME_TEL: e.target.value })}
                          placeholder="3548910..."
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-600">Estado Físico</Label>
                        <select
                          value={unit.EST_FIS_TEL || "NUEVO"}
                          onChange={(e) => updatePhoneUnit(idx, { EST_FIS_TEL: e.target.value as EstadoProducto })}
                          className="w-full h-8 border rounded px-2 text-xs bg-white"
                        >
                          <option value="NUEVO">Nuevo</option>
                          <option value="USADO_EXCELENTE">Usado - Excelente</option>
                          <option value="USADO_BUENO">Usado - Bueno</option>
                          <option value="USADO_REGULAR">Usado - Regular</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-[11px] text-gray-600">Disponibilidad</Label>
                        <select
                          value={unit.DIS_TEL || "DISPONIBLE"}
                          onChange={(e) => updatePhoneUnit(idx, { DIS_TEL: e.target.value as DisponibilidadTelefono })}
                          className="w-full h-8 border rounded px-2 text-xs bg-white font-medium"
                        >
                          <option value="DISPONIBLE">Disponible (En Stock)</option>
                          <option value="RESERVADO">Reservado</option>
                          <option value="VENDIDO">Vendido</option>
                          <option value="BAJA">De Baja</option>
                        </select>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-gray-100 bg-gray-50/70 rounded p-2.5 space-y-2">
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                          <div>
                            <Label className="text-[10px] text-gray-500">Origen</Label>
                            <select
                              value={unit.ORG_TEL || "COMPRA_NUEVA"}
                              onChange={(e) => updatePhoneUnit(idx, { ORG_TEL: e.target.value as OrigenProducto })}
                              className="w-full h-7 border rounded px-1.5 text-xs bg-white"
                            >
                              <option value="COMPRA_NUEVA">Compra Nueva</option>
                              <option value="PARTE_PAGO">Parte de Pago</option>
                              <option value="CONSIGNACION">Consignación</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Batería (1-10)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={unit.EST_BAT_TEL ?? 10}
                              onChange={(e) => updatePhoneUnit(idx, { EST_BAT_TEL: Number(e.target.value) })}
                              className="h-7 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Pantalla (1-10)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={unit.EST_PAN_TEL ?? 10}
                              onChange={(e) => updatePhoneUnit(idx, { EST_PAN_TEL: Number(e.target.value) })}
                              className="h-7 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Carcasa (1-10)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={unit.EST_CAR_TEL ?? 10}
                              onChange={(e) => updatePhoneUnit(idx, { EST_CAR_TEL: Number(e.target.value) })}
                              className="h-7 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Cámara (1-10)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={unit.EST_CAM_TEL ?? 10}
                              onChange={(e) => updatePhoneUnit(idx, { EST_CAM_TEL: Number(e.target.value) })}
                              className="h-7 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-gray-500">Software (1-10)</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={unit.EST_SOF_TEL ?? 10}
                              onChange={(e) => updatePhoneUnit(idx, { EST_SOF_TEL: Number(e.target.value) })}
                              className="h-7 text-xs bg-white"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-[10px] text-gray-500">Accesorios Incluidos / Observaciones de la unidad</Label>
                          <Input
                            value={unit.ACC_INC_TEL || ""}
                            onChange={(e) => updatePhoneUnit(idx, { ACC_INC_TEL: e.target.value })}
                            placeholder="Ej. Caja original, cable USB-C, cargador 20W..."
                            className="h-7 text-xs bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

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

          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 self-start">
            <button
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, imageMode: "url", imageFile: null, removeImage: false }));
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
            ? isEditing
              ? "Guardando cambios..."
              : "Creando producto..."
            : isEditing
            ? "Guardar cambios"
            : "Crear producto"}
        </Button>
      </div>
    </form>
  );
}
