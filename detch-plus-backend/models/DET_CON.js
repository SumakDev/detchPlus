import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_CON = sequelize.define("DET_CON", {
  ID_PRO: { type: DataTypes.INTEGER, primaryKey: true },
  CAP_CON: DataTypes.STRING(20),
  NUM_CON: { type: DataTypes.INTEGER, defaultValue: 1 },
  EST_CON: DataTypes.STRING(100),
  VER_CON: DataTypes.STRING(50)
}, {
  tableName: "DET_CON",
  timestamps: false,
});

export default DET_CON;