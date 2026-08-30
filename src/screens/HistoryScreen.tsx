import type { Sesion } from '../types';
import ScreenHeader from '../components/ScreenHeader';
import { IconWind, IconSettings, IconTrash, IconChevronRight } from '../components/icons';
import { formatearFechaHoy, formatearDuracion } from '../lib/format';

interface Props {
  sesiones: Sesion[];
  onEliminar: (id: string) => void;
  onVerSesion: (id: string) => void;
  onAjustes: () => void;
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function agruparPorMes(sesiones: Sesion[]) {
  const ahora = new Date();
  const meses: { label: string; count: number; esMesActual: boolean }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const count = sesiones.filter((s) => {
      const sd = new Date(s.fechaHoraISO);
      return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
    }).length;
    meses.push({ label: MESES[d.getMonth()], count, esMesActual: i === 0 });
  }
  return meses;
}

function calcularRachaDias(sesiones: Sesion[]): number {
  if (sesiones.length === 0) return 0;
  const dias = new Set(sesiones.map((s) => new Date(s.fechaHoraISO).toDateString()));
  let racha = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!dias.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (dias.has(cursor.toDateString())) {
    racha++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return racha;
}

export default function HistoryScreen({ sesiones, onEliminar, onVerSesion, onAjustes }: Props) {
  const totalHoras = Math.round(sesiones.reduce((acc, s) => acc + s.duracionMin, 0) / 60);
  const racha = calcularRachaDias(sesiones);
  const meses = agruparPorMes(sesiones);
  const maxMes = Math.max(...meses.map((m) => m.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ScreenHeader title="Tu progreso" rightIcon={<IconSettings />} onRightIconClick={onAjustes} />

      <div className="rise" style={{ padding: '0 20px', animationDelay: '60ms' }}>
        <div style={{ background: 'var(--ink)', borderRadius: 20, padding: '22px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Total sesiones</div>
            <div className="disp" style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
              {sesiones.length}
            </div>
          </div>
          <div style={{ width: 1, height: 38, background: 'var(--ink-2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Horas totales</div>
            <div className="disp" style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
              {totalHoras}
            </div>
          </div>
          <div style={{ width: 1, height: 38, background: 'var(--ink-2)' }} />
          <div>
            <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Racha</div>
            <div className="disp" style={{ fontSize: 36, fontWeight: 700, color: 'var(--accent)', marginTop: 2 }}>
              {racha}d
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Sesiones por mes</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date().getFullYear()}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 74 }}>
          {meses.map((m, i) => {
            const alturaPct = Math.max(8, Math.round((m.count / maxMes) * 100));
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                <div
                  className="bar-grow"
                  style={{
                    width: '100%',
                    height: `${alturaPct}%`,
                    background: m.esMesActual ? 'var(--accent)' : 'var(--card-alt)',
                    borderRadius: 6,
                    animationDelay: `${180 + i * 30}ms`,
                  }}
                />
                <div style={{ fontSize: 10, color: m.esMesActual ? 'var(--accent)' : 'var(--muted)', fontWeight: m.esMesActual ? 600 : 400 }}>
                  {m.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '22px 20px 0 20px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Sesiones recientes</div>
        {sesiones.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '12px 0' }}>
            Todavía no registraste ninguna sesión. Cuando anotes una desde la pantalla de Viento, va a aparecer acá.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sesiones.map((s, i) => (
              <div
                key={s.id}
                className="rise press"
                onClick={() => onVerSesion(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '12px 14px',
                  animationDelay: `${Math.min(360 + i * 40, 600)}ms`,
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: i === 0 ? 'var(--card-accent-soft)' : 'var(--card-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconWind color={i === 0 ? 'var(--accent)' : 'var(--ink)'} size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.spot}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                    {formatearFechaHoy(s.fechaHoraISO)} · {formatearDuracion(s.duracionMin)}
                    {s.vientoNudos != null ? ` · ${s.vientoNudos}kt` : ''}
                    {s.notas ? ' · 📝' : ''}
                  </div>
                </div>
                <IconChevronRight />
                <button
                  className="press"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEliminar(s.id);
                  }}
                  style={{ background: 'none', border: 'none', padding: 4, flexShrink: 0 }}
                  aria-label="Eliminar sesión"
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
