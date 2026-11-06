import React, { useState } from 'react';
import { Camera, Minus, Plus, ShoppingBag, Utensils, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ItemSauceOptions } from '../types';
import { formatCLP } from '../utils/formatters';

export const ProductModal: React.FC = () => {
  const {
    selectedProductForModal,
    setSelectedProductForModal,
    addToCart,
    setPhotoEditorProduct,
  } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [sauces, setSauces] = useState<ItemSauceOptions>({
    soya: 1,
    teriyaki: 1,
    wasabi: true,
    jengibre: true,
    chopsticks: 1,
  });

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const itemTotal = product.price * quantity;

  const handleAdd = () => {
    addToCart(product, quantity, sauces, notes);
    setSelectedProductForModal(null);
    setQuantity(1);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#14171d] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header Image */}
        <div className="relative aspect-[16/9] w-full bg-zinc-900 overflow-hidden shrink-0">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
              <Utensils className="w-10 h-10" />
            </div>
          )}

          {/* Botón de edición de foto */}
          <button
            type="button"
            onClick={() => setPhotoEditorProduct(product)}
            className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-white/15 text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
            title="Editar foto de este producto"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Editar Foto</span>
          </button>

          <button
            onClick={() => setSelectedProductForModal(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-xl font-bold text-white font-display">
                {product.name}
              </h3>
              <span className="text-lg font-bold text-red-400 font-mono tabular-nums whitespace-nowrap">
                {formatCLP(product.price)}
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {product.description}
            </p>
            {product.ingredients && (
              <div className="mt-2 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Ingredientes: </span>
                {product.ingredients.join(', ')}
              </div>
            )}
          </div>

          {/* Salsas & Acompañamientos */}
          <div className="bg-zinc-900/80 rounded-xl p-4 border border-white/5 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Acompañamientos Incluidos
            </h4>

            {/* Soya Stepper */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Salsa Soya</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, soya: Math.max(0, s.soya - 1) }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono text-sm text-white">{sauces.soya}</span>
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, soya: s.soya + 1 }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Teriyaki Stepper */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Salsa Teriyaki</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, teriyaki: Math.max(0, s.teriyaki - 1) }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono text-sm text-white">{sauces.teriyaki}</span>
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, teriyaki: s.teriyaki + 1 }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Palitos Stepper */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-300">Pares de Palitos (Chopsticks)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, chopsticks: Math.max(0, s.chopsticks - 1) }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-mono text-sm text-white">{sauces.chopsticks}</span>
                <button
                  type="button"
                  onClick={() => setSauces((s) => ({ ...s, chopsticks: s.chopsticks + 1 }))}
                  className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Wasabi & Jengibre Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sauces.wasabi}
                  onChange={(e) => setSauces((s) => ({ ...s, wasabi: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
                />
                <span>Incluir Wasabi</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sauces.jengibre}
                  onChange={(e) => setSauces((s) => ({ ...s, jengibre: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500"
                />
                <span>Incluir Jengibre</span>
              </label>
            </div>
          </div>

          {/* Special Instructions Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Instrucciones Especiales (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: sin sésamo, frito bien dorado, etc."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Modal Footer with quantity & Add Button */}
        <div className="p-4 sm:p-5 bg-zinc-950/90 border-t border-white/10 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-center active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-white font-mono text-base">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-lg hover:bg-zinc-800 text-zinc-300 flex items-center justify-center active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add CTA */}
          <button
            onClick={handleAdd}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold text-sm sm:text-base transition-all shadow-xl shadow-red-950/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar al Pedido</span>
            </div>
            <span className="font-mono tabular-nums font-bold">
              {formatCLP(itemTotal)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
