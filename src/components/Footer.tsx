import React from 'react';
import { Calendar, Lock, MapPin, Phone, Share2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const { settings, setIsAdminOpen, setIsShareModalOpen, setCurrentView } = useStore();

  return (
    <footer className="border-t border-white/5 bg-[#090b0e] py-12 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Logo size="sm" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              {settings.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] block">
              Navegación
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('menu');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Carta Digital & Promociones
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('reservas');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-red-400 text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  <span>Reserva de Mesas en Línea</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="hover:text-amber-400 text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Compartir Carta & Código QR</span>
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${settings.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Atención por WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours & Delivery */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] block">
              Horario & Entregas
            </span>
            <p className="text-xs text-zinc-300">{settings.openingHoursText}</p>
            <p className="text-[11px] text-zinc-400">
              Tiempo estimado de delivery: {settings.estimatedDeliveryTime}
            </p>
            <div className="pt-1 flex items-start gap-1.5 text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
          </div>

          {/* Admin Access */}
          <div className="space-y-2">
            <span className="font-semibold text-white uppercase tracking-wider text-[11px] block">
              Administración
            </span>
            <p className="text-xs text-zinc-400">
              Panel interno para actualizar precios, productos y confirmar reservas de mesa.
            </p>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800 text-xs font-medium"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Abrir Panel de Control</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-zinc-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {settings.storeName}. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span>Carta Móvil & Pedidos Directos a WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
