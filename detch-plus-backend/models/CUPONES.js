import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CUPONES = sequelize.define("CUPONES", {
  ID_CUP: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  COD_CUP: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  NOM_CUP: { type: DataTypes.STRING(100), allowNull: false },
  DES_CUP: DataTypes.TEXT,
  TIP_DES_CUP: { type: DataTypes.ENUM("PORCENTAJE", "MONTO_FIJO"), allowNull: false },
  VAL_DES_CUP: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  MON_MIN_CUP: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  FEC_INI_CUP: { type: DataTypes.DATE, allowNull: false },
  FEC_FIN_CUP: { type: DataTypes.DATE, allowNull: false },
  LIM_USO_CUP: DataTypes.INTEGER,
  USO_ACT_CUP: { type: DataTypes.INTEGER, defaultValue: 0 },
  ACT_CUP: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CRE_CUP: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "CUPONES",
  timestamps: false,
});

export default CUPONES;