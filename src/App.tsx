/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { ReservationModule } from './components/ReservationModule';
import { ReservationConfirmationModal } from './components/ReservationConfirmationModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminPanel } from './components/AdminPanel';
import { PhotoEditorModal } from './components/PhotoEditorModal';
import { CategoryManagerModal } from './components/CategoryManagerModal';
import { ShareModal } from './components/ShareModal';
import { Footer } from './components/Footer';
import { formatCLP } from './utils/formatters';

const AppContent: React.FC = () => {
  const {
    products,
    categories,
    activeCategory,
    searchQuery,
    setSearchQuery,
    currentView,
    setCurrentView,
    cartCount,
    cartSubtotal,
    setIsCartOpen,
    settings,
    photoEditorProduct,
    setPhotoEditorProduct,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    categoryModalMode,
    categoryToEdit,
    isAdminLoggedIn,
    toggleMenuVisibility,
    isShareModalOpen,
    setIsShareModalOpen,
  } = useStore();

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.ingredients &&
        p.ingredients.some((ing) =>
          ing.toLowerCase().includes(searchQuery.toLowerCase())
        ));
    return matchesCategory && matchesSearch;
  });

  // Group by category if "all" is active and no search query
  const showGrouped = activeCategory === 'all' && !searchQuery;

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12">
        {currentView === 'menu' ? (
          <>
            {/* If Carta is hidden and admin is logged in: show admin indicator banner */}
            {settings.showMenu === false && isAdminLoggedIn && (
              <div className="bg-red-950/80 border-b border-red-500/50 py-2.5 px-4 text-center text-xs text-red-200 flex flex-wrap items-center justify-center gap-3">
                <span className="flex items-center gap-1.5 font-semibold">
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span>Modo Administrador: La Carta Digital está OCULTA a los visitantes</span>
                </span>
                <button
                  type="button"
                  onClick={toggleMenuVisibility}
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Botón Mostrar Carta</span>
                </button>
              </div>
            )}

            {/* Hero Banner */}
            <Hero />

            {/* If Carta is hidden and user is NOT admin: show friendly paused state */}
            {settings.showMenu === false && !isAdminLoggedIn ? (
              <section className="max-w-3xl mx-auto px-4 py-16 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-xl shadow-red-950/50">
                  <Utensils className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                    Carta Digital en Mantención
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Estamos actualizando nuestro catálogo con nuevas delicias y preparaciones de sushi. Puedes consultarnos directamente por WhatsApp para conocer las opciones disponibles del día.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <a
                    href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría consultar la carta o hacer un pedido')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Consultar por WhatsApp</span>
                  </a>

                  {settings.showReservations !== false && (
                    <button
                      onClick={() => setCurrentView('reservas')}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Calendar className="w-4 h-4 text-red-400" />
                      <span>Reservar Mesa en Salón</span>
                    </button>
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* Interactive Category Filter Navigation */}
                <CategoryNav />

                {/* Products Section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                  {filteredProducts.length === 0 ? (
                    /* Empty state */
                    <div className="text-center py-16 sm:py-24 bg-zinc-900/40 rounded-3xl border border-white/5 space-y-3">
                      <Search className="w-10 h-10 text-zinc-500 mx-auto stroke-1" />
                  <h3 className="text-lg font-bold text-white font-display">
                    No encontramos rolls con esa búsqueda
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
                    Intenta con otra palabra clave como "salmón", "camarón", "hand roll" o limpia el filtro.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                  >
                    Ver Toda la Carta
                  </button>
                </div>
              ) : showGrouped ? (
                /* Grouped by Categories */
                <div className="space-y-12">
                  {categories.map((category) => {
                    const categoryProducts = products.filter(
                      (p) => p.categoryId === category.id
                    );
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category.id} className="space-y-4">
                        <div className="flex items-end justify-between border-b border-white/5 pb-2">
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-xs text-zinc-400 mt-0.5">
                                {category.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-zinc-500 font-mono">
                            {categoryProducts.length} {categoryProducts.length === 1 ? 'opción' : 'opciones'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                          {categoryProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Flat Grid for Search or Filtered Category */
                <div>
                  <div className="mb-6 flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                      {searchQuery && ` para "${searchQuery}"`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </>
    ) : (
          /* Reservation View */
          <ReservationModule />
        )}
      </main>

      {/* Floating Mobile Cart Bar (Sticky when on mobile and has items) */}
      {cartCount > 0 && (
        <div className="fixed bottom-3 inset-x-3 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-red-600 active:scale-95 text-white font-bold text-sm shadow-2xl shadow-red-950/80 flex items-center justify-between border border-red-500/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center font-mono text-xs">
                {cartCount}
              </div>
              <span>Ver Pedido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums">{formatCLP(cartSubtotal)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Global Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <AdminPanel />
      <ReservationConfirmationModal />
      <OrderSuccessModal />

      {/* Photo Editor Modal */}
      {photoEditorProduct && (
        <PhotoEditorModal
          product={photoEditorProduct}
          onClose={() => setPhotoEditorProduct(null)}
        />
      )}

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        initialMode={categoryModalMode}
        categoryToEdit={categoryToEdit}
      />

      {/* Share Modal & QR Generator */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
