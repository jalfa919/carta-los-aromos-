import React from 'react';
import { Calendar, ChevronRight, Clock, MapPin, Phone, Share2, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';
import heroSushiBanner from '../assets/images/hero_sushi_banner_1792036727652.jpg';
import { Logo } from './Logo';

export const Hero: React.FC = () => {
  const { settings, setCurrentView, setIsShareModalOpen } = useStore();

  const scrollToMenu = () => {
    setCurrentView('menu');
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0d0f12] border-b border-white/5">
      {/* Background with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroSushiBanner}
          alt="Variedad de sushi artesanal y rolls de autor"
          className="w-full h-full object-cover object-center opacity-30 scale-105 transform filter blur-[1px]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f12] via-[#0d0f12]/80 to-[#0d0f12]/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-3xl">
          {/* Official Logo Banner */}
          <div className="mb-6 inline-block">
            <Logo size="lg" className="drop-shadow-2xl" />
          </div>

          {/* Live Service Status Strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs mb-4">
            {/* Local Abierto / Cerrado */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
              settings.isOpen
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                : 'bg-red-950/70 border-red-800 text-red-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span>{settings.isOpen ? 'LOCAL ABIERTO' : 'LOCAL CERRADO'}</span>
            </div>

            {/* Delivery */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              settings.isDeliveryAvailable
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
            }`}>
              <Truck className="w-3 h-3 text-red-400" />
              <span>Delivery {settings.isDeliveryAvailable ? 'Activo' : 'Pausado'}</span>
            </div>

            {/* Salón */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              settings.isSalonAvailable
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
            }`}>
              <Calendar className="w-3 h-3 text-red-400" />
              <span>Salón {settings.isSalonAvailable ? 'Abierto' : 'Pausado'}</span>
            </div>

            {/* Retiro en Local */}
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium ${
              settings.isPickupAvailable
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
            }`}>
              <MapPin className="w-3 h-3 text-red-400" />
              <span>Retiro {settings.isPickupAvailable ? 'Disponible' : 'Pausado'}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1] mb-4 font-display text-balance">
            Sushi Burgers, Hand Rolls y Tablas Crujientes
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 mb-8 max-w-2xl leading-relaxed">
            Arma tu pedido online, personaliza tus salsas favoritas y recíbelo por delivery o reserva una mesa con vista a la barra en segundos.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={scrollToMenu}
              className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-red-950/50 flex items-center gap-2"
            >
              <span>Ver Carta y Hacer Pedido</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentView('reservas')}
              className="px-6 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 active:scale-95 text-zinc-200 hover:text-white font-semibold text-sm sm:text-base transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Calendar className="w-4 h-4 text-red-400" />
              <span>Reservar una Mesa</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 active:scale-95 text-amber-400 hover:text-amber-300 font-semibold text-sm sm:text-base transition-all flex items-center gap-2 backdrop-blur-sm"
              title="Compartir enlace o código QR de la carta"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Compartir Carta / QR</span>
            </button>

            <PWAInstallButton variant="banner" />
          </div>

          {/* Feature strip with editorial precision */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs sm:text-sm text-zinc-300">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">Delivery {settings.estimatedDeliveryTime}</span>
                <span className="text-zinc-400 text-xs">Gratis sobre {formatCLP(settings.freeDeliveryThreshold)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">WhatsApp Directo</span>
                <span className="text-zinc-400 text-xs">+{settings.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 col-span-2 sm:col-span-1">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-white">Retiro o Salón</span>
                <span className="text-zinc-400 text-xs truncate max-w-[180px] block">{settings.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
