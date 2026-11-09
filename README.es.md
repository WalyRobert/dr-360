[Português](README.md) · [Español](README.es.md)

# DR 360° — Reproductor de vídeo inmersivo

**Idioma:** Español  
**Estado:** Proyecto de visualización inmersiva en desarrollo.

DR 360° es un reproductor web experimental para vídeos panorámicos, con renderizado en una esfera 3D, navegación mediante ratón o pantalla táctil y controles de reproducción. El proyecto explora tecnologías web 3D y sensores de orientación de dispositivos.

## Funcionalidades identificadas en el código

- Renderizado de vídeo en una esfera 3D mediante Three.js.
- Carga de vídeo local y entrada de URL remota.
- Navegación con OrbitControls.
- Control de orientación del dispositivo mediante DeviceOrientationControls.
- Modos de visualización 360°, 180° y 120°.
- Controles de volumen, velocidad, bucle y progreso.
- Ajustes visuales mediante shader: brillo, contraste, saturación y nitidez.
- Pantalla completa y ocultación automática de los controles.

El proyecto también incluye una opción de visualización estereoscópica lado a lado. Esto no demuestra, por sí solo, compatibilidad completa con WebXR ni con dispositivos de realidad virtual específicos.

## Tecnologías

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Lucide React

## Ejecución local

**Requisitos:** Node.js y npm.

```bash
git clone https://github.com/WalyRobert/dr-360.git
cd dr-360
npm install
npm run dev
```

Para generar la versión de producción:

```bash
npm run build
npm run preview
```

## Estructura principal

- `src/App.tsx`: alterna entre la página inicial y el reproductor.
- `src/components/Video360Viewer.tsx`: controla los medios, la reproducción, los ajustes y la interacción.
- `src/components/Scene.tsx`: renderiza la esfera, la textura de vídeo, el shader y los controles de cámara.
- `src/types.ts`: tipos de estado y configuración.
- `src/components/`: componentes de interfaz y controles.

## Limitaciones y próximos pasos

- [ ] Corregir la interacción del control principal de reproducción, que actualmente abre el selector de archivos.
- [ ] Probar los permisos y el comportamiento de orientación en distintos navegadores y dispositivos.
- [ ] Evaluar la implementación de WebXR para experiencias VR reales.
- [ ] Probar en visores, incluido Meta Quest, antes de declarar compatibilidad.
- [ ] Revocar las URL de objeto al sustituir vídeos para evitar consumo innecesario de memoria.
- [ ] Validar URL remotas y comportamiento CORS.
- [ ] Añadir pruebas y una guía de demostración.
- [ ] Documentar formatos, limitaciones y dispositivos realmente probados.

## Nota sobre VR

La opción estereoscópica existente renderiza dos regiones de la escena. La compatibilidad con visores, el seguimiento de cabeza y la experiencia inmersiva completa deben probarse en el hardware y navegador de destino.

## Autor

Waly Robert

Proyecto independiente de experimentación en visualización inmersiva e interfaces 3D.
