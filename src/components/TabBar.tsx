import { IconWind, IconHistory, IconBook } from './icons';

export type Tab = 'viento' | 'historial' | 'aprender';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabBar({ active, onChange }: Props) {
  const items: { key: Tab; label: string; Icon: typeof IconWind }[] = [
    { key: 'viento', label: 'Viento', Icon: IconWind },
    { key: 'historial', label: 'Progreso', Icon: IconHistory },
    { key: 'aprender', label: 'Guías', Icon: IconBook },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '10px 0 max(20px, env(safe-area-inset-bottom)) 0',
        borderTop: '1px solid var(--border)',
        background: 'transparent',
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const isActive = key === active;
        const color = isActive ? 'var(--ink)' : 'var(--icon-muted)';
        return (
          <button
            key={key}
            className="press"
            onClick={() => onChange(key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              color,
              background: 'none',
              border: 'none',
              padding: '4px 10px',
            }}
          >
            <Icon color={color} size={20} />
            <div style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</div>
          </button>
        );
      })}
    </div>
  );
}
