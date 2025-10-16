import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TECNICOS = sequelize.define("TECNICOS", {
  ID_TEC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_TEC: { type: DataTypes.STRING(100), allowNull: false },
  TEL_TEC: DataTypes.STRING(15),
  DIR_TEC: DataTypes.TEXT,
  ESP_TEC: DataTypes.STRING(100),
  EST_TEC: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CRE_TEC: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "TECNICOS",
  timestamps: false,
});

export default TECNICOS;