import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, NOTIFICATION_EMAIL } from '@/lib/email-config';

// GET - Ejecucion automatica via cron (domingos 15:00)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const resultado = await enviarRecordatorio();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('Error en GET recordatorio-horarios:', error);
    return NextResponse.json({ error: 'Error al enviar recordatorio' }, { status: 500 });
  }
}

async function enviarRecordatorio() {
  const hoy = new Date();
  const proximoLunes = new Date(hoy);
  proximoLunes.setDate(hoy.getDate() + (8 - hoy.getDay()));

  const proximoDomingo = new Date(proximoLunes);
  proximoDomingo.setDate(proximoLunes.getDate() + 6);

  const panelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/turnosweb/horarios`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; padding: 28px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 24px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 8px; }
        .info-box { background: #fff; padding: 16px; margin: 16px 0; border-radius: 8px; }
        .countdown { font-size: 44px; font-weight: 700; color: #d97706; text-align: center; margin: 16px 0; }
        .btn-wrap { text-align: center; margin: 20px 0; }
        .btn { display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Recordatorio importante</h1>
          <p style="margin: 8px 0 0 0;">Configura los horarios de la proxima semana</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h2 style="margin-top: 0; color: #92400e;">En 1 hora se habilitan los turnos</h2>
            <p style="margin-bottom: 0; color: #78350f;">
              Configura los horarios disponibles para la proxima semana antes de las <strong>16:00 hs</strong>.
            </p>
          </div>

          <div class="countdown">1h</div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #374151;">Semana a configurar</h3>
            <p style="margin: 8px 0; color: #6b7280;">
              <strong>Desde:</strong> ${proximoLunes.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br>
              <strong>Hasta:</strong> ${proximoDomingo.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #374151;">Pasos</h3>
            <ol style="color: #6b7280; margin: 8px 0;">
              <li>Ingresa al panel de administracion</li>
              <li>Ve a la seccion Horarios</li>
              <li>Configura los horarios por dia (lunes a sabado)</li>
              <li>Guarda los cambios antes de las 16:00 hs</li>
            </ol>
          </div>

          <div class="btn-wrap">
            <a href="${panelUrl}" class="btn">Configurar horarios</a>
          </div>

          <div class="info-box" style="background: #dbeafe; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af;">
              <strong>Recuerda:</strong> Los clientes podran reservar turnos de lunes a jueves de la proxima semana
              desde las 16:00 hs de hoy (viernes y sabado se pueden reservar siempre).
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">Recordatorio automatico del sistema</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">Turnos Web - Sistema de Gestion</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: 'Recordatorio: configura horarios de la proxima semana (en 1 hora)',
    html: emailHtml,
  });

  return {
    success: true,
    message: 'Recordatorio enviado exitosamente',
    proximaSemana: {
      inicio: proximoLunes.toISOString().split('T')[0],
      fin: proximoDomingo.toISOString().split('T')[0],
    },
  };
}
