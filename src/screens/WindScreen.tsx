import type { ReactNode } from 'react';
import type { CondicionActual, PronosticoDia, PronosticoDiario, PronosticoHora, Spot } from '../types';
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
  onNuevaSesion: () => void;
  onAjustes: () => void;
}

function categorizarViento(nudos: number): { label: string; color: string; bg: string; variante: string } {
  if (nudos < 7) return { label: 'Calma', color: '#7f97b3', bg: 'rgba(127,151,179,0.2)', variante: 'calma' };
  if (nudos < 16) return { label: 'Ideal para wing', color: '#168b96', bg: 'rgba(22,139,150,0.18)', variante: 'ideal' };
  if (nudos < 26) return { label: 'Fuerte', color: '#287fe0', bg: 'rgba(40,127,224,0.2)', variante: 'fuerte' };
  return { label: 'Día épico', color: '#e08a3d', bg: 'rgba(224,138,61,0.22)', variante: 'epico' };
}

// Silueta abstracta de hydrofoil visto desde arriba (ala frontal + mástil +
// estabilizador trasero), pensada para vivir como textura de fondo dentro
// del hero, no como ilustración protagonista.
function HydrofoilMark({ size = 300 }: { size?: number }) {
  const ala = 'M30,112 C88,72 128,96 150,100 C172,96 212,72 270,112 C212,124 172,110 150,108 C128,110 88,124 30,112 Z';
  const estabilizador = 'M112,228 C130,214 148,221 150,223 C152,221 170,214 188,228 C170,235 152,228 150,227 C148,228 130,235 112,228 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 300 300" fill="none">
      <defs>
        <filter id="foilGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g stroke="#8fe6ea" strokeWidth="6" opacity="0.35" filter="url(#foilGlow)">
        <path d={ala} />
        <line x1="150" y1="106" x2="150" y2="224" strokeWidth="5" />
        <path d={estabilizador} />
      </g>
      <g stroke="#eafcfd" strokeWidth="1.3">
        <path d={ala} />
        <line x1="150" y1="106" x2="150" y2="224" />
        <path d={estabilizador} />
      </g>
    </svg>
  );
}

