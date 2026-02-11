export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miercoles',
  'Jueves',
  'Viernes',
  'Sabado',
] as const;

export function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function dayNamesMatch(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

export function buildConsecutiveSlots(
  startTime: string,
  blocks: number,
  stepMinutes: number
): string[] {
  const result: string[] = [];
  const [h, m] = startTime.split(':').map(Number);
  let current = h * 60 + m;

  for (let i = 0; i < blocks; i++) {
    const hour = Math.floor(current / 60);
    const minute = current % 60;
    result.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    current += stepMinutes;
  }

  return result;
}

export function generateTimeSlots(
  horaInicio: string,
  horaFin: string,
  duracionMinutos = 40
): string[] {
  const horarios: string[] = [];
  const [horaIni, minIni] = horaInicio.split(':').map(Number);
  const [horaFinal, minFinal] = horaFin.split(':').map(Number);

  let minutoActual = horaIni * 60 + minIni;
  const minutoFin = horaFinal * 60 + minFinal;

  while (minutoActual + duracionMinutos <= minutoFin + 30) {
    const horas = Math.floor(minutoActual / 60);
    const minutos = minutoActual % 60;
    horarios.push(`${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`);
    minutoActual += duracionMinutos;
  }

  return horarios;
}

export function getValidServiceIcon(icono?: string | null): string | null {
  const value = (icono || '').trim();

  if (!value) {
    return null;
  }

  // Common mojibake markers when UTF-8 text is interpreted as Latin-1.
  if (/[\u00C3\u00C2\u00E2]/.test(value)) {
    return null;
  }

  // Only pictographic icons count as "real" icons.
  if (!/\p{Extended_Pictographic}/u.test(value)) {
    return null;
  }

  return value;
}

export function formatServiceName(icono: string | undefined | null, nombre: string): string {
  const cleanName = nombre?.trim() || 'Servicio';
  const validIcon = getValidServiceIcon(icono);
  return validIcon ? `${validIcon} ${cleanName}` : cleanName;
}

export function getVisibleServiceIcon(icono: string | undefined | null, nombre: string): string {
  const fallback = nombre?.trim()?.charAt(0)?.toUpperCase() || 'S';
  const validIcon = getValidServiceIcon(icono);
  return validIcon || fallback;
}
