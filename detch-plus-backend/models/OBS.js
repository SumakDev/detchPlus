import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const OBS = sequelize.define("OBS", {
  ID_OBS: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TIP_OBS: { type: DataTypes.ENUM("CLIENTE", "PRODUCTO", "SERVICIO", "GENERAL"), allowNull: false },
  DES_OBS: { type: DataTypes.TEXT, allowNull: false },
  FEC_OBS: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  CED_CLI: DataTypes.STRING(20),
  CED_EMP: { type: DataTypes.STRING(20), allowNull: false },
  NUM_REF_OBS: DataTypes.STRING(50)
}, {
  tableName: "OBS",
  timestamps: false,
});

export default OBS;