// Cada corriente es un trazo continuo (sin guiones) coloreado por un
// gradiente que se desliza sobre él: así el brillo "viaja" por la curva y
// se apaga de forma gradual en las puntas, en vez de ir cortado en
// segmentos parejos (el efecto "hormiguitas en fila" de un dasharray).
function prefiereMovimientoReducido(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function WindCurrents() {
  const movimientoReducido = prefiereMovimientoReducido();
  const corrientes: {
    d: string;
    width: number;
    periodo: number;
    duracion: string;
    reverso?: boolean;
    perfil: 'estela' | 'destello';
  }[] = [
    { d: 'M-20,178 C80,148 140,208 240,168 C300,144 340,158 420,120', width: 1.5, periodo: 150, duracion: '12s', perfil: 'estela' },
    { d: 'M-20,58 C60,90 120,38 200,68 C280,98 340,48 420,78', width: 1.1, periodo: 110, duracion: '16s', perfil: 'destello' },
    { d: 'M-20,120 C100,100 160,150 260,110 C320,90 360,128 420,100', width: 1.9, periodo: 170, duracion: '14s', perfil: 'estela' },
    { d: 'M-20,26 C90,6 150,46 230,18 C300,-6 360,26 420,8', width: 0.9, periodo: 90, duracion: '19s', perfil: 'destello' },
    { d: 'M-20,208 C70,228 150,190 230,214 C300,234 350,204 420,224', width: 1, periodo: 130, duracion: '17s', reverso: true, perfil: 'estela' },
  ];

  return (
    <svg className="wind-hero-currents" viewBox="0 0 400 240" preserveAspectRatio="none">
      <defs>
        {corrientes.map((c, i) => {
          const stops =
            c.perfil === 'estela' ? (
              <>
                <stop offset="0%" stopColor="#eafcfd" stopOpacity="0" />
                <stop offset="18%" stopColor="#8fe6ea" stopOpacity="0.5" />
                <stop offset="46%" stopColor="#eafcfd" stopOpacity="1" />
                <stop offset="70%" stopColor="#8fe6ea" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#eafcfd" stopOpacity="0" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#eafcfd" stopOpacity="0" />
                <stop offset="42%" stopColor="#eafcfd" stopOpacity="0" />
                <stop offset="52%" stopColor="#eafcfd" stopOpacity="1" />
                <stop offset="62%" stopColor="#eafcfd" stopOpacity="0" />
                <stop offset="100%" stopColor="#eafcfd" stopOpacity="0" />
              </>
            );
          return (
            <linearGradient key={i} id={`flow-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={c.periodo} y2="0" spreadMethod="repeat">
              {stops}
              {!movimientoReducido && (
                <animateTransform
                  attributeName="gradientTransform"
                  type="translate"
                  from={c.reverso ? `${c.periodo} 0` : '0 0'}
                  to={c.reverso ? '0 0' : `${c.periodo} 0`}
                  dur={c.duracion}
                  repeatCount="indefinite"
                />
              )}
            </linearGradient>
          );
        })}
      </defs>
      {corrientes.map((c, i) => (
        <path key={`glow-${i}`} className="corriente corriente--glow" d={c.d} stroke={`url(#flow-${i})`} strokeWidth={c.width + 2.2} />
      ))}
      {corrientes.map((c, i) => (
        <path key={`line-${i}`} className="corriente" d={c.d} stroke={`url(#flow-${i})`} strokeWidth={c.width} />
      ))}
    </svg>
  );
}

function WindParticles() {
  const puntos = [
    { x: 60, y: 40, r: 1.6, delay: '0s' },
    { x: 140, y: 90, r: 1.1, delay: '-3s' },
    { x: 220, y: 30, r: 1.4, delay: '-6s' },
    { x: 300, y: 70, r: 1, delay: '-9s' },
    { x: 90, y: 130, r: 1.3, delay: '-2s' },
    { x: 260, y: 130, r: 1.6, delay: '-5s' },
  ];
  return (
    <svg className="wind-hero-particulas" viewBox="0 0 400 240" preserveAspectRatio="none">
      {puntos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} style={{ animationDelay: p.delay }} />
      ))}
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

function BrujulaViento({ grados, activo, size = 66 }: { grados: number; activo: boolean; size?: number }) {
  const marcas = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width={size} height={size} viewBox="0 0 66 66">
      <defs>
        <filter id="needleGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <circle cx="33" cy="33" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx="33" cy="33" r="30" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.6" />
      {marcas.map((deg) => {
        const cardinal = deg % 90 === 0;
        const rad = (deg * Math.PI) / 180;
        const outer = 30;
        const inner = cardinal ? 23.5 : 26.5;
        const x1 = 33 + outer * Math.sin(rad);
        const y1 = 33 - outer * Math.cos(rad);
        const x2 = 33 + inner * Math.sin(rad);
        const y2 = 33 - inner * Math.cos(rad);
        return (
          <line
            key={deg}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={cardinal ? 1.6 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <text x="33" y="9" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="rgba(255,255,255,0.6)">
        N
      </text>
      <circle cx="33" cy="33" r="2.8" fill="#8fe6ea" />
      {activo && (
        <g transform={`rotate(${grados} 33 33)`} style={{ transition: 'transform 600ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
          <line x1="33" y1="33" x2="33" y2="13" stroke="#8fe6ea" strokeWidth="6" strokeLinecap="round" opacity="0.55" filter="url(#needleGlow)" />
          <line x1="33" y1="33" x2="33" y2="13" stroke="#8fe6ea" strokeWidth="3" strokeLinecap="round" />
          <polygon points="33,8 27,20 39,20" fill="#8fe6ea" />
        </g>
      )}
    </svg>
  );
}

function IconRachaMini() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fe6ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12h13a3 3 0 1 0-2.5-4.7" />
      <path d="M3 8h9" />
      <path d="M3 16h16a2.5 2.5 0 1 1-2 4" />
    </svg>
  );
}

function IconAireMini() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fe6ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V4a2 2 0 1 0-4 0v10.76a4 4 0 1 0 4 0Z" />
    </svg>
  );
}

function IconSensacionMini() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fe6ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15a4 4 0 0 1 4-4 4 4 0 0 1 4 4" />
      <path d="M13 11a4 4 0 0 1 4-4 4 4 0 0 1 4 4" />
      <path d="M3 19h18" />
    </svg>
  );
}

function HeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {icon}
        <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.4px', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{label}</div>
      </div>
      <div className="disp" style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
        {value}
      </div>
    </div>
  );
}

export default function WindScreen({ spot, condicion, pronostico, pronosticoSemana, cargando, error, onNuevaSesion, onAjustes }: Props) {
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

      <div className="rise" style={{ padding: '0 20px', animationDelay: '60ms', flex: '1 1 auto' }}>
        <div
          className={`wind-hero wind-hero--${condicion ? categorizarViento(condicion.vientoNudos).variante : 'ideal'}`}
          style={{
            borderRadius: 20,
            padding: '20px 22px',
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
          }}
        >
          <WindCurrents />
          <WindParticles />
          <div className="wind-hero-foil" style={{ right: -70, bottom: -90 }}>
            <HydrofoilMark size={280} />
          </div>

          {error && !condicion ? (
            <div className="wind-hero-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 15, color: '#ffffff', fontWeight: 600 }}>Sin datos de viento</div>
              <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 6 }}>
                No pudimos conectar con el servicio de pronóstico. Revisá tu conexión.
              </div>
            </div>
          ) : (
            <div className="wind-hero-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', right: 14, top: 14 }}>
                <BrujulaViento grados={condicion?.direccionGrados ?? 0} activo={!!condicion} size={62} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div className="disp" style={{ fontSize: 58, fontWeight: 700, color: '#ffffff', lineHeight: 1, letterSpacing: '-1px' }}>
                    {condicion ? condicion.vientoNudos : cargando ? '–' : '–'}
                  </div>
                  <div style={{ fontSize: 16, color: '#8fe6ea', fontWeight: 600 }}>
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
                          marginTop: 8,
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
              </div>

              {condicion && (
                <div style={{ display: 'flex', gap: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                  <HeroStat icon={<IconRachaMini />} label="Racha" value={`${condicion.rachaNudos} kt`} />
                  <HeroStat icon={<IconAireMini />} label="Aire" value={`${condicion.tempAireC}°`} />
                  <HeroStat
                    icon={<IconSensacionMini />}
                    label="Sensación"
                    value={condicion.sensacionTermicaC != null ? `${condicion.sensacionTermicaC}°` : '—'}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 20px 0 20px', flex: '0 1 auto', overflowY: 'auto' }}>
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
