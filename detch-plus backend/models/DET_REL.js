import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_REL = sequelize.define("DET_REL", {
  ID_PRO: { type: DataTypes.INTEGER, primaryKey: true },
  TAM_REL: DataTypes.STRING(20),
  COL_REL: DataTypes.STRING(50),
  TIP_REL: { type: DataTypes.ENUM("SMART_WATCH", "FITNESS_BAND"), allowNull: false }
}, {
  tableName: "DET_REL",
  timestamps: false,
});

export default DET_REL;