import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_SER = sequelize.define("DET_SER", {
  ID_DET_SER: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NUM_SER: { type: DataTypes.INTEGER, allowNull: false },
  IME_TEL_SER: DataTypes.STRING(20),
  MAR_TEL_SER: DataTypes.STRING(50),
  MOD_TEL_SER: DataTypes.STRING(100),
  CAP_TEL_SER: DataTypes.STRING(20),
  DES_REP_TEL_SER: DataTypes.TEXT,
  DIR_SER: DataTypes.TEXT,
  PROB_REP_SER: DataTypes.TEXT,
  SOL_APL_SER: DataTypes.TEXT
}, {
  tableName: "DET_SER",
  timestamps: false,
});

export default DET_SER;