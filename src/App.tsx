import { useEffect, useState } from 'react';
import type { CondicionActual, PronosticoDia, PronosticoDiario, Sesion, Spot } from './types';
import { obtenerCondicionActual, obtenerPronosticoHoy, obtenerPronosticoSemana } from './lib/openMeteo';
import { obtenerSesiones, guardarSesion, eliminarSesion, obtenerSpot, guardarSpot, borrarTodasLasSesiones } from './lib/storage';
import TabBar, { type Tab } from './components/TabBar';
import SplashScreen from './screens/SplashScreen';
import WindScreen from './screens/WindScreen';
import LogSessionScreen from './screens/LogSessionScreen';
import HistoryScreen from './screens/HistoryScreen';
import SessionDetailScreen from './screens/SessionDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import LearnScreen from './screens/LearnScreen';

const ACTUALIZAR_CADA_MS = 10 * 60 * 1000; // 10 minutos

export default function App() {
  const [mostrarSplash, setMostrarSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('viento');
  const [mostrarNuevaSesion, setMostrarNuevaSesion] = useState(false);
  const [sesionDetalleId, setSesionDetalleId] = useState<string | null>(null);
  const [mostrarAjustes, setMostrarAjustes] = useState(false);

  const [spot, setSpot] = useState<Spot>(obtenerSpot());
  const [sesiones, setSesiones] = useState<Sesion[]>(() => obtenerSesiones());

  const [condicion, setCondicion] = useState<CondicionActual | null>(null);
  const [pronostico, setPronostico] = useState<PronosticoDia | null>(null);
  const [pronosticoSemana, setPronosticoSemana] = useState<PronosticoDiario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setCargando(true);
      const [c, p, s] = await Promise.all([
        obtenerCondicionActual(spot.lat, spot.lon),
        obtenerPronosticoHoy(spot.lat, spot.lon),
        obtenerPronosticoSemana(spot.lat, spot.lon),
      ]);
      if (!activo) return;
      setCondicion(c);
      setPronostico(p);
      setPronosticoSemana(s);
      setError(!c && !p);
      setCargando(false);
    }

    cargar();
    const intervalo = setInterval(cargar, ACTUALIZAR_CADA_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [spot.lat, spot.lon]);

  function handleGuardarSpot(nuevoSpot: Spot) {
    guardarSpot(nuevoSpot);
    setSpot(nuevoSpot);
  }

  useEffect(() => {
    const t = setTimeout(() => setMostrarSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Las pantallas superpuestas (nueva sesión, detalle, ajustes) empujan una
  // entrada al historial del navegador al abrirse, así el gesto de "volver"
  // del sistema (o el botón atrás) las cierra en vez de salir de la app.
  useEffect(() => {
    function onPopState() {
      setMostrarNuevaSesion(false);
      setSesionDetalleId(null);
      setMostrarAjustes(false);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  function abrirOverlay() {
    window.history.pushState({ overlay: true }, '');
  }

  function cerrarOverlay() {
    window.history.back();
  }

  function handleGuardarSesion(datos: {
    fechaHoraISO: string;
    duracionMin: number;
    equipo: string[];
    calificacion: number;
    vientoNudos: number | null;
    vientoDireccion: string | null;
    notas: string;
  }) {
    const ala = datos.equipo.find((e) => e.toLowerCase().startsWith('ala')) ?? null;
    const tabla = datos.equipo.find((e) => e.toLowerCase().startsWith('tabla')) ?? null;
    guardarSesion({
      spot: spot.nombre,
      fechaHoraISO: datos.fechaHoraISO,
      duracionMin: datos.duracionMin,
      ala,
      tabla,
      calificacion: datos.calificacion,
      vientoNudos: datos.vientoNudos,
      vientoDireccion: datos.vientoDireccion,
      notas: datos.notas || undefined,
    });
    setSesiones(obtenerSesiones());
    setTab('historial');
    cerrarOverlay();
  }

  function handleEliminarSesion(id: string) {
    eliminarSesion(id);
    setSesiones(obtenerSesiones());
  }

  const sesionDetalle = sesionDetalleId ? sesiones.find((s) => s.id === sesionDetalleId) ?? null : null;

  function handleBorrarTodo() {
    borrarTodasLasSesiones();
    setSesiones([]);
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
            pronosticoSemana={pronosticoSemana}
            cargando={cargando}
            error={error}
            onNuevaSesion={() => {
              abrirOverlay();
              setMostrarNuevaSesion(true);
            }}
            onAjustes={() => {
              abrirOverlay();
              setMostrarAjustes(true);
            }}
          />
        )}
        {tab === 'historial' && (
          <HistoryScreen
            sesiones={sesiones}
            onEliminar={handleEliminarSesion}
            onVerSesion={(id) => {
              abrirOverlay();
              setSesionDetalleId(id);
            }}
            onAjustes={() => {
              abrirOverlay();
              setMostrarAjustes(true);
            }}
          />
        )}
        {tab === 'aprender' && (
          <LearnScreen
            onAjustes={() => {
              abrirOverlay();
              setMostrarAjustes(true);
            }}
          />
        )}

        {mostrarNuevaSesion && (
          <div className="screen fade-in">
            <LogSessionScreen
              spot={spot}
              condicion={condicion}
              onCancelar={cerrarOverlay}
              onGuardar={handleGuardarSesion}
              onGuardarSpot={handleGuardarSpot}
            />
          </div>
        )}

        {sesionDetalle && (
          <div className="screen fade-in">
            <SessionDetailScreen
              sesion={sesionDetalle}
              onCerrar={cerrarOverlay}
              onEliminar={handleEliminarSesion}
            />
          </div>
        )}

        {mostrarAjustes && (
          <div className="screen fade-in">
            <SettingsScreen
              spot={spot}
              sesionesCount={sesiones.length}
              onCerrar={cerrarOverlay}
              onGuardarSpot={handleGuardarSpot}
              onBorrarTodo={handleBorrarTodo}
            />
          </div>
        )}
      </div>
      {!mostrarNuevaSesion && !sesionDetalle && !mostrarAjustes && <TabBar active={tab} onChange={setTab} />}
    </div>
  );
}
