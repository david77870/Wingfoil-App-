// Cliente para la API pública de Open-Meteo (sin API key, uso no comercial).
// Docs: https://open-meteo.com/en/docs
//
// Nota: en el sandbox de desarrollo no tuve acceso de red para verificar esta
// respuesta en vivo (proxy del entorno bloquea api.open-meteo.com). El shape
// de abajo sigue el formato documentado y estable de Open-Meteo:
//   - "current" y "hourly" devuelven las variables pedidas como claves planas
//     con el mismo nombre que se pidió (ej: wind_speed_10m).
//   - "hourly.time" es un array de strings ISO (uno por hora).
//   - Vienen acompañados de "current_units" / "hourly_units" con las unidades.
// El parseo de abajo es defensivo: si algún campo no viene, no rompe la app.

import type { CondicionActual, PronosticoDia, PronosticoHora } from '../types';

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
  hourly?: {
    time?: string[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
    wind_gusts_10m?: number[];
    temperature_2m?: number[];
  };
}

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export function direccionATexto(grados: number): string {
  const puntos = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const idx = Math.round(grados / 45) % 8;
  return puntos[idx];
}

async function fetchForecast(lat: number, lon: number): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m',
    current: 'temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    wind_speed_unit: 'kn',
    timezone: 'auto',
    forecast_days: '2',
  });
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Open-Meteo respondió ${res.status}`);
  }
  return (await res.json()) as OpenMeteoResponse;
}

export async function obtenerCondicionActual(lat: number, lon: number): Promise<CondicionActual | null> {
  try {
    const data = await fetchForecast(lat, lon);
    const c = data.current;
    if (!c || c.wind_speed_10m == null) return null;
    const direccionGrados = c.wind_direction_10m ?? 0;
    return {
      tempAguaAprox: null,
      tempAireC: Math.round(c.temperature_2m ?? 0),
      vientoNudos: Math.round(c.wind_speed_10m),
      rachaNudos: Math.round(c.wind_gusts_10m ?? c.wind_speed_10m),
      direccionGrados,
      direccionTexto: direccionATexto(direccionGrados),
      actualizadoISO: c.time ?? new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error obteniendo condición actual de Open-Meteo:', err);
    return null;
  }
}

export async function obtenerPronosticoHoy(lat: number, lon: number): Promise<PronosticoDia | null> {
  try {
    const data = await fetchForecast(lat, lon);
    const h = data.hourly;
    if (!h || !h.time || !h.wind_speed_10m) return null;

    const ahora = new Date();
    const horas: PronosticoHora[] = [];

    for (let i = 0; i < h.time.length && horas.length < 5; i++) {
      const t = new Date(h.time[i]);
      if (t < ahora) continue; // saltear horas pasadas
      const viento = h.wind_speed_10m[i];
      if (viento == null) continue;
      horas.push({
        hora: `${t.getHours()}h`,
        horaISO: h.time[i],
        vientoNudos: Math.round(viento),
        direccionGrados: h.wind_direction_10m?.[i] ?? 0,
      });
    }

    return {
      fechaISO: ahora.toISOString(),
      horas,
    };
  } catch (err) {
    console.error('Error obteniendo pronóstico de Open-Meteo:', err);
    return null;
  }
}
