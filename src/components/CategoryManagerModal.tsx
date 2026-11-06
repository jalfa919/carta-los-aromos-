import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Edit2,
  Trash2,
  X,
  Check,
  Layers,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Category } from '../types';
import { useStore } from '../context/StoreContext';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'list' | 'create' | 'edit';
  categoryToEdit?: Category | null;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'list',
  categoryToEdit = null,
}) => {
  const {
    categories,
    products,
    addCategory,
    updateCategory,
    deleteCategory,
    activeCategory,
    setActiveCategory,
  } = useStore();

  const [mode, setMode] = useState<'list' | 'create' | 'edit'>(initialMode);
  const [selectedCat, setSelectedCat] = useState<Category | null>(categoryToEdit);

  // Form states
  const [nameInput, setNameInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [orderInput, setOrderInput] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    if (categoryToEdit) {
      setSelectedCat(categoryToEdit);
      setNameInput(categoryToEdit.name);
      setDescriptionInput(categoryToEdit.description || '');
      setOrderInput(categoryToEdit.order || 1);
    } else {
      setSelectedCat(null);
      setNameInput('');
      setDescriptionInput('');
      setOrderInput(categories.length + 1);
    }
  }, [initialMode, categoryToEdit, isOpen, categories.length]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const startCreate = () => {
    setSelectedCat(null);
    setNameInput('');
    setDescriptionInput('');
    setOrderInput(categories.length + 1);
    setMode('create');
  };

  const startEdit = (cat: Category) => {
    setSelectedCat(cat);
    setNameInput(cat.name);
    setDescriptionInput(cat.description || '');
    setOrderInput(cat.order || 1);
    setMode('edit');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    addCategory(nameInput.trim(), descriptionInput.trim());
    showToast(`Categoría "${nameInput.trim()}" creada con éxito`);
    setMode('list');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCat || !nameInput.trim()) return;

    const updated: Category = {
      ...selectedCat,
      name: nameInput.trim(),
      description: descriptionInput.trim(),
      order: Number(orderInput) || selectedCat.order,
    };

    updateCategory(updated);
    showToast(`Categoría "${updated.name}" actualizada con éxito`);
    setMode('list');
  };

  const handleDelete = (cat: Category) => {
    const productCount = products.filter((p) => p.categoryId === cat.id).length;
    let confirmMsg = `¿Eliminar la categoría "${cat.name}"?`;
    if (productCount > 0) {
      confirmMsg = `Atención: Esta categoría contiene ${productCount} producto(s). ¿Seguro que deseas eliminar "${cat.name}"?`;
    }

    if (window.confirm(confirmMsg)) {
      deleteCategory(cat.id);
      if (activeCategory === cat.id) {
        setActiveCategory('all');
      }
      showToast(`Categoría "${cat.name}" eliminada`);
      if (selectedCat?.id === cat.id) {
        setMode('list');
        setSelectedCat(null);
      }
    }
  };

  const moveOrder = (cat: Category, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const currentIndex = sorted.findIndex((c) => c.id === cat.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetCat = sorted[targetIndex];
    const currentOrder = cat.order || currentIndex + 1;
    const targetOrder = targetCat.order || targetIndex + 1;

    updateCategory({ ...cat, order: targetOrder });
    updateCategory({ ...targetCat, order: currentOrder });
    showToast('Orden actualizado');
  };

  const sortedCategories = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12151b] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                {mode === 'create'
                  ? 'Crear Nueva Categoría'
                  : mode === 'edit'
                  ? `Editar Categoría: ${selectedCat?.name}`
                  : 'Gestión y Edición de Categorías'}
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === 'list'
                  ? `Tienes ${categories.length} categorías en la carta`
                  : 'Personaliza el nombre y visibilidad en el menú'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode !== 'list' && (
              <button
                onClick={() => setMode('list')}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs border border-zinc-800"
              >
                Volver a la lista
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-emerald-600/90 text-white text-xs px-4 py-2 text-center font-medium shadow-md">
            {toastMessage}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* LIST VIEW */}
          {mode === 'list' && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-white/5">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Categorías de la Carta
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Agrega nuevas secciones o edita los nombres que ven tus clientes
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startCreate}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nueva Categoría</span>
                </button>
              </div>

              {/* Categories Cards / Table */}
              <div className="space-y-2.5">
                {sortedCategories.map((cat, idx) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-zinc-900/80 hover:bg-zinc-900 border border-white/5 rounded-xl transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-white font-display">
                              {cat.name}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                              {count} {count === 1 ? 'producto' : 'productos'}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Order buttons */}
                        <div className="flex items-center bg-zinc-950 rounded-lg p-0.5 border border-zinc-800 mr-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveOrder(cat, 'up')}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                            title="Subir"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sortedCategories.length - 1}
                            onClick={() => moveOrder(cat, 'down')}
                            className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400"
                            title="Bajar"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Botón Edición de Categoría */}
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>

                        {/* Botón Eliminar */}
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-700/60 hover:border-red-500/30 rounded-lg text-xs transition-colors"
                          title="Eliminar Categoría"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CREATE FORM */}
          {mode === 'create' && (
            <form onSubmit={handleSaveCreate} className="space-y-4 max-w-lg mx-auto">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-white/5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Nombre de la Nueva Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ej: Postres & Helados Artesanales"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Este nombre aparecerá en la barra de navegación del menú.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Descripción de la Categoría (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    placeholder="Ej: Deliciosos postres japoneses, dorayakis y helados para finalizar tu pedido"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Posición / Orden en la Carta
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderInput}
                    onChange={(e) => setOrderInput(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-red-950/50"
                >
                  <Check className="w-4 h-4" />
                  <span>Crear Categoría</span>
                </button>
              </div>
            </form>
          )}

          {/* EDIT FORM */}
          {mode === 'edit' && selectedCat && (
            <form onSubmit={handleSaveEdit} className="space-y-4 max-w-lg mx-auto">
              <div className="bg-zinc-900/80 p-5 rounded-2xl border border-amber-500/20 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-sm text-white focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Descripción de la Categoría
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Posición / Orden
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={orderInput}
                    onChange={(e) => setOrderInput(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div className="pt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>
                    Tiene {products.filter((p) => p.categoryId === selectedCat.id).length} productos vinculados
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-amber-950/50"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios de Categoría</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
