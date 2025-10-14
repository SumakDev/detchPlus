import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SES_USU = sequelize.define("SES_USU", {
  ID_SES_USU: { type: DataTypes.STRING(128), primaryKey: true },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  IP_SES_USU: DataTypes.STRING(45),
  UA_SES_USU: DataTypes.TEXT,
  FEC_INI_SES: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_ULG_SES: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  EXP_SES_USU: { type: DataTypes.DATE, allowNull: false },
  ACT_SES_USU: { type: DataTypes.BOOLEAN, defaultValue: true },
  DAT_SES_USU: DataTypes.JSON
}, {
  tableName: "SES_USU",
  timestamps: false,
});

export default SES_USU;