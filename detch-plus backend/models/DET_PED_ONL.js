import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_PED_ONL = sequelize.define("DET_PED_ONL", {
  ID_DET_PED_ONL: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_PED_ONL: { type: DataTypes.INTEGER, allowNull: false },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  CAN_PED_ONL: { type: DataTypes.INTEGER, allowNull: false },
  PRE_UNI_PED_ONL: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  PRE_TOT_PED_ONL: { type: DataTypes.DECIMAL(10,2), allowNull: false }
}, {
  tableName: "DET_PED_ONL",
  timestamps: false,
});

export default DET_PED_ONL;