import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { FACTURAS, DET_FAC, CLIENTES, EMPLEADOS, PRODUCTOS, STOCK, MOV_INV, PED_ONL } from "../models/index.js";

// GET /api/ventas/resumen
export async function getResumen(req, res) {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    const facturasHoy = await FACTURAS.findAll({
      where: {
        FEC_FAC: { [Op.between]: [startOfToday, endOfToday] },
        EST_FAC: { [Op.ne]: "ANULADA" },
      },
    });

    const facturasAyer = await FACTURAS.findAll({
      where: {
        FEC_FAC: { [Op.between]: [startOfYesterday, endOfYesterday] },
        EST_FAC: { [Op.ne]: "ANULADA" },
      },
    });

    const facturasMes = await FACTURAS.findAll({
      where: {
        FEC_FAC: { [Op.gte]: startOfMonth },
        EST_FAC: { [Op.ne]: "ANULADA" },
      },
    });

    // Consultar pedidos online para métricas globales
    const pedidosHoy = await PED_ONL.findAll({
      where: {
        FEC_PED_ONL: { [Op.between]: [startOfToday, endOfToday] },
        EST_PED_ONL: { [Op.ne]: "CANCELADO" },
      },
    });

    const pedidosMes = await PED_ONL.findAll({
      where: {
        FEC_PED_ONL: { [Op.gte]: startOfMonth },
        EST_PED_ONL: { [Op.ne]: "CANCELADO" },
      },
    });

    // Evitar doble conteo si el pedido online ya generó factura registrada
    const pedidosSinFacturaHoy = pedidosHoy.filter((p) => !p.NOT_PED_ONL || !p.NOT_PED_ONL.includes("FAC-"));
    const pedidosSinFacturaMes = pedidosMes.filter((p) => !p.NOT_PED_ONL || !p.NOT_PED_ONL.includes("FAC-"));

    const totalFacturasHoy = facturasHoy.reduce((acc, f) => acc + Number(f.TOT_FAC || 0), 0);
    const totalPedidosOnlineHoy = pedidosSinFacturaHoy.reduce((acc, p) => acc + Number(p.TOT_PED_ONL || 0), 0);
    const totalHoy = totalFacturasHoy + totalPedidosOnlineHoy;

    const totalAyer = facturasAyer.reduce((acc, f) => acc + Number(f.TOT_FAC || 0), 0);
    const totalMes =
      facturasMes.reduce((acc, f) => acc + Number(f.TOT_FAC || 0), 0) +
      pedidosSinFacturaMes.reduce((acc, p) => acc + Number(p.TOT_PED_ONL || 0), 0);

    const ticketsHoy = facturasHoy.length + pedidosSinFacturaHoy.length;
    const promedioTicket = ticketsHoy > 0 ? totalHoy / ticketsHoy : 0;

    let crecimientoVsAyerPct = 0;
    if (totalAyer > 0) {
      crecimientoVsAyerPct = Math.round(((totalHoy - totalAyer) / totalAyer) * 100);
    } else if (totalHoy > 0) {
      crecimientoVsAyerPct = 100;
    }

    return res.json({
      totalHoy,
      totalHoyFmt: `$${totalHoy.toFixed(2)}`,
      totalMes,
      ticketsHoy,
      promedioTicket,
      crecimientoVsAyerPct,
      facturasHoyTotal: totalFacturasHoy,
      pedidosOnlineHoyTotal: totalPedidosOnlineHoy,
      totalPedidosOnline: pedidosHoy.length,
    });
  } catch (error) {
    console.error("ventas.getResumen error:", error);
    return res.status(500).json({ error: "Error calculando resumen de ventas" });
  }
}

// GET /api/ventas
export async function getAll(req, res) {
  try {
    const { q, est } = req.query;
    const where = {};
    if (est) where.EST_FAC = est;

    const data = await FACTURAS.findAll({
      where,
      include: [
        {
          model: CLIENTES,
          as: "cliente",
          attributes: ["CED_CLI", "NOM_CLI", "APE_CLI", "NUM_CLI", "COR_CLI"],
        },
        {
          model: DET_FAC,
          as: "detalles",
          include: [
            {
              model: PRODUCTOS,
              as: "producto",
              attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO", "IMG_URL"],
            },
          ],
        },
      ],
      order: [["FEC_FAC", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    try {
      const simple = await FACTURAS.findAll({ order: [["FEC_FAC", "DESC"]] });
      return res.json(simple);
    } catch (e) {
      console.error("ventas.getAll error:", e);
      return res.status(500).json({ error: error.message });
    }
  }
}

// POST /api/ventas (crear venta y descontar stock)
export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const { CED_CLI, CED_EMP, DIR_FAC, items = [] } = req.body || {};

    if (!CED_CLI) return res.status(400).json({ error: "Cédula de cliente requerida" });
    if (!items.length) return res.status(400).json({ error: "Debe incluir al menos un producto" });

    // Resolver empleado válido
    let cedulaEmpleado = CED_EMP;
    if (!cedulaEmpleado) {
      const emp = await EMPLEADOS.findOne({ transaction: t });
      cedulaEmpleado = emp ? emp.CED_EMP : "1234567890";
    }

    let subtotal = 0;
    for (const item of items) {
      const precio = Number(item.PRE_UNI_FAC || item.precio || 0);
      const cantidad = Number(item.CAN_PRO || item.cantidad || 1);
      subtotal += precio * cantidad;
    }

    const iva = Number((subtotal * 0.15).toFixed(2)); // IVA Ecuador
    const total = Number((subtotal + iva).toFixed(2));

    const factura = await FACTURAS.create(
      {
        CED_CLI,
        CED_EMP: cedulaEmpleado,
        DIR_FAC: DIR_FAC || "Venta en mostrador",
        SUB_FAC: subtotal,
        IVA_FAC: iva,
        TOT_FAC: total,
        EST_FAC: "PAGADA",
        FEC_FAC: new Date(),
      },
      { transaction: t }
    );

    for (const item of items) {
      const idPro = item.ID_PRO || item.id;
      const cant = Number(item.CAN_PRO || item.cantidad || 1);
      const preUni = Number(item.PRE_UNI_FAC || item.precio || 0);

      await DET_FAC.create(
        {
          NUM_FAC: factura.NUM_FAC,
          ID_PRO: idPro,
          CAN_PRO: cant,
          PRE_UNI_FAC: preUni,
          PRE_TOT_FAC: Number((preUni * cant).toFixed(2)),
        },
        { transaction: t }
      );

      // Descontar de stock si existe
      const stock = await STOCK.findByPk(idPro, { transaction: t });
      if (stock && Number(stock.CAN_DIS_STO) >= cant) {
        await stock.update(
          { CAN_DIS_STO: Number(stock.CAN_DIS_STO) - cant, FEC_ACT_STO: new Date() },
          { transaction: t }
        );

        await MOV_INV.create(
          {
            ID_PRO: idPro,
            TIP_MOV: "SALIDA",
            CAN_MOV: cant,
            MOT_MOV: `VENTA_FAC_${factura.NUM_FAC}`,
            NUM_DOC_MOV: String(factura.NUM_FAC),
          },
          { transaction: t }
        );
      }
    }

    await t.commit();
    return res.status(201).json(factura);
  } catch (error) {
    await t.rollback();
    console.error("ventas.create error:", error);
    return res.status(500).json({ error: error.message || "Error al registrar venta" });
  }
}
