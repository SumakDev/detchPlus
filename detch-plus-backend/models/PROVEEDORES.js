import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PROVEEDORES = sequelize.define("PROVEEDORES", {
  ID_PRV: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_PRV: { type: DataTypes.STRING(150), allowNull: false },
  RUC_PRV: { type: DataTypes.STRING(20), unique: true },
  TEL_PRV: DataTypes.STRING(15),
  COR_PRV: DataTypes.STRING(100),
  DIR_PRV: DataTypes.TEXT,
  CON_PRI_PRV: DataTypes.STRING(100),
  EST_PRV: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CRE_PRV: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "PROVEEDORES",
  timestamps: false,
});

export default PROVEEDORES;