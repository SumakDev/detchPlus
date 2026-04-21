import { CATEGORIAS, MARCAS, MODELOS, PRODUCTOS, STOCK, MOV_INV } from "./inventory/index.js";
import { ROLES, USUARIOS } from "./users/index.js";
import { CLIENTES, TECNICOS } from "./people/index.js";
import { SER_TEC } from "./services/index.js";

export function setupAssociations() {
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

  // Movimientos -> Producto (1:N)
  PRODUCTOS.hasMany(MOV_INV, { foreignKey: "ID_PRO", as: "movimientos" });
  MOV_INV.belongsTo(PRODUCTOS, { foreignKey: "ID_PRO", as: "producto" });

  // Servicio técnico: relaciones
  TECNICOS.hasMany(SER_TEC, { foreignKey: "ID_TEC", as: "servicios" });
  SER_TEC.belongsTo(TECNICOS, { foreignKey: "ID_TEC", as: "tecnico" });

  // SER_TEC -> CLIENTES por CED_CLI
  CLIENTES.hasMany(SER_TEC, { foreignKey: "CED_CLI", sourceKey: "CED_CLI", as: "servicios" });
  SER_TEC.belongsTo(CLIENTES, { foreignKey: "CED_CLI", targetKey: "CED_CLI", as: "cliente" });

  // Asociaciones ROLES <-> USUARIOS
  ROLES.hasMany(USUARIOS, { foreignKey: "ID_ROL", as: "usuarios" });
  USUARIOS.belongsTo(ROLES, { foreignKey: "ID_ROL", as: "rol" });
}
