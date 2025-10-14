import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const PRECIOS = sequelize.define("PRECIOS", {
  ID_PRE: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
  TIP_PRE: { type: DataTypes.ENUM("COMPRA", "VENTA", "PARTE_PAGO"), allowNull: false },
  VAL_PRE: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  FEC_INI_PRE: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  FEC_FIN_PRE: DataTypes.DATE,
  ACT_PRE: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: "PRECIOS",
  timestamps: false,
});

export default PRECIOS;