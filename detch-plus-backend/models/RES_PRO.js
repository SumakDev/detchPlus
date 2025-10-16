import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const RES_PRO = sequelize.define("RES_PRO", {
  ID_RES_PRO: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  CAL_RES_PRO: { type: DataTypes.INTEGER, allowNull: false },
  TIT_RES_PRO: DataTypes.STRING(200),
  COM_RES_PRO: DataTypes.TEXT,
  VER_RES_PRO: { type: DataTypes.BOOLEAN, defaultValue: false },
  UTI_POS_RES_PRO: { type: DataTypes.INTEGER, defaultValue: 0 },
  UTI_NEG_RES_PRO: { type: DataTypes.INTEGER, defaultValue: 0 },
  EST_RES_PRO: { type: DataTypes.ENUM("PENDIENTE", "APROBADA", "RECHAZADA"), defaultValue: "PENDIENTE" },
  FEC_RES_PRO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "RES_PRO",
  timestamps: false,
});

export default RES_PRO;