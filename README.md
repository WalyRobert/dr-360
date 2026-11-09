# DR 360° — Player de vídeo imersivo

**Idioma:** Português (Brasil)  
**Status:** Projeto de visualização imersiva em desenvolvimento.

DR 360° é um player web experimental para vídeos panorâmicos, com renderização em esfera 3D, navegação por mouse/toque e controles de reprodução. O projeto explora tecnologias web 3D e sensores de orientação de dispositivos.

## Funcionalidades identificadas no código

- Renderização de vídeo em esfera 3D com Three.js.
- Upload de vídeo local e entrada de URL remota.
- Navegação com OrbitControls.
- Controle de orientação do dispositivo por DeviceOrientationControls.
- Modos de enquadramento 360°, 180° e 120°.
- Controles de volume, velocidade, loop e progresso.
- Ajustes visuais por shader: brilho, contraste, saturação e nitidez.
- Tela cheia e interface com ocultação automática dos controles.

O projeto também possui uma opção de visualização estereoscópica lado a lado. Isso não equivale, por si só, à comprovação de compatibilidade completa com WebXR ou headsets específicos.

## Tecnologias

- React 19
- TypeScript
- Vite
- Three.js
- React Three Fiber
- Drei
- Lucide React

## Executar localmente

**Pré-requisito:** Node.js e npm.

```bash
git clone https://github.com/WalyRobert/dr-360.git
cd dr-360
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura principal

- `src/App.tsx`: alterna entre a página inicial e o player.
- `src/components/Video360Viewer.tsx`: controla mídia, reprodução, configurações e interação.
- `src/components/Scene.tsx`: renderiza a esfera, textura de vídeo, shader e controles de câmera.
- `src/types.ts`: tipos de estado e configurações.
- `src/components/`: componentes da interface e controles.

## Limitações e próximos passos

- [ ] Corrigir a interação do controle principal de play/pause, que atualmente aciona o seletor de arquivos.
- [ ] Testar permissões e comportamento de orientação em diferentes navegadores e dispositivos.
- [ ] Avaliar implementação WebXR para experiências VR reais.
- [ ] Testar especificamente em headsets, incluindo Meta Quest, antes de declarar compatibilidade.
- [ ] Revogar URLs de objeto ao substituir vídeos, evitando consumo desnecessário de memória.
- [ ] Validar URLs remotas e comportamento CORS.
- [ ] Adicionar testes e roteiro de demonstração.
- [ ] Documentar formatos, limitações e dispositivos efetivamente testados.

## Observação sobre VR

A opção estereoscópica existente renderiza duas regiões da cena. O suporte a headset, rastreamento de cabeça e experiência imersiva completa precisa ser testado no hardware e navegador de destino.

## Autor

Waly Robert

Projeto independente de experimentação em visualização imersiva e interfaces 3D.
