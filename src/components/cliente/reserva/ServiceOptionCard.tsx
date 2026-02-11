'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getVisibleServiceIcon } from '@/lib/reservas';
import type { Servicio } from '@/types/agenda';

interface ServiceOptionCardProps {
  servicio: Servicio;
  selected: boolean;
  onSelect: () => void;
}

export function ServiceOptionCard({ servicio, selected, onSelect }: ServiceOptionCardProps) {
  return (
    <Card
      className={`p-3 sm:p-4 cursor-pointer transition-all ${
        selected ? 'ring-2 ring-primary bg-accent' : 'hover:border-primary/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
          {getVisibleServiceIcon(servicio.icono, servicio.nombre)}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">{servicio.nombre}</h3>
          {servicio.descripcion && (
            <p className="text-xs text-muted-foreground mt-0.5">{servicio.descripcion}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            ${servicio.precio.toLocaleString('es-AR')} ARS - {servicio.duracionMinutos} min
          </p>
        </div>
        {selected && <Badge>Seleccionado</Badge>}
      </div>
    </Card>
  );
}
