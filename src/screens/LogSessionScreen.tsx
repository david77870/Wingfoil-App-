import { useState } from 'react';
import type { CondicionActual, Spot } from '../types';
import { IconBack, IconPin, IconCalendar, IconMinus, IconPlus, IconWind, IconStar, IconChevronRight } from '../components/icons';
import { formatearDuracion, inputDatetimeLocalAhora } from '../lib/format';

const EQUIPO_DISPONIBLE = ['Ala 5m', 'Ala 4m', 'Ala 3m', 'Tabla 110L', 'Tabla 90L'];

interface Props {
  spot: Spot;
  condicion: CondicionActual | null;
  onCancelar: () => void;
  onGuardar: (datos: {
    fechaHoraISO: string;
    duracionMin: number;
    equipo: string[];
    calificacion: number;
  }) => void;
}

export default function LogSessionScreen({ spot, condicion, onCancelar, onGuardar }: Props) {
  const [fechaHora, setFechaHora] = useState(inputDatetimeLocalAhora());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [duracionMin, setDuracionMin] = useState(80);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<string[]>(['Ala 5m']);
  const [calificacion, setCalificacion] = useState(3);

  function toggleEquipo(item: string) {
    setEquipoSeleccionado((prev) => (prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]));
  }

  function guardar() {
    onGuardar({
      fechaHoraISO: new Date(fechaHora).toISOString(),
      duracionMin,
      equipo: equipoSeleccionado,
      calificacion,
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
          className="rise"
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
        </div>

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

        <div className="rise" style={{ background: 'var(--ink)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animationDelay: '160ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconWind color="var(--accent)" />
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Viento (auto)</div>
              <div className="disp" style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginTop: 1 }}>
                {condicion ? `${condicion.vientoNudos}-${condicion.rachaNudos}kt · ${condicion.direccionTexto}` : 'sin datos ahora'}
              </div>
            </div>
          </div>
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
