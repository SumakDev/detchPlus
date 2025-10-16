import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_FAC = sequelize.define("DET_FAC", {
  ID_DET_FAC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  NUM_FAC: { type: DataTypes.INTEGER, allowNull: false },           // FK -> FACTURAS(NUM_FAC)
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },            // FK -> PRODUCTOS(ID_PRO)
  CAN_PRO: { type: DataTypes.INTEGER, allowNull: false },
  PRE_UNI_FAC: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  PRE_TOT_FAC: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: "DET_FAC",
  timestamps: false,
});

export default DET_FAC;