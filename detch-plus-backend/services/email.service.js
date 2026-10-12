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