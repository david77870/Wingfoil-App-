import { useState } from 'react';
import type { Spot } from '../types';
import { IconBack, IconPin, IconTrash } from '../components/icons';

interface Props {
  spot: Spot;
  sesionesCount: number;
  onCerrar: () => void;
  onGuardarSpot: (spot: Spot) => void;
  onBorrarTodo: () => void;
}

export default function SettingsScreen({ spot, sesionesCount, onCerrar, onGuardarSpot, onBorrarTodo }: Props) {
  const [spotNombre, setSpotNombre] = useState(spot.nombre);
  const [spotLat, setSpotLat] = useState(spot.lat);
  const [spotLon, setSpotLon] = useState(spot.lon);
  const [ubicando, setUbicando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function usarMiUbicacion() {
    if (!navigator.geolocation) return;
    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSpotLat(Number(pos.coords.latitude.toFixed(4)));
        setSpotLon(Number(pos.coords.longitude.toFixed(4)));
        setUbicando(false);
      },
      () => setUbicando(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function guardarSpot() {
    onGuardarSpot({ id: spot.id, nombre: spotNombre.trim() || spot.nombre, lat: spotLat, lon: spotLon });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 1600);
  }

  function borrarTodo() {
    const ok = window.confirm(`¿Borrar las ${sesionesCount} sesiones guardadas en este dispositivo? Esta acción no se puede deshacer.`);
    if (ok) onBorrarTodo();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 20px 6px 20px' }}>
        <button
          className="press"
          onClick={onCerrar}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'var(--card-alt)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconBack />
        </button>
        <div className="disp" style={{ fontSize: 16, fontWeight: 700 }}>
          Ajustes
        </div>
        <div style={{ width: 34, height: 34 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="rise" style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '40ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <IconPin />
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Spot por defecto</div>
          </div>
          <input
            type="text"
            value={spotNombre}
            onChange={(e) => setSpotNombre(e.target.value)}
            placeholder="Nombre del spot"
            style={{
              width: '100%',
              minWidth: 0,
              boxSizing: 'border-box',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 14,
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="number"
              value={spotLat}
              onChange={(e) => setSpotLat(Number(e.target.value))}
              placeholder="Latitud"
              step="0.0001"
              style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--ink)' }}
            />
            <input
              type="number"
              value={spotLon}
              onChange={(e) => setSpotLon(Number(e.target.value))}
              placeholder="Longitud"
              step="0.0001"
              style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--ink)' }}
            />
          </div>
          <button
            className="press"
            onClick={usarMiUbicacion}
            disabled={ubicando}
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 600,
              background: 'var(--card-alt)',
              color: 'var(--ink)',
              marginBottom: 10,
            }}
          >
            {ubicando ? 'Ubicando…' : '📍 Usar mi ubicación actual'}
          </button>
          <button
            className="press"
            onClick={guardarSpot}
            style={{
              width: '100%',
              border: 'none',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 600,
              background: guardado ? '#43c07f' : 'var(--ink)',
              color: '#ffffff',
            }}
          >
            {guardado ? 'Guardado ✓' : 'Guardar spot'}
          </button>
        </div>

        <div className="rise" style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '80ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 6 }}>Tus datos</div>
          <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 12 }}>
            {sesionesCount} {sesionesCount === 1 ? 'sesión' : 'sesiones'} guardada{sesionesCount === 1 ? '' : 's'} solo en este dispositivo.
          </div>
          <button
            className="press"
            onClick={borrarTodo}
            disabled={sesionesCount === 0}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              border: '1px solid var(--danger)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 600,
              background: 'none',
              color: 'var(--danger)',
              opacity: sesionesCount === 0 ? 0.4 : 1,
            }}
          >
            <IconTrash color="var(--danger)" size={14} />
            Borrar todo el historial
          </button>
        </div>

        <div className="rise" style={{ background: 'var(--card-alt)', borderRadius: 14, padding: '14px 16px', animationDelay: '120ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 6 }}>Acerca de</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Wingfoil v1 · React + Vite · Viento en vivo de Open-Meteo · Todo se guarda en este dispositivo, no hay cuenta ni backend.
          </div>
        </div>
      </div>
    </div>
  );
}
