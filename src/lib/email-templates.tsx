interface NuevoTurnoEmailProps {
  nombreCliente: string;
  telefono: string;
  email?: string;
  servicio: string;
  fecha: string;
  hora: string;
  cantidadPersonas: number;
}

interface TurnoCanceladoEmailProps {
  nombreCliente: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
}

interface ResumenDiarioEmailProps {
  fecha: string;
  turnos: Array<{
    hora: string;
    servicio: string;
    nombreCliente: string;
    telefono: string;
    estado: string;
  }>;
}

interface MultipleTurnosEmailProps {
  nombreCliente: string;
  telefono: string;
  email?: string;
  cantidadPersonas: number;
  turnos: Array<{
    servicio: string;
    fecha: string;
    hora: string;
  }>;
}

const baseStyles = `
  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
  .container { max-width: 640px; margin: 0 auto; padding: 20px; }
  .header { color: #fff; padding: 28px; border-radius: 10px 10px 0 0; text-align: center; }
  .content { background: #f9fafb; padding: 24px; border-radius: 0 0 10px 10px; }
  .panel { background: #fff; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #4f46e5; }
  .row { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eee; }
  .row:last-child { border-bottom: none; }
  .label { font-weight: 700; color: #4b5563; }
  .footer { margin-top: 16px; text-align: center; color: #6b7280; font-size: 12px; }
`;

export const nuevoTurnoEmail = ({
  nombreCliente,
  telefono,
  email,
  servicio,
  fecha,
  hora,
  cantidadPersonas,
}: NuevoTurnoEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${baseStyles}
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Nuevo turno reservado</h1>
      <p style="margin: 8px 0 0 0;">Turnos Web</p>
    </div>
    <div class="content">
      <p>Se registro un nuevo turno.</p>
      <div class="panel">
        <div class="row"><span class="label">Cliente:</span><span>${nombreCliente}</span></div>
        <div class="row"><span class="label">Telefono:</span><span>${telefono}</span></div>
        ${email ? `<div class="row"><span class="label">Email:</span><span>${email}</span></div>` : ''}
        ${cantidadPersonas > 1 ? `<div class="row"><span class="label">Personas:</span><span>${cantidadPersonas}</span></div>` : ''}
        <div class="row"><span class="label">Servicio:</span><span>${servicio}</span></div>
        <div class="row"><span class="label">Fecha:</span><span>${new Date(fecha).toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</span></div>
        <div class="row"><span class="label">Hora:</span><span>${hora} hs</span></div>
      </div>
      <p>
        Contacto directo:
        <a href="https://wa.me/${telefono.replace(/\D/g, '')}" style="color:#4f46e5; font-weight:700; text-decoration:none;">
          WhatsApp
        </a>
      </p>
      <div class="footer">
        <p>Email automatico generado por Turnos Web.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const turnoCanceladoEmail = ({
  nombreCliente,
  telefono,
  servicio,
  fecha,
  hora,
}: TurnoCanceladoEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${baseStyles}
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); }
    .alert { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; color: #991b1b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Turno cancelado</h1>
      <p style="margin: 8px 0 0 0;">Turnos Web</p>
    </div>
    <div class="content">
      <div class="alert"><strong>Un cliente cancelo su turno.</strong></div>
      <div class="panel" style="border-left-color:#dc2626;">
        <div class="row"><span class="label">Cliente:</span><span>${nombreCliente}</span></div>
        <div class="row"><span class="label">Telefono:</span><span>${telefono}</span></div>
        <div class="row"><span class="label">Servicio:</span><span>${servicio}</span></div>
        <div class="row"><span class="label">Fecha:</span><span>${new Date(fecha).toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}</span></div>
        <div class="row"><span class="label">Hora:</span><span>${hora} hs</span></div>
      </div>
      <p style="color:#059669; font-weight:700;">El horario quedo libre para nuevas reservas.</p>
      <div class="footer">
        <p>Email automatico generado por Turnos Web.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const resumenDiarioEmail = ({ fecha, turnos }: ResumenDiarioEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${baseStyles}
    .container { max-width: 720px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .turno-card { background: #fff; border-radius: 8px; padding: 14px; margin: 12px 0; border-left: 4px solid #4f46e5; }
    .turno-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }
    .hora { font-size: 22px; font-weight: 700; color: #4f46e5; }
    .estado { border-radius: 999px; padding: 4px 10px; font-size: 12px; font-weight: 700; }
    .estado-pendiente { background: #fef3c7; color: #92400e; }
    .estado-confirmado { background: #dbeafe; color: #1e3a8a; }
    .estado-completado { background: #dcfce7; color: #166534; }
    .estado-cancelado { background: #fee2e2; color: #991b1b; }
    .empty { text-align: center; color: #6b7280; padding: 24px; background: #fff; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Agenda del dia</h1>
      <p style="margin: 8px 0 0 0;">Turnos Web</p>
    </div>
    <div class="content">
      <div class="panel">
        <div class="row">
          <span class="label">Fecha:</span>
          <span>${new Date(fecha).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</span>
        </div>
        <div class="row"><span class="label">Total turnos:</span><span>${turnos.length}</span></div>
      </div>

      ${turnos.length === 0
        ? `
        <div class="empty">
          <p style="margin:0;">No hay turnos programados para hoy.</p>
        </div>
      `
        : turnos
            .map(
              (turno) => `
        <div class="turno-card">
          <div class="turno-head">
            <span class="hora">${turno.hora} hs</span>
            <span class="estado estado-${turno.estado}">${turno.estado.toUpperCase()}</span>
          </div>
          <p style="margin:6px 0;"><strong>Servicio:</strong> ${turno.servicio}</p>
          <p style="margin:6px 0;"><strong>Cliente:</strong> ${turno.nombreCliente}</p>
          <p style="margin:6px 0;">
            <strong>Telefono:</strong>
            <a href="https://wa.me/${turno.telefono.replace(/\D/g, '')}" style="color:#4f46e5; text-decoration:none;">
              ${turno.telefono}
            </a>
          </p>
        </div>
      `
            )
            .join('')}

      ${turnos.length > 0 ? `<p style="text-align:center; color:#4b5563; margin-top:20px;">Buen dia de trabajo.</p>` : ''}

      <div class="footer">
        <p>Email automatico generado por Turnos Web.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const multipleTurnosEmail = ({
  nombreCliente,
  telefono,
  email,
  cantidadPersonas,
  turnos,
}: MultipleTurnosEmailProps) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${baseStyles}
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); }
    .turno-item { background: #fff; border: 1px solid #d1d5db; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px; margin: 10px 0; }
    .badge { display: inline-block; background: #4f46e5; color: #fff; border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { display: inline-block; background: #16a34a; color: #fff; text-decoration: none; font-weight: 700; padding: 10px 18px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">${turnos.length} nuevos turnos reservados</h1>
      <p style="margin: 8px 0 0 0;">Turnos Web</p>
    </div>
    <div class="content">
      <p>Se registraron multiples turnos para un mismo cliente.</p>
      <div class="panel">
        <div class="row"><span class="label">Cliente:</span><span>${nombreCliente}</span></div>
        <div class="row"><span class="label">Telefono:</span><span>${telefono}</span></div>
        ${email ? `<div class="row"><span class="label">Email:</span><span>${email}</span></div>` : ''}
        <div class="row"><span class="label">Cantidad:</span><span>${cantidadPersonas} persona${cantidadPersonas > 1 ? 's' : ''}</span></div>
      </div>

      <h3 style="color:#4f46e5; margin-top:24px;">Turnos reservados</h3>
      ${turnos
        .map(
          (turno, index) => `
        <div class="turno-item">
          <span class="badge">Turno ${index + 1}</span>
          <p style="margin:6px 0;"><strong>Servicio:</strong> ${turno.servicio}</p>
          <p style="margin:6px 0;"><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}</p>
          <p style="margin:6px 0;"><strong>Hora:</strong> ${turno.hora} hs</p>
        </div>
      `
        )
        .join('')}

      <div class="cta">
        <a href="https://wa.me/${telefono.replace(/\D/g, '')}">Contactar por WhatsApp</a>
      </div>

      <div class="footer">
        <p>Email automatico generado por Turnos Web.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
