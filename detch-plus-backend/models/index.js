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


// Producto -> catálogos
PRODUCTOS.belongsTo(CATEGORIAS, { foreignKey: "ID_CAT", as: "categoria" });
PRODUCTOS.belongsTo(MARCAS, { foreignKey: "ID_MAR", as: "marca" });
PRODUCTOS.belongsTo(MODELOS, { foreignKey: "ID_MOD", as: "modelo" });

// Catálogos
MARCAS.hasMany(MODELOS, { foreignKey: "ID_MAR", as: "modelos" });
MODELOS.belongsTo(MARCAS, { foreignKey: "ID_MAR", as: "marca" });


// Producto -> Stock (1:1)
PRODUCTOS.hasOne(STOCK, { foreignKey: "ID_PRO", as: "stock", onDelete: "CASCADE" });
STOCK.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Producto -> Proveedor (N:1)
PROVEEDORES.hasMany(PRODUCTOS, { foreignKey: "ID_PRV", as: "productos" });
PRODUCTOS.belongsTo(PROVEEDORES, { foreignKey: "ID_PRV", as: "proveedor" });

// Movimientos -> Producto (1:N)
PRODUCTOS.hasMany(MOV_INV, { foreignKey: "ID_PRO", as: "movimientos" });
MOV_INV.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Servicio técnico: relaciones
TECNICOS.hasMany(SER_TEC, { foreignKey: "ID_TEC", as: "servicios" });
SER_TEC.belongsTo(TECNICOS, { foreignKey: "ID_TEC", as: "tecnico" });
SER_TEC.hasOne(DET_SER, { foreignKey: "NUM_SER", as: "detalle", onDelete: "CASCADE" });
DET_SER.belongsTo(SER_TEC, { foreignKey: "NUM_SER", as: "servicio" });

// SER_TEC -> CLIENTES por CED_CLI (targetKey en CLIENTES.CED_CLI)
CLIENTES.hasMany(SER_TEC, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "servicios" });
SER_TEC.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });

// Asociaciones ROLES <-> USUARIOS
ROLES.hasMany(USUARIOS, { foreignKey: "ID_ROL", as: "usuarios" });
USUARIOS.belongsTo(ROLES, { foreignKey: "ID_ROL", as: "rol" });

// Un usuario tiene muchas sesiones
USUARIOS.hasMany(SES_USU, { foreignKey: "ID_USU", as: "sesiones" });
// Cada sesión pertenece a un usuario
SES_USU.belongsTo(USUARIOS, { foreignKey: "ID_USU", as: "usuario" });

// Asociación PRODUCTOS (1) — (N) PRECIOS
PRODUCTOS.hasMany(PRECIOS, { foreignKey: "ID_PRO", as: "precios" });
PRECIOS.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Relación 1:1 Producto ↔ Teléfono
PRODUCTOS.hasOne(DET_TELE, { foreignKey: "ID_PRO", as: "telefono", onDelete: "CASCADE" });
DET_TELE.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

// Asociación USUARIOS <-> EMPLEADOS / CLIENTES
USUARIOS.belongsTo(EMPLEADOS, {foreignKey: "ID_PERSONA",constraints: false, as: "empleado"});
USUARIOS.belongsTo(CLIENTES, {foreignKey: "ID_PERSONA",constraints: false, as: "cliente"});

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