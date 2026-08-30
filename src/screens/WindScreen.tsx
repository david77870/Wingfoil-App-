import type { CondicionActual, PronosticoDia, PronosticoDiario, PronosticoHora, Sesion, Spot } from '../types';
import ScreenHeader from '../components/ScreenHeader';
import { IconPlus, IconSettings } from '../components/icons';
import { formatearFechaHoy } from '../lib/format';
import { iconoClima } from '../lib/openMeteo';

interface Props {
  spot: Spot;
  condicion: CondicionActual | null;
  pronostico: PronosticoDia | null;
  pronosticoSemana: PronosticoDiario[];
  cargando: boolean;
  error: boolean;
  sesiones: Sesion[];
  onNuevaSesion: () => void;
  onAjustes: () => void;
}

function categorizarViento(nudos: number): { label: string; color: string; bg: string; variante: string } {
  if (nudos < 7) return { label: 'Calma', color: '#7f97b3', bg: 'rgba(127,151,179,0.2)', variante: 'calma' };
  if (nudos < 16) return { label: 'Ideal para wing', color: '#168b96', bg: 'rgba(22,139,150,0.18)', variante: 'ideal' };
  if (nudos < 26) return { label: 'Fuerte', color: '#287fe0', bg: 'rgba(40,127,224,0.2)', variante: 'fuerte' };
  return { label: 'Día épico', color: '#e08a3d', bg: 'rgba(224,138,61,0.22)', variante: 'epico' };
}

function HydrofoilMark({ size = 300 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" fill="none">
      <path
        d="M150,26 C186,26 200,64 200,150 C200,236 186,274 150,274 C114,274 100,236 100,150 C100,64 114,26 150,26 Z"
        stroke="#ffffff"
        strokeWidth="1.4"
      />
      <line x1="150" y1="150" x2="150" y2="238" stroke="#ffffff" strokeWidth="1.4" />
      <line x1="107" y1="196" x2="193" y2="196" stroke="#ffffff" strokeWidth="1.4" />
      <line x1="128" y1="232" x2="172" y2="232" stroke="#ffffff" strokeWidth="1.4" />
    </svg>
  );
}

function Sparkline({ horas, maxViento }: { horas: PronosticoHora[]; maxViento: number }) {
  const w = 300;
  const h = 40;
  const pad = 6;
  const minViento = Math.min(...horas.map((h) => h.vientoNudos));
  const rango = Math.max(1, maxViento - minViento);
  const paso = horas.length > 1 ? (w - pad * 2) / (horas.length - 1) : 0;

  const puntos = horas.map((hora, i) => {
    const x = pad + i * paso;
    const y = pad + (1 - (hora.vientoNudos - minViento) / rango) * (h - pad * 2);
    return { x, y, valor: hora.vientoNudos };
  });

  const linea = puntos.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${pad},${h} ${linea} ${w - pad},${h}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      <polygon points={area} fill="var(--teal)" opacity="0.1" />
      <polyline points={linea} fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === puntos.length - 1 ? 4 : 2.5} fill={i === puntos.length - 1 ? 'var(--accent)' : 'var(--teal)'} />
      ))}
    </svg>
  );
}

function tendenciaViento(horas: PronosticoHora[]): { texto: string; simbolo: string; color: string } | null {
  if (horas.length < 2) return null;
  const delta = horas[horas.length - 1].vientoNudos - horas[0].vientoNudos;
  if (delta >= 2) return { texto: 'Aumentando', simbolo: '↑', color: 'var(--teal)' };
  if (delta <= -2) return { texto: 'Bajando', simbolo: '↓', color: 'var(--muted)' };
  return { texto: 'Estable', simbolo: '→', color: 'var(--muted)' };
}

