import React, { useState } from 'react';
import { ArrowDownToLine, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleClick}
          title="Descargar app en tu celular"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-red-500/30 hover:border-red-500/60 text-zinc-300 hover:text-white transition-all text-xs font-medium"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 text-red-400" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">App</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Smartphone className="w-4 h-4 text-red-400" />
          <span>Instalar en mi Celular</span>
        </button>
      )}

      {/* Installation Guide Modal (for iOS or fallback instructions) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-[#14171d] border border-white/10 rounded-3xl p-6 shadow-2xl text-left space-y-4">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base font-display">
                  Cómo instalar la App
                </h3>
                <p className="text-[11px] text-zinc-400">En tu teléfono Android o iPhone</p>
              </div>
            </div>

            {isIOS ? (
              /* iOS Instructions */
              <div className="space-y-3 text-xs text-zinc-300 bg-zinc-950 p-4 rounded-2xl border border-white/5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>En iPhone / iPad (Safari):</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Toca el botón <Share2 className="w-3.5 h-3.5 inline mx-1 text-blue-400" />{' '}
                      <strong>Compartir</strong> en la barra inferior de Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Baja en el menú y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Toca <strong>Agregar</strong> arriba a la derecha. ¡Listo! La app aparecerá en
                      tu pantalla con su icono.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Android / Chrome / PC Instructions */
              <div className="space-y-3 text-xs text-zinc-300 bg-zinc-950 p-4 rounded-2xl border border-white/5">
                <div className="font-semibold text-white">En Android (Chrome):</div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Toca los <strong>tres puntos (⋮)</strong> del navegador arriba a la derecha.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-mono text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Elige <strong>"Instalar aplicación"</strong> o{' '}
                      <strong>"Agregar a la pantalla principal"</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors text-center"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
