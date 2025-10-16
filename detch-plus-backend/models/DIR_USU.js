import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DIR_USU = sequelize.define("DIR_USU", {
  ID_DIR_USU: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  TIP_DIR_USU: { type: DataTypes.ENUM("PRINCIPAL", "ENVIO", "FACTURACION"), defaultValue: "ENVIO" },
  NOM_CON_USU: { type: DataTypes.STRING(100), allowNull: false },
  TEL_CON_USU: DataTypes.STRING(15),
  DIR_LIN1_USU: { type: DataTypes.STRING(200), allowNull: false },
  DIR_LIN2_USU: DataTypes.STRING(200),
  CIU_USU: { type: DataTypes.STRING(100), allowNull: false },
  PROV_USU: { type: DataTypes.STRING(100), allowNull: false },
  COD_POS_USU: DataTypes.STRING(10),
  PAIS_USU: { type: DataTypes.STRING(50), defaultValue: "Ecuador" },
  REF_DIR_USU: DataTypes.TEXT,
  ES_PRE_DIR_USU: { type: DataTypes.BOOLEAN, defaultValue: false },
  ACT_DIR_USU: { type: DataTypes.BOOLEAN, defaultValue: true },
  FEC_CRE_DIR_USU: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "DIR_USU",
  timestamps: false,
});

export default DIR_USU;