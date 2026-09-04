import type { Sesion } from '../types';
import { IconBack, IconStar, IconTrash, IconWind, IconPin, IconCalendar } from '../components/icons';
import { formatearFechaCorta, formatearDuracion } from '../lib/format';

interface Props {
  sesion: Sesion;
  onCerrar: () => void;
  onEliminar: (id: string) => void;
}

export default function SessionDetailScreen({ sesion, onCerrar, onEliminar }: Props) {
  const equipo = [sesion.ala, sesion.tabla].filter(Boolean) as string[];

  function eliminar() {
    onEliminar(sesion.id);
    onCerrar();
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
          Sesión
        </div>
        <button
          className="press"
          onClick={eliminar}
          aria-label="Eliminar sesión"
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
          <IconTrash />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="rise" style={{ background: 'var(--surface-deep)', borderRadius: 14, padding: '18px 16px', animationDelay: '40ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted-2)', textTransform: 'uppercase', letterSpacing: '.3px' }}>
            {formatearFechaCorta(sesion.fechaHoraISO)}
          </div>
          <div className="disp" style={{ fontSize: 22, fontWeight: 700, color: 'var(--on-surface-deep)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconPin color="var(--on-surface-deep)" size={18} />
            {sesion.spot}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <IconStar key={n} filled={n <= sesion.calificacion} size={20} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div className="rise" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '80ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <IconCalendar size={16} />
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Duración</div>
            </div>
            <div className="disp" style={{ fontSize: 18, fontWeight: 700 }}>{formatearDuracion(sesion.duracionMin)}</div>
          </div>
          <div className="rise" style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '110ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <IconWind size={16} />
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px' }}>Viento</div>
            </div>
            <div className="disp" style={{ fontSize: 18, fontWeight: 700 }}>
              {sesion.vientoNudos != null ? `${sesion.vientoNudos}kt` : '—'}
              {sesion.vientoDireccion ? ` ${sesion.vientoDireccion}` : ''}
            </div>
          </div>
        </div>

        {equipo.length > 0 && (
          <div className="rise" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '140ms' }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>Equipo</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {equipo.map((item) => (
                <div
                  key={item}
                  style={{ padding: '8px 14px', borderRadius: 20, background: 'var(--card-alt)', color: 'var(--ink)', fontSize: 12, fontWeight: 600 }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rise" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', animationDelay: '170ms' }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 10 }}>Notas</div>
          {sesion.notas ? (
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{sesion.notas}</div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Sin notas para esta sesión.</div>
          )}
        </div>
      </div>
    </div>
  );
}
