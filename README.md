# Wingfoil

App para trackear sesiones de wingfoil: viento y pronóstico en vivo, registro de sesiones y progreso.

Hecha con React + TypeScript + Vite, empaquetada como PWA instalable (funciona en el celular como app y también en la compu, desde el navegador).

## Funcionalidad v1

- **Viento**: condición actual y pronóstico de las próximas horas para tu spot, usando la API pública de [Open-Meteo](https://open-meteo.com/) (gratis, sin API key).
- **Registrar sesión**: fecha/hora, duración, equipo usado (ala/tabla) y calificación. El viento se captura automáticamente del dato en vivo al guardar.
- **Historial y progreso**: total de sesiones, horas totales, racha de días, sesiones por mes y listado de sesiones recientes.
- **Aprender**: guías básicas (placeholder para v1, pensado para crecer).

Todo se guarda en el dispositivo (`localStorage`) — v1 no tiene backend ni cuentas de usuario.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Build de producción

```bash
npm run build
npm run preview   # sirve el build en local para probarlo
```

## Instalar como app (PWA)

1. Deployá el build (ver abajo) a un hosting con HTTPS.
2. Desde el celular, abrí la URL en Chrome/Safari y elegí "Agregar a la pantalla de inicio" (Android) o "Compartir → Agregar a inicio" (iPhone).
3. En la compu, Chrome va a mostrar un ícono de instalar en la barra de direcciones.

## Deploy

El proyecto es un sitio estático (`npm run build` genera la carpeta `dist/`). Cualquiera de estas opciones sirve, todas tienen plan gratuito:

- **Vercel**: conectá el repo de GitHub en [vercel.com](https://vercel.com), detecta Vite automáticamente.
- **Netlify**: conectá el repo en [netlify.com](https://netlify.com) (build command: `npm run build`, publish directory: `dist`).
- **GitHub Pages**: requiere configurar `base` en `vite.config.ts` con el nombre del repo.

Recomendado para este proyecto: Vercel o Netlify (cero configuración extra, HTTPS automático, necesario para que la PWA se pueda instalar).

## Configurar tu spot

Por ahora el spot por default está hardcodeado en `src/lib/storage.ts` (El Pato, San Isidro). Para cambiarlo, editá las coordenadas `lat`/`lon` de `SPOT_DEFAULT` en ese archivo.

## Estructura

```
src/
  types.ts              tipos compartidos
  lib/
    openMeteo.ts         cliente de la API de pronóstico
    storage.ts            persistencia local (sesiones, spot)
    format.ts             helpers de fecha/duración
  components/
    icons.tsx             íconos SVG
    ScreenHeader.tsx
    TabBar.tsx
  screens/
    SplashScreen.tsx
    WindScreen.tsx
    LogSessionScreen.tsx
    HistoryScreen.tsx
    LearnScreen.tsx
  App.tsx                 estado global y navegación entre pantallas
```
