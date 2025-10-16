import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PRODUCTOS = sequelize.define("PRODUCTOS", {
  ID_PRO: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  COD_BAR_PRO: { type: DataTypes.STRING(50), unique: true },
  IME_PRO: DataTypes.STRING(20),
  ID_CAT: { type: DataTypes.INTEGER, allowNull: false },
  ID_MAR: { type: DataTypes.INTEGER, allowNull: false },
  ID_MOD: DataTypes.STRING(20),
  DES_PRO: DataTypes.TEXT,
  ORG_PRO: { type: DataTypes.ENUM("COMPRA_NUEVA", "PARTE_PAGO", "CONSIGNACION"), allowNull: false },
  EST_PRO: { type: DataTypes.ENUM("NUEVO", "USADO_EXCELENTE", "USADO_BUENO", "USADO_REGULAR"), allowNull: false },
  FEC_ING_PRO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ID_PRV: DataTypes.INTEGER,
  ACT_PRO: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_MOD_PRO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "PRODUCTOS",
  timestamps: false,
});

export default PRODUCTOS;