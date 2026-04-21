import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const CLIENTES = sequelize.define(
  "CLIENTES",
  {
    CED_CLI: { type: DataTypes.STRING(20), primaryKey: true, allowNull: false },
    NOM_CLI: { type: DataTypes.STRING(100), allowNull: false },
    APE_CLI: { type: DataTypes.STRING(100), allowNull: false },
    DIR_CLI: { type: DataTypes.TEXT, allowNull: true },
    COR_CLI: { type: DataTypes.STRING(100), allowNull: true },
    NUM_CLI: { type: DataTypes.STRING(20), allowNull: true },
    DIF_CLI: { type: DataTypes.ENUM("BAJA", "MEDIA", "ALTA"), allowNull: false, defaultValue: "BAJA" },
    ACT_CLI: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    FEC_REG_CLI: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }, 
  },
  { tableName: "CLIENTES", timestamps: false }
);

export default CLIENTES;