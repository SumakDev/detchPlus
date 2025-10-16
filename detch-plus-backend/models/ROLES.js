import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ROLES = sequelize.define("ROLES", {
  ID_ROL: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_ROL: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  DES_ROL: DataTypes.TEXT,
  PER_ROL: DataTypes.JSON,
  ACT_ROL: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CRE_ROL: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "ROLES",
  timestamps: false,
});

export default ROLES;