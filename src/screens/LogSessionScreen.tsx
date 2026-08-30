import { useState } from 'react';
import type { CondicionActual, Spot } from '../types';
import { IconBack, IconPin, IconCalendar, IconMinus, IconPlus, IconWind, IconStar, IconChevronRight } from '../components/icons';
import { formatearDuracion, inputDatetimeLocalAhora } from '../lib/format';

const EQUIPO_DISPONIBLE = ['Ala 5m', 'Ala 4m', 'Ala 3m', 'Tabla 110L', 'Tabla 90L'];
const DIRECCIONES = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];

interface Props {
  spot: Spot;
  condicion: CondicionActual | null;
  onCancelar: () => void;
  onGuardar: (datos: {
    fechaHoraISO: string;
    duracionMin: number;
    equipo: string[];
    calificacion: number;
    vientoNudos: number | null;
    vientoDireccion: string | null;
  }) => void;
  onGuardarSpot: (spot: Spot) => void;
}

export default function LogSessionScreen({ spot, condicion, onCancelar, onGuardar, onGuardarSpot }: Props) {
  const [fechaHora, setFechaHora] = useState(inputDatetimeLocalAhora());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [duracionMin, setDuracionMin] = useState(80);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string[]>(['Ala 5m']);
  const [calificacion, setCalificacion] = useState(3);

  const [mostrarSpot, setMostrarSpot] = useState(false);
  const [spotNombre, setSpotNombre] = useState(spot.nombre);
  const [spotLat, setSpotLat] = useState(spot.lat);
  const [spotLon, setSpotLon] = useState(spot.lon);
  const [ubicando, setUbicando] = useState(false);

  const [modoVientoManual, setModoVientoManual] = useState(false);
  const [vientoManual, setVientoManual] = useState(condicion?.vientoNudos ?? 15);
  const [rachaManual, setRachaManual] = useState(condicion?.rachaNudos ?? 18);
  const [direccionManual, setDireccionManual] = useState(condicion?.direccionTexto ?? 'NE');

  function toggleEquipo(item: string) {
    setEquipoSeleccionado((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

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

  function guardarSpotLocal() {
    onGuardarSpot({
      id: spot.id,
      nombre: spotNombre.trim() || spot.nombre,
      lat: spotLat,
      lon: spotLon,
    });
    setMostrarSpot(false);
  }

  function guardar() {
    const viento = modoVientoManual
      ? { vientoNudos: vientoManual, vientoDireccion: direccionManual }
      : { vientoNudos: condicion?.vientoNudos ?? null, vientoDireccion: condicion?.direccionTexto ?? null };
    onGuardar({
      fechaHoraISO: new Date(fechaHora).toISOString(),
      duracionMin,
      equipo: equipoSeleccionado,
      calificacion,
      ...viento,
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 20px 6px 20px' }}>
        <button
          className="press"
          onClick={onCancelar}
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
          Nueva sesión
        </div>
        <div style={{ width: 34, height: 34 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          className="rise press"
          onClick={() => setMostrarSpot((v) => !v)}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animationDelay: '40ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconPin />
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Spot</div>
              <div className="disp" style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>
                {spot.nombre}
              </div>
            </div>
          </div>
          <IconChevronRight />
        </div>
        {mostrarSpot && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <input
              type="text"
              value={spotNombre}
              onChange={(e) => setSpotNombre(e.target.value)}
              placeholder="Nombre del spot"
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 14,
                color: 'var(--ink)',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
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
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--card-alt)',
                color: 'var(--ink)',
              }}
            >
              {ubicando ? 'Ubicando…' : '📍 Usar mi ubicación actual'}
            </button>
            <button
              className="press"
              onClick={guardarSpotLocal}
              style={{
                border: 'none',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--ink)',
                color: '#ffffff',
              }}
            >
              Guardar spot
            </button>
          </div>
        )}

        <div
          className="rise press"
          onClick={() => setMostrarFecha((v) => !v)}
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animationDelay: '80ms',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconCalendar />
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Fecha y hora</div>
              <div className="disp" style={{ fontSize: 15, fontWeight: 600, marginTop: 1 }}>
                {new Date(fechaHora).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <IconChevronRight />
        </div>
        {mostrarFecha && (
          <input
            type="datetime-local"
            value={fechaHora}
            onChange={(e) => setFechaHora(e.target.value)}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--ink)',
              background: '#ffffff',
            }}
          />
        )}

        <div className="rise" style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '120ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>
            Duración
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              className="press"
              onClick={() => setDuracionMin((d) => Math.max(5, d - 5))}
              style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--card-alt)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconMinus />
            </button>
            <div className="disp" style={{ fontSize: 24, fontWeight: 700 }}>
              {formatearDuracion(duracionMin)}
            </div>
            <button
              className="press"
              onClick={() => setDuracionMin((d) => d + 5)}
              style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--ink)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconPlus />
            </button>
          </div>
        </div>

        <div className="rise" style={{ background: 'var(--ink)', borderRadius: 14, padding: '14px 16px', animationDelay: '160ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <IconWind color="var(--accent)" />
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.3px' }}>
                  Viento {modoVientoManual ? '(manual)' : '(auto)'}
                </div>
                <div className="disp" style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginTop: 1 }}>
                  {modoVientoManual
                    ? `${vientoManual}-${rachaManual}kt · ${direccionManual}`
                    : condicion
                      ? `${condicion.vientoNudos}-${condicion.rachaNudos}kt · ${condicion.direccionTexto}`
                      : 'sin datos ahora'}
                </div>
              </div>
            </div>
            <button
              className="press"
              onClick={() => setModoVientoManual((v) => !v)}
              style={{
                border: 'none',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 11,
                fontWeight: 600,
                background: modoVientoManual ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                color: '#ffffff',
              }}
            >
              {modoVientoManual ? 'Editando' : 'Corregir'}
            </button>
          </div>

          {modoVientoManual && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', marginBottom: 4 }}>Viento (kt)</div>
                  <input
                    type="number"
                    value={vientoManual}
                    onChange={(e) => setVientoManual(Number(e.target.value))}
                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', border: 'none', borderRadius: 10, padding: '8px 10px', fontSize: 14, background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-2)', marginBottom: 4 }}>Racha (kt)</div>
                  <input
                    type="number"
                    value={rachaManual}
                    onChange={(e) => setRachaManual(Number(e.target.value))}
                    style={{ width: '100%', minWidth: 0, boxSizing: 'border-box', border: 'none', borderRadius: 10, padding: '8px 10px', fontSize: 14, background: 'rgba(255,255,255,0.12)', color: '#ffffff' }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--muted-2)', marginBottom: 6 }}>Dirección</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIRECCIONES.map((d) => (
                    <button
                      key={d}
                      className="press"
                      onClick={() => setDireccionManual(d)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 20,
                        border: 'none',
                        fontSize: 12,
                        fontWeight: d === direccionManual ? 700 : 400,
                        background: d === direccionManual ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rise" style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '200ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>Equipo</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EQUIPO_DISPONIBLE.map((item) => {
              const sel = equipoSeleccionado.includes(item);
              return (
                <button
                  key={item}
                  className="press"
                  onClick={() => toggleEquipo(item)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 20,
                    background: sel ? 'var(--ink)' : 'var(--card-alt)',
                    color: sel ? '#ffffff' : 'var(--ink)',
                    fontSize: 12,
                    fontWeight: sel ? 600 : 400,
                    border: 'none',
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rise" style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '240ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>Cómo estuvo</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="press" onClick={() => setCalificacion(n)} style={{ background: 'none', border: 'none', padding: 0 }}>
                <IconStar filled={n <= calificacion} />
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 12 }} />
      </div>

      <div style={{ padding: '14px 20px max(20px, env(safe-area-inset-bottom)) 20px' }}>
        <button
          className="press"
          onClick={guardar}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'var(--accent)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 14,
            padding: 16,
            border: 'none',
          }}
        >
          Guardar sesión
        </button>
      </div>
    </div>
  );
}
