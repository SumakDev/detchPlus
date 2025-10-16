import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CUP_USO = sequelize.define("CUP_USO", {
  ID_CUP_USO: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_CUP: { type: DataTypes.INTEGER, allowNull: false },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  ID_PED_ONL: { type: DataTypes.INTEGER, allowNull: false },
  MON_DES_CUP_USO: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  FEC_USO_CUP: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "CUP_USO",
  timestamps: false,
});

export default CUP_USO;