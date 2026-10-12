import sequelize from "../config/database.js";
import { STOCK, MOV_INV } from "../models/index.js";

async function run() {
  try {
    console.log("Dropping conflicting trigger tr_act_sto_ven (prevents double stock deduction)...");
    await sequelize.query("DROP TRIGGER IF EXISTS tr_act_sto_ven;");
    console.log("Trigger tr_act_sto_ven dropped successfully!");

    // Restaurar stock de Producto 5 (PS5) a 2 unidades originales
    const p5 = await STOCK.findByPk(5);
    if (p5) {
      await p5.update({
        CAN_DIS_STO: 2,
        CAN_RES_STO: 0,
        FEC_ACT_STO: new Date(),
      });
      console.log("Stock Producto 5 restablecido a 2 unidades disponibles.");
    }

    // Verificar stocks actuales
    const all = await STOCK.findAll();
    console.log("Estado actual de inventario:");
    all.forEach(s => console.log(`Prod ${s.ID_PRO}: Disp = ${s.CAN_DIS_STO}, Res = ${s.CAN_RES_STO}`));

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
