import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CATEGORIAS = sequelize.define("CATEGORIAS", {
  ID_CAT: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NOM_CAT: { type: DataTypes.ENUM("TELEFONO", "RELOJ", "CONSOLA", "ESTUCHE", "ACCESORIO"), allowNull: false },
  DES_CAT: DataTypes.TEXT
}, {
  tableName: "CATEGORIAS",
  timestamps: false,
});

export default CATEGORIAS;