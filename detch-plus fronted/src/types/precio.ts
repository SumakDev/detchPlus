export type Precio = {
  ID_PRE: number;
  ID_PRO: number;
  TIP_PRE: "COMPRA" | "VENTA" | "PARTE_PAGO";
  VAL_PRE: number;
  producto?: {
    ID_PRO: number;
    ID_MAR?: number;
    ID_MOD?: number;
    IMG_URL?: string | null;
    marca?: { NOM_MAR?: string | null };
    modelo?: { NOM_MOD?: string | null };
  };
  // Decorado por backend para comodidad en UI (opcional)
  productoNombre?: string | null;
};