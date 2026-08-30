// Persistencia local (localStorage) de sesiones y configuración del spot.
// v1: todo vive en el dispositivo, sin backend.

import type { Sesion, Spot } from '../types';

const KEY_SESIONES = 'wingfoil.sesiones.v1';
const KEY_SPOT = 'wingfoil.spot.v1';

const SPOT_DEFAULT: Spot = {
  id: 'laguna-setubal',
  nombre: 'Laguna Setúbal',
  lat: -31.6151,
  lon: -60.6926,
};

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function obtenerSesiones(): Sesion[] {
  try {
    const raw = localStorage.getItem(KEY_SESIONES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarSesion(sesion: Omit<Sesion, 'id'>): Sesion {
  const nueva: Sesion = { ...sesion, id: generarId() };
  const actuales = obtenerSesiones();
  const actualizadas = [nueva, ...actuales].sort(
    (a, b) => new Date(b.fechaHoraISO).getTime() - new Date(a.fechaHoraISO).getTime()
  );
  localStorage.setItem(KEY_SESIONES, JSON.stringify(actualizadas));
  return nueva;
}

export function eliminarSesion(id: string): void {
  const actuales = obtenerSesiones().filter((s) => s.id !== id);
  localStorage.setItem(KEY_SESIONES, JSON.stringify(actuales));
}

export function obtenerSpot(): Spot {
  try {
    const raw = localStorage.getItem(KEY_SPOT);
    if (!raw) return SPOT_DEFAULT;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
      return parsed as Spot;
    }
    return SPOT_DEFAULT;
  } catch {
    return SPOT_DEFAULT;
  }
}

export function guardarSpot(spot: Spot): void {
  localStorage.setItem(KEY_SPOT, JSON.stringify(spot));
}
