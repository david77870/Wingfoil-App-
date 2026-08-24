import { useEffect, useState } from 'react';
import type { CondicionActual, PronosticoDia, Sesion } from './types';
import { obtenerCondicionActual, obtenerPronosticoHoy } from './lib/openMeteo';
import { obtenerSesiones, guardarSesion, eliminarSesion, obtenerSpot } from './lib/storage';
import TabBar, { type Tab } from './components/TabBar';
import SplashScreen from './screens/SplashScreen';
import WindScreen from './screens/WindScreen';
import LogSessionScreen from './screens/LogSessionScreen';
import HistoryScreen from './screens/HistoryScreen';
import LearnScreen from './screens/LearnScreen';

const ACTUALIZAR_CADA_MS = 10 * 60 * 1000; // 10 minutos

export default function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('viento');
  const [mostrarNuevaSesion, setMostrarNuevaSesion] = useState(false);

  const [spot] = useState(obtenerSpot());
  const [sesiones, setSesiones] = useState<Sesion[]>(() => obtenerSesiones());

  const [condicion, setCondicion] = useState<CondicionActual | null>(null);
  const [pronostico, setPronostico] = useState<PronosticoDia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      const [c, p] = await Promise.all([
        obtenerCondicionActual(spot.lat, spot.lon),
        obtenerPronosticoHoy(spot.lat, spot.lon),
      ]);
      if (!activo) return;
      setCondicion(c);
      setPronostico(p);
      setError(!c && !p);
      setCargando(false);
    }

    cargar();
    const intervalo = setInterval(cargar, ACTUALIZAR_CADA_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMostrarSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  function handleGuardarSesion(datos: { fechaHoraISO: string; duracionMin: number; equipo: string[]; calificacion: number }) {
    const ala = datos.equipo.find((e) => e.toLowerCase().startsWith('ala')) ?? null;
    const tabla = datos.equipo.find((e) => e.toLowerCase().startsWith('tabla')) ?? null;
    guardarSesion({
      spot: spot.nombre,
      fechaHoraISO: datos.fechaHoraISO,
      duracionMin: datos.duracionMin,
      ala,
      tabla,
      calificacion: datos.calificacion,
      vientoNudos: condicion?.vientoNudos ?? null,
      vientoDireccion: condicion?.direccionTexto ?? null,
    });
    setSesiones(obtenerSesiones());
    setMostrarNuevaSesion(false);
    setTab('historial');
  }

  function handleEliminarSesion(id: string) {
    eliminarSesion(id);
    setSesiones(obtenerSesiones());
  }

  if (mostrarSplash) {
    return (
      <div className="app-shell">
        <SplashScreen />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {tab === 'viento' && (
          <WindScreen
            spot={spot}
            condicion={condicion}
            pronostico={pronostico}
            cargando={cargando}
            error={error}
            sesiones={sesiones}
            onNuevaSesion={() => setMostrarNuevaSesion(true)}
          />
        )}
        {tab === 'historial' && <HistoryScreen sesiones={sesiones} onEliminar={handleEliminarSesion} />}
        {tab === 'aprender' && <LearnScreen />}

        {mostrarNuevaSesion && (
          <div className="screen fade-in">
            <LogSessionScreen
              spot={spot}
              condicion={condicion}
              onCancelar={() => setMostrarNuevaSesion(false)}
              onGuardar={handleGuardarSesion}
            />
          </div>
        )}
      </div>
      {!mostrarNuevaSesion && <TabBar active={tab} onChange={setTab} />}
    </div>
  );
}
