import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CLIENTES = sequelize.define("CLIENTES", {
  CED_CLI: { type: DataTypes.STRING(20), primaryKey: true },
  NOM_CLI: { type: DataTypes.STRING(100), allowNull: false },
  APE_CLI: { type: DataTypes.STRING(100), allowNull: false },
  DIR_CLI: DataTypes.TEXT,
  COR_CLI: DataTypes.STRING(100),
  NUM_CLI: DataTypes.STRING(15),
  DIF_CLI: { type: DataTypes.ENUM("BAJA", "MEDIA", "ALTA"), defaultValue: "BAJA" },
  ACT_CLI: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_REG_CLI: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "CLIENTES",
  timestamps: false,
});

export default CLIENTES;