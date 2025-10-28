export type Precio = {
  ID_PRE: number;
  ID_PRO: number;
  TIP_PRE: "COMPRA" | "VENTA" | "PARTE_PAGO";
  VAL_PRE: number;
};