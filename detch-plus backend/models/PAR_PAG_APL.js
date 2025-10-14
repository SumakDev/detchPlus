import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PAR_PAG_APL = sequelize.define("PAR_PAG_APL", {
  ID_PAR_PAG: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NUM_FAC: { type: DataTypes.INTEGER, allowNull: false },
  ID_EVA_PAR: { type: DataTypes.INTEGER, allowNull: false },
  VAL_APL_PAR: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  FEC_APL_PAR: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "PAR_PAG_APL",
  timestamps: false,
});

export default PAR_PAG_APL;