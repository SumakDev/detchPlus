import { PED_ONL, DET_PED_ONL, FACTURAS, STOCK, MOV_INV } from "../models/index.js";

async function run() {
  try {
    console.log("Iniciando reconciliación de pedidos cancelados...");

    // Buscar pedidos cancelados
    const cancelledOrders = await PED_ONL.findAll({
      where: { EST_PED_ONL: "CANCELADO" },
      include: [{ model: DET_PED_ONL, as: "items" }],
    });

    console.log(`Se encontraron ${cancelledOrders.length} pedidos cancelados.`);

    for (const order of cancelledOrders) {
      console.log(`Procesando pedido ${order.NUM_PED_ONL}...`);

      // 1. Anular factura vinculada si existe y sigue pendiente
      const not = order.NOT_PED_ONL || "";
      const match = not.match(/FAC-(\d+)/);
      if (match && match[1]) {
        const numFac = parseInt(match[1], 10);
        const fac = await FACTURAS.findByPk(numFac);
        if (fac && fac.EST_FAC !== "ANULADA") {
          await fac.update({ EST_FAC: "ANULADA" });
          console.log(`Factura FAC-${String(numFac).padStart(5, "0")} actualizada a ANULADA.`);
        }
      }

      // 2. Reingresar stock de items
      for (const it of order.items || []) {
        // Verificar si ya se registró la entrada en MOV_INV para evitar duplicados
        const existingMov = await MOV_INV.findOne({
          where: {
            ID_PRO: it.ID_PRO,
            TIP_MOV: "ENTRADA",
            NUM_DOC_MOV: order.NUM_PED_ONL,
          },
        });

        if (!existingMov) {
          const stock = await STOCK.findByPk(it.ID_PRO);
          if (stock) {
            const newDisp = Number(stock.CAN_DIS_STO) + Number(it.CAN_PED_ONL);
            const newRes = Math.max(0, Number(stock.CAN_RES_STO) - Number(it.CAN_PED_ONL));
            await stock.update({
              CAN_DIS_STO: newDisp,
              CAN_RES_STO: newRes,
              FEC_ACT_STO: new Date(),
            });
            console.log(`Stock Producto ${it.ID_PRO} restaurado -> Disp: ${newDisp}, Res: ${newRes}`);
          }

          await MOV_INV.create({
            ID_PRO: it.ID_PRO,
            TIP_MOV: "ENTRADA",
            CAN_MOV: it.CAN_PED_ONL,
            MOT_MOV: `Cancelación de pedido online ${order.NUM_PED_ONL} - Reingreso de stock`,
            NUM_DOC_MOV: order.NUM_PED_ONL,
            FEC_MOV: new Date(),
          });
          console.log(`Kardex MOV_INV registrado para Producto ${it.ID_PRO}.`);
        } else {
          console.log(`Movimiento ya existente para pedido ${order.NUM_PED_ONL} y producto ${it.ID_PRO}.`);
        }
      }
    }

    console.log("¡Reconciliación completada con éxito!");
    process.exit(0);
  } catch (err) {
    console.error("Error en reconciliación:", err);
    process.exit(1);
  }
}

run();
