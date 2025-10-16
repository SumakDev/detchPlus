import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SER_TEC = sequelize.define("SER_TEC", {
  NUM_SER: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_TEC: { type: DataTypes.INTEGER, allowNull: false },
  CED_CLI: { type: DataTypes.STRING(20), allowNull: false },
  FEC_SER: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  PRE_SER: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  PRE_VEN_SER: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  IVA_SER: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  EST_SER: { type: DataTypes.ENUM("RECIBIDO", "EN_PROCESO", "TERMINADO", "ENTREGADO"), defaultValue: "RECIBIDO" }
}, {
  tableName: "SER_TEC",
  timestamps: false,
});

export default SER_TEC;