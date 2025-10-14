import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MOV_INV = sequelize.define("MOV_INV", {
  ID_MOV: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  TIP_MOV: { type: DataTypes.ENUM("ENTRADA", "SALIDA", "AJUSTE"), allowNull: false },
  CAN_MOV: { type: DataTypes.INTEGER, allowNull: false },
  FEC_MOV: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  MOT_MOV: DataTypes.STRING(200),
  NUM_DOC_MOV: DataTypes.STRING(50),
  CED_EMP: DataTypes.STRING(20)
}, {
  tableName: "MOV_INV",
  timestamps: false,
});

export default MOV_INV;