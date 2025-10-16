import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const NOTIF = sequelize.define("NOTIF", {
  ID_NOTIF: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  TIT_NOTIF: { type: DataTypes.STRING(200), allowNull: false },
  MEN_NOTIF: { type: DataTypes.TEXT, allowNull: false },
  TIP_NOTIF: { type: DataTypes.ENUM("INFO", "SUCCESS", "WARNING", "ERROR", "PROMOCION"), defaultValue: "INFO" },
  LEI_NOTIF: { type: DataTypes.BOOLEAN, defaultValue: false },
  URL_ACC_NOTIF: DataTypes.STRING(255),
  FEC_CRE_NOTIF: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_LEI_NOTIF: DataTypes.DATE
}, {
  tableName: "NOTIF",
  timestamps: false,
});

export default NOTIF;