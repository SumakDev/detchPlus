import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LIS_DES = sequelize.define("LIS_DES", {
  ID_LIS_DES: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  FEC_AGR_LIS_DES: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "LIS_DES",
  timestamps: false,
});

export default LIS_DES;