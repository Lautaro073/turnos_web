import nodemailer from 'nodemailer';

// Email del profesional que recibira las notificaciones
export const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'staingosanchez@gmail.com';

// Configurar transporter de Nodemailer con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: `"Turnos Web" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('[OK] Email enviado exitosamente:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('[ERROR] Error al enviar email:', error);
    return { success: false, error };
  }
}


