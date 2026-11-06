import React from 'react';
import { Calendar, Lock, Phone, QrCode, Share2, ShoppingBag, Utensils } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const {
    settings,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    setIsAdminOpen,
    setIsShareModalOpen,
    currentView,
    setCurrentView,
    unreadReservationsAlert,
    isAdminLoggedIn,
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-[#0d0f12]/95 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Zone 1: Official Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('menu')}
              className="text-left group flex items-center transition-transform active:scale-95"
            >
              <Logo size="sm" className="hover:opacity-90 transition-opacity" />
            </button>
          </div>

          {/* Zone 2: Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentView('menu')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentView === 'menu'
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Carta & Pedidos</span>
              {settings.showMenu === false && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30 font-mono">
                  Oculta
                </span>
              )}
            </button>

            {(settings.showReservations !== false || isAdminLoggedIn) && (
              <button
                onClick={() => setCurrentView('reservas')}
                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  currentView === 'reservas'
                    ? 'bg-red-600/20 text-red-400 border border-red-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Calendar className="w-4 h-4 text-red-400" />
                <span>Reservar Mesa</span>
                {settings.showReservations === false && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30 font-mono">
                    Oculta
                  </span>
                )}
              </button>
            )}

            <a
              href={`https://wa.me/${settings.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </nav>

          {/* Zone 3: Actions (Install App, Cart & Admin access) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Install PWA Button */}
            <PWAInstallButton variant="header" />

            {/* Compartir Carta & Código QR */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              title="Compartir enlace o código QR de la carta digital"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Compartir Carta</span>
            </button>

            {/* Admin trigger button with notification alert */}
            <button
              onClick={() => setIsAdminOpen(true)}
              title="Panel de Administración"
              className="relative p-2 sm:px-3 sm:py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline font-medium">
                {isAdminLoggedIn ? 'Panel Admin' : 'Admin'}
              </span>
              {unreadReservationsAlert > 0 && (
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {unreadReservationsAlert}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white transition-all shadow-lg shadow-red-950/40 text-xs sm:text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold">{cartCount}</span>
              <span className="hidden sm:inline text-white/80">|</span>
              <span className="hidden sm:inline font-mono tabular-nums font-semibold">
                {formatCLP(cartSubtotal)}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Bar */}
        <div className="flex md:hidden items-center justify-between border-t border-white/5 py-2 px-1">
          <div className={`grid gap-2 w-full ${(settings.showReservations !== false || isAdminLoggedIn) ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <button
              onClick={() => setCurrentView('menu')}
              className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                currentView === 'menu'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Carta y Pedidos</span>
              {settings.showMenu === false && (
                <span className="text-[9px] px-1 rounded bg-red-950 text-red-400 font-mono">Oculta</span>
              )}
            </button>

            {(settings.showReservations !== false || isAdminLoggedIn) && (
              <button
                onClick={() => setCurrentView('reservas')}
                className={`py-1.5 px-3 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  currentView === 'reservas'
                    ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Reservar Mesa</span>
                {settings.showReservations === false && (
                  <span className="text-[9px] px-1 rounded bg-red-950 text-red-400 font-mono">Oculta</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
