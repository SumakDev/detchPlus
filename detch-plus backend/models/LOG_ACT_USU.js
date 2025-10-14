import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LOG_ACT_USU = sequelize.define("LOG_ACT_USU", {
  ID_LOG_ACT_USU: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_USU: DataTypes.INTEGER,
  ACC_LOG_ACT_USU: { type: DataTypes.STRING(100), allowNull: false },
  DES_LOG_ACT_USU: DataTypes.TEXT,
  IP_LOG_ACT_USU: DataTypes.STRING(45),
  UA_LOG_ACT_USU: DataTypes.TEXT,
  DAT_ADI_LOG_ACT_USU: DataTypes.JSON,
  FEC_LOG_ACT_USU: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "LOG_ACT_USU",
  timestamps: false,
});

export default LOG_ACT_USU;