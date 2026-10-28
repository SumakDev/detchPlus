// Enums según tu BD
export type OrigenProducto = "COMPRA_NUEVA" | "PARTE_PAGO" | "CONSIGNACION";
export type EstadoProducto = "NUEVO" | "USADO_EXCELENTE" | "USADO_BUENO" | "USADO_REGULAR";
export type DisponibilidadTelefono = "DISPONIBLE" | "RESERVADO" | "VENDIDO" | "BAJA";
export type TipoReloj = "SMART_WATCH" | "FITNESS_BAND";

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

export function formatOrigenProducto(origen?: string | null): string {
  switch (origen) {
    case "COMPRA_NUEVA":
      return "Compra Nueva";
    case "PARTE_PAGO":
      return "Parte de Pago";
    case "CONSIGNACION":
      return "Consignación";
    default:
      return origen || "";
  }
}

// Unidad física individual en DET_TELE (1 Producto -> N Unidades de Teléfono)
export type DetalleTelefono = {
  ID_DET_TEL?: number;
  ID_PRO?: number;
  IME_TEL?: string | null;
  COL_TEL?: string | null;
  ALM_TEL?: string | null;
  EST_FIS_TEL: EstadoProducto;
  ORG_TEL: OrigenProducto;
  EST_BAT_TEL?: number;
  EST_PAN_TEL?: number;
  EST_CAR_TEL?: number;
  EST_CAM_TEL?: number;
  EST_SOF_TEL?: number;
  ACC_INC_TEL?: string | null;
  DIS_TEL?: DisponibilidadTelefono;
  FEC_ING_TEL?: string;
};

// Ficha Técnica de Reloj (1:1 en DET_REL)
export type DetalleReloj = {
  ID_PRO?: number;
  TAM_REL?: string | null;
  COL_REL?: string | null;
  TIP_REL?: "SMART_WATCH" | "FITNESS_BAND";
};

// Ficha Técnica de Consola (1:1 en DET_CON)
export type DetalleConsola = {
  ID_PRO?: number;
  CAP_CON?: string | null;
  NUM_CON?: number;
  EST_CON?: string | null;
  VER_CON?: string | null;
};

// Proveedor (PROVEEDORES)
export type Proveedor = {
  ID_PRV: number;
  NOM_PRV: string;
  RUC_PRV?: string | null;
  TEL_PRV?: string | null;
  COR_PRV?: string | null;
  DIR_PRV?: string | null;
  CON_PRI_PRV?: string | null;
  EST_PRV?: boolean;
};

// Conteo agrupado por Color + Almacenamiento + Estado Físico
export type ResumenVarianteTelefono = {
  color: string;
  almacenamiento: string;
  estadoFisico: EstadoProducto;
  disponibles: number;
  reservados: number;
  vendidos: number;
  baja: number;
  total: number;
};

// Relaciones (cuando el backend hace include)
export type CategoriaRef = { ID_CAT: number; NOM_CAT: string; DES_CAT?: string };
export type MarcaRef = { ID_MAR: number; NOM_MAR: string; DES_MAR?: string };
export type ModeloRef = { ID_MOD: string; NOM_MOD: string; ID_MAR: number };

// Objeto que consume la UI
export type Producto = {
  ID_PRO: string;
  COD_BAR_PRO?: string | null;

  ID_CAT: number;
  ID_MAR: number;
  ID_MOD?: string | null;

  DES_PRO?: string | null;
  ORG_PRO: OrigenProducto;
  EST_PRO: EstadoProducto;

  FEC_ING_PRO: string; // ISO
  ID_PRV?: number | null;
  ACT_PRO: boolean;
  FEC_MOD_PRO: string; // ISO

  IMG_URL?: string | null;

  // Derivados/relaciones
  NOMBRE: string;
  PRECIO_VENTA?: number;
  STOCK_DISPONIBLE?: number;
  categoria?: CategoriaRef;
  marca?: MarcaRef;
  modelo?: ModeloRef;
  proveedor?: Proveedor | null;
  precios?: Array<{ TIP_PRE: string; VAL_PRE: number }>;
  stock?: { CAN_DIS_STO: number; CAN_RES_STO: number; STO_MIN: number; STO_MAX: number };
  detallesTelefono?: DetalleTelefono[];
  detalleReloj?: DetalleReloj | null;
  detalleConsola?: DetalleConsola | null;
  RESUMEN_VARIANTES?: ResumenVarianteTelefono[];
};

export type Product = Producto;

// Datos del formulario (antes de convertir a FormData)
export type ProductoFormData = {
  COD_BAR_PRO?: string;

  ID_CAT: number;
  ID_MAR: number;
  ID_MOD?: string;
  ID_PRV?: number | null;

  DES_PRO?: string;
  ORG_PRO: OrigenProducto;
  EST_PRO: EstadoProducto;

  PRECIO_VENTA?: number | string;
  ACT_PRO: boolean;

  imageFile?: File | null;
  IMG_URL?: string;
  removeImage?: boolean;
  detallesTelefono?: DetalleTelefono[];
  DETALLE_RELOJ?: DetalleReloj | null;
  DETALLE_CONSOLA?: DetalleConsola | null;
};

export type ProductInput = ProductoFormData;
