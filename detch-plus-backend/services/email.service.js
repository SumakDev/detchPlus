import nodemailer from "nodemailer";
import { Resend } from "resend";

const WEB_ORIGIN = process.env.WEB_ORIGIN?.split(",")[0]?.trim() || "http://localhost:3000";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

console.log("Resend activo:", !!resend);

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  } else {
    // Modo de desarrollo: genera cuenta de prueba en Ethereal
    console.log("ℹ️ Creando transporter de prueba (Ethereal) para correos de desarrollo...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

// Con RESEND_API_KEY (producción) envía por API HTTPS; sin ella (local) usa nodemailer/Ethereal
async function sendMail({ from, to, subject, html }) {
  if (resend) {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) throw new Error(error.message);
    return { messageId: data.id, previewUrl: null };
  }

  const mailer = await getTransporter();
  const info = await mailer.sendMail({ from, to, subject, html });
  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || null,
  };
}

export async function sendVerificationEmail(to, name, token) {
  try {
    const verifyUrl = `${WEB_ORIGIN}/verificar-correo?token=${token}`;

    const { messageId, previewUrl } = await sendMail({
      from: process.env.SMTP_FROM || '"DetchPlus Support" <no-reply@detchplus.plus>',
      to,
      subject: "Verifica tu cuenta en DetchPlus",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #111827; font-size: 26px; margin: 0; font-weight: 700;">DetchPlus</h1>
            <p style="color: #4b5563; font-size: 14px; margin-top: 4px;">Tu destino Apple y tecnología de confianza</p>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">¡Hola, ${name || "Cliente"}!</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
              Gracias por registrarte en DetchPlus. Para activar tu cuenta y asegurar tus compras y pedidos, confirma tu dirección de correo electrónico haciendo clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" style="background-color: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                Verificar mi cuenta
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.4;">
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
              <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            Si no creaste una cuenta en DetchPlus, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    if (previewUrl) {
      console.log(`✉️ [Correo de Verificación] Vista previa: ${previewUrl}`);
    }
    return { success: true, previewUrl, messageId };
  } catch (err) {
    console.error("Error enviando correo de verificación:", err);
    return { success: false, error: err.message };
  }
}

export async function sendPasswordResetEmail(to, name, token) {
  try {
    const resetUrl = `${WEB_ORIGIN}/reset-password?token=${token}`;

    const { messageId, previewUrl } = await sendMail({
      from: process.env.SMTP_FROM || '"DetchPlus Security" <security@detchplus.plus>',
      to,
      subject: "Recuperación de contraseña — DetchPlus",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #111827; font-size: 26px; margin: 0; font-weight: 700;">DetchPlus</h1>
            <p style="color: #4b5563; font-size: 14px; margin-top: 4px;">Seguridad y Protección de Cuenta</p>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Solicitud de restablecimiento</h2>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
              Hola, <strong>${name || "Usuario"}</strong>. Recibimos una solicitud para restablecer la contraseña de tu cuenta en DetchPlus.
            </p>
            <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
              Haz clic en el siguiente botón para definir tu nueva contraseña. Este enlace es válido por 1 hora:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            <p style="color: #6b7280; font-size: 13px; line-height: 1.4;">
              Si el botón no abre automáticamente, ingresa a:<br>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            Si tú no solicitaste este cambio, no te preocupes: tu cuenta sigue segura y no se realizarán modificaciones sin este enlace.
          </p>
        </div>
      `,
    });

    if (previewUrl) {
      console.log(`🔑 [Recuperación de Contraseña] Vista previa: ${previewUrl}`);
    }
    return { success: true, previewUrl, messageId };
  } catch (err) {
    console.error("Error enviando correo de recuperación:", err);
    return { success: false, error: err.message };
  }
}

export async function sendOrderReceiptEmail({ to, name, order, items = [], shippingAddress = {} }) {
  try {
    if (!to) return { success: false, error: "Email no proporcionado" };
    const receiptUrl = `${WEB_ORIGIN}/recibo/${order.NUM_PED_ONL}`;

    const itemsRows = items.map((it) => {
      const cant = Number(it.CAN_PED_ONL || it.cantidad || 1);
      const precio = Number(it.PRE_UNI_PED_ONL || it.precio || 0).toFixed(2);
      const total = Number(it.PRE_TOT_PED_ONL || cant * Number(precio)).toFixed(2);
      const desc = it.producto?.DES_PRO || it.DES_PRO || it.nombre || `Producto #${it.ID_PRO || it.id}`;
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-size: 14px;">
            ${desc}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 14px; text-align: center;">
            ${cant}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 14px; text-align: right;">
            $${precio}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 600; font-size: 14px; text-align: right;">
            $${total}
          </td>
        </tr>
      `;
    }).join("");

    const dirTexto = [
      shippingAddress.DIR_LIN1_USU || shippingAddress.direccion,
      shippingAddress.CIU_USU || shippingAddress.ciudad,
      shippingAddress.PROV_USU || shippingAddress.provincia,
      "Ecuador",
    ].filter(Boolean).join(", ");

    const { messageId, previewUrl } = await sendMail({
      from: process.env.SMTP_FROM || '"DetchPlus Pedidos" <pedidos@detchplus.plus>',
      to,
      subject: `Recibo de Compra #${order.NUM_PED_ONL} — DetchPlus`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f3f4f6;">
            <h1 style="color: #111827; font-size: 26px; margin: 0; font-weight: 700;">DetchPlus</h1>
            <p style="color: #10b981; font-weight: 600; font-size: 14px; margin-top: 4px;">✓ ¡Gracias por tu compra, ${name || "Cliente"}!</p>
          </div>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Número de Pedido:</td>
                <td style="color: #111827; font-weight: 700; font-family: monospace; text-align: right;">${order.NUM_PED_ONL}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Código de Rastreo:</td>
                <td style="color: #2563eb; font-weight: 600; font-family: monospace; text-align: right;">${order.COD_SEG_PED || "—"}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Método de Pago:</td>
                <td style="color: #111827; font-weight: 500; text-align: right;">${order.MET_PAG_PED || "EFECTIVO"}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Dirección de Entrega:</td>
                <td style="color: #111827; font-weight: 500; text-align: right;">${dirTexto || "Entrega acordada"}</td>
              </tr>
            </table>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; text-transform: uppercase;">
                <th style="padding: 8px 0; text-align: left;">Producto</th>
                <th style="padding: 8px 0; text-align: center;">Cant.</th>
                <th style="padding: 8px 0; text-align: right;">Precio</th>
                <th style="padding: 8px 0; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">Subtotal:</td>
                <td style="color: #111827; text-align: right;">$${Number(order.SUB_PED_ONL || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding: 4px 0;">IVA (15%):</td>
                <td style="color: #111827; text-align: right;">$${Number(order.IMP_PED_ONL || 0).toFixed(2)}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb; font-size: 16px;">
                <td style="color: #111827; font-weight: 700; padding: 8px 0 0 0;">Total Pagado:</td>
                <td style="color: #111827; font-weight: 700; text-align: right; padding: 8px 0 0 0;">$${Number(order.TOT_PED_ONL || 0).toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${receiptUrl}" style="background-color: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
              Ver Recibo en Línea / Descargar
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
            DetchPlus — Expertos en tecnología y servicio técnico Apple.<br>
            Si tienes dudas con tu pedido contáctanos a soporte@detchplus.plus
          </p>
        </div>
      `,
    });

    if (previewUrl) {
      console.log(`🧾 [Recibo de Compra] Vista previa: ${previewUrl}`);
    }
    return { success: true, previewUrl, messageId };
  } catch (err) {
    console.error("Error enviando correo de recibo:", err);
    return { success: false, error: err.message };
  }
}