import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { sendEmail, NOTIFICATION_EMAIL } from '@/lib/email-config';
import { turnoCanceladoEmail } from '@/lib/email-templates';
import { formatServiceName } from '@/lib/reservas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, canceladoPorCliente } = body;

    if (!estado) {
      return NextResponse.json(
        { error: 'Falta el estado' },
        { status: 400 }
      );
    }

    const citaRef = doc(db, 'citas', id);
    await updateDoc(citaRef, {
      estado,
      updatedAt: new Date().toISOString(),
    });

    // Si fue cancelado por el cliente, enviar email de notificacion
    if (estado === 'cancelado' && canceladoPorCliente) {
      try {
        // Obtener datos del turno
        const turnoDoc = await getDoc(citaRef);
        const turnoData = turnoDoc.data();

        if (turnoData) {
          // Obtener nombre del servicio
          const serviciosRef = collection(db, 'servicios');
          const serviciosSnapshot = await getDocs(serviciosRef);
          const servicio = serviciosSnapshot.docs.find(doc => doc.id === turnoData.servicioId);
          const servicioNombre = servicio
            ? formatServiceName(servicio.data().icono || '', servicio.data().nombre || 'Servicio')
            : 'Servicio';

          const emailHtml = turnoCanceladoEmail({
            nombreCliente: turnoData.nombre,
            telefono: turnoData.telefono,
            servicio: servicioNombre,
            fecha: turnoData.fecha,
            hora: turnoData.hora,
          });

          await sendEmail({
            to: NOTIFICATION_EMAIL,
            subject: `Turno cancelado - ${new Date(turnoData.fecha).toLocaleDateString('es-AR')} ${turnoData.hora}hs`,
            html: emailHtml,
          });
        }
      } catch (emailError) {
        console.error('Error al enviar email de cancelacion:', emailError);
        // No falla la cancelacion si el email falla
      }
    }

    return NextResponse.json(
      { success: true, message: 'Turno actualizado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    return NextResponse.json(
      { error: 'Error al actualizar turno' },
      { status: 500 }
    );
  }
}


