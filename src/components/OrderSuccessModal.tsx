import React, { useState } from 'react';
import { CheckCircle2, Copy, ExternalLink, MessageSquare, Utensils, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../utils/formatters';

export const OrderSuccessModal: React.FC = () => {
  const { lastOrderTicket, setLastOrderTicket, settings } = useStore();
  const [copied, setCopied] = useState(false);

  if (!lastOrderTicket) return null;

  const { text, waLink, total, info } = lastOrderTicket;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    window.location.href = waLink;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-5">
        <button
          onClick={() => setLastOrderTicket(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            ¡Pedido Listo para Enviar!
          </h3>
          <p className="text-xs text-zinc-400">
            Toca el botón verde para abrir WhatsApp y enviar tu pedido a {settings.storeName}.
          </p>
        </div>

        {/* Ticket Summary Box */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/5 text-left text-xs space-y-2">
          <div className="flex justify-between font-semibold text-white pb-2 border-b border-white/5">
            <span>Cliente: {info.name}</span>
            <span className="text-red-400 font-mono">{formatCLP(total)}</span>
          </div>
          <div className="text-zinc-400 text-[11px]">
            Modalidad:{' '}
            <strong className="text-white">
              {info.orderType === 'delivery' ? 'Delivery a Domicilio' : 'Retiro en Local'}
            </strong>
          </div>
          {info.orderType === 'delivery' && (
            <div className="text-zinc-400 text-[11px] truncate">
              Dirección: <span className="text-zinc-200">{info.address}</span>
            </div>
          )}
        </div>

        {/* Big Actions */}
        <div className="space-y-2.5 pt-2">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir WhatsApp Ahora</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar texto del pedido'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLastOrderTicket(null)}
            className="w-full py-2 text-zinc-500 hover:text-white text-xs transition-colors"
          >
            Cerrar y seguir viendo la carta
          </button>
        </div>
      </div>
    </div>
  );
};
