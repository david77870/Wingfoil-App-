import type { ReactNode } from 'react';
import { IconUser } from './icons';

interface Props {
  title: string;
  subtitle?: string;
  rightIcon?: ReactNode;
}

export default function ScreenHeader({ title, subtitle, rightIcon }: Props) {
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
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--card-alt)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {rightIcon ?? <IconUser />}
      </div>
    </div>
  );
}
