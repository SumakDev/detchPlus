import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const DET_TELE = sequelize.define(
  "DET_TELE",
  {
    ID_DET_TEL: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ID_PRO: { type: DataTypes.INTEGER, allowNull: false },
    IME_TEL: { type: DataTypes.STRING(20), unique: true, allowNull: true },
    COL_TEL: { type: DataTypes.STRING(50), allowNull: true },
    ALM_TEL: { type: DataTypes.STRING(20), allowNull: true },
    EST_FIS_TEL: {
      type: DataTypes.ENUM("NUEVO", "USADO_EXCELENTE", "USADO_BUENO", "USADO_REGULAR"),
      allowNull: false,
      defaultValue: "NUEVO",
    },
    ORG_TEL: {
      type: DataTypes.ENUM("COMPRA_NUEVA", "PARTE_PAGO", "CONSIGNACION"),
      allowNull: false,
      defaultValue: "COMPRA_NUEVA",
    },
    EST_BAT_TEL: { type: DataTypes.INTEGER, defaultValue: 10 },
    EST_PAN_TEL: { type: DataTypes.INTEGER, defaultValue: 10 },
    EST_CAR_TEL: { type: DataTypes.INTEGER, defaultValue: 10 },
    EST_CAM_TEL: { type: DataTypes.INTEGER, defaultValue: 10 },
    EST_SOF_TEL: { type: DataTypes.INTEGER, defaultValue: 10 },
    ACC_INC_TEL: { type: DataTypes.TEXT, allowNull: true },
    DIS_TEL: {
      type: DataTypes.ENUM("DISPONIBLE", "RESERVADO", "VENDIDO", "BAJA"),
      allowNull: false,
      defaultValue: "DISPONIBLE",
    },
    FEC_ING_TEL: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "DET_TELE",
    timestamps: false,
  }
);

export default DET_TELE;
