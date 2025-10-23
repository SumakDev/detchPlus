export type StockItem = {
  ID_PRO: string;          // id del producto
  SKU?: string;
  NOM_PRO: string;         // nombre del producto
  STOCK: number;           // stock actual
  MIN_STOCK: number;       // stock mínimo
  UBICACION?: string;      // opcional
  ACTIVO?: boolean;        // opcional
  FEC_ACT?: string;        // ISO
};

export type StockFilters = {
  q?: string;
  estado?: "todos" | "criticos" | "agotados" | "ok";
}; 