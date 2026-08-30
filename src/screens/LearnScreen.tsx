import ScreenHeader from '../components/ScreenHeader';
import { IconSettings } from '../components/icons';

interface Props {
  onAjustes: () => void;
}

const TIPS = [
  {
    titulo: 'Antes de entrar al agua',
    texto: 'Revisá el pronóstico y la marea, avisá a alguien tu horario estimado, y chequeá que el leash y el sistema de seguridad del ala estén en buen estado.',
  },
  {
    titulo: 'Elegir el tamaño de ala',
    texto: 'Con más viento, ala más chica. Como referencia general: por encima de 20kt conviene bajar de tamaño para mantener el control.',
  },
  {
    titulo: 'Cuidado del equipo',
    texto: 'Enjuagá ala, tabla y foil con agua dulce después de cada sesión, y dejalos secar a la sombra antes de guardarlos.',
  },
];

export default function LearnScreen({ onAjustes }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <ScreenHeader title="Guías" subtitle="buenas prácticas para el agua" rightIcon={<IconSettings />} onRightIconClick={onAjustes} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TIPS.map((tip, i) => (
          <div
            key={tip.titulo}
            className="rise"
            style={{
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '16px 16px',
              animationDelay: `${60 + i * 60}ms`,
            }}
          >
            <div className="disp" style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              {tip.titulo}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{tip.texto}</div>
          </div>
        ))}
        <div
          className="rise"
          style={{
            background: 'var(--card-alt)',
            borderRadius: 14,
            padding: '16px 16px',
            fontSize: 12,
            color: 'var(--muted)',
            animationDelay: `${60 + TIPS.length * 60}ms`,
          }}
        >
          Más contenido (glosario, maniobras, spots) llega en próximas versiones.
        </div>
      </div>
    </div>
  );
}
