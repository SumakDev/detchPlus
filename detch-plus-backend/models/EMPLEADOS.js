import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EMPLEADOS = sequelize.define("EMPLEADOS", {
  CED_EMP: { type: DataTypes.STRING(20), primaryKey: true },
  NOM_EMP: { type: DataTypes.STRING(100), allowNull: false },
  APE_EMP: { type: DataTypes.STRING(100), allowNull: false },
  NUM_EMP: DataTypes.STRING(15),
  DIR_EMP: DataTypes.TEXT,
  OBS_EMP: DataTypes.TEXT,
  COM_EMP: { type: DataTypes.DECIMAL(5,2), defaultValue: 0.00 },
  ACT_EMP: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CON_EMP: DataTypes.DATEONLY,
  FEC_CRE_EMP: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "EMPLEADOS",
  timestamps: false,
});

export default EMPLEADOS;