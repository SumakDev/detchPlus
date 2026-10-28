import CATEGORIAS from "./CATEGORIAS.js";
import MARCAS from "./MARCAS.js";
import MODELOS from "./MODELOS.js";
import PROVEEDORES from "./PROVEEDORES.js";
import EMPLEADOS from "./EMPLEADOS.js";
import CLIENTES from "./CLIENTES.js";
import TECNICOS from "./TECNICOS.js";
import PRODUCTOS from "./PRODUCTOS.js";
import DET_TELE from "./DET_TELE.js";
import DET_REL from "./DET_REL.js";
import DET_CON from "./DET_CON.js";
import STOCK from "./STOCK.js";
import PRECIOS from "./PRECIOS.js";
import MOV_INV from "./MOV_INV.js";
import FACTURAS from "./FACTURAS.js";
import DET_FAC from "./DET_FAC.js";
import EVA_PAR_PAG from "./EVA_PAR_PAG.js";
import PAR_PAG_APL from "./PAR_PAG_APL.js";
import SER_TEC from "./SER_TEC.js";
import DET_SER from "./DET_SER.js";
import OBS from "./OBS.js";
import MOV_FIN from "./MOV_FIN.js";
import ROLES from "./ROLES.js";
import USUARIOS from "./USUARIOS.js";
import DIR_USU from "./DIR_USU.js";
import SES_USU from "./SES_USU.js";
import CAR_COM from "./CAR_COM.js";
import LIS_DES from "./LIS_DES.js";
import PED_ONL from "./PED_ONL.js";
import DET_PED_ONL from "./DET_PED_ONL.js";
import CUPONES from "./CUPONES.js";
import CUP_USO from "./CUP_USO.js";
import RES_PRO from "./RES_PRO.js";
import LOG_ACT_USU from "./LOG_ACT_USU.js";
import NOTIF from "./NOTIF.js";

// Producto -> catálogos y proveedores
PRODUCTOS.belongsTo(CATEGORIAS, { foreignKey: "ID_CAT", as: "categoria" });
CATEGORIAS.hasMany(PRODUCTOS, { foreignKey: "ID_CAT", as: "productos" });

PRODUCTOS.belongsTo(MARCAS, { foreignKey: "ID_MAR", as: "marca" });
MARCAS.hasMany(PRODUCTOS, { foreignKey: "ID_MAR", as: "productos" });

PRODUCTOS.belongsTo(MODELOS, { foreignKey: "ID_MOD", as: "modelo" });
MODELOS.hasMany(PRODUCTOS, { foreignKey: "ID_MOD", as: "productos" });

PRODUCTOS.belongsTo(PROVEEDORES, { foreignKey: "ID_PRV", as: "proveedor" });
PROVEEDORES.hasMany(PRODUCTOS, { foreignKey: "ID_PRV", as: "productos" });

// Catálogos: Marca -> Modelos
MARCAS.hasMany(MODELOS, { foreignKey: "ID_MAR", as: "modelos" });
MODELOS.belongsTo(MARCAS, { foreignKey: "ID_MAR", as: "marca" });

// Producto -> Stock (1:1)
PRODUCTOS.hasOne(STOCK, { foreignKey: "ID_PRO", as: "stock", onDelete: "CASCADE" });
STOCK.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Producto -> Detalles de Teléfono (1:N)
PRODUCTOS.hasMany(DET_TELE, { foreignKey: "ID_PRO", as: "detallesTelefono", onDelete: "CASCADE" });
DET_TELE.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Producto -> Detalle Reloj y Consola (1:1)
PRODUCTOS.hasOne(DET_REL, { foreignKey: "ID_PRO", as: "detalleReloj", onDelete: "CASCADE" });
DET_REL.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

PRODUCTOS.hasOne(DET_CON, { foreignKey: "ID_PRO", as: "detalleConsola", onDelete: "CASCADE" });
DET_CON.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Producto -> Precios (1:N)
PRODUCTOS.hasMany(PRECIOS, { foreignKey: "ID_PRO", as: "precios", onDelete: "CASCADE" });
PRECIOS.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Movimientos de Inventario -> Producto y Empleado (1:N)
PRODUCTOS.hasMany(MOV_INV, { foreignKey: "ID_PRO", as: "movimientos" });
MOV_INV.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
EMPLEADOS.hasMany(MOV_INV, { foreignKey: "CED_EMP", sourceKey: "CED_EMP", as: "movimientosInventario" });
MOV_INV.belongsTo(EMPLEADOS, { foreignKey: "CED_EMP", targetKey: "CED_EMP", as: "empleado" });

// Servicio técnico: relaciones
TECNICOS.hasMany(SER_TEC, { foreignKey: "ID_TEC", as: "servicios" });
SER_TEC.belongsTo(TECNICOS, { foreignKey: "ID_TEC", as: "tecnico" });

CLIENTES.hasMany(SER_TEC, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "servicios" });
SER_TEC.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });

SER_TEC.hasOne(DET_SER, { foreignKey: "NUM_SER", as: "detalle" });
DET_SER.belongsTo(SER_TEC, { foreignKey: "NUM_SER", as: "servicio" });

// Asociaciones ROLES <-> USUARIOS
ROLES.hasMany(USUARIOS, { foreignKey: "ID_ROL", as: "usuarios" });
USUARIOS.belongsTo(ROLES, { foreignKey: "ID_ROL", as: "rol" });

// Facturación y Ventas
FACTURAS.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });
CLIENTES.hasMany(FACTURAS, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "facturas" });

FACTURAS.belongsTo(EMPLEADOS, { foreignKey: "CED_EMP", targetKey: "CED_EMP", as: "empleado" });
EMPLEADOS.hasMany(FACTURAS, { foreignKey: "CED_EMP", sourceKey: "CED_EMP", as: "facturas" });

FACTURAS.hasMany(DET_FAC, { foreignKey: "NUM_FAC", as: "detalles", onDelete: "CASCADE" });
DET_FAC.belongsTo(FACTURAS, { foreignKey: "NUM_FAC", as: "factura" });

DET_FAC.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
PRODUCTOS.hasMany(DET_FAC, { foreignKey: "ID_PRO", as: "detallesFactura" });

// Parte de Pago / Trade-In (EVA_PAR_PAG y PAR_PAG_APL)
EVA_PAR_PAG.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });
CLIENTES.hasMany(EVA_PAR_PAG, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "evaluacionesPartePago" });

EVA_PAR_PAG.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
PRODUCTOS.hasMany(EVA_PAR_PAG, { foreignKey: "ID_PRO", as: "evaluacionesPartePago" });

EVA_PAR_PAG.belongsTo(EMPLEADOS, { foreignKey: "CED_EMP", targetKey: "CED_EMP", as: "empleado" });
EMPLEADOS.hasMany(EVA_PAR_PAG, { foreignKey: "CED_EMP", sourceKey: "CED_EMP", as: "evaluacionesPartePago" });

PAR_PAG_APL.belongsTo(FACTURAS, { foreignKey: "NUM_FAC", as: "factura" });
FACTURAS.hasMany(PAR_PAG_APL, { foreignKey: "NUM_FAC", as: "partesPagoAplicadas" });

PAR_PAG_APL.belongsTo(EVA_PAR_PAG, { foreignKey: "ID_EVA_PAR", as: "evaluacion" });
EVA_PAR_PAG.hasMany(PAR_PAG_APL, { foreignKey: "ID_EVA_PAR", as: "aplicaciones" });

// Movimientos Financieros (MOV_FIN) y Observaciones (OBS)
MOV_FIN.belongsTo(EMPLEADOS, { foreignKey: "CED_EMP", targetKey: "CED_EMP", as: "empleado" });
EMPLEADOS.hasMany(MOV_FIN, { foreignKey: "CED_EMP", sourceKey: "CED_EMP", as: "movimientosFinancieros" });

OBS.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });
CLIENTES.hasMany(OBS, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "observaciones" });

OBS.belongsTo(EMPLEADOS, { foreignKey: "CED_EMP", targetKey: "CED_EMP", as: "empleado" });
EMPLEADOS.hasMany(OBS, { foreignKey: "CED_EMP", sourceKey: "CED_EMP", as: "observaciones" });

// Pedidos Online (E-Commerce)
PED_ONL.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(PED_ONL, { foreignKey: "ID_USU", as: "pedidos" });

PED_ONL.belongsTo(DIR_USU, { foreignKey: "ID_DIR_ENV_ONL", as: "direccionEnvio" });
USUARIOS.hasMany(DIR_USU, { foreignKey: "ID_USU", as: "direcciones" });
DIR_USU.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });

PED_ONL.hasMany(DET_PED_ONL, { foreignKey: "ID_PED_ONL", as: "detalles", onDelete: "CASCADE" });
PED_ONL.hasMany(DET_PED_ONL, { foreignKey: "ID_PED_ONL", as: "items", onDelete: "CASCADE" });
DET_PED_ONL.belongsTo(PED_ONL, { foreignKey: "ID_PED_ONL", as: "pedido" });

DET_PED_ONL.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
PRODUCTOS.hasMany(DET_PED_ONL, { foreignKey: "ID_PRO", as: "detallesPedido" });

// Cupones y Uso de Cupones (CUPONES, CUP_USO)
CUPONES.hasMany(CUP_USO, { foreignKey: "ID_CUP", as: "usos" });
CUP_USO.belongsTo(CUPONES, { foreignKey: "ID_CUP", as: "cupon" });
CUP_USO.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
CUP_USO.belongsTo(PED_ONL, { foreignKey: "ID_PED_ONL", as: "pedido" });

// Reseñas de Productos (RES_PRO), Lista de Deseos (LIS_DES) y Carrito (CAR_COM)
RES_PRO.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
PRODUCTOS.hasMany(RES_PRO, { foreignKey: "ID_PRO", as: "resenas" });
RES_PRO.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(RES_PRO, { foreignKey: "ID_USU", as: "resenas" });

LIS_DES.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
PRODUCTOS.hasMany(LIS_DES, { foreignKey: "ID_PRO", as: "enListasDeseos" });
LIS_DES.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(LIS_DES, { foreignKey: "ID_USU", as: "listaDeseos" });

CAR_COM.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });
CAR_COM.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(CAR_COM, { foreignKey: "ID_USU", as: "carritoItems" });

// Sesiones (SES_USU), Bitácora de Actividad (LOG_ACT_USU) y Notificaciones (NOTIF)
SES_USU.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(SES_USU, { foreignKey: "ID_USU", as: "sesiones" });

LOG_ACT_USU.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(LOG_ACT_USU, { foreignKey: "ID_USU", as: "logsActividad" });

NOTIF.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });
USUARIOS.hasMany(NOTIF, { foreignKey: "ID_USU", as: "notificaciones" });

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
  NOTIF,
};
