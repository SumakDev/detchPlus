import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const EVA_PAR_PAG = sequelize.define("EVA_PAR_PAG", {
  ID_EVA_PAR: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  CED_CLI: { type: DataTypes.STRING(20), allowNull: false },
  FEC_EVA_PAR: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  VAL_EVA_PAR: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  OBS_EVA_PAR: DataTypes.TEXT,
  EST_EVA_PAR: { type: DataTypes.ENUM("PENDIENTE", "APROBADO", "RECHAZADO"), defaultValue: "PENDIENTE" },
  CED_EMP: { type: DataTypes.STRING(20), allowNull: false }
}, {
  tableName: "EVA_PAR_PAG",
  timestamps: false,
});

export default EVA_PAR_PAG;