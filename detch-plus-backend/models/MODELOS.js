import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MODELOS = sequelize.define("MODELOS", {
  ID_MOD: { type: DataTypes.STRING(20), primaryKey: true },
  NOM_MOD: { type: DataTypes.STRING(50), allowNull: false },
  FEC_MOD: { type: DataTypes.DATEONLY, allowNull: false },
  ID_MAR: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: "MODELOS",
  timestamps: false,
});

export default MODELOS;