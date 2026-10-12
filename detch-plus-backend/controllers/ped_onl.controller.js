import { PED_ONL, DET_PED_ONL, DIR_USU, STOCK, PRODUCTOS } from "../models/index.js";
import sequelize from "../config/database.js";

export async function getAll(req, res) {
  try {
    const data = await PED_ONL.findAll({
      order: [["ID_PED_ONL", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getOne(req, res) {
  try {
    const data = await PED_ONL.findByPk(req.params.id);
    if (!data) return res.status(404).json({ error: "No encontrado" });

    const items = await DET_PED_ONL.findAll({
      where: { ID_PED_ONL: req.params.id },
      include: [{ model: PRODUCTOS, as: "producto", attributes: ["COD_BAR_PRO", "DES_PRO"] }],
    });

    return res.json({ ...data.toJSON(), items });
  } catch (error) {
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
      telefono,
      metodoPago = "EFECTIVO",
      notas = "",
    } = body;

    // Obtener ID_USU si viene autenticado o de fallback (usuario web o demo)
    const userId = Number(req.user?.ID_USU || body.ID_USU || 1);

    let idDirEnvio = body.ID_DIR_ENV_ONL;

    // Si envió dirección en el checkout, crearla en DIR_USU
    if (!idDirEnvio && direccion) {
      const dir = await DIR_USU.create({
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
      }, { transaction: t });
      idDirEnvio = dir.ID_DIR_USU;
    }

    if (!idDirEnvio) {
      // Buscar primera dirección existente del usuario o crear una por defecto
      const existingDir = await DIR_USU.findOne({ where: { ID_USU: userId }, transaction: t });
      if (existingDir) {
        idDirEnvio = existingDir.ID_DIR_USU;
      } else {
        const fallbackDir = await DIR_USU.create({
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
        }, { transaction: t });
        idDirEnvio = fallbackDir.ID_DIR_USU;
      }
    }

    // Calcular montos
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

    const impuesto = Number((subtotal * 0.15).toFixed(2)); // IVA 15%
    const total = Number((subtotal + impuesto).toFixed(2));
    const numPedido = `PED-${Date.now().toString().slice(-6)}`;
    const codSeguimiento = `DP-TRACK-${Math.floor(100000 + Math.random() * 900000)}`;

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
      MET_PAG_PED: ["EFECTIVO", "TRANSFERENCIA", "TARJ_CRED", "TARJ_DEB", "PAYPAL"].includes(metodoPago) ? metodoPago : "EFECTIVO",
      EST_PAG_PED: "PENDIENTE",
      NOT_PED_ONL: notas,
      COD_SEG_PED: codSeguimiento,
    };

    const createdOrder = await PED_ONL.create(orderPayload, { transaction: t });

    // Guardar detalles
    const createdItems = [];
    if (items.length > 0) {
      for (const it of items) {
        const cant = Number(it.cantidad || it.CAN_PED_ONL || 1);
        const precio = Number(it.precio || it.PRE_UNI_PED_ONL || 0);
        const tot = Number((cant * precio).toFixed(2));

        const det = await DET_PED_ONL.create({
          ID_PED_ONL: createdOrder.ID_PED_ONL,
          ID_PRO: it.id || it.ID_PRO,
          CAN_PED_ONL: cant,
          PRE_UNI_PED_ONL: precio,
          PRE_TOT_PED_ONL: tot,
        }, { transaction: t });
        createdItems.push(det);
      }
    }

    await t.commit();

    return res.status(201).json({
      message: "¡Pedido creado exitosamente!",
      order: createdOrder,
      items: createdItems,
      trackingCode: codSeguimiento,
    });
  } catch (error) {
    await t.rollback();
    console.error("ped_onl.create error:", error);
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
