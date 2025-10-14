import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PED_ONL = sequelize.define("PED_ONL", {
  ID_PED_ONL: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NUM_PED_ONL: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  ID_USU: { type: DataTypes.INTEGER, allowNull: false },
  ID_DIR_ENV_ONL: { type: DataTypes.INTEGER, allowNull: false },
  ID_DIR_FAC_ONL: DataTypes.INTEGER,
  SUB_PED_ONL: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  IMP_PED_ONL: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  COS_ENV_PED: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  DES_PED_ONL: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  TOT_PED_ONL: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  EST_PED_ONL: { type: DataTypes.ENUM("PENDIENTE", "CONFIRMADO", "PROCESANDO", "ENVIADO", "ENTREGADO", "CANCELADO"), defaultValue: "PENDIENTE" },
  MET_PAG_PED: { type: DataTypes.ENUM("EFECTIVO", "TRANSFERENCIA", "TARJ_CRED", "TARJ_DEB", "PAYPAL"), allowNull: false },
  EST_PAG_PED: { type: DataTypes.ENUM("PENDIENTE", "PAGADO", "FALLIDO", "REEMBOLSADO"), defaultValue: "PENDIENTE" },
  NOT_PED_ONL: DataTypes.TEXT,
  COD_SEG_PED: DataTypes.STRING(50),
  FEC_EST_ENT_PED: DataTypes.DATEONLY,
  FEC_ENT_PED: DataTypes.DATE,
  FEC_PED_ONL: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_ACT_PED_ONL: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: "PED_ONL",
  timestamps: false,
});

export default PED_ONL;