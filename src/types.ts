// Tipos compartidos de la app

export type EquipoAla = string;
export type EquipoTabla = string;

export interface Sesion {
  id: string;
  spot: string;
  fechaHoraISO: string; // ISO local datetime string, e.g. "2026-08-24T16:40"
  duracionMin: number;
  ala: EquipoAla | null;
  tabla: EquipoTabla | null;
  calificacion: number; // 1-5
  vientoNudos: number | null; // capturado automáticamente al guardar, si estaba disponible
  vientoDireccion: string | null;
  notas?: string;
}

export interface Spot {
  id: string;
  nombre: string;
  lat: number;
  lon: number;
}

export interface CondicionActual {
  tempAguaAprox: number | null;
  tempAireC: number;
  vientoNudos: number;
  rachaNudos: number;
  direccionGrados: number;
  direccionTexto: string;
  actualizadoISO: string;
}

export interface PronosticoHora {
  hora: string; // "16h"
  horaISO: string;
  vientoNudos: number;
  direccionGrados: number;
}

export interface PronosticoDia {
  fechaISO: string;
  horas: PronosticoHora[];
}

export interface PronosticoDiario {
  fechaISO: string; // "2026-08-31"
  diaLabel: string; // "hoy", "lun", "mar"...
  vientoMaxNudos: number;
  rachaMaxNudos: number;
  direccionGrados: number;
  tempMaxC: number;
  tempMinC: number;
  weatherCode: number;
}
