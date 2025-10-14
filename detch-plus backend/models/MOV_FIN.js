import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MOV_FIN = sequelize.define("MOV_FIN", {
  ID_MOV_FIN: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TIP_MOV_FIN: { type: DataTypes.ENUM("INGRESO", "EGRESO", "POR_COBRAR", "POR_PAGAR"), allowNull: false },
  MON_MOV_FIN: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  FEC_MOV_FIN: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  REF_MOV_FIN: DataTypes.STRING(100),
  DES_MOV_FIN: DataTypes.TEXT,
  CED_EMP: DataTypes.STRING(20),
  CAT_MOV_FIN: DataTypes.STRING(50)
}, {
  tableName: "MOV_FIN",
  timestamps: false,
});

export default MOV_FIN;