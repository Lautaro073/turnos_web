'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { es } from 'date-fns/locale';
import { getServicios } from '@/lib/servicios-cache';
import { ServiceOptionCard } from '@/components/cliente/reserva/ServiceOptionCard';
import {
    ConfirmReservationDialog,
    ErrorReservationDialog,
    SuccessReservationDialog,
} from '@/components/cliente/reserva/ReservationDialogs';
import {
    buildConsecutiveSlots,
    dayNamesMatch,
    DIAS_SEMANA,
    generateTimeSlots,
    toDateKey,
} from '@/lib/reservas';
import type {
    ApiErrorResponse,
    CitasResponse,
    HorarioDiaConfig,
    HorariosPorFecha,
    HorariosResponse,
    ReservaExitosa,
    ReservaPayload,
    SelectedTimesByDate,
    Servicio,
} from '@/types/agenda';

export default function ServiceSelector() {
    const searchParams = useSearchParams();
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [cargandoServicios, setCargandoServicios] = useState(true);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<SelectedTimesByDate>({});
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [cantidadPersonas, setCantidadPersonas] = useState('1');
    const [horariosDisponiblesPorFecha, setHorariosDisponiblesPorFecha] = useState<HorariosPorFecha>({});
    const [configuracionHorarios, setConfiguracionHorarios] = useState<HorarioDiaConfig[] | null>(null);
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [fechasSinHorario, setFechasSinHorario] = useState<Date[]>([]);
    const [mostrarDialogoConfirmacion, setMostrarDialogoConfirmacion] = useState(false);
    const [mostrarDialogoExito, setMostrarDialogoExito] = useState(false);
    const [mostrarDialogoError, setMostrarDialogoError] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    const [confirmando, setConfirmando] = useState(false);
    const [datosReservas, setDatosReservas] = useState<ReservaExitosa[]>([]);

    useEffect(() => {
        const cargarServicios = async () => {
            setCargandoServicios(true);
            const data = await getServicios();
            setServicios(data);
            setCargandoServicios(false);
            const servicioId = searchParams.get('servicio');
            if (servicioId && data.find(s => s.id === servicioId)) {
                setSelectedService(servicioId);
            }
        };
        cargarServicios();
    }, [searchParams]);

    useEffect(() => {
        const cargarConfiguracion = async () => {
            try {
                const response = await fetch('/api/horarios');
                const data: HorariosResponse = await response.json();
                setConfiguracionHorarios(Array.isArray(data.horarios) ? data.horarios : []);
            } catch (error) {
                console.error('Error al cargar configuracion:', error);
            }
        };
        cargarConfiguracion();
    }, []);

    const verificarHorariosDisponibles = useCallback(async (fecha: Date): Promise<string[]> => {
        if (!configuracionHorarios) return [];

        const diaSemana = DIAS_SEMANA[fecha.getDay()];
        const configDia = configuracionHorarios.find((d) => dayNamesMatch(d.dia, diaSemana));

        if (!configDia || !configDia.activo) return [];

        const servicioSeleccionado = servicios.find(s => s.id === selectedService);
        const duracion = servicioSeleccionado?.duracionMinutos || 40;
        const cantidad = Number.parseInt(cantidadPersonas || '1', 10) || 1;
        let horariosGenerados: string[] = [];

        if (configDia.franjas && Array.isArray(configDia.franjas)) {
            configDia.franjas.forEach((franja) => {
                const horariosFramja = generateTimeSlots(franja.horaInicio, franja.horaFin, duracion);
                horariosGenerados = [...horariosGenerados, ...horariosFramja];
            });
        } else if (configDia.horaInicio && configDia.horaFin) {
            horariosGenerados = generateTimeSlots(configDia.horaInicio, configDia.horaFin, duracion);
        }

        try {
            const fechaStr = toDateKey(fecha);
            const response = await fetch(`/api/citas?fecha=${fechaStr}`);
            const data: CitasResponse = await response.json();
            const horariosOcupados = data.citas?.map((cita) => cita.hora) || [];
            let horariosLibres = horariosGenerados.filter(h => !horariosOcupados.includes(h));

            const hoy = new Date();
            const esHoy = fecha.toDateString() === hoy.toDateString();
            if (esHoy) {
                const horaActual = hoy.getHours();
                const minutosActuales = hoy.getMinutes();
                const tiempoActualEnMinutos = horaActual * 60 + minutosActuales;
                horariosLibres = horariosLibres.filter(horario => {
                    const [hora, minutos] = horario.split(':').map(Number);
                    const tiempoHorarioEnMinutos = hora * 60 + minutos;
                    return tiempoHorarioEnMinutos > tiempoActualEnMinutos + 30;
                });
            }

            if (cantidad > 1) {
                horariosLibres = horariosLibres.filter(horario => {
                    const [hora, minutos] = horario.split(':').map(Number);
                    let tiempoInicial = hora * 60 + minutos;
                    for (let i = 0; i < cantidad; i++) {
                        const horas = Math.floor(tiempoInicial / 60);
                        const mins = tiempoInicial % 60;
                        const horarioConsecutivo = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                        if (!horariosLibres.includes(horarioConsecutivo)) {
                            return false;
                        }
                        tiempoInicial += duracion;
                    }
                    return true;
                });
            }

            return horariosLibres;
        } catch (error) {
            console.error('Error al cargar citas:', error);
            return horariosGenerados;
        }
    }, [cantidadPersonas, configuracionHorarios, selectedService, servicios]);

    useEffect(() => {
        const cargarHorariosDisponibles = async () => {
            if (selectedDates.length === 0 || !configuracionHorarios) {
                setHorariosDisponiblesPorFecha({});
                setMostrarAlerta(false);
                return;
            }

            // Cargar horarios para cada fecha seleccionada
            const horariosPorFecha: HorariosPorFecha = {};

            for (const fecha of selectedDates) {
                const fechaKey = toDateKey(fecha);
                const horariosDeEstaFecha = await verificarHorariosDisponibles(fecha);
                horariosPorFecha[fechaKey] = horariosDeEstaFecha;
            }

            setHorariosDisponiblesPorFecha(horariosPorFecha);

            const hayAlgunHorario = Object.values(horariosPorFecha).some(h => h.length > 0);
            setMostrarAlerta(!hayAlgunHorario);
        };
        cargarHorariosDisponibles();
    }, [selectedDates, configuracionHorarios, selectedService, cantidadPersonas, servicios, verificarHorariosDisponibles]);

    const handleDateSelect = async (dates: Date[] | undefined) => {
        if (!dates || dates.length === 0) {
            setSelectedDates([]);
            setSelectedTimes({});
            setFechasSinHorario([]);
            return;
        }

        // Limpiar horarios de fechas que fueron deseleccionadas
        const newSelectedTimes = { ...selectedTimes };
        const fechasKeys = dates.map((d) => toDateKey(d));

        // Encontrar horarios que estan seleccionados actualmente
        const horariosExistentes = Object.values(newSelectedTimes).find(horas => horas.length > 0);

        // Eliminar horarios de fechas que ya no estan seleccionadas
        Object.keys(newSelectedTimes).forEach(fechaKey => {
            if (!fechasKeys.includes(fechaKey)) {
                delete newSelectedTimes[fechaKey];
            }
        });

        // Si hay horarios seleccionados, verificar disponibilidad en nuevas fechas
        const fechasNoDisponibles: Date[] = [];
        if (horariosExistentes && horariosExistentes.length > 0) {
            for (const fechaKey of fechasKeys) {
                if (!newSelectedTimes[fechaKey]) {
                    // Nueva fecha, verificar si el horario esta disponible
                    const fecha = new Date(fechaKey + 'T00:00:00');
                    const disponibles = await verificarHorariosDisponibles(fecha);

                    // Verificar si todos los horarios consecutivos estan disponibles
                    const todosDisponibles = horariosExistentes.every(h => disponibles.includes(h));

                    if (todosDisponibles) {
                        newSelectedTimes[fechaKey] = [...horariosExistentes];
                    } else {
                        fechasNoDisponibles.push(fecha);
                    }
                }
            }
        }

        setFechasSinHorario(fechasNoDisponibles);
        setSelectedTimes(newSelectedTimes);
        setSelectedDates(dates);
    };

    const handleTimeSelect = async (fecha: Date, hora: string) => {
        const servicioSeleccionado = servicios.find(s => s.id === selectedService);
        const duracion = servicioSeleccionado?.duracionMinutos || 40;
        const cantidad = Number.parseInt(cantidadPersonas || '1', 10) || 1;
        const horariosConsecutivos = buildConsecutiveSlots(hora, cantidad, duracion);

        const newSelectedTimes = { ...selectedTimes };
        const fechaKey = toDateKey(fecha);
        const horasActuales = newSelectedTimes[fechaKey] || [];
        const estaSeleccionado = horariosConsecutivos.every(h => horasActuales.includes(h));

        if (estaSeleccionado) {
            // Deseleccionar
            newSelectedTimes[fechaKey] = [];
        } else {
            // Seleccionar
            newSelectedTimes[fechaKey] = [...horariosConsecutivos];
        }

        setSelectedTimes(newSelectedTimes);
        setFechasSinHorario([]);
    };

    const handleMultipleTimeSelect = (fechas: Date[], hora: string) => {
        const servicioSeleccionado = servicios.find(s => s.id === selectedService);
        const duracion = servicioSeleccionado?.duracionMinutos || 40;
        const cantidad = Number.parseInt(cantidadPersonas || '1', 10) || 1;
        const horariosConsecutivos = buildConsecutiveSlots(hora, cantidad, duracion);

        const newSelectedTimes = { ...selectedTimes };

        // Verificar si todas las fechas tienen este horario seleccionado
        const todasSeleccionadas = fechas.every(fecha => {
            const fechaKey = toDateKey(fecha);
            const horasActuales = newSelectedTimes[fechaKey] || [];
            return horariosConsecutivos.every(h => horasActuales.includes(h));
        });

        // Seleccionar o deseleccionar para todas las fechas
        fechas.forEach(fecha => {
            const fechaKey = toDateKey(fecha);
            if (todasSeleccionadas) {
                newSelectedTimes[fechaKey] = [];
            } else {
                newSelectedTimes[fechaKey] = [...horariosConsecutivos];
            }
        });

        setSelectedTimes(newSelectedTimes);
        setFechasSinHorario([]);
    };

    const getTotalTurnos = () => {
        return Object.values(selectedTimes).reduce((total, horas) => total + horas.length, 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMostrarDialogoConfirmacion(true);
    };

    const confirmarReserva = async () => {
        if (!selectedService) return;
        setConfirmando(true);
        try {
            const reservas: ReservaPayload[] = [];
            for (const [fechaKey, horas] of Object.entries(selectedTimes)) {
                for (const hora of horas) {
                    const fecha = new Date(fechaKey + 'T00:00:00');
                    reservas.push({
                        servicioId: selectedService,
                        fecha: fecha.toISOString(),
                        hora,
                        nombre,
                        telefono,
                        cantidadPersonas: parseInt(cantidadPersonas || '1')
                    });
                }
            }
            if (reservas.length > 1) {
                const response = await fetch('/api/citas/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ citas: reservas, cantidadPersonas: parseInt(cantidadPersonas || '1') }),
                });
                const data: ApiErrorResponse = await response.json();
                if (!response.ok) {
                    if (data.code === 'HORARIO_OCUPADO') {
                        setMensajeError('Algunos horarios ya fueron ocupados. Por favor recarga y selecciona otros turnos.');
                    } else {
                        setMensajeError(data.error || 'Error al reservar algunos turnos.');
                    }
                    setMostrarDialogoError(true);
                    setMostrarDialogoConfirmacion(false);
                    setConfirmando(false);
                    return;
                }
            } else {
                const response = await fetch('/api/citas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reservas[0]),
                });
                const data: ApiErrorResponse = await response.json();
                if (!response.ok) {
                    if (data.code === 'HORARIO_OCUPADO') {
                        setMensajeError(data.error || 'Ese horario ya no esta disponible. Elige otro turno.');
                    } else {
                        setMensajeError(data.error || 'Error al reservar el turno.');
                    }
                    setMostrarDialogoError(true);
                    setMostrarDialogoConfirmacion(false);
                    setConfirmando(false);
                    return;
                }
            }
            const servicioNombre = servicios.find(s => s.id === selectedService)?.nombre || 'Servicio';
            const reservasExitosas = reservas.map(r => ({
                fecha: new Date(r.fecha).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }),
                hora: r.hora,
                servicio: servicioNombre
            }));
            setDatosReservas(reservasExitosas);
            setMostrarDialogoExito(true);
            setMostrarDialogoConfirmacion(false);
            setSelectedService(null);
            setSelectedDates([]);
            setSelectedTimes({});
            setNombre('');
            setTelefono('');
            setCantidadPersonas('1');
            setMostrarAlerta(false);
            setConfirmando(false);
        } catch (error) {
            console.error('Error:', error);
            setMensajeError('Error de conexion. Por favor verifica tu internet e intenta nuevamente.');
            setMostrarDialogoError(true);
            setMostrarDialogoConfirmacion(false);
            setConfirmando(false);
        }
    };

    const isFormValid = selectedService && getTotalTurnos() > 0 && nombre && telefono;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8 max-w-4xl mx-auto px-3 sm:px-0">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">1. Elige tu servicio</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    {cargandoServicios ? (
                        [...Array(2)].map((_, i) => (
                            <Card key={i} className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-muted rounded animate-pulse w-3/4"></div>
                                        <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                                        <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        servicios.map((servicio) => (
                            <ServiceOptionCard
                                key={servicio.id}
                                servicio={servicio}
                                selected={selectedService === servicio.id}
                                onSelect={() => setSelectedService(servicio.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {selectedService && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">2. Selecciona fecha y hora</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center md:items-start">
                            <Label className="mb-2 block">Fechas (puedes seleccionar varias)</Label>
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={handleDateSelect}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    if (date < today) return true;
                                    if (date.getDay() === 0) return true;
                                    const diaSemana = date.getDay();
                                    const ahora = new Date();
                                    const horaActual = ahora.getHours();
                                    const diaActual = ahora.getDay();
                                    const inicioSemanaActual = new Date(today);
                                    const diasDesdeInicio = today.getDay() === 0 ? 6 : today.getDay() - 1;
                                    inicioSemanaActual.setDate(today.getDate() - diasDesdeInicio);
                                    const finSemanaActual = new Date(inicioSemanaActual);
                                    finSemanaActual.setDate(inicioSemanaActual.getDate() + 6);
                                    const inicioProximaSemana = new Date(finSemanaActual);
                                    inicioProximaSemana.setDate(finSemanaActual.getDate() + 1);
                                    const finProximaSemana = new Date(inicioProximaSemana);
                                    finProximaSemana.setDate(inicioProximaSemana.getDate() + 6);
                                    if (diaSemana === 5 || diaSemana === 6) {
                                        return false;
                                    }
                                    if (diaSemana >= 1 && diaSemana <= 4) {
                                        const esPostDomingo16 = diaActual === 0 && horaActual >= 16;
                                        if (esPostDomingo16) {
                                            if (date >= inicioProximaSemana && date <= finProximaSemana) {
                                                return false;
                                            }
                                        }
                                        if (date >= inicioSemanaActual && date <= finSemanaActual) {
                                            return false;
                                        }
                                        return true;
                                    }
                                    return false;
                                }}
                                locale={es}
                                className="rounded-md border mx-auto md:mx-0"
                            />
                            {selectedDates.length > 0 && (
                                <div className="mt-4 p-3 bg-accent rounded-lg w-full">
                                    <p className="text-sm font-medium mb-2">{selectedDates.length} fecha(s) seleccionada(s):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDates.map((date, i) => (
                                            <Badge key={i} variant="secondary">
                                                {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <Label className="mb-2 block">
                                Horarios disponibles
                            </Label>
                            {parseInt(cantidadPersonas || '1') > 1 && (
                                <Alert className="mb-3 sm:mb-4 py-2 sm:py-3">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs sm:text-sm">
                                        Cada boton muestra el rango completo. Se reservaran {cantidadPersonas} turnos consecutivos.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {fechasSinHorario.length > 0 && (
                                <Alert className="mb-3 sm:mb-4 py-2 sm:py-3 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                                    <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                    <AlertDescription className="text-xs sm:text-sm text-orange-800 dark:text-orange-200">
                                        El horario no esta disponible para: {fechasSinHorario.map(f => f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })).join(', ')}
                                    </AlertDescription>
                                </Alert>
                            )}
                            {mostrarAlerta && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4" />
                                    <AlertDescription>
                                        Lo sentimos, no hay turnos disponibles. Por favor selecciona otra fecha.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {selectedDates.length > 0 ? (
                                <div className="space-y-4">
                                    {(() => {
                                        // Agrupar fechas por dia de la semana y horarios disponibles
                                        const gruposPorDia: { [key: string]: { fechas: Date[], horarios: string[] } } = {};

                                        selectedDates.forEach(fecha => {
                                            const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
                                            const fechaKey = toDateKey(fecha);
                                            const horariosDisponibles = horariosDisponiblesPorFecha[fechaKey] || [];

                                            if (!gruposPorDia[diaSemana]) {
                                                gruposPorDia[diaSemana] = { fechas: [], horarios: horariosDisponibles };
                                            } else {
                                                // Calcular interseccion de horarios
                                                gruposPorDia[diaSemana].horarios = gruposPorDia[diaSemana].horarios.filter(h =>
                                                    horariosDisponibles.includes(h)
                                                );
                                            }
                                            gruposPorDia[diaSemana].fechas.push(fecha);
                                        });

                                        const servicioSeleccionado = servicios.find(s => s.id === selectedService);
                                        const duracion = servicioSeleccionado?.duracionMinutos || 40;

                                        return Object.entries(gruposPorDia).map(([diaSemana, { fechas, horarios }]) => {
                                            const esMismoDia = fechas.length > 1;
                                            const primerFecha = fechas[0];

                                            return (
                                                <div key={diaSemana} className="border rounded-lg p-3 sm:p-4 bg-card">
                                                    <h4 className="font-semibold text-sm mb-3">
                                                        {esMismoDia
                                                            ? `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} (${fechas.length} fechas)`
                                                            : primerFecha.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
                                                        }
                                                    </h4>
                                                    {esMismoDia && (
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            {fechas.map(f => f.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })).join(', ')}
                                                        </p>
                                                    )}
                                                    {horarios.length > 0 ? (
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
                                                            {horarios.map((hora) => {
                                                                const cantidad = Number.parseInt(cantidadPersonas || '1', 10) || 1;
                                                                const horariosConsecutivos = buildConsecutiveSlots(hora, cantidad, duracion);

                                                                // Verificar si esta seleccionado en todas las fechas del grupo
                                                                const todasSeleccionadas = fechas.every(fecha => {
                                                                    const fechaKey = toDateKey(fecha);
                                                                    const horasSeleccionadas = selectedTimes[fechaKey] || [];
                                                                    return horariosConsecutivos.every(h => horasSeleccionadas.includes(h));
                                                                });
                                                                const ultimoHorario = horariosConsecutivos[horariosConsecutivos.length - 1];

                                                                return (
                                                                    <Button
                                                                        key={hora}
                                                                        type="button"
                                                                        variant={todasSeleccionadas ? 'default' : 'outline'}
                                                                        className={parseInt(cantidadPersonas || '1') > 1 ? "w-full text-[10px] sm:text-xs py-3 sm:py-4 col-span-2" : "w-full text-xs sm:text-sm py-2"}
                                                                        onClick={() => {
                                                                            if (fechas.length > 1) {
                                                                                handleMultipleTimeSelect(fechas, hora);
                                                                            } else {
                                                                                handleTimeSelect(fechas[0], hora);
                                                                            }
                                                                        }}
                                                                    >
                                                                        {parseInt(cantidadPersonas || '1') > 1 ? (
                                                                            <span className="flex flex-col items-center leading-tight">
                                                                                <span className="font-semibold">{hora} - {ultimoHorario}</span>
                                                                                <span className="text-[9px] sm:text-[10px] opacity-70">({cantidadPersonas} Personas)</span>
                                                                            </span>
                                                                        ) : hora}
                                                                    </Button>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">No hay horarios disponibles en comun</p>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                    {getTotalTurnos() > 0 && (
                                        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {getTotalTurnos()} turno(s) seleccionado(s)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 border rounded-md">
                                    Selecciona al menos una fecha primero
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedService && selectedDates.length > 0 && (
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">3. Tus datos</h2>
                    <Card className="p-4 sm:p-6">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="nombre">Nombre completo</Label>
                                <Input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    placeholder="Juan Perez"
                                    className="mt-1.5"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="telefono">Telefono/WhatsApp</Label>
                                <Input
                                    id="telefono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="3865123456"
                                    className="mt-1.5"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="cantidadPersonas">Cuantas personas van?</Label>
                                <Input
                                    id="cantidadPersonas"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={cantidadPersonas}
                                    onChange={(e) => {
                                        const valor = e.target.value;
                                        // Permitir borrar completamente el campo
                                        if (valor === '') {
                                            setCantidadPersonas('');
                                            setSelectedTimes({});
                                            setFechasSinHorario([]);
                                            return;
                                        }
                                        const num = parseInt(valor);
                                        if (!isNaN(num) && num >= 1 && num <= 10) {
                                            setCantidadPersonas(valor);
                                            setSelectedTimes({});
                                            setFechasSinHorario([]);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        // Al perder el foco, si esta vacio o invalido, poner 1
                                        const valor = e.target.value;
                                        if (valor === '' || parseInt(valor) < 1) {
                                            setCantidadPersonas('1');
                                            setSelectedTimes({});
                                            setFechasSinHorario([]);
                                        }
                                    }}
                                    className="mt-1.5"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">
                                    {parseInt(cantidadPersonas || '1') > 1 ? (
                                        <span className="font-medium text-orange-600 dark:text-orange-400">
                                            Al seleccionar un horario, se reservaran {cantidadPersonas} turnos consecutivos automaticamente
                                        </span>
                                    ) : 'Si van varias personas, indica la cantidad'}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {isFormValid && (
                <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full md:w-auto md:px-12">
                        Confirmar {getTotalTurnos()} Turno{getTotalTurnos() > 1 ? 's' : ''}
                    </Button>
                </div>
            )}

            <ConfirmReservationDialog
                open={mostrarDialogoConfirmacion}
                onOpenChange={setMostrarDialogoConfirmacion}
                selectedTimes={selectedTimes}
                selectedServiceName={servicios.find((s) => s.id === selectedService)?.nombre || 'Servicio'}
                totalTurnos={getTotalTurnos()}
                confirmando={confirmando}
                onConfirm={confirmarReserva}
            />

            <SuccessReservationDialog
                open={mostrarDialogoExito}
                onOpenChange={setMostrarDialogoExito}
                reservas={datosReservas}
            />

            <ErrorReservationDialog
                open={mostrarDialogoError}
                onOpenChange={setMostrarDialogoError}
                message={mensajeError}
            />
        </form>
    );
}

