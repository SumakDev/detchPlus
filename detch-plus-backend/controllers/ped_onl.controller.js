import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  PED_ONL,
  DET_PED_ONL,
  DIR_USU,
  STOCK,
  PRODUCTOS,
  DET_TELE,
  MOV_INV,
  CLIENTES,
  EMPLEADOS,
  FACTURAS,
  DET_FAC,
  USUARIOS,
  CUPONES,
  CUP_USO,
  MOV_FIN,
  NOTIF,
} from "../models/index.js";
import sequelize from "../config/database.js";
import { Op } from "sequelize";
import { sendOrderReceiptEmail } from "../services/email.service.js";
import { syncPhoneStock } from "./det_tele.controller.js";

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
    const idParam = req.params.id;
    const isNumeric = !isNaN(Number(idParam)) && /^\d+$/.test(String(idParam).trim());
    const where = isNumeric
      ? { [Op.or]: [{ ID_PED_ONL: Number(idParam) }, { NUM_PED_ONL: idParam }] }
      : { NUM_PED_ONL: idParam };

    const data = await PED_ONL.findOne({
      where,
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
    if (!data) return res.status(404).json({ error: "Pedido no encontrado" });
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

    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: "El carrito de compras está vacío." });
    }

    // 0. Validación estricta de disponibilidad y estado activo de cada producto ANTES de crear orden
    for (const it of items) {
      const idPro = Number(it.id || it.ID_PRO);
      const cant = Number(it.cantidad || it.CAN_PED_ONL || 1);

      if (!idPro || cant <= 0) {
        await t.rollback();
        return res.status(400).json({ error: "Producto o cantidad inválida en el pedido." });
      }

      const prod = await PRODUCTOS.findByPk(idPro, { transaction: t });
      if (!prod || prod.ACT_PRO === false || prod.ACT_PRO === 0) {
        await t.rollback();
        return res.status(409).json({
          error: `El producto "${prod?.DES_PRO || `#${idPro}`}" ya no se encuentra activo en el catálogo. Fue retirado de tu bolsa.`,
          code: "PRODUCT_INACTIVE",
          productId: idPro,
        });
      }

      const stock = await STOCK.findByPk(idPro, { transaction: t });
      const disp = Number(stock?.CAN_DIS_STO ?? 0);
      if (disp < cant) {
        await t.rollback();
        return res.status(409).json({
          error:
            disp <= 0
              ? `El producto "${prod.DES_PRO}" se encuentra agotado en este momento.`
              : `Stock insuficiente para "${prod.DES_PRO}". Disponibles: ${disp}, Solicitados: ${cant}.`,
          code: "INSUFFICIENT_STOCK",
          productId: idPro,
          availableStock: disp,
        });
      }
    }

    // 1. Resolver usuario: Autenticado (req.user), existente por email, o nuevo usuario invitado
    let userId = null;

    // A) Si viene autenticado mediante token JWT
    if (req.user?.ID_USU) {
      const authUser = await USUARIOS.findByPk(req.user.ID_USU, { transaction: t });
      if (authUser) {
        userId = authUser.ID_USU;
      }
    }

    // B) Si no hay usuario autenticado, buscar por email o crear cuenta invitada
    if (!userId) {
      const cleanEmail = email ? String(email).trim().toLowerCase() : "";
      if (cleanEmail) {
        const existingUser = await USUARIOS.findOne({
          where: { COR_USU: cleanEmail },
          transaction: t,
        });

        if (existingUser) {
          userId = existingUser.ID_USU;
        } else {
          // Crear usuario con rol CLIENTE_WEB (ID_ROL = 4)
          const partesNombre = (nombreContacto || "Cliente Invitado").trim().split(" ");
          const primerNombre = partesNombre[0] || "Cliente";
          const apellido = partesNombre.slice(1).join(" ") || "DetchPlus";
          const baseUsername = cleanEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30) || "cliente";
          const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
          const generatedUsername = `${baseUsername}_${uniqueSuffix}`;

          const randomPassword = crypto.randomBytes(16).toString("hex");
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const newUser = await USUARIOS.create(
            {
              USR_USU: generatedUsername,
              COR_USU: cleanEmail,
              PAS_HAS_USU: hashedPassword,
              ID_ROL: 4, // CLIENTE_WEB
              TIPO_PERSONA: "CLIENTE",
              ID_PERSONA: cedula ? String(cedula).trim() : "",
              NOM_USU: primerNombre,
              APE_USU: apellido,
              TEL_USU: telefono ? String(telefono).trim() : null,
              EST_USU: "ACTIVO",
              COR_VER_USU: false,
              ACE_TER_USU: true,
            },
            { transaction: t }
          );

          userId = newUser.ID_USU;
        }
      }
    }

    // C) Salvaguarda final: Si no hubo email, verificar si body.ID_USU existe en BD o tomar el primer usuario existente
    if (!userId) {
      if (body.ID_USU) {
        const bodyUser = await USUARIOS.findByPk(Number(body.ID_USU), { transaction: t });
        if (bodyUser) userId = bodyUser.ID_USU;
      }
      if (!userId) {
        const firstUser = await USUARIOS.findOne({
          order: [["ID_USU", "ASC"]],
          transaction: t,
        });
        if (firstUser) userId = firstUser.ID_USU;
      }
    }

    if (!userId) {
      throw new Error("No se pudo asociar un usuario válido para registrar el pedido.");
    }

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
    let descuentoCupon = 0;
    let cuponEncontrado = null;
    if (body.codigoCupon) {
      const code = String(body.codigoCupon).trim().toUpperCase();
      cuponEncontrado = await CUPONES.findOne({
        where: { COD_CUP: code, ACT_CUP: true },
        transaction: t,
      });
      if (cuponEncontrado) {
        if (cuponEncontrado.TIP_DES_CUP === "PORCENTAJE") {
          descuentoCupon = Number(((subtotal * Number(cuponEncontrado.VAL_DES_CUP || 0)) / 100).toFixed(2));
        } else {
          descuentoCupon = Number(Number(cuponEncontrado.VAL_DES_CUP || 0).toFixed(2));
        }
        if (descuentoCupon > subtotal) descuentoCupon = subtotal;
      }
    }

    const total = Math.max(0, Number((subtotal - descuentoCupon + impuesto).toFixed(2)));
    const maxOrder = await PED_ONL.max("ID_PED_ONL", { transaction: t });
    const nextNum = (Number(maxOrder) || 0) + 1;
    const numPedido = `PED-${new Date().getFullYear()}${String(nextNum).padStart(6, "0")}`;
    const codSeguimiento = `DP-TRACK-${Math.floor(100000 + Math.random() * 900000)}`;

    // 4. Crear PED_ONL
    const orderPayload = {
      NUM_PED_ONL: numPedido,
      ID_USU: userId,
      ID_DIR_ENV_ONL: idDirEnvio,
      SUB_PED_ONL: subtotal,
      IMP_PED_ONL: impuesto,
      COS_ENV_PED: 0.00,
      DES_PED_ONL: descuentoCupon,
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

    if (cuponEncontrado && descuentoCupon > 0) {
      await cuponEncontrado.update(
        { USO_ACT_CUP: Number(cuponEncontrado.USO_ACT_CUP || 0) + 1 },
        { transaction: t }
      );
      await CUP_USO.create(
        {
          ID_CUP: cuponEncontrado.ID_CUP,
          ID_USU: userId,
          ID_PED_ONL: createdOrder.ID_PED_ONL,
          MON_DES_CUP_USO: descuentoCupon,
          FEC_USO_CUP: new Date(),
        },
        { transaction: t }
      );
    }

    // 5. Guardar detalles de pedido y descontar inventario en STOCK (y DET_TELE si es teléfono)
    const createdItems = [];
    for (const it of items) {
      const idPro = Number(it.id || it.ID_PRO);
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

      const prod = await PRODUCTOS.findByPk(idPro, { transaction: t });
      if (Number(prod?.ID_CAT) === 1) {
        // Si es teléfono, marcar las primeras N unidades disponibles en DET_TELE como VENDIDO
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
              {
                CAN_DIS_STO: Math.max(0, Number(stock.CAN_DIS_STO) - cant),
                FEC_ACT_STO: new Date(),
              },
              { transaction: t }
            );
          }
        }
      } else {
        const stock = await STOCK.findByPk(idPro, { transaction: t });
        if (stock) {
          await stock.update(
            {
              CAN_DIS_STO: Math.max(0, Number(stock.CAN_DIS_STO) - cant),
              FEC_ACT_STO: new Date(),
            },
            { transaction: t }
          );
        }
      }

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

    // 8. Registrar movimiento financiero en MOV_FIN y notificación en NOTIF
    await MOV_FIN.create(
      {
        TIP_MOV_FIN: orderPayload.EST_PAG_PED === "PAGADO" ? "INGRESO" : "POR_COBRAR",
        MON_MOV_FIN: total,
        FEC_MOV_FIN: new Date(),
        REF_MOV_FIN: numPedido,
        DES_MOV_FIN: "Pedido Online " + numPedido,
        CED_EMP: cedulaEmpleado,
        CAT_MOV_FIN: "VENTA_ONLINE",
      },
      { transaction: t }
    );

    await NOTIF.create(
      {
        ID_USU: userId,
        TIT_NOTIF: "Pedido " + numPedido + " recibido",
        MEN_NOTIF: "Tu pedido por $" + total.toFixed(2) + " ha sido registrado. Código de seguimiento: " + codSeguimiento,
        TIP_NOTIF: "SUCCESS",
        URL_ACC_NOTIF: "/recibo/" + numPedido,
        FEC_CRE_NOTIF: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    // Enviar recibo digital por correo al cliente de forma asíncrona
    (async () => {
      try {
        let emailDestino = email ? String(email).trim() : "";
        if (!emailDestino && userId) {
          const u = await USUARIOS.findByPk(userId);
          emailDestino = u?.COR_USU || "";
        }
        if (emailDestino) {
          await sendOrderReceiptEmail({
            to: emailDestino,
            name: nombreContacto || "Cliente DetchPlus",
            order: createdOrder,
            items,
            shippingAddress: {
              direccion,
              ciudad,
              provincia,
            },
          });
        }
      } catch (mailErr) {
        console.error("Error al enviar email de recibo:", mailErr.message);
      }
    })();

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

    const previousEstado = order.EST_PED_ONL;
    const updateFields = {};
    if (EST_PED_ONL) updateFields.EST_PED_ONL = EST_PED_ONL;
    if (EST_PAG_PED) updateFields.EST_PAG_PED = EST_PAG_PED;
    if (EST_PED_ONL === "ENTREGADO") updateFields.FEC_ENT_PED = new Date();

    // 1. Si el pedido se cancela (y no estaba cancelado previamente)
    if (EST_PED_ONL === "CANCELADO" && previousEstado !== "CANCELADO") {
      updateFields.EST_PAG_PED = "FALLIDO";

      // Anular factura asociada
      const not = order.NOT_PED_ONL || "";
      const match = not.match(/FAC-(\d+)/);
      if (match && match[1]) {
        const numFac = parseInt(match[1], 10);
        await FACTURAS.update({ EST_FAC: "ANULADA" }, { where: { NUM_FAC: numFac } });
      }

      // Reingresar stock disponible y ajustar stock reservado
      const items = await DET_PED_ONL.findAll({ where: { ID_PED_ONL: order.ID_PED_ONL } });
      for (const it of items) {
        const prod = await PRODUCTOS.findByPk(it.ID_PRO);
        if (Number(prod?.ID_CAT) === 1) {
          const vendidas = await DET_TELE.findAll({
            where: { ID_PRO: it.ID_PRO, DIS_TEL: "VENDIDO" },
            order: [["ID_DET_TEL", "DESC"]],
            limit: Number(it.CAN_PED_ONL || 1),
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
                CAN_DIS_STO: Number(stock.CAN_DIS_STO) + Number(it.CAN_PED_ONL),
                CAN_RES_STO: Math.max(0, Number(stock.CAN_RES_STO) - Number(it.CAN_PED_ONL)),
                FEC_ACT_STO: new Date(),
              });
            }
          }
        } else {
          const stock = await STOCK.findByPk(it.ID_PRO);
          if (stock) {
            const newDisp = Number(stock.CAN_DIS_STO) + Number(it.CAN_PED_ONL);
            const newRes = Math.max(0, Number(stock.CAN_RES_STO) - Number(it.CAN_PED_ONL));
            await stock.update({
              CAN_DIS_STO: newDisp,
              CAN_RES_STO: newRes,
              FEC_ACT_STO: new Date(),
            });
          }
        }

        // Registrar movimiento de Kardex (ENTRADA por cancelación)
        await MOV_INV.create({
          ID_PRO: it.ID_PRO,
          TIP_MOV: "ENTRADA",
          CAN_MOV: it.CAN_PED_ONL,
          MOT_MOV: `Cancelación de pedido online ${order.NUM_PED_ONL} - Reingreso de stock`,
          NUM_DOC_MOV: order.NUM_PED_ONL,
          FEC_MOV: new Date(),
        });
      }

      // Registrar EGRESO financiero por reverso de pedido
      try {
        await MOV_FIN.create({
          TIP_MOV_FIN: "EGRESO",
          MON_MOV_FIN: Number(order.TOT_PED_ONL || 0),
          FEC_MOV_FIN: new Date(),
          REF_MOV_FIN: order.NUM_PED_ONL,
          DES_MOV_FIN: "Reverso por cancelación de pedido " + order.NUM_PED_ONL,
          CAT_MOV_FIN: "REVERSO_ONLINE",
        });
      } catch (e) {
        console.error("Error registrando reverso en MOV_FIN:", e);
      }

      if (order.ID_USU) {
        try {
          await NOTIF.create({
            ID_USU: order.ID_USU,
            TIT_NOTIF: "Pedido " + order.NUM_PED_ONL + " cancelado",
            MEN_NOTIF: "Tu pedido " + order.NUM_PED_ONL + " ha sido cancelado.",
            TIP_NOTIF: "WARNING",
            URL_ACC_NOTIF: "/recibo/" + order.NUM_PED_ONL,
            FEC_CRE_NOTIF: new Date(),
          });
        } catch (e) {
          console.error("Error registrando notificación de cancelación:", e);
        }
      }
    }

    // 2. Si el pedido se confirma o paga, y tiene factura asociada, actualizar estado de la factura a PAGADA
    if (EST_PED_ONL === "CONFIRMADO" || EST_PED_ONL === "ENTREGADO" || EST_PAG_PED === "PAGADO") {
      const not = order.NOT_PED_ONL || "";
      const match = not.match(/FAC-(\d+)/);
      if (match && match[1]) {
        const numFac = parseInt(match[1], 10);
        await FACTURAS.update({ EST_FAC: "PAGADA" }, { where: { NUM_FAC: numFac } });
      }
    }

    // Notificar cambios de estado positivos al usuario
    if (
      order.ID_USU &&
      EST_PED_ONL &&
      EST_PED_ONL !== previousEstado &&
      ["CONFIRMADO", "ENVIADO", "ENTREGADO"].includes(EST_PED_ONL)
    ) {
      try {
        await NOTIF.create({
          ID_USU: order.ID_USU,
          TIT_NOTIF: `Pedido ${order.NUM_PED_ONL}: ${EST_PED_ONL}`,
          MEN_NOTIF: `El estado de tu pedido ${order.NUM_PED_ONL} ahora es ${EST_PED_ONL}.`,
          TIP_NOTIF: EST_PED_ONL === "ENTREGADO" ? "SUCCESS" : "INFO",
          URL_ACC_NOTIF: "/recibo/" + order.NUM_PED_ONL,
          FEC_CRE_NOTIF: new Date(),
        });
      } catch (e) {
        console.error("Error registrando notificación de estado:", e);
      }
    }

    await order.update(updateFields);

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
