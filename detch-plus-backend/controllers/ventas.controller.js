import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { FACTURAS, DET_FAC, CLIENTES, EMPLEADOS, PRODUCTOS, DET_TELE, STOCK, MOV_INV, PED_ONL } from "../models/index.js";
import { syncPhoneStock } from "./det_tele.controller.js";

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

    if (!CED_CLI) {
      await t.rollback();
      return res.status(400).json({ error: "Cédula de cliente requerida" });
    }
    if (!items.length) {
      await t.rollback();
      return res.status(400).json({ error: "Debe incluir al menos un producto" });
    }

    // 0. Validar que todos los productos estén activos y tengan stock suficiente
    for (const item of items) {
      const idPro = Number(item.ID_PRO || item.id);
      const cant = Number(item.CAN_PRO || item.cantidad || 1);
      if (!idPro || cant <= 0) {
        await t.rollback();
        return res.status(400).json({ error: "Producto o cantidad inválida en la factura." });
      }
      const prod = await PRODUCTOS.findByPk(idPro, { transaction: t });
      if (!prod || prod.ACT_PRO === false || prod.ACT_PRO === 0) {
        await t.rollback();
        return res.status(409).json({
          error: `El producto "${prod?.DES_PRO || `#${idPro}`}" está inactivo o eliminado y no puede facturarse.`,
        });
      }
      const stock = await STOCK.findByPk(idPro, { transaction: t });
      const disp = Number(stock?.CAN_DIS_STO ?? 0);
      if (disp < cant) {
        await t.rollback();
        return res.status(409).json({
          error:
            disp <= 0
              ? `El producto "${prod.DES_PRO}" está agotado.`
              : `Stock insuficiente para "${prod.DES_PRO}" (Disponibles: ${disp}, Solicitados: ${cant}).`,
        });
      }
    }

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
      const idPro = Number(item.ID_PRO || item.id);
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

      const prod = await PRODUCTOS.findByPk(idPro, { transaction: t });
      if (Number(prod?.ID_CAT) === 1) {
        const unidadesDisponibles = await DET_TELE.findAll({
          where: { ID_PRO: idPro, DIS_TEL: "DISPONIBLE" },
          order: [["ID_DET_TEL", "ASC"]],
          limit: cant,
          transaction: t,
        });
        if (unidadesDisponibles.length > 0) {
          for (const u of unidadesDisponibles) {
            await u.update({ DIS_TEL: "VENDIDO" }, { transaction: t });
          }
          await syncPhoneStock(idPro, t);
        } else {
          const stock = await STOCK.findByPk(idPro, { transaction: t });
          if (stock) {
            await stock.update(
              { CAN_DIS_STO: Math.max(0, Number(stock.CAN_DIS_STO) - cant), FEC_ACT_STO: new Date() },
              { transaction: t }
            );
          }
        }
      } else {
        const stock = await STOCK.findByPk(idPro, { transaction: t });
        if (stock) {
          await stock.update(
            { CAN_DIS_STO: Math.max(0, Number(stock.CAN_DIS_STO) - cant), FEC_ACT_STO: new Date() },
            { transaction: t }
          );
        }
      }

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

    await t.commit();
    return res.status(201).json(factura);
  } catch (error) {
    await t.rollback();
    console.error("ventas.create error:", error);
    return res.status(500).json({ error: error.message || "Error al registrar venta" });
  }
}

// PATCH /api/ventas/:id/estado
export async function patchEstadoFactura(req, res) {
  try {
    const { id } = req.params;
    const { EST_FAC } = req.body;
    if (!["PENDIENTE", "PAGADA", "ANULADA"].includes(EST_FAC)) {
      return res.status(400).json({ error: "Estado no válido (PENDIENTE, PAGADA, ANULADA)" });
    }

    const factura = await FACTURAS.findByPk(id);
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });

    const previousEst = factura.EST_FAC;
    await factura.update({ EST_FAC });

    // Si se anula la factura directamente
    if (EST_FAC === "ANULADA" && previousEst !== "ANULADA") {
      // 1. Si proviene de un pedido online, cancelar también el pedido online
      const ped = await PED_ONL.findOne({
        where: {
          NOT_PED_ONL: { [Op.like]: `%FAC-${String(factura.NUM_FAC).padStart(5, "0")}%` },
        },
      });
      if (ped && ped.EST_PED_ONL !== "CANCELADO") {
        await ped.update({ EST_PED_ONL: "CANCELADO", EST_PAG_PED: "FALLIDO" });
      }

      // 2. Reingresar stock si no fue gestionado por pedido online
      const detFac = await DET_FAC.findAll({ where: { NUM_FAC: factura.NUM_FAC } });
      for (const it of detFac) {
        const prod = await PRODUCTOS.findByPk(it.ID_PRO);
        if (Number(prod?.ID_CAT) === 1) {
          const vendidas = await DET_TELE.findAll({
            where: { ID_PRO: it.ID_PRO, DIS_TEL: "VENDIDO" },
            order: [["ID_DET_TEL", "DESC"]],
            limit: Number(it.CAN_PRO || 1),
          });
          if (vendidas.length > 0) {
            for (const u of vendidas) {
              await u.update({ DIS_TEL: "DISPONIBLE" });
            }
            await syncPhoneStock(it.ID_PRO);
          } else {
            const stock = await STOCK.findByPk(it.ID_PRO);
            if (stock) {
              await stock.update({
                CAN_DIS_STO: Number(stock.CAN_DIS_STO) + Number(it.CAN_PRO),
                FEC_ACT_STO: new Date(),
              });
            }
          }
        } else {
          const stock = await STOCK.findByPk(it.ID_PRO);
          if (stock) {
            const newDisp = Number(stock.CAN_DIS_STO) + Number(it.CAN_PRO);
            const newRes = ped ? Math.max(0, Number(stock.CAN_RES_STO) - Number(it.CAN_PRO)) : stock.CAN_RES_STO;
            await stock.update({
              CAN_DIS_STO: newDisp,
              CAN_RES_STO: newRes,
              FEC_ACT_STO: new Date(),
            });
          }
        }
        await MOV_INV.create({
          ID_PRO: it.ID_PRO,
          TIP_MOV: "ENTRADA",
          CAN_MOV: it.CAN_PRO,
          MOT_MOV: `Anulación de factura FAC-${String(factura.NUM_FAC).padStart(5, "0")} - Reingreso de stock`,
          NUM_DOC_MOV: `FAC-${factura.NUM_FAC}`,
          FEC_MOV: new Date(),
        });
      }
    }

    return res.json(factura);
  } catch (error) {
    console.error("ventas.patchEstadoFactura error:", error);
    return res.status(500).json({ error: error.message });
  }
}
