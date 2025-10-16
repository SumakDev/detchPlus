import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_TELE = sequelize.define("DET_TELE", {
  ID_PRO: { type: DataTypes.INTEGER, primaryKey: true },
  COL_TEL: DataTypes.STRING(50),
  ALM_TEL: DataTypes.STRING(20),
  EST_BAT_TEL: { type: DataTypes.INTEGER },
  EST_PAN_TEL: { type: DataTypes.INTEGER },
  EST_CAR_TEL: { type: DataTypes.INTEGER },
  EST_CAM_TEL: { type: DataTypes.INTEGER },
  EST_SOF_TEL: { type: DataTypes.INTEGER },
  ACC_INC_TEL: DataTypes.TEXT
}, {
  tableName: "DET_TELE",
  timestamps: false,
});

export default DET_TELE;