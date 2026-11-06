import React from 'react';
import { Edit2, Layers, Plus, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';

export const CategoryNav: React.FC = () => {
  const {
    categories,
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    openCreateCategoryModal,
    openEditCategoryModal,
  } = useStore();

  const getProductCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div id="menu-section" className="py-5 sm:py-6 border-b border-white/5 bg-[#0f1115]/95 sticky top-16 sm:top-20 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Search Bar & Title & Category Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display flex items-center gap-2">
              <span>Nuestra Carta</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Selecciona tus rolls, promociones o hand rolls para armar tu pedido
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por rollo..."
                className="w-full pl-9 pr-9 py-2 bg-zinc-900 border border-zinc-800 focus:border-red-500 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Botón de Creación de Nuevas Categorías */}
            <button
              type="button"
              onClick={openCreateCategoryModal}
              className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/40 shrink-0 transition-all"
              title="Crear nueva categoría"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">+ Nueva Categoría</span>
              <span className="sm:hidden">+ Categoría</span>
            </button>

            {/* Botón de Edición de Categorías */}
            <button
              type="button"
              onClick={() => openEditCategoryModal()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all"
              title="Administrar y editar categorías"
            >
              <Edit2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Editar Categorías</span>
            </button>
          </div>
        </div>

        {/* Category Pills / Segmented Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            <span>Todos</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeCategory === 'all' ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {getProductCount('all')}
            </span>
          </button>

          {categories.map((cat: Category) => {
            const count = getProductCount(cat.id);
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                className={`group flex items-center rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 border ${
                  isActive
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/40'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white hover:bg-zinc-800 border-zinc-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-3 py-1.5 flex items-center gap-1.5"
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-red-800 text-white' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>

                {/* Quick Edit Category Button on pill */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditCategoryModal(cat);
                  }}
                  className={`pr-2.5 pl-1 py-1.5 opacity-60 hover:opacity-100 transition-opacity ${
                    isActive ? 'text-white hover:text-amber-200' : 'text-zinc-500 hover:text-amber-400'
                  }`}
                  title={`Editar categoría "${cat.name}"`}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Quick inline + Add Category button at the end of the scroll */}
          <button
            type="button"
            onClick={openCreateCategoryModal}
            className="px-3 py-1.5 rounded-xl border border-dashed border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-white text-xs font-medium flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors bg-zinc-900/40"
          >
            <Plus className="w-3 h-3 text-red-500" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>
    </div>
  );
};
