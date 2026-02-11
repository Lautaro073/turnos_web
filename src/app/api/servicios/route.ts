import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

export async function GET() {
  try {
    const serviciosRef = collection(db, 'servicios');
    const q = query(serviciosRef, orderBy('orden', 'asc'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Retornar servicios por defecto si no hay ninguno configurado
      return NextResponse.json({
        servicios: [
          {
            id: '1',
            nombre: 'Asesoria',
            descripcion: 'Atencion personalizada de 40 minutos',
            precio: 150,
            duracionMinutos: 40,
            icono: 'A',
            activo: true,
            orden: 1,
          },
          {
            id: '2',
            nombre: 'Reunion de Seguimiento',
            descripcion: 'Revision y plan de accion',
            precio: 250,
            duracionMinutos: 40,
            icono: 'R',
            activo: true,
            orden: 2,
          },
        ],
      });
    }

    const servicios = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ servicios });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    return NextResponse.json(
      { error: 'Error al obtener servicios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { servicios } = body;

    if (!servicios || !Array.isArray(servicios)) {
      return NextResponse.json(
        { error: 'Datos invalidos' },
        { status: 400 }
      );
    }

    // Eliminar servicios existentes
    const serviciosRef = collection(db, 'servicios');
    const querySnapshot = await getDocs(serviciosRef);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Guardar nuevos servicios
    const savePromises = servicios.map((servicio, index) => {
      const docRef = doc(serviciosRef, servicio.id);
      return setDoc(docRef, {
        ...servicio,
        orden: index + 1,
        updatedAt: new Date().toISOString(),
      });
    });

    await Promise.all(savePromises);

    return NextResponse.json(
      { success: true, message: 'Servicios guardados exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al guardar servicios:', error);
    return NextResponse.json(
      { error: 'Error al guardar servicios' },
      { status: 500 }
    );
  }
}

