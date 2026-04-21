import { setupAssociations } from "./associations.js";
import { CATEGORIAS, MARCAS, MODELOS, PRODUCTOS, STOCK, MOV_INV, PRECIOS, RES_PRO } from "./inventory/index.js";
import { ROLES, USUARIOS, DIR_USU, SES_USU, LOG_ACT_USU, NOTIF } from "./users/index.js";
import { CLIENTES, EMPLEADOS, PROVEEDORES, TECNICOS } from "./people/index.js";
import { SER_TEC, DET_SER, OBS, DET_TELE, DET_REL, DET_CON } from "./services/index.js";
import { PED_ONL, DET_PED_ONL, FACTURAS, DET_FAC, CAR_COM, LIS_DES } from "./orders/index.js";
import { MOV_FIN, EVA_PAR_PAG, PAR_PAG_APL, CUPONES, CUP_USO } from "./finance/index.js";

setupAssociations();

export {
  CATEGORIAS,
  MARCAS,
  MODELOS,
  PROVEEDORES,
  EMPLEADOS,
  CLIENTES,
  TECNICOS,
  PRODUCTOS,
  DET_TELE,
  DET_REL,
  DET_CON,
  STOCK,
  PRECIOS,
  MOV_INV,
  FACTURAS,
  DET_FAC,
  EVA_PAR_PAG,
  PAR_PAG_APL,
  SER_TEC,
  DET_SER,
  OBS,
  MOV_FIN,
  ROLES,
  USUARIOS,
  DIR_USU,
  SES_USU,
  CAR_COM,
  LIS_DES,
  PED_ONL,
  DET_PED_ONL,
  CUPONES,
  CUP_USO,
  RES_PRO,
  LOG_ACT_USU,
  NOTIF
};