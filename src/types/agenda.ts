export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  icono: string;
  activo: boolean;
  orden?: number;
}

export type EstadoTurno = 'pendiente' | 'confirmado' | 'completado' | 'cancelado';

export interface FranjaHoraria {
  horaInicio: string;
  horaFin: string;
}

export interface HorarioDiaConfig {
  dia: string;
  activo: boolean;
  franjas?: FranjaHoraria[];
  horaInicio?: string;
  horaFin?: string;
}

export interface HorariosResponse {
  horarios?: HorarioDiaConfig[];
}

export interface CitaResumen {
  id: string;
  hora: string;
  estado: EstadoTurno;
}

export interface CitaTurno {
  id: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  email?: string | null;
  estado: EstadoTurno;
  cantidadPersonas?: number;
  createdAt?: unknown;
}

export interface CitasResponse {
  citas?: CitaResumen[];
  error?: string;
}

export type SelectedTimesByDate = Record<string, string[]>;
export type HorariosPorFecha = Record<string, string[]>;

export interface ReservaPayload {
  servicioId: string;
  fecha: string;
  hora: string;
  nombre: string;
  telefono: string;
  cantidadPersonas: number;
  email?: string;
}

export interface ReservaExitosa {
  fecha: string;
  hora: string;
  servicio: string;
}

export interface ApiErrorResponse {
  code?: string;
  error?: string;
}
