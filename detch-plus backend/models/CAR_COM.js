import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CAR_COM = sequelize.define("CAR_COM", {
  ID_CAR_COM: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  CAN_CAR_COM: { type: DataTypes.INTEGER, defaultValue: 1 },
  PRE_UNI_CAR: { type: DataTypes.DECIMAL(10,2) },
  FEC_AGR_CAR: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_ACT_CAR: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "CAR_COM",
  timestamps: false,
});

export default CAR_COM;