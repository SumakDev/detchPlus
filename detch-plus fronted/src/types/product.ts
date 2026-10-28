// Enums según tu BD
export type OrigenProducto = "COMPRA_NUEVA" | "PARTE_PAGO" | "CONSIGNACION";
export type EstadoProducto = "NUEVO" | "USADO_EXCELENTE" | "USADO_BUENO" | "USADO_REGULAR";

export function formatEstadoProducto(estado?: string | null): string {
  switch (estado) {
    case "NUEVO":
      return "Nuevo";
    case "USADO_EXCELENTE":
      return "Usado - Excelente";
    case "USADO_BUENO":
      return "Usado - Bueno";
    case "USADO_REGULAR":
      return "Usado - Regular";
    default:
      return estado || "";
  }
}

// Relaciones (cuando el backend hace include)
export type CategoriaRef = { ID_CAT: number; NOM_CAT: string; DES_CAT?: string };
export type MarcaRef = { ID_MAR: number; NOM_MAR: string; DES_MAR?: string };
export type ModeloRef = { ID_MOD: string; NOM_MOD: string; ID_MAR: number };

// Objeto que consume la UI
export type Producto = {
  ID_PRO: string;
  COD_BAR_PRO?: string | null;
  IME_PRO?: string | null;

  ID_CAT: number;
  ID_MAR: number;
  ID_MOD?: string | null;

  DES_PRO?: string | null;
  ORG_PRO: OrigenProducto;
  EST_PRO: EstadoProducto;

  FEC_ING_PRO: string;  // ISO
  ID_PRV?: number | null;
  ACT_PRO: boolean;
  FEC_MOD_PRO: string;  // ISO

  IMG_URL?: string | null;

  // Derivados/relaciones
  NOMBRE: string;
  PRECIO_VENTA?: number;
  STOCK_DISPONIBLE?: number;
  categoria?: CategoriaRef;
  marca?: MarcaRef;
  modelo?: ModeloRef;
  precios?: Array<{ TIP_PRE: string; VAL_PRE: number }>;
  stock?: { CAN_DIS_STO: number; CAN_RES_STO: number; STO_MIN: number; STO_MAX: number };
};

// Datos del formulario (antes de convertir a FormData)
export type ProductoFormData = {
  COD_BAR_PRO?: string;
  IME_PRO?: string;

  ID_CAT: number;
  ID_MAR: number;
  ID_MOD?: string;

  DES_PRO?: string;
  ORG_PRO: OrigenProducto;
  EST_PRO: EstadoProducto;

  PRECIO_VENTA?: number | string;
  ACT_PRO: boolean;

  imageFile?: File | null;
  IMG_URL?: string;
  removeImage?: boolean;
};