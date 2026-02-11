'use client';

import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReservaExitosa, SelectedTimesByDate } from '@/types/agenda';

interface ConfirmReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTimes: SelectedTimesByDate;
  selectedServiceName: string;
  totalTurnos: number;
  confirmando: boolean;
  onConfirm: () => void;
}

export function ConfirmReservationDialog({
  open,
  onOpenChange,
  selectedTimes,
  selectedServiceName,
  totalTurnos,
  confirmando,
  onConfirm,
}: ConfirmReservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Confirmar {totalTurnos} turno{totalTurnos > 1 ? 's' : ''}
          </DialogTitle>
          <DialogDescription>Estas por reservar los siguientes turnos:</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(selectedTimes).flatMap(([fechaKey, horas]) => {
              const fecha = new Date(`${fechaKey}T00:00:00`);
              return horas.map((hora) => (
                <div key={`${fechaKey}-${hora}`} className="bg-accent p-3 rounded-lg">
                  <p className="font-semibold text-foreground text-sm">{selectedServiceName}</p>
                  <p className="text-xs text-muted-foreground">
                    📅 {fecha.toLocaleDateString('es-AR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    - 🕐 {hora} hs
                  </p>
                </div>
              ));
            })}
          </div>

          <div className="border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-3">
            <p className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <AlertCircle className="h-4 w-4" />
              Politicas importantes:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                <span>
                  Cancelaciones: con <strong>2 horas de anticipacion</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                <span>
                  Llega entre <strong>10 y 5 minutos antes</strong> del turno
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                <span>
                  Tiempo de espera: <strong>maximo 5 minutos</strong>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={confirmando}>
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={confirmando}>
            {confirmando ? 'Confirmando...' : 'Confirmar reserva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SuccessReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservas: ReservaExitosa[];
}

export function SuccessReservationDialog({
  open,
  onOpenChange,
  reservas,
}: SuccessReservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 animate-in zoom-in duration-300" />
          </div>
          <DialogTitle className="text-2xl">
            Turno{reservas.length > 1 ? 's' : ''} reservado{reservas.length > 1 ? 's' : ''}!
          </DialogTitle>
          <DialogDescription className="text-base">
            {reservas.length > 1 ? 'Tus turnos fueron' : 'Tu turno fue'} confirmado
            {reservas.length > 1 ? 's' : ''} con exito
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {reservas.map((reserva, index) => (
              <div key={`${reserva.fecha}-${reserva.hora}-${index}`} className="bg-accent p-4 rounded-lg space-y-2 text-left">
                <p className="font-semibold text-foreground">{reserva.servicio}</p>
                <p className="text-sm text-muted-foreground">{reserva.fecha}</p>
                <p className="text-sm text-muted-foreground">{reserva.hora} hs</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Recorda llegar entre 10 y 5 minutos antes de {reservas.length > 1 ? 'cada turno' : 'tu turno'}.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ErrorReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}

export function ErrorReservationDialog({
  open,
  onOpenChange,
  message,
}: ErrorReservationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400 animate-in zoom-in duration-300" />
          </div>
          <DialogTitle className="text-2xl">Ups, hubo un problema</DialogTitle>
          <DialogDescription className="text-base">{message}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-lg text-left">
            <p className="text-sm text-muted-foreground">
              <strong>Sugerencias:</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
              <li>Elegi otro horario disponible.</li>
              <li>Proba con otra fecha.</li>
              <li>Si persiste, contactanos por WhatsApp.</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
