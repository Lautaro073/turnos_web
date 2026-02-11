import { z } from 'zod';

// ValidaciÃ³n para crear una cita
export const citaSchema = z.object({
  servicioId: z.string().min(1, 'Debes seleccionar un servicio'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha invÃ¡lido'),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora invÃ¡lido'),
  clienteNombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  clienteCelular: z.string()
    .regex(/^\+?\d{10,15}$/, 'NÃºmero de celular invÃ¡lido (10-15 dÃ­gitos)'),
});

// ValidaciÃ³n para servicio
export const servicioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  descripcion: z.string().min(5, 'La descripciÃ³n debe tener al menos 5 caracteres'),
  precio: z.number().min(0, 'El precio debe ser mayor a 0'),
  duracionMinutos: z.number().min(5, 'La duraciÃ³n mÃ­nima es 5 minutos').max(480, 'La duraciÃ³n mÃ¡xima es 8 horas'),
  activo: z.boolean().default(true),
});

// ValidaciÃ³n para horario
export const horarioSchema = z.object({
  diaSemana: z.number().min(0).max(6),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora invÃ¡lido'),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora invÃ¡lido'),
  activo: z.boolean().default(true),
});

// ValidaciÃ³n para configuraciÃ³n
export const configuracionSchema = z.object({
  emailNotificaciones: z.string().email('Email invÃ¡lido'),
  whatsappContacto: z.string().regex(/^\+?\d{10,15}$/, 'NÃºmero de WhatsApp invÃ¡lido'),
  nombreNegocio: z.string().min(3, 'El nombre del negocio debe tener al menos 3 caracteres'),
  logoUrl: z.string().url('URL de logo invÃ¡lida').optional(),
});

export type CitaInput = z.infer<typeof citaSchema>;
export type ServicioInput = z.infer<typeof servicioSchema>;
export type HorarioInput = z.infer<typeof horarioSchema>;
export type ConfiguracionInput = z.infer<typeof configuracionSchema>;