function BrujulaViento({ grados, activo }: { grados: number; activo: boolean }) {
  return (
    <svg width="66" height="66" viewBox="0 0 66 66">
      <circle cx="33" cy="33" r="29" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
      <circle cx="33" cy="33" r="2" fill="rgba(255,255,255,0.3)" />
      <text x="33" y="10" textAnchor="middle" fontSize="8" fontWeight="700" fill="rgba(255,255,255,0.45)">
        N
      </text>
      {activo && (
        <g transform={`rotate(${grados} 33 33)`} style={{ transition: 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <line x1="33" y1="33" x2="33" y2="16" stroke="#287fe0" strokeWidth="3" strokeLinecap="round" />
          <polygon points="33,10 28,20 38,20" fill="#287fe0" />
        </g>
      )}
    </svg>
  );
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

export default function WindScreen({ spot, condicion, pronostico, pronosticoSemana, cargando, error, sesiones, onNuevaSesion, onAjustes }: Props) {
  const racha = calcularRachaDias(sesiones);
  const maxViento = pronostico?.horas.length
    ? Math.max(...pronostico.horas.map((h) => h.vientoNudos), 1)
    : 1;
  const maxVientoSemana = pronosticoSemana.length
    ? Math.max(...pronosticoSemana.map((d) => d.vientoMaxNudos), 1)
    : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ScreenHeader
        title={spot.nombre}
        subtitle={condicion ? formatearFechaHoy(condicion.actualizadoISO) : 'actualizando…'}
        rightIcon={<IconSettings />}
        onRightIconClick={onAjustes}
      />

      <div className="rise" style={{ padding: '0 20px', animationDelay: '60ms' }}>
        <div
          className={`wind-hero wind-hero--${condicion ? categorizarViento(condicion.vientoNudos).variante : 'ideal'}`}
          style={{
            borderRadius: 20,
            padding: '26px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div className="wind-hero-foil" style={{ right: -70, bottom: -90, transform: 'rotate(18deg)' }}>
            <HydrofoilMark size={280} />
          </div>

          {error && !condicion ? (
            <div className="wind-hero-content">
              <div style={{ fontSize: 15, color: '#ffffff', fontWeight: 600 }}>Sin datos de viento</div>
              <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>
                No pudimos conectar con el servicio de pronóstico. Revisá tu conexión.
              </div>
            </div>
          ) : (
            <div className="wind-hero-content">
              <div style={{ position: 'absolute', right: 18, top: 18 }}>
                <BrujulaViento grados={condicion?.direccionGrados ?? 0} activo={!!condicion} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <div className="disp" style={{ fontSize: 68, fontWeight: 700, color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
                  {condicion ? condicion.vientoNudos : cargando ? '–' : '–'}
                </div>
                <div style={{ fontSize: 16, color: '#7fc2ff', fontWeight: 600 }}>
                  kt {condicion?.direccionTexto ?? ''}
                </div>
              </div>

              {condicion &&
                (() => {
                  const cat = categorizarViento(condicion.vientoNudos);
                  return (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 10,
                        padding: '4px 10px',
                        borderRadius: 20,
                        background: cat.bg,
                      }}
                    >
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color }} />
                      <div style={{ fontSize: 11, fontWeight: 600, color: cat.color }}>{cat.label}</div>
                    </div>
                  );
                })()}

              <div style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 10 }}>
                {condicion ? `Racha ${condicion.rachaNudos}kt · ${condicion.tempAireC}° de aire` : cargando ? 'Cargando pronóstico…' : 'Sin datos por ahora'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '14px 20px 0 20px' }}>
        <StatCard label="Aire" value={condicion ? `${condicion.tempAireC}°` : '—'} delay="120ms" />
        <StatCard label="Sesiones" value={String(sesiones.length)} delay="150ms" />
        <StatCard label="Racha" value={racha > 0 ? `${racha}d` : '—'} delay="180ms" accent={racha > 0} />
      </div>

      <div style={{ padding: '22px 20px 0 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Pronóstico de hoy</div>
          {pronostico &&
            pronostico.horas.length > 1 &&
            (() => {
              const t = tendenciaViento(pronostico.horas);
              if (!t) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: t.color }}>
                  <span>{t.simbolo}</span>
                  {t.texto}
                </div>
              );
            })()}
        </div>
        {pronostico && pronostico.horas.length > 0 ? (
          <div>
            <Sparkline horas={pronostico.horas} maxViento={maxViento} />
            <div style={{ display: 'flex', marginTop: 6 }}>
              {pronostico.horas.map((h) => {
                const esFuerte = h.vientoNudos === maxViento;
                return (
                  <div key={h.horaISO} style={{ flex: 1, textAlign: 'center' }}>
                    <div className="disp" style={{ fontSize: 12, fontWeight: esFuerte ? 700 : 600, color: esFuerte ? 'var(--accent)' : 'var(--ink)' }}>
                      {h.vientoNudos}
                    </div>
                    <div style={{ fontSize: 10, color: esFuerte ? 'var(--accent)' : 'var(--muted)', fontWeight: esFuerte ? 600 : 400, marginTop: 2 }}>
                      {h.hora}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{cargando ? 'Cargando…' : 'Sin pronóstico disponible.'}</div>
        )}

        <div style={{ margin: '22px 0 2px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Pronóstico de la semana</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Clima y viento máximo · próximos 7 días</div>
        </div>
        {pronosticoSemana.length > 0 ? (
          <div
            className="no-scrollbar"
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              paddingBottom: 4,
              marginTop: 10,
              scrollSnapType: 'x proximity',
            }}
          >
            {pronosticoSemana.map((d, i) => {
              const esFuerte = d.vientoMaxNudos === maxVientoSemana;
              return (
                <div
                  key={d.fechaISO}
                  className="rise"
                  style={{
                    flex: '0 0 auto',
                    width: 68,
                    background: esFuerte ? 'var(--card-accent-soft)' : '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    animationDelay: `${240 + i * 30}ms`,
                    scrollSnapAlign: 'start',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'capitalize', color: esFuerte ? 'var(--accent)' : 'var(--ink)' }}>
                    {d.diaLabel}
                  </div>
                  <div style={{ fontSize: 22, lineHeight: 1 }}>{iconoClima(d.weatherCode)}</div>
                  <div className="disp" style={{ fontSize: 15, fontWeight: 700, color: esFuerte ? 'var(--accent)' : 'var(--ink)', lineHeight: 1 }}>
                    {d.vientoMaxNudos}
                    <span style={{ fontSize: 9, fontWeight: 400, color: 'var(--muted)' }}> kt</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                    {d.tempMaxC}°/{d.tempMinC}°
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>{cargando ? 'Cargando…' : 'Sin pronóstico disponible.'}</div>
        )}
        <div style={{ height: 6 }} />
      </div>

      <div style={{ padding: '14px 20px 14px 20px' }}>
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
