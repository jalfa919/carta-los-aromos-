import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  Globe,
  HelpCircle,
  Info,
  Instagram,
  MessageCircle,
  Printer,
  QrCode,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useStore } from '../context/StoreContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useStore();
  const [copied, setCopied] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'link' | 'html' | 'error103' | 'qr' | 'guias'>('link');
  const [customUrlInput, setCustomUrlInput] = useState(settings.customShareUrl || '');
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // Default shared URL
  const defaultUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('localhost') || window.location.origin.includes('3000')
        ? 'https://ais-pre-otwagfthzotxd5ox6yjt4x-721396287143.us-west2.run.app'
        : window.location.origin)
    : 'https://ais-pre-otwagfthzotxd5ox6yjt4x-721396287143.us-west2.run.app';

  const activeUrl = (settings.customShareUrl && settings.customShareUrl.trim().length > 0)
    ? settings.customShareUrl.trim()
    : defaultUrl;

  const waCatalogUrl = 'https://wa.me/c/56979553144';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(activeUrl, {
        width: 380,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error generating QR', err));
    }
  }, [isOpen, activeUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(activeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = activeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyWACatalog = async () => {
    try {
      await navigator.clipboard.writeText(waCatalogUrl);
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    } catch {
      setCopiedWA(true);
      setTimeout(() => setCopiedWA(false), 2500);
    }
  };

  const handleSaveCustomUrl = () => {
    updateSettings({ customShareUrl: customUrlInput.trim() });
    setIsEditingUrl(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.storeName,
          text: `🍣 ¡Revisa nuestra carta digital y pide directo por WhatsApp en ${settings.storeName}!`,
          url: activeUrl,
        });
      } catch {
        // Ignored
      }
    } else {
      handleCopyLink();
    }
  };

  const shareText = encodeURIComponent(
    `🍣 *¡Hola! Te comparto la carta digital de ${settings.storeName}* 🥢\n\nPuedes ver todos los rolls, combos, handrolls y hacer tu pedido directo aquí:\n${activeUrl}`
  );
  const waShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  const downloadQrCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `QR-Carta-${settings.storeName.replace(/\s+/g, '-')}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const fetchHtmlCode = async (): Promise<string> => {
    if (htmlContent) return htmlContent;
    try {
      const res = await fetch('/carta.html');
      const text = await res.text();
      setHtmlContent(text);
      return text;
    } catch (e) {
      console.error('Error fetching html', e);
      return '';
    }
  };

  const handleCopyHtml = async () => {
    try {
      const code = await fetchHtmlCode();
      if (!code) {
        window.open('/carta.html', '_blank');
        return;
      }
      await navigator.clipboard.writeText(code);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      window.open('/carta.html', '_blank');
    }
  };

  const handleDownloadHtml = async () => {
    try {
      setIsDownloadingHtml(true);
      const code = await fetchHtmlCode();
      const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carta-${settings.storeName.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error', err);
      window.open('/carta.html', '_blank');
    } finally {
      setIsDownloadingHtml(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#11141a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display flex items-center gap-2">
                <span>Compartir Carta Digital</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Enlaces para clientes, redes sociales y código QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-5 border-b border-white/5 bg-zinc-950 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-3 px-1 text-center flex items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === 'link'
                ? 'border-red-500 text-white bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="truncate">Enlace</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`py-3 px-1 text-center flex items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === 'html'
                ? 'border-emerald-500 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">HTML</span>
          </button>
          <button
            onClick={() => setActiveTab('error103')}
            className={`py-3 px-1 text-center flex items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === 'error103'
                ? 'border-amber-500 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Error 103</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-1 text-center flex items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === 'qr'
                ? 'border-red-500 text-white bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="truncate">QR</span>
          </button>
          <button
            onClick={() => setActiveTab('guias')}
            className={`py-3 px-1 text-center flex items-center justify-center gap-1 transition-colors border-b-2 ${
              activeTab === 'guias'
                ? 'border-red-500 text-white bg-white/[0.02]'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Instagram className="w-3.5 h-3.5" />
            <span className="truncate">Redes</span>
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: ENLACE PRINCIPAL */}
          {activeTab === 'link' && (
            <div className="p-5 sm:p-6 space-y-5">
              {/* Alerta de Error 103 / Acceso Público */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-amber-300 block">
                    ¿Por qué dio Error 103 en el otro móvil?
                  </span>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    Google protege las vistas previas de desarrollo. Para que <strong>cualquier persona</strong> pueda abrirla sin iniciar sesión, debes pulsar el botón <strong>"Share" / "Compartir"</strong> en la barra superior derecha de Google AI Studio y cambiar el acceso a <strong>"Anyone with the link" (Cualquiera con el enlace)</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('error103')}
                    className="text-amber-400 underline font-semibold text-[11px] pt-0.5 block hover:text-amber-300"
                  >
                    Ver paso a paso cómo solucionarlo &rarr;
                  </button>
                </div>
              </div>

              {/* Enlace actual de la web */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">
                    Enlace de tu Carta Digital:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(!isEditingUrl)}
                    className="text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    {isEditingUrl ? 'Cerrar edición' : 'Cambiar enlace personalizado'}
                  </button>
                </div>

                {isEditingUrl ? (
                  <div className="p-3 bg-zinc-950 border border-amber-500/40 rounded-2xl space-y-2">
                    <span className="text-[11px] text-zinc-400 block">
                      Pega aquí tu enlace público de AI Studio o tu dominio propio:
                    </span>
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomUrlInput('');
                          updateSettings({ customShareUrl: '' });
                          setIsEditingUrl(false);
                        }}
                        className="px-2.5 py-1 text-[11px] text-zinc-400 hover:text-white"
                      >
                        Restablecer original
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomUrl}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg"
                      >
                        Guardar Enlace
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
                    <input
                      type="text"
                      readOnly
                      value={activeUrl}
                      className="bg-transparent text-xs sm:text-sm text-zinc-200 font-mono flex-1 outline-none px-2 select-all"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/40'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Alternativa Inmediata: Catálogo oficial de WhatsApp */}
              <div className="p-3.5 bg-zinc-950 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Enlace Catálogo WhatsApp (Abre siempre sin errores):</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    100% Público
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                  <span className="text-xs font-mono text-zinc-300 flex-1 truncate px-1">
                    {waCatalogUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyWACatalog}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedWA ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWA ? 'Copiado' : 'Copiar'}</span>
                  </button>
                  <a
                    href={waCatalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-zinc-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={waShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-red-400" />
                  <span>Compartir en Celular</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: CÓDIGO HTML INDEPENDIENTE */}
          {activeTab === 'html' && (
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Header Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-zinc-950 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        Carta en 1 Solo Archivo HTML
                      </h4>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        100% Autónomo • Sin servidores • Cero Error 103
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Autoejecutable
                  </span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Creamos un archivo <strong>carta.html</strong> completo que contiene todos los productos de <strong>{settings.storeName}</strong>, buscador, carrito interactivo y pedidos automáticos a WhatsApp (+56 9 7955 3144). Puedes abrirlo con doble clic en cualquier teléfono o computador, o subirlo a cualquier hosting web.
                </p>
              </div>

              {/* Botón principal de descarga */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  disabled={isDownloadingHtml}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>{isDownloadingHtml ? 'Generando archivo...' : 'Descargar "carta-kitchen-los-aromos.html"'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyHtml}
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{copiedHtml ? '¡Código Copiado!' : 'Copiar Código HTML'}</span>
                  </button>

                  <a
                    href="/carta.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver en Navegador</span>
                  </a>
                </div>

                {/* Descarga de Código Fuente Completo (ZIP para Vercel) */}
                <a
                  href="/kitchen-los-aromos-proyecto.zip"
                  download="kitchen-los-aromos-proyecto.zip"
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all mt-1"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Descargar Código Fuente Completo (.ZIP para Vercel / GitHub)</span>
                </a>
              </div>

              {/* Guía de uso del archivo HTML */}
              <div className="space-y-2 pt-1">
                <span className="font-bold text-zinc-300 block text-xs">
                  ¿Cómo usar este archivo HTML?
                </span>
                
                <div className="space-y-2 text-[11px] text-zinc-400">
                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">1</span>
                    <div>
                      <strong className="text-zinc-200 block">En cualquier teléfono o PC:</strong>
                      <span>Envíaselo a tu cliente por WhatsApp o guárdalo en tu teléfono. Se abre en Chrome, Safari o cualquier navegador al tocarlo, sin pedir cuenta ni clave.</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">2</span>
                    <div>
                      <strong className="text-zinc-200 block">Subirlo a un hosting gratuito:</strong>
                      <span>Puedes subirlo gratis a <strong>GitHub Pages</strong>, <strong>Netlify</strong> (solo arrastras el archivo), <strong>Vercel</strong> o <strong>Hostinger</strong> para tener tu propia dirección web (ej: <em>www.kitchenlosaromos.cl</em>).</span>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-amber-600/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">3</span>
                    <div>
                      <strong className="text-zinc-200 block">Modificar precios o agregar platos:</strong>
                      <span>Puedes abrirlo con el <em>Bloc de Notas</em> o cualquier editor de texto y cambiar fácilmente cualquier precio o texto en la lista de productos.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CÓMO SOLUCIONAR EL ERROR 103 */}
          {activeTab === 'error103' && (
            <div className="p-5 sm:p-6 space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Cómo solucionar el "Error 103 de Google"
                </h4>
                <p className="text-zinc-400 text-xs">
                  Tu app está funcionando perfectamente. El error ocurre porque la vista previa está en modo privado para tu cuenta.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Paso 1 */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-6 h-6 rounded-full bg-red-600/30 text-red-400 flex items-center justify-center text-xs font-mono">1</span>
                    <span>Ubica el botón "Share" en Google AI Studio</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed pl-8">
                    Mira la esquina superior derecha de la pantalla de Google AI Studio (arriba a la derecha, fuera de la vista previa del teléfono). Verás un botón azul que dice <strong>"Share" (Compartir)</strong>.
                  </p>
                </div>

                {/* Paso 2 */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center text-xs font-mono">2</span>
                    <span>Cambia el permiso a "Anyone with the link"</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed pl-8">
                    En la ventana que se abre, cambia de <em>"Restricted"</em> a <strong>"Anyone with the link" (Cualquier persona con el enlace)</strong>. Esto quita el bloqueo de Google para que cualquier móvil pueda abrirla directamente.
                  </p>
                </div>

                {/* Paso 3 */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-xs font-mono">3</span>
                    <span>Copia el enlace público generado</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed pl-8">
                    Haz clic en <strong>"Copy link"</strong>. Ese enlace no pedirá ninguna cuenta de Google y abrirá tu carta de inmediato en cualquier celular.
                  </p>
                </div>
              </div>

              {/* Botón para volver al enlace */}
              <button
                type="button"
                onClick={() => setActiveTab('link')}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors mt-2"
              >
                Entendido, volver a copiar mi enlace
              </button>
            </div>
          )}

          {/* TAB 3: CÓDIGO QR */}
          {activeTab === 'qr' && (
            <div className="p-5 sm:p-6 space-y-5 text-center">
              <div className="max-w-[260px] mx-auto bg-white p-4 rounded-3xl shadow-xl shadow-black/60 border-4 border-zinc-800 space-y-2">
                <div className="text-center pb-1">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-900 font-display block">
                    {settings.storeName}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-semibold">
                    Escanea para ver la Carta
                  </span>
                </div>
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Código QR de ${settings.storeName}`}
                    className="w-full h-auto aspect-square rounded-xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-zinc-100 animate-pulse rounded-xl" />
                )}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-red-600 block">
                    🍣 Pedidos directos a WhatsApp
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Código QR vinculado a: <strong className="text-white font-mono break-all text-[11px]">{activeUrl}</strong>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={downloadQrCode}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Imagen QR</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-700 text-zinc-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir Cartel</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GUÍAS INSTAGRAM Y WHATSAPP */}
          {activeTab === 'guias' && (
            <div className="p-5 sm:p-6 space-y-4 text-xs text-zinc-300">
              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-pink-600/30 text-pink-400 flex items-center justify-center text-[10px]">1</span>
                  <span>En Instagram (Bio y Stories):</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Entra a tu perfil de Instagram &gt; pulsa <strong>Editar perfil</strong> &gt; selecciona <strong>Enlaces / Links</strong> &gt; pulsa <strong>Agregar enlace externo</strong> &gt; pega la URL de tu carta y titúlala "🍣 Nuestra Carta y Pedidos".
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                  <span>En WhatsApp Business (Mensaje de bienvenida):</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Ajustes &gt; Herramientas para la empresa &gt; <strong>Mensaje de bienvenida</strong>. Agrega: <em>"¡Hola! Gracias por escribirnos a {settings.storeName}. Haz tu pedido desde nuestra carta online aquí: {activeUrl}"</em>.
                </p>
              </div>

              <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span className="w-5 h-5 rounded-full bg-amber-600/30 text-amber-400 flex items-center justify-center text-[10px]">3</span>
                  <span>En las Mesas de tu Local:</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Ve a la pestaña <strong>Código QR</strong>, descárgalo e imprímelo en formato pequeño para cada mesa o en el mesón de caja. Los clientes sólo apuntarán su cámara para pedir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500 shrink-0">
          <span>{settings.storeName} • Coquimbo, Chile</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
