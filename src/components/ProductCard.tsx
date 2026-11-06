import React, { useState } from 'react';
import { Camera, Plus, Utensils } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatCLP } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProductForModal, setPhotoEditorProduct } = useStore();
  const [imageError, setImageError] = useState(false);

  return (
    <article
      onClick={() => product.available && setSelectedProductForModal(product)}
      className={`group relative flex flex-col bg-[#14171d] rounded-2xl border border-white/5 overflow-hidden transition-all duration-200 ${
        product.available
          ? 'hover:border-zinc-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 cursor-pointer'
          : 'opacity-60 cursor-not-allowed'
      }`}
    >
      {/* Product Image Slot */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-600 p-4 text-center">
            <Utensils className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">{product.name}</span>
          </div>
        )}

        {/* Botón directo de Edición de Fotos */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPhotoEditorProduct(product);
          }}
          className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-lg bg-black/80 hover:bg-black text-white hover:text-amber-400 border border-white/10 text-[10px] font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95 backdrop-blur-sm"
          title="Editar foto de este producto"
        >
          <Camera className="w-3 h-3 text-amber-400" />
          <span>Editar Foto</span>
        </button>

        {/* Subtle overlays (Availability or Promo) */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-2 text-center backdrop-blur-[2px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-300 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-800">
              Agotado por hoy
            </span>
          </div>
        )}

        {product.isPopular && product.available && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[11px] font-semibold text-amber-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/30">
              Más Pedido
            </span>
          </div>
        )}

        {product.piecesCount && (
          <div className="absolute bottom-2.5 right-2.5">
            <span className="text-[11px] font-semibold text-zinc-200 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 font-mono tabular-nums">
              {product.piecesCount} piezas
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-white mb-1.5 group-hover:text-red-400 transition-colors line-clamp-1">
          {product.name}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Ingredients inline */}
        {product.ingredients && product.ingredients.length > 0 && (
          <div className="text-[11px] text-zinc-500 mb-4 truncate">
            {product.ingredients.join(' · ')}
          </div>
        )}

        {/* Price and Add button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
          <div>
            <span className="text-xs text-zinc-500 block">Precio</span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
              {formatCLP(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={!product.available}
            onClick={(e) => {
              e.stopPropagation();
              if (product.available) {
                setSelectedProductForModal(product);
              }
            }}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              product.available
                ? 'bg-red-600 hover:bg-red-500 active:scale-95 text-white shadow-md shadow-red-950/40'
                : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </article>
  );
};
