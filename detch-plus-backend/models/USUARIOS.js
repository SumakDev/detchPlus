import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const USUARIOS = sequelize.define("USUARIOS", {
  ID_USU: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  USR_USU: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  COR_USU: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  PAS_HAS_USU: { type: DataTypes.STRING(255), allowNull: false },
  ID_ROL: { type: DataTypes.INTEGER, allowNull: false },
  TIPO_PERSONA: { type: DataTypes.ENUM("CLIENTE", "EMPLEADO"), defaultValue: "CLIENTE" },
  ID_PERSONA: { type: DataTypes.STRING(20), defaultValue: "" },
  NOM_USU: { type: DataTypes.STRING(100), allowNull: false },
  APE_USU: { type: DataTypes.STRING(100), allowNull: false },
  TEL_USU: DataTypes.STRING(15),
  FEC_NAC_USU: DataTypes.DATEONLY,
  AVA_USU: DataTypes.STRING(255),
  EST_USU: { type: DataTypes.ENUM("ACTIVO", "INACTIVO", "BLOQUEADO", "PEND_VER"), defaultValue: "PEND_VER" },
  COR_VER_USU: { type: DataTypes.BOOLEAN, defaultValue: false },
  TOK_VER_USU: DataTypes.STRING(100),
  TOK_RES_USU: DataTypes.STRING(100),
  FEC_ULG_USU: DataTypes.DATE,
  IP_ULG_USU: DataTypes.STRING(45),
  INT_FAL_USU: { type: DataTypes.INTEGER, defaultValue: 0 },
  FEC_BLOQ_USU: DataTypes.DATE,
  ACE_TER_USU: { type: DataTypes.BOOLEAN, defaultValue: false },
  ACE_MAR_USU: { type: DataTypes.BOOLEAN, defaultValue: false },
  FEC_REG_USU: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_ACT_USU: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "USUARIOS",
  timestamps: false,
});

export default USUARIOS;