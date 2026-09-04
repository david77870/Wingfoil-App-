export default function SplashScreen() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--surface-deep)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="rise-scale" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <img src="/logo.png" alt="Wingfoil" style={{ width: 170, height: 'auto', display: 'block' }} />
        <div className="disp" style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', letterSpacing: '.3px' }}>
          Wingfoil
        </div>
      </div>
      <div className="rise" style={{ position: 'absolute', bottom: 56, fontSize: 12, color: '#5b7392', animationDelay: '180ms' }}>
        viento · sesiones · progreso
      </div>
    </div>
  );
}
