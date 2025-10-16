import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const STOCK = sequelize.define("STOCK", {
  ID_PRO: { type: DataTypes.INTEGER, primaryKey: true },
  CAN_DIS_STO: { type: DataTypes.INTEGER, defaultValue: 0 },
  CAN_RES_STO: { type: DataTypes.INTEGER, defaultValue: 0 },
  UBI_STO: DataTypes.STRING(100),
  STO_MIN: { type: DataTypes.INTEGER, defaultValue: 1 },
  STO_MAX: { type: DataTypes.INTEGER, defaultValue: 100 },
  FEC_ACT_STO: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "STOCK",
  timestamps: false,
});

export default STOCK;