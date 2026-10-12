import {
  PED_ONL,
  DET_PED_ONL,
  DIR_USU,
  STOCK,
  PRODUCTOS,
  MOV_INV,
  CLIENTES,
  EMPLEADOS,
  FACTURAS,
  DET_FAC,
  USUARIOS,
} from "../models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";

export async function getAll(req, res) {
  try {
    const { q, est } = req.query;
    const where = {};
    if (est) where.EST_PED_ONL = est;
    if (q) {
      where[Op.or] = [
        { NUM_PED_ONL: { [Op.like]: `%${q}%` } },
        { COD_SEG_PED: { [Op.like]: `%${q}%` } },
      ];
    }

    const data = await PED_ONL.findAll({
      where,
      include: [
        {
          model: DET_PED_ONL,
          as: "items",
          include: [{ model: PRODUCTOS, as: "producto", attributes: ["ID_PRO", "DES_PRO", "COD_BAR_PRO", "IMG_URL"] }],
        },
        {
          model: USUARIOS,
          as: "usuario",
          attributes: ["ID_USU", "NOM_USU", "APE_USU", "COR_USU", "TEL_USU"],
        },
        {
          model: DIR_USU,
          as: "direccionEnvio",
        },
      ],
      order: [["ID_PED_ONL", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    console.error("ped_onl.getAll error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await PED_ONL.findByPk(req.params.id, {
      include: [
        {
          model: DET_PED_ONL,
          as: "items",
          include: [{ model: PRODUCTOS, as: "producto" }],
        },
        {
          model: USUARIOS,
          as: "usuario",
          attributes: ["ID_USU", "NOM_USU", "APE_USU", "COR_USU", "TEL_USU"],
        },
        {
          model: DIR_USU,
          as: "direccionEnvio",
        },
      ],
    });
    if (!data) return res.status(404).json({ error: "No encontrado" });
    return res.json(data);
  } catch (error) {
    console.error("ped_onl.getOne error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function create(req, res) {
  const t = await sequelize.transaction();
  try {
    const body = req.body || {};
    const {
      items = [],
      direccion,
      ciudad,
      provincia,
      nombreContacto,
      email,
      cedula,
      telefono,
      metodoPago = "EFECTIVO",
      notas = "",
    } = body;

    // 1. Obtener ID_USU si viene autenticado o de fallback
    const userId = Number(req.user?.ID_USU || body.ID_USU || 1);

    // 2. Resolver o crear dirección en DIR_USU
    let idDirEnvio = body.ID_DIR_ENV_ONL;
    if (!idDirEnvio && direccion) {
      const dir = await DIR_USU.create(
        {
          ID_USU: userId,
          TIP_DIR_USU: "ENVIO",
          NOM_CON_USU: nombreContacto || "Cliente DetchPlus",
          TEL_CON_USU: telefono || "0999999999",
          DIR_LIN1_USU: direccion,
          CIU_USU: ciudad || "Quito",
          PROV_USU: provincia || "Pichincha",
          PAIS_USU: "Ecuador",
          ES_PRE_DIR_USU: 1,
          ACT_DIR_USU: 1,
        },
        { transaction: t }
      );
      idDirEnvio = dir.ID_DIR_USU;
    }

    if (!idDirEnvio) {
      const existingDir = await DIR_USU.findOne({ where: { ID_USU: userId }, transaction: t });
      if (existingDir) {
        idDirEnvio = existingDir.ID_DIR_USU;
      } else {
        const fallbackDir = await DIR_USU.create(
          {
            ID_USU: userId,
            TIP_DIR_USU: "ENVIO",
            NOM_CON_USU: nombreContacto || "Cliente DetchPlus",
            TEL_CON_USU: telefono || "0999999999",
            DIR_LIN1_USU: direccion || "Entrega en Tienda / Principal",
            CIU_USU: ciudad || "Quito",
            PROV_USU: provincia || "Pichincha",
            PAIS_USU: "Ecuador",
            ES_PRE_DIR_USU: 1,
            ACT_DIR_USU: 1,
          },
          { transaction: t }
        );
        idDirEnvio = fallbackDir.ID_DIR_USU;
      }
    }

    // 3. Calcular montos
    let subtotal = 0;
    if (items.length > 0) {
      subtotal = items.reduce((acc, item) => {
        const cant = Number(item.cantidad || item.CAN_PED_ONL || 1);
        const precio = Number(item.precio || item.PRE_UNI_PED_ONL || 0);
        return acc + cant * precio;
      }, 0);
    } else {
      subtotal = Number(body.SUB_PED_ONL || body.total || 0);
    }

    const impuesto = Number((subtotal * 0.15).toFixed(2)); // IVA 15% Ecuador
    const total = Number((subtotal + impuesto).toFixed(2));
    const numPedido = `PED-${Date.now().toString().slice(-6)}`;
    const codSeguimiento = `DP-TRACK-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Crear PED_ONL
    const orderPayload = {
      NUM_PED_ONL: body.NUM_PED_ONL || numPedido,
      ID_USU: userId,
      ID_DIR_ENV_ONL: idDirEnvio,
      SUB_PED_ONL: subtotal,
      IMP_PED_ONL: impuesto,
      COS_ENV_PED: 0.00,
      DES_PED_ONL: 0.00,
      TOT_PED_ONL: total,
      EST_PED_ONL: "PENDIENTE",
      MET_PAG_PED: ["EFECTIVO", "TRANSFERENCIA", "TARJ_CRED", "TARJ_DEB", "PAYPAL"].includes(metodoPago)
        ? metodoPago
        : "EFECTIVO",
      EST_PAG_PED: metodoPago === "TARJ_CRED" || metodoPago === "TARJ_DEB" ? "PAGADO" : "PENDIENTE",
      NOT_PED_ONL: notas,
      COD_SEG_PED: codSeguimiento,
    };

    const createdOrder = await PED_ONL.create(orderPayload, { transaction: t });

    // 5. Guardar detalles de pedido y descontar inventario en STOCK
    const createdItems = [];
    if (items.length > 0) {
      for (const it of items) {
        const idPro = it.id || it.ID_PRO;
        const cant = Number(it.cantidad || it.CAN_PED_ONL || 1);
        const precio = Number(it.precio || it.PRE_UNI_PED_ONL || 0);
        const tot = Number((cant * precio).toFixed(2));

        const det = await DET_PED_ONL.create(
          {
            ID_PED_ONL: createdOrder.ID_PED_ONL,
            ID_PRO: idPro,
            CAN_PED_ONL: cant,
            PRE_UNI_PED_ONL: precio,
            PRE_TOT_PED_ONL: tot,
          },
          { transaction: t }
        );
        createdItems.push(det);

        // Descontar inventario disponible y registrar en Kardex (MOV_INV)
        const stock = await STOCK.findByPk(idPro, { transaction: t });
        if (stock && Number(stock.CAN_DIS_STO) >= cant) {
          await stock.update(
            {
              CAN_DIS_STO: Number(stock.CAN_DIS_STO) - cant,
              FEC_ACT_STO: new Date(),
            },
            { transaction: t }
          );

          await MOV_INV.create(
            {
              ID_PRO: idPro,
              TIP_MOV: "SALIDA",
              CAN_MOV: cant,
              MOT_MOV: `PED_ONL_${createdOrder.NUM_PED_ONL}`,
              NUM_DOC_MOV: String(createdOrder.NUM_PED_ONL),
            },
            { transaction: t }
          );
        }
      }
    }

    // 6. Sincronizar o crear en CLIENTES para permitir la emisión de FACTURAS
    let cedulaCliente = cedula ? String(cedula).trim() : "";
    if (!cedulaCliente) {
      const userObj = await USUARIOS.findByPk(userId, { transaction: t });
      cedulaCliente =
        userObj?.ID_PERSONA ||
        (userObj?.COR_USU
          ? (await CLIENTES.findOne({ where: { COR_CLI: userObj.COR_USU }, transaction: t }))?.CED_CLI
          : "") ||
        "0503022618";
    }

    let clienteExistente = await CLIENTES.findByPk(cedulaCliente, { transaction: t });
    if (!clienteExistente) {
      const partesNombre = (nombreContacto || "Cliente Web").trim().split(" ");
      const primerNombre = partesNombre[0] || "Cliente";
      const apellido = partesNombre.slice(1).join(" ") || "Web";

      clienteExistente = await CLIENTES.create(
        {
          CED_CLI: cedulaCliente,
          NOM_CLI: primerNombre,
          APE_CLI: apellido,
          COR_CLI: email || "",
          NUM_CLI: telefono || "0999999999",
          DIR_CLI: direccion || "Tienda Online DetchPlus",
          ACT_CLI: 1,
        },
        { transaction: t }
      );
    }

    // Obtener empleado para la relación de FACTURAS
    const primerEmpleado = await EMPLEADOS.findOne({ transaction: t });
    const cedulaEmpleado = primerEmpleado ? primerEmpleado.CED_EMP : "1234567890";

    // 7. Generar FACTURA formal vinculada a la venta
    const factura = await FACTURAS.create(
      {
        CED_CLI: clienteExistente.CED_CLI,
        CED_EMP: cedulaEmpleado,
        DIR_FAC: direccion || "Venta Tienda Online",
        SUB_FAC: subtotal,
        IVA_FAC: impuesto,
        TOT_FAC: total,
        EST_FAC: metodoPago === "TARJ_CRED" || metodoPago === "TARJ_DEB" ? "PAGADA" : "PENDIENTE",
        FEC_FAC: new Date(),
      },
      { transaction: t }
    );

    // Guardar renglones de la factura en DET_FAC
    for (const it of items) {
      const idPro = it.id || it.ID_PRO;
      const cant = Number(it.cantidad || it.CAN_PED_ONL || 1);
      const precio = Number(it.precio || it.PRE_UNI_PED_ONL || 0);

      await DET_FAC.create(
        {
          NUM_FAC: factura.NUM_FAC,
          ID_PRO: idPro,
          CAN_PRO: cant,
          PRE_UNI_FAC: precio,
          PRE_TOT_FAC: Number((cant * precio).toFixed(2)),
        },
        { transaction: t }
      );
    }

    // Actualizar nota de pedido con el número de factura
    await createdOrder.update(
      {
        NOT_PED_ONL: `Factura: FAC-${String(factura.NUM_FAC).padStart(5, "0")} | ${notas}`.trim(),
      },
      { transaction: t }
    );

    await t.commit();

    return res.status(201).json({
      message: "¡Pedido y Factura creados exitosamente!",
      order: createdOrder,
      factura,
      items: createdItems,
      trackingCode: codSeguimiento,
    });
  } catch (error) {
    await t.rollback();
    console.error("ped_onl.create error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function patchEstado(req, res) {
  try {
    const { id } = req.params;
    const { EST_PED_ONL, EST_PAG_PED } = req.body;
    const order = await PED_ONL.findByPk(id);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    const updateFields = {};
    if (EST_PED_ONL) updateFields.EST_PED_ONL = EST_PED_ONL;
    if (EST_PAG_PED) updateFields.EST_PAG_PED = EST_PAG_PED;
    if (EST_PED_ONL === "ENTREGADO") updateFields.FEC_ENT_PED = new Date();

    await order.update(updateFields);

    // Si el pedido se confirma o paga, y tiene factura asociada, actualizar estado de la factura a PAGADA
    if (EST_PED_ONL === "CONFIRMADO" || EST_PED_ONL === "ENTREGADO" || EST_PAG_PED === "PAGADO") {
      const not = order.NOT_PED_ONL || "";
      const match = not.match(/FAC-(\d+)/);
      if (match && match[1]) {
        const numFac = parseInt(match[1], 10);
        await FACTURAS.update({ EST_FAC: "PAGADA" }, { where: { NUM_FAC: numFac } });
      }
    }

    const refreshed = await PED_ONL.findByPk(id, {
      include: [
        {
          model: DET_PED_ONL,
          as: "items",
          include: [{ model: PRODUCTOS, as: "producto" }],
        },
        {
          model: USUARIOS,
          as: "usuario",
          attributes: ["ID_USU", "NOM_USU", "APE_USU", "COR_USU", "TEL_USU"],
        },
      ],
    });

    return res.json(refreshed);
  } catch (error) {
    console.error("ped_onl.patchEstado error:", error);
    return res.status(500).json({ error: error.message });
  }
}

export async function update(req, res) {
  try {
    const [updated] = await PED_ONL.update(req.body, { where: { ID_PED_ONL: req.params.id } });
    if (!updated) return res.status(404).json({ error: "No encontrado" });
    const refreshed = await PED_ONL.findByPk(req.params.id);
    return res.json(refreshed);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function remove(req, res) {
  try {
    const deleted = await PED_ONL.destroy({ where: { ID_PED_ONL: req.params.id } });
    return deleted ? res.json({ message: "Eliminado correctamente" }) : res.status(404).json({ error: "No encontrado" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
