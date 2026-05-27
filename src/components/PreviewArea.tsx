import React, { useState } from 'react';
import { Maximize2Icon } from 'lucide-react';
import { Header } from './Header';
import { Dock } from './Dock';
import { CanvasHUD } from './CanvasHUD';
import { CanvasContextMenu } from './CanvasContextMenu';
import { SuperellipseState } from '../hooks/useSuperellipse';
interface PreviewAreaProps {
  state: SuperellipseState;
  updateState: (updates: Partial<SuperellipseState>) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  projectName?: string;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  resetState?: () => void;
}
type PreviewSize = 'default' | 'large' | 'banner' | 'medium';
const PREVIEW_SIZES = {
  default: {
    width: 200,
    height: 200,
    label: 'Default'
  },
  large: {
    width: 290,
    height: 350,
    label: '290×350'
  },
  banner: {
    width: 191,
    height: 62,
    label: '191×62'
  },
  medium: {
    width: 288,
    height: 328,
    label: '288×328'
  }
};
export function PreviewArea({
  state,
  updateState,
  theme,
  toggleTheme,
  projectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  resetState
}: PreviewAreaProps) {
  const [previewSize, setPreviewSize] = useState<PreviewSize>('large');
  const isDark = theme === 'dark';
  // Glow theme mode can be independent of app theme
  const isGlowDark = state.glowThemeMode === 'dark';
  // Documentation formula: height = 1800 × maskSize + 600 pixels
  const shape1Height = Math.round(1800 * state.glowMaskSize + 600);
  const noiseSvg =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>";
  const noopReset = () => {};
  return (
    <CanvasContextMenu state={state} resetState={resetState || noopReset}>
      <main className="relative flex-[3] h-[55vh] md:h-full flex flex-col bg-muted/30 dark:bg-background transition-colors duration-500 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-50" />

        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          projectName={projectName}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          onSave={onSave} />
        

        {/* Preview Canvas */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 md:p-8">
          {/* Size Toggle */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 md:top-auto md:bottom-8 bg-card/80 backdrop-blur-md border border-border/60 p-1 rounded-full shadow-xl flex items-center gap-1">
            {(Object.keys(PREVIEW_SIZES) as PreviewSize[]).map((sizeKey) =>
            <button
              key={sizeKey}
              onClick={() => {
                setPreviewSize(sizeKey);
                updateState({
                  width: PREVIEW_SIZES[sizeKey].width,
                  height: PREVIEW_SIZES[sizeKey].height
                });
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${previewSize === sizeKey ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground'}`}>
              
                <Maximize2Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {PREVIEW_SIZES[sizeKey].label}
                </span>
              </button>
            )}
          </div>

          {/* Phone Frame with 4-Layer Glow */}
          <div
            className={`relative rounded-[40px] overflow-hidden shadow-2xl border-4 transition-colors duration-500 z-10 ${isDark ? 'bg-[#050505] border-secondary' : 'bg-white border-border'}`}
            style={{
              width: `${state.width}px`,
              height: `${state.height}px`
            }}>
            
            {/* Glow Container - 1530×2160 per documentation */}
            <div
              className="absolute w-[1530px] h-[2160px] pointer-events-none transition-all duration-700 ease-out"
              style={{
                maskImage:
                'linear-gradient(to bottom, black 30%, transparent 100%)',
                WebkitMaskImage:
                'linear-gradient(to bottom, black 30%, transparent 100%)',
                left: `${state.glowPositionX}px`,
                top: `${state.glowPositionY}px`,
                transform: `scale(${state.glowScale})`,
                opacity: state.enabled && state.glowEnabled ? 1 : 0
              }}>
              
              {/* Outer Glow: 1620 × dynamic, blur 180px, opacity 40% */}
              <div
                className="absolute top-[360px] left-[270px] w-[1620px] rounded-full opacity-40 transition-all duration-700"
                style={{
                  filter: 'blur(180px)',
                  backgroundColor: state.glowColor,
                  height: `${shape1Height}px`,
                  mixBlendMode: isGlowDark ? 'screen' : 'normal'
                }} />
              

              {/* Mid Glow: 1170 × 1170, blur 120px, opacity 60% */}
              <div
                className="absolute top-[540px] left-[414px] w-[1170px] h-[1170px] rounded-full opacity-60 transition-all duration-700"
                style={{
                  filter: 'blur(120px)',
                  backgroundColor: state.glowColor,
                  mixBlendMode: isGlowDark ? 'screen' : 'normal'
                }} />
              

              {/* Inner Glow: 900 × 720, blur 60px, opacity 100% dark / 60% light */}
              <div
                className="absolute top-[630px] left-[504px] w-[900px] h-[720px] rounded-full transition-all duration-700"
                style={{
                  filter: 'blur(60px)',
                  opacity: isGlowDark ? 1 : 0.6,
                  backgroundColor: state.glowColor,
                  mixBlendMode: isGlowDark ? 'screen' : 'normal'
                }} />
              

              {/* Core White: 540 × 396, blur 80px dark / 120px light, opacity 40% dark / 70% light */}
              <div
                className="absolute top-[720px] left-[630px] w-[540px] h-[396px] rounded-full transition-all duration-700"
                style={{
                  backgroundColor: '#FFFFFF',
                  filter: isGlowDark ? 'blur(80px)' : 'blur(120px)',
                  opacity: isGlowDark ? 0.4 : 0.7,
                  mixBlendMode: 'normal'
                }} />
              
            </div>

            {/* Noise Overlay */}
            <div
              className="absolute inset-0 w-full h-full pointer-events-none z-[5] mix-blend-overlay transition-opacity duration-700"
              style={{
                backgroundImage: `url("${noiseSvg}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '200px 200px',
                opacity:
                state.enabled && state.noiseEnabled ?
                state.noiseIntensity / 100 :
                0
              }} />
            

            {/* UI Content Overlay */}
            <div className="absolute bottom-0 w-full p-6 pb-8 flex flex-col gap-4 z-20">
              <div
                onClick={() => {
                  updateState({
                    enabled: false
                  });
                  setTimeout(
                    () =>
                    updateState({
                      enabled: true
                    }),
                    100
                  );
                }}
                className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isDark ? 'white' : 'black'}
                  strokeOpacity="0.8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  
                  <path d="M15.295 19.562 16 22" />
                  <path d="m17 16 3.758 2.098" />
                  <path d="m19 12.5 3.026-.598" />
                  <path d="M7.61 6.3a3 3 0 0 0-3.92 1.3l-1.38 2.79a3 3 0 0 0 1.3 3.91l6.89 3.597a1 1 0 0 0 1.342-.447l3.106-6.211a1 1 0 0 0-.447-1.341z" />
                  <path d="M8 9V2" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-medium tracking-widest uppercase mb-1 text-foreground/60">
                  Collaboration Hub
                </div>
                <h1 className="text-xl font-bold leading-tight mb-2 text-foreground">
                  Get More Done
                  <br />
                  Together
                </h1>
                <p className="text-xs leading-relaxed text-foreground/60">
                  Stay aligned, share ideas, and keep every project moving
                  smoothly.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button className="w-full h-10 rounded-full flex items-center justify-center gap-2 font-medium text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    <path
                      d="M16.92 9.1875C16.92 8.6025 16.8675 8.04 16.77 7.5H9V10.695H13.44C13.245 11.7225 12.66 12.5925 11.7825 13.1775V15.255H14.46C16.02 13.815 16.92 11.7 16.92 9.1875Z"
                      fill="#4285F4" />
                    

                    <path
                      d="M9 17.25C11.2275 17.25 13.095 16.515 14.46 15.255L11.7825 13.1775C11.0475 13.6725 10.11 13.9725 9 13.9725C6.855 13.9725 5.0325 12.525 4.38 10.575H1.635V12.705C2.9925 15.3975 5.775 17.25 9 17.25Z"
                      fill="#34A853" />
                    

                    <path
                      d="M4.38 10.5675C4.215 10.0725 4.1175 9.5475 4.1175 9C4.1175 8.4525 4.215 7.9275 4.38 7.4325V5.3025H1.635C1.0725 6.4125 0.75 7.665 0.75 9C0.75 10.335 1.0725 11.5875 1.635 12.6975L3.7725 11.0325L4.38 10.5675Z"
                      fill="#FBBC05" />
                    

                    <path
                      d="M9 4.035C10.215 4.035 11.295 4.455 12.1575 5.265L14.52 2.9025C13.0875 1.5675 11.2275 0.75 9 0.75C5.775 0.75 2.9925 2.6025 1.635 5.3025L4.38 7.4325C5.0325 5.4825 6.855 4.035 9 4.035Z"
                      fill="#EA4335" />
                    
                  </svg>
                  Continue With Google
                </button>
                <button className="w-full h-10 rounded-full flex items-center justify-center font-medium text-xs bg-secondary text-secondary-foreground hover:bg-accent transition-colors">
                  Skip
                </button>
              </div>
            </div>

            <a
              href="https://ap.cx"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] z-20 opacity-40 text-foreground hover:opacity-60 transition-opacity">
              
              ap.cx
            </a>

            {/* Canvas HUD - inside the phone frame */}
            <CanvasHUD state={state} />
          </div>

          {/* Dock - floating below the phone frame */}
          <Dock state={state} updateState={updateState} />
        </div>
      </main>
    </CanvasContextMenu>);

}