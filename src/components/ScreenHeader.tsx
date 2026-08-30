import type { ReactNode } from 'react';
import { IconUser } from './icons';

interface Props {
  title: string;
  subtitle?: string;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
}

export default function ScreenHeader({ title, subtitle, rightIcon, onRightIconClick }: Props) {
  const circleStyle = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'var(--card-alt)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'none',
  } as const;

  return (
    <div
      className="rise"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 20px 16px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/logo.png" alt="Wingfoil" style={{ width: 28, height: 'auto', flexShrink: 0 }} />
        <div>
          <div className="disp" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.2px' }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      {onRightIconClick ? (
        <button className="press" onClick={onRightIconClick} aria-label="Ajustes" style={circleStyle}>
          {rightIcon ?? <IconUser />}
        </button>
      ) : (
        <div style={circleStyle}>{rightIcon ?? <IconUser />}</div>
      )}
    </div>
  );
}
