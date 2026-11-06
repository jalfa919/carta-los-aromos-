import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  FolderOpen,
  Image as ImageIcon,
  RotateCw,
  Sparkles,
  Upload,
  X,
  Sliders,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import comboImg from '../assets/images/product_sushi_promo_combo_1792036727551.jpg';
import handRollImg from '../assets/images/product_hand_roll_crispy_1792036728539.jpg';
import gohanImg from '../assets/images/product_gohan_sushi_bowl_1792036728023.jpg';
import sushiBurgerImg from '../assets/images/product_sushi_burger_1792040474784.jpg';
import cheddarFriesImg from '../assets/images/product_cheddar_bacon_fries_1792040474811.jpg';
import heroBannerImg from '../assets/images/hero_sushi_banner_1792036727652.jpg';

interface PhotoEditorModalProps {
  product: Product;
  onClose: () => void;
  onSave?: (updatedProduct: Product) => void;
}

const PRESET_GALLERY = [
  { label: 'Tabla / Promo 30-50 Pzs', image: comboImg, category: 'Combos' },
  { label: 'Sushi Burger Panko', image: sushiBurgerImg, category: 'Burgers' },
  { label: 'Hand Roll Crocante', image: handRollImg, category: 'Hand Rolls' },
  { label: 'Papas Cheddar & Tocino', image: cheddarFriesImg, category: 'Fast Food' },
  { label: 'Gohan Sushi Bowl', image: gohanImg, category: 'Gohan' },
  { label: 'Rolls Calientes & Fríos', image: heroBannerImg, category: 'Rolls' },
  {
    label: 'Avocado Roll (Palta)',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    category: 'Rolls Fríos',
  },
  {
    label: 'Hot Roll Panko Dorado',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=800&auto=format&fit=crop&q=80',
    category: 'Fritos',
  },
  {
    label: 'Gyozas Japonesas',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
    category: 'Entradas',
  },
  {
    label: 'Bebidas & Refrescos',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    category: 'Bebidas',
  },
];

export const PhotoEditorModal: React.FC<PhotoEditorModalProps> = ({
  product,
  onClose,
  onSave,
}) => {
  const { updateProduct } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentImage, setCurrentImage] = useState<string>(product.image || '');
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery' | 'adjust'>('upload');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simple adjustments
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturate, setSaturate] = useState<number>(100);

  // Compress & read file via canvas for optimal localStorage storage
  const processImageFile = (file: File) => {
    setIsLoadingFile(true);
    setErrorMessage(null);

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      setIsLoadingFile(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Max dimension 1000px to maintain crisp quality while keeping payload lean
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setCurrentImage(compressedDataUrl);
        } else {
          setCurrentImage(event.target?.result as string);
        }
        setIsLoadingFile(false);
      };
      img.onerror = () => {
        setErrorMessage('No se pudo procesar la imagen seleccionada.');
        setIsLoadingFile(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo.');
      setIsLoadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setCurrentImage(urlInput.trim());
    setUrlInput('');
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetAdjustments = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
  };

  const handleSave = () => {
    // If adjustments were made and it's a data url or canvas-renderable, render to clean image
    if (rotation !== 0 || brightness !== 100 || contrast !== 100 || saturate !== 100) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const isRotated90or270 = rotation % 180 !== 0;
        canvas.width = isRotated90or270 ? img.height : img.width;
        canvas.height = isRotated90or270 ? img.width : img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          try {
            const finalImage = canvas.toDataURL('image/jpeg', 0.88);
            const updated = { ...product, image: finalImage };
            updateProduct(updated);
            if (onSave) onSave(updated);
            onClose();
            return;
          } catch {
            // Fallback if tainted canvas
          }
        }
        const updated = { ...product, image: currentImage };
        updateProduct(updated);
        if (onSave) onSave(updated);
        onClose();
      };
      img.onerror = () => {
        const updated = { ...product, image: currentImage };
        updateProduct(updated);
        if (onSave) onSave(updated);
        onClose();
      };
      img.src = currentImage;
    } else {
      const updated = { ...product, image: currentImage };
      updateProduct(updated);
      if (onSave) onSave(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12151b] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Editor de Fotos del Producto
              </h3>
              <p className="text-xs text-zinc-400 truncate max-w-[260px] sm:max-w-md">
                {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Photo Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Vista Previa de la Foto
              </span>
              {(rotation !== 0 || brightness !== 100 || contrast !== 100 || saturate !== 100) && (
                <button
                  onClick={handleResetAdjustments}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Restablecer filtros
                </button>
              )}
            </div>

            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner group">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`,
                  }}
                  className="w-full h-full object-cover transition-transform duration-200"
                />
              ) : (
                <div className="text-center p-6 text-zinc-500 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-xs">Sin foto asignada</p>
                </div>
              )}

              {/* Quick overlay controls */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="text-xs text-zinc-200 hover:text-white flex items-center gap-1"
                  title="Girar 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar 90°</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Archivo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Galería Sushi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('adjust')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'adjust'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Filtros & Luz</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD & URL */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* File upload drag drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/80 transition-all space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Toca aquí para seleccionar una foto de tu celular o PC
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Admite fotos tomadas con la cámara, JPG, PNG o WEBP
                  </p>
                </div>
                {isLoadingFile && (
                  <p className="text-xs text-amber-400 animate-pulse font-medium">
                    Optimizando imagen...
                  </p>
                )}
              </div>

              {/* Paste direct URL */}
              <form onSubmit={handleApplyUrl} className="space-y-1.5">
                <label className="text-[11px] text-zinc-400 block font-medium">
                  O pegar enlace directo de la imagen (URL de internet):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/mifoto.jpg"
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold shrink-0"
                  >
                    Cargar URL
                  </button>
                </div>
              </form>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALLERY PRESETS */}
          {activeTab === 'gallery' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Selecciona una foto profesional de nuestra colección de Kitchen Los Aromos:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {PRESET_GALLERY.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCurrentImage(item.image);
                      handleResetAdjustments();
                    }}
                    className={`group text-left rounded-xl overflow-hidden border p-1.5 transition-all ${
                      currentImage === item.image
                        ? 'border-amber-400 bg-amber-950/30 ring-1 ring-amber-400'
                        : 'border-white/5 bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-zinc-950 mb-1.5 relative">
                      <img
                        src={item.image}
                        alt={item.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {currentImage === item.image && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate">
                      {item.label}
                    </p>
                    <p className="text-[9px] text-zinc-500">
                      {item.category}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ADJUSTMENTS */}
          {activeTab === 'adjust' && (
            <div className="space-y-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Brillo ({brightness}%)</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Contraste ({contrast}%)</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Saturación de Color ({saturate}%)</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={saturate}
                    onChange={(e) => setSaturate(Number(e.target.value))}
                    className="w-full accent-red-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Restablecer a valores por defecto
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-white/5 bg-zinc-950/90 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Nueva Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
