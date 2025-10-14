import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MARCAS = sequelize.define("MARCAS", {
  ID_MAR: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_MAR: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  DES_MAR: DataTypes.TEXT
}, {
  tableName: "MARCAS",
  timestamps: false,
});

export default MARCAS;