import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { sendEmail, NOTIFICATION_EMAIL } from '@/lib/email-config';
import { formatServiceName } from '@/lib/reservas';
import type { CitaTurno } from '@/types/agenda';

type ServicioReporte = {
  id: string;
  nombre?: string;
  icono?: string;
  precio?: number;
};

type TopServicio = {
  nombreConIcono: string;
  cantidad: number;
};

function resolverPeriodoReporte(mes?: number, anio?: number) {
  // Si no llega mes/anio, se usa el mes anterior.
  if (mes && anio) {
    return { mes: mes, anio };
  }

  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  if (mesActual === 1) {
    return { mes: 12, anio: hoy.getFullYear() - 1 };
  }
  return { mes: mesActual - 1, anio: hoy.getFullYear() };
}

async function generarYEnviarReporte(mes?: number, anio?: number) {
  const periodo = resolverPeriodoReporte(mes, anio);
  const mesReporte = periodo.mes; // 1-12
  const anioReporte = periodo.anio;

  const inicioMes = new Date(anioReporte, mesReporte - 1, 1);
  const finMes = new Date(anioReporte, mesReporte, 0);
  const inicioStr = inicioMes.toISOString().split('T')[0];
  const finStr = finMes.toISOString().split('T')[0];

  const citasRef = collection(db, 'citas');
  const q = query(
    citasRef,
    where('fecha', '>=', `${inicioStr}T00:00:00`),
    where('fecha', '<=', `${finStr}T23:59:59`)
  );
  const citasSnapshot = await getDocs(q);
  const citas: CitaTurno[] = citasSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as CitaTurno));

  const serviciosSnapshot = await getDocs(collection(db, 'servicios'));
  const servicios: ServicioReporte[] = serviciosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ServicioReporte));

  const citasCompletadas = citas.filter((c) => c.estado === 'completado');
  const citasCanceladas = citas.filter((c) => c.estado === 'cancelado');
  const citasPendientes = citas.filter((c) => c.estado === 'pendiente');

  const gananciaTotal = citasCompletadas.reduce((total, cita) => {
    const servicio = servicios.find((s) => s.id === cita.servicioId);
    return total + (servicio?.precio || 0);
  }, 0);

  const serviciosCount = citasCompletadas.reduce<Record<string, number>>((acc, cita) => {
    acc[cita.servicioId] = (acc[cita.servicioId] || 0) + 1;
    return acc;
  }, {});

  const topServicios: TopServicio[] = Object.entries(serviciosCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([servicioId, count]) => {
      const servicio = servicios.find((s) => s.id === servicioId);
      const nombre = servicio?.nombre || 'Servicio';
      return {
        nombreConIcono: formatServiceName(servicio?.icono || '', nombre),
        cantidad: count,
      };
    });

  const nombreMes = new Date(anioReporte, mesReporte - 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 640px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #fff; padding: 28px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 24px; }
        .card { background: #fff; padding: 16px; margin: 12px 0; border-radius: 8px; }
        .stat-label { color: #6b7280; font-size: 13px; margin-bottom: 6px; }
        .stat-value { font-size: 30px; font-weight: 700; color: #059669; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
        .item { background: #fff; padding: 14px; border-radius: 8px; text-align: center; }
        .label { color: #6b7280; font-size: 12px; }
        .value { font-size: 24px; font-weight: 700; margin-top: 4px; }
        .services { list-style: none; padding: 0; margin: 0; }
        .services li { background: #fff; padding: 12px; margin: 10px 0; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
        .footer { background: #111827; color: #fff; text-align: center; padding: 18px; border-radius: 0 0 10px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">Reporte mensual</h1>
          <p style="margin: 6px 0 0 0;">${nombreMes}</p>
        </div>
        <div class="content">
          <div class="card">
            <div class="stat-label">Ganancia total del mes</div>
            <div class="stat-value">$${gananciaTotal.toLocaleString('es-AR')}</div>
          </div>

          <h3 style="margin-top: 24px; color: #1f2937;">Resumen de turnos</h3>
          <div class="grid">
            <div class="item"><div class="label">Total</div><div class="value" style="color:#2563eb;">${citas.length}</div></div>
            <div class="item"><div class="label">Completados</div><div class="value" style="color:#059669;">${citasCompletadas.length}</div></div>
            <div class="item"><div class="label">Cancelados</div><div class="value" style="color:#dc2626;">${citasCanceladas.length}</div></div>
            <div class="item"><div class="label">Pendientes</div><div class="value" style="color:#d97706;">${citasPendientes.length}</div></div>
          </div>

          ${topServicios.length > 0
            ? `
            <h3 style="margin-top: 24px; color: #1f2937;">Servicios mas solicitados</h3>
            <ul class="services">
              ${topServicios
                .map(
                  (s, i) => `
                <li>
                  <span>${i + 1}. ${s.nombreConIcono}</span>
                  <strong>${s.cantidad} veces</strong>
                </li>
              `
                )
                .join('')}
            </ul>
          `
            : ''}

          <div class="card" style="background:#fef3c7; border-left:4px solid #f59e0b;">
            <p style="margin:0; color:#92400e;">
              <strong>Consejo:</strong> Revisa estas metricas para detectar tendencias y mejoras.
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin:0;">Turnos Web</p>
          <p style="margin:5px 0 0 0; opacity:0.8; font-size:12px;">Sistema de gestion de turnos</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: NOTIFICATION_EMAIL,
    subject: `Reporte mensual - ${nombreMes} - Ganancia: $${gananciaTotal.toLocaleString('es-AR')}`,
    html: emailHtml,
  });

  return {
    success: true,
    message: 'Reporte enviado exitosamente',
    gananciaTotal,
    totalTurnos: citas.length,
  };
}

// GET - Cron automatico (idealmente el dia 1 de cada mes)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resultado = await generarYEnviarReporte();
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('Error al enviar reporte mensual automatico:', error);
    return NextResponse.json({ error: 'Error al generar el reporte automatico' }, { status: 500 });
  }
}

// POST - Envio manual desde panel admin
export async function POST(request: NextRequest) {
  try {
    const { mes, anio } = await request.json();

    if (!mes || !anio) {
      return NextResponse.json({ error: 'Mes y anio son requeridos' }, { status: 400 });
    }

    const resultado = await generarYEnviarReporte(Number(mes), Number(anio));
    return NextResponse.json(resultado, { status: 200 });
  } catch (error) {
    console.error('Error en POST reporte-mensual:', error);
    return NextResponse.json({ error: 'Error al enviar el reporte mensual' }, { status: 500 });
  }
}
