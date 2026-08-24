import type { CondicionActual, PronosticoDia, Sesion, Spot } from '../types';
import ScreenHeader from '../components/ScreenHeader';
import { IconArrowUp, IconPlus } from '../components/icons';
import { formatearFechaHoy } from '../lib/format';

interface Props {
  spot: Spot;
  condicion: CondicionActual | null;
  pronostico: PronosticoDia | null;
  cargando: boolean;
  error: boolean;
  sesiones: Sesion[];
  onNuevaSesion: () => void;
}

function calcularRachaDias(sesiones: Sesion[]): number {
  if (sesiones.length === 0) return 0;
  const dias = new Set(sesiones.map((s) => new Date(s.fechaHoraISO).toDateString()));
  let racha = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  // si no hubo sesión hoy, el día "actual" para contar racha es ayer
  if (!dias.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (dias.has(cursor.toDateString())) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

export default function WindScreen({ spot, condicion, pronostico, cargando, error, sesiones, onNuevaSesion }: Props) {
  const racha = calcularRachaDias(sesiones);
  const maxViento = pronostico?.horas.length
    ? Math.max(...pronostico.horas.map((h) => h.vientoNudos), 1)
    : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ScreenHeader title={spot.nombre} subtitle={condicion ? formatearFechaHoy(condicion.actualizadoISO) : 'actualizando…'} />

      <div className="rise" style={{ padding: '0 20px', animationDelay: '60ms' }}>
        <div style={{ background: 'var(--ink)', borderRadius: 20, padding: '26px 24px', position: 'relative', overflow: 'hidden' }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: 'absolute', right: -30, top: -30, opacity: 0.9 }}>
            <circle cx="75" cy="75" r="70" fill="none" stroke="#1c3654" strokeWidth="1" />
          </svg>
          {error && !condicion ? (
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 15, color: '#ffffff', fontWeight: 600 }}>Sin datos de viento</div>
              <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>
                No pudimos conectar con el servicio de pronóstico. Revisá tu conexión.
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, position: 'relative' }}>
                <div className="disp" style={{ fontSize: 64, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                  {condicion ? condicion.vientoNudos : cargando ? '–' : '–'}
                </div>
                <div style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>
                  kt {condicion?.direccionTexto ?? ''}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 6 }}>
                {condicion ? `Racha ${condicion.rachaNudos}kt · ${condicion.tempAireC}° de aire` : cargando ? 'Cargando pronóstico…' : 'Sin datos por ahora'}
              </div>
              {pronostico && pronostico.horas.length > 1 && pronostico.horas[1].vientoNudos > pronostico.horas[0].vientoNudos && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16 }}>
                  <IconArrowUp />
                  <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>Subiendo la próxima hora</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '14px 20px 0 20px' }}>
        <StatCard label="Aire" value={condicion ? `${condicion.tempAireC}°` : '—'} delay="120ms" />
        <StatCard label="Sesiones" value={String(sesiones.length)} delay="150ms" />
        <StatCard label="Racha" value={racha > 0 ? `${racha}d` : '—'} delay="180ms" accent={racha > 0} />
      </div>

      <div style={{ padding: '22px 20px 0 20px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Pronóstico de hoy</div>
        </div>
        {pronostico && pronostico.horas.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {pronostico.horas.map((h, i) => {
              const alto = Math.max(20, Math.round((h.vientoNudos / maxViento) * 64));
              const esFuerte = h.vientoNudos === maxViento;
              return (
                <div key={h.horaISO} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div
                    className="disp"
                    style={{ fontSize: 12, fontWeight: esFuerte ? 700 : 600, color: esFuerte ? 'var(--accent)' : 'var(--ink)' }}
                  >
                    {h.vientoNudos}
                  </div>
                  <div
                    className="bar-grow"
                    style={{
                      width: '100%',
                      height: alto,
                      background: esFuerte ? 'var(--accent)' : 'var(--card-alt)',
                      borderRadius: 6,
                      animationDelay: `${220 + i * 30}ms`,
                    }}
                  />
                  <div style={{ fontSize: 10, color: esFuerte ? 'var(--accent)' : 'var(--muted)', fontWeight: esFuerte ? 600 : 400 }}>
                    {h.hora}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{cargando ? 'Cargando…' : 'Sin pronóstico disponible.'}</div>
        )}
      </div>

      <div style={{ padding: '0 20px 14px 20px' }}>
        <button
          className="press"
          onClick={onNuevaSesion}
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
          <IconPlus />
          Registrar sesión
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, delay, accent }: { label: string; value: string; delay: string; accent?: boolean }) {
  return (
    <div
      className="rise"
      style={{
        flex: 1,
        background: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 14,
        animationDelay: delay,
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.3px', textTransform: 'uppercase' }}>{label}</div>
      <div className="disp" style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: accent ? 'var(--accent)' : 'var(--ink)' }}>
        {value}
      </div>
    </div>
  );
}
