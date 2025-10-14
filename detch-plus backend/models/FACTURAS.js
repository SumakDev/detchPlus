import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FACTURAS = sequelize.define("FACTURAS", {
  NUM_FAC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CED_CLI: { type: DataTypes.STRING(20), allowNull: false },
  CED_EMP: { type: DataTypes.STRING(20), allowNull: false },
  FEC_FAC: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  DIR_FAC: DataTypes.TEXT,
  SUB_FAC: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  IVA_FAC: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  TOT_FAC: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  EST_FAC: { type: DataTypes.ENUM("PENDIENTE", "PAGADA", "ANULADA"), defaultValue: "PENDIENTE" }
}, {
  tableName: "FACTURAS",
  timestamps: false,
});

export default FACTURAS;