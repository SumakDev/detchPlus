import type { DetalleTelefono, ResumenVarianteTelefono } from "./product";

// Datos crudos que llegan del backend (BD -> Front)
export type StockDb = {
  ID_PRO: number;                 // PK del producto
  CAN_DIS_STO: number;            // disponible
  CAN_RES_STO: number;            // reservado
  UBI_STO?: string | null;        // ubicación
  STO_MIN: number;                // mínimo operativo
  STO_MAX: number;                // máximo operativo
  FEC_ACT_STO: string;            // ISO fecha última actualización

  // Si el backend hace include del producto:
  producto?: {
    ID_PRO: number;
    ID_CAT?: number;
    COD_BAR_PRO?: string | null;
    DES_PRO?: string | null;
    IMG_URL?: string | null;
    ACT_PRO?: boolean;
    EST_PRO?: string;

    // Relaciones opcionales si haces include:
    marca?: { ID_MAR: number; NOM_MAR: string };
    modelo?: { ID_MOD: string; NOM_MOD: string };
    categoria?: { ID_CAT: number; NOM_CAT: string };
    detallesTelefono?: DetalleTelefono[];
    RESUMEN_VARIANTES?: ResumenVarianteTelefono[];
  };
};

// Filtros de UI
export type StockFilters = {
  q?: string;
  estado?: "todos" | "criticos" | "agotados" | "ok";
};

// Tipo que usa la UI (Front) ya mapeado y con nombres amigables
export type StockItem = {
  id: string;                     // ID_PRO como string
  disponible: number;             // CAN_DIS_STO
  reservado: number;              // CAN_RES_STO
  minimo: number;                 // STO_MIN
  maximo: number;                 // STO_MAX
  ubicacion?: string;             // UBI_STO
  fechaAct: string;               // FEC_ACT_STO (ISO)
  estado: "OK" | "CRITICO" | "AGOTADO"; // derivado de disponible vs mínimo

  // Datos del producto para mostrar
  producto?: {
    idCat?: number;
    codigo?: string | null;       // COD_BAR_PRO
    nombre: string;               // Marca + Modelo o descripción/código
    marca?: string;
    modelo?: string;
    categoria?: string;
    img?: string | null;          // URL absoluta o relativa
    descripcion?: string | null;
    activo?: boolean;
    estadoFisico?: string;
    detallesTelefono?: DetalleTelefono[];
    resumenVariantes?: ResumenVarianteTelefono[];
  };
};

// Utilidad: calcula el estado visual
export function computeEstado(disponible: number, minimo: number): "OK" | "CRITICO" | "AGOTADO" {
  if (disponible <= 0) return "AGOTADO";
  if (disponible <= minimo) return "CRITICO";
  return "OK";
}

// Utilidad: compone un nombre amigable a partir del include
export function computeNombre(p?: StockDb["producto"]): string {
  if (!p) return "Producto";
  const marca = p.marca?.NOM_MAR;
  const modelo = p.modelo?.NOM_MOD;
  if (marca || modelo) return [marca, modelo].filter(Boolean).join(" ");
  if (p.DES_PRO) return String(p.DES_PRO).split("\n")[0].slice(0, 60);
  return p.COD_BAR_PRO || `Producto ${p.ID_PRO}`;
}

// Mapeo BD -> UI
export function dbToUi(row: StockDb): StockItem {
  const disponible = Number(row.CAN_DIS_STO ?? 0);
  const reservado = Number(row.CAN_RES_STO ?? 0);
  const minimo = Number(row.STO_MIN ?? 0);
  const maximo = Number(row.STO_MAX ?? 0);

  const p = row.producto;
  return {
    id: String(row.ID_PRO),
    disponible,
    reservado,
    minimo,
    maximo,
    ubicacion: row.UBI_STO || undefined,
    fechaAct: row.FEC_ACT_STO,
    estado: computeEstado(disponible, minimo),
    producto: p
      ? {
          idCat: p.ID_CAT ?? p.categoria?.ID_CAT,
          codigo: p.COD_BAR_PRO || null,
          nombre: computeNombre(p),
          marca: p.marca?.NOM_MAR,
          modelo: p.modelo?.NOM_MOD,
          categoria: p.categoria?.NOM_CAT,
          img: p.IMG_URL || null,
          descripcion: p.DES_PRO || null,
          activo: p.ACT_PRO !== undefined ? p.ACT_PRO : true,
          estadoFisico: p.EST_PRO || undefined,
          detallesTelefono: p.detallesTelefono || [],
          resumenVariantes: p.RESUMEN_VARIANTES || [],
        }
      : undefined,
  };
}
