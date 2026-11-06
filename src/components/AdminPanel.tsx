import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Building,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  Edit2,
  Eye,
  EyeOff,
  FileCode,
  FolderPlus,
  Globe,
  Layers,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Maximize2,
  MessageSquare,
  Minimize2,
  Phone,
  Plus,
  Power,
  RefreshCw,
  Search,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Upload,
  Users,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category, Product, Reservation, ReservationStatus } from '../types';
import { formatCLP, sanitizeWhatsAppPhone } from '../utils/formatters';
import { Logo } from './Logo';
import defaultLogoImg from '../assets/images/logo_los_aromos_1792043483679.jpg';

export const AdminPanel: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    products,
    categories,
    settings,
    reservations,
    updateProduct,
    addProduct,
    deleteProduct,
    toggleProductAvailability,
    addCategory,
    updateCategory,
    deleteCategory,
    setPhotoEditorProduct,
    updateSettings,
    updateStoreName,
    toggleAllPaymentMethods,
    togglePaymentMethodVisibility,
    toggleMenuVisibility,
    toggleReservationsVisibility,
    updateReservationStatus,
    deleteReservation,
    resetToDefaults,
    exportCatalogJson,
    importCatalogJson,
    setIsShareModalOpen,
  } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'reservations' | 'settings'>('products');

  // Fullscreen view state for panel & product editor
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isEditorFullScreen, setIsEditorFullScreen] = useState(false);

  // Quick Page Name modal state
  const [isEditPageNameOpen, setIsEditPageNameOpen] = useState(false);
  const [quickPageNameInput, setQuickPageNameInput] = useState(settings.storeName);
  const [quickPageTaglineInput, setQuickPageTaglineInput] = useState(settings.tagline || '');

  // Product management state
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Friendly Panel & Fast Changes state
  const [productViewMode, setProductViewMode] = useState<'grid' | 'table'>('grid');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'soldout' | 'popular'>('all');
  const [quickPriceEditingId, setQuickPriceEditingId] = useState<string | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [isSwitchboardCollapsed, setIsSwitchboardCollapsed] = useState<boolean>(false);

  // Category management state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatOrder, setNewCatOrder] = useState(categories.length + 1);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');
  const [editCatOrder, setEditCatOrder] = useState(1);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || 'promociones');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPieces, setNewProdPieces] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdPopular, setNewProdPopular] = useState(false);

  // Settings form state
  const [storeNameInput, setStoreNameInput] = useState(settings.storeName);
  const [phoneInput, setPhoneInput] = useState(settings.phone);
  const [addressInput, setAddressInput] = useState(settings.address);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState(settings.deliveryFee.toString());
  const [freeDeliveryInput, setFreeDeliveryInput] = useState(settings.freeDeliveryThreshold.toString());
  const [minOrderInput, setMinOrderInput] = useState(settings.minOrderAmount.toString());
  const [openingHoursInput, setOpeningHoursInput] = useState(settings.openingHoursText);
  const [maxCapacityInput, setMaxCapacityInput] = useState(settings.maxGuestsPerSlot.toString());
  const [newPinInput, setNewPinInput] = useState(settings.adminPin);
  const [logoUrlInput, setLogoUrlInput] = useState(settings.logoUrl || '');

  // Bank details
  const [bankName, setBankName] = useState(settings.bankDetails.bank);
  const [bankAccountType, setBankAccountType] = useState(settings.bankDetails.accountType);
  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankDetails.accountNumber);
  const [bankRut, setBankRut] = useState(settings.bankDetails.rut);
  const [bankHolder, setBankHolder] = useState(settings.bankDetails.holderName);
  const [bankEmail, setBankEmail] = useState(settings.bankDetails.email);

  // JSON import/export
  const [importJsonText, setImportJsonText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  if (!isAdminOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pinInput)) {
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN incorrecto. (El PIN por defecto es 1234)');
    }
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseInt(newProdPrice.replace(/\D/g, ''), 10) || 0;
    if (!newProdName.trim() || price <= 0) {
      alert('Ingresa al menos el nombre y un precio válido.');
      return;
    }

    addProduct({
      name: newProdName.trim(),
      price,
      categoryId: newProdCategory,
      description: newProdDesc.trim(),
      piecesCount: newProdPieces ? parseInt(newProdPieces, 10) : undefined,
      image: newProdImage.trim() || '/src/assets/images/product_sushi_promo_combo_1792036727551.jpg',
      available: true,
      isPopular: newProdPopular,
    });

    setIsAddingProduct(false);
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setNewProdPieces('');
    setNewProdImage('');
    setNewProdPopular(false);
    showToast('Producto agregado exitosamente');
  };

  const handleUpdateEditingProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
    setIsEditorFullScreen(false);
    showToast('Producto actualizado correctamente');
  };

  // Category handlers in AdminPanel
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(newCatName.trim(), newCatDesc.trim());
    setIsAddingCategory(false);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatOrder(categories.length + 2);
    showToast(`Categoría "${newCatName.trim()}" creada con éxito`);
  };

  const handleStartEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || '');
    setEditCatOrder(cat.order || 1);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;
    updateCategory({
      ...editingCategory,
      name: editCatName.trim(),
      description: editCatDesc.trim(),
      order: Number(editCatOrder) || editingCategory.order,
    });
    setEditingCategory(null);
    showToast('Categoría actualizada correctamente');
  };

  const handleDeleteCategory = (cat: Category) => {
    const count = products.filter((p) => p.categoryId === cat.id).length;
    let msg = `¿Eliminar la categoría "${cat.name}"?`;
    if (count > 0) {
      msg = `Esta categoría tiene ${count} producto(s) asignados. ¿Eliminar de todas formas?`;
    }
    if (confirm(msg)) {
      deleteCategory(cat.id);
      showToast('Categoría eliminada');
      if (editingCategory?.id === cat.id) setEditingCategory(null);
    }
  };

  const moveCategoryOrder = (cat: Category, direction: 'up' | 'down') => {
    const sorted = [...categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex((c) => c.id === cat.id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const targetCat = sorted[targetIdx];
    const currOrder = cat.order || idx + 1;
    const targetOrder = targetCat.order || targetIdx + 1;
    updateCategory({ ...cat, order: targetOrder });
    updateCategory({ ...targetCat, order: currOrder });
    showToast('Orden de categorías actualizado');
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('La imagen supera los 4MB. Elige una imagen más liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setLogoUrlInput(result);
        updateSettings({ logoUrl: result });
        showToast('¡Logo actualizado exitosamente!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetOfficialLogo = () => {
    setLogoUrlInput(defaultLogoImg);
    updateSettings({ logoUrl: defaultLogoImg });
    showToast('Logo restablecido al diseño oficial Los Aromos');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: storeNameInput,
      phone: phoneInput,
      address: addressInput,
      deliveryFee: parseInt(deliveryFeeInput, 10) || 0,
      freeDeliveryThreshold: parseInt(freeDeliveryInput, 10) || 0,
      minOrderAmount: parseInt(minOrderInput, 10) || 0,
      openingHoursText: openingHoursInput,
      maxGuestsPerSlot: parseInt(maxCapacityInput, 10) || 24,
      adminPin: newPinInput.trim() || '1234',
      logoUrl: logoUrlInput.trim() || defaultLogoImg,
      bankDetails: {
        bank: bankName,
        accountType: bankAccountType,
        accountNumber: bankAccountNumber,
        rut: bankRut,
        holderName: bankHolder,
        email: bankEmail,
      },
    });
    showToast('Configuraciones del local guardadas');
  };

  const handleContactCustomer = (res: Reservation) => {
    const cleanPhone = res.customerPhone.replace(/\D/g, '');
    const msg = `Hola ${res.customerName}, te escribimos de ${settings.storeName} sobre tu reserva #${res.id} para el ${res.date} a las ${res.time} hrs.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleQuickPriceSave = (productId: string) => {
    const numericPrice = parseInt(quickPriceValue.replace(/\D/g, ''), 10);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      showToast('⚠️ Ingresa un precio válido en CLP');
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    updateProduct({
      ...product,
      price: numericPrice,
    });
    setQuickPriceEditingId(null);
    setQuickPriceValue('');
    showToast(`✓ Precio de "${product.name}" actualizado a ${formatCLP(numericPrice)}`);
  };

  const handleToggleProductPopular = (product: Product) => {
    updateProduct({
      ...product,
      isPopular: !product.isPopular,
    });
    showToast(product.isPopular ? `"${product.name}" marcado como estándar` : `★ "${product.name}" marcado como MÁS PEDIDO`);
  };

  // Filtered products with category, text search & availability filter
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(productSearch.toLowerCase());
    let matchesAvailability = true;
    if (filterAvailability === 'available') matchesAvailability = p.available;
    else if (filterAvailability === 'soldout') matchesAvailability = !p.available;
    else if (filterAvailability === 'popular') matchesAvailability = !!p.isPopular;
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center transition-all duration-300 ${
        isFullScreen ? 'p-0' : 'p-2 sm:p-4'
      } animate-in fade-in duration-200`}
    >
      <div
        className={`relative w-full bg-[#11141a] border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullScreen
            ? 'h-full max-h-none rounded-none border-0'
            : 'max-w-6xl rounded-2xl sm:rounded-3xl max-h-[92vh] border'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                  Panel de Administración
                </h2>
                {isAdminLoggedIn && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-300">
                    <Globe className="w-3.5 h-3.5 text-red-400" />
                    <span className="font-semibold text-white truncate max-w-[150px]">{settings.storeName}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Gestión de productos, categorías, pedidos, nombre de página y pagos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <>
                {/* Botón de Edición de Nombre de Página en el Panel */}
                <button
                  type="button"
                  onClick={() => {
                    setQuickPageNameInput(settings.storeName);
                    setQuickPageTaglineInput(settings.tagline || '');
                    setIsEditPageNameOpen(true);
                  }}
                  className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/40 active:scale-95"
                  title="Editar el nombre de la página web"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Editar Nombre Página</span>
                </button>

                {/* Botón de Pantalla Completa en la cabecera */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !isFullScreen;
                    setIsFullScreen(next);
                    showToast(next ? '⛶ Modo Pantalla Completa activado' : '🗗 Modo ventana restaurado');
                  }}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 border ${
                    isFullScreen
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 ring-1 ring-amber-400/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border-zinc-800 hover:border-amber-500/40'
                  }`}
                  title={isFullScreen ? 'Salir de pantalla completa' : 'Visualizar panel en pantalla completa para editar productos cómodamente'}
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Salir Pantalla Completa</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Pantalla Completa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-zinc-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </>
            )}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white text-xs py-2 px-4 text-center font-medium animate-in fade-in">
            ✓ {toastMessage}
          </div>
        )}

        {/* If NOT logged in: PIN Form */}
        {!isAdminLoggedIn ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center space-y-6 my-auto">
            <div className="flex justify-center mb-1">
              <Logo size="md" variant="stacked" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2 font-display">
                Acceso Administrador
              </h3>
              <p className="text-xs text-zinc-400">
                Ingresa el PIN de seguridad del local para gestionar precios, productos y reservas.
              </p>
              <div className="mt-2 inline-block px-2.5 py-1 bg-zinc-900 rounded border border-zinc-800 text-[11px] text-zinc-400 font-mono">
                PIN de prueba: <strong>1234</strong>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ingresa PIN (ej: 1234)"
                className="w-full text-center text-xl tracking-widest px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none font-mono"
              />

              {pinError && (
                <div className="text-xs text-red-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-red-950/40"
              >
                Entrar al Panel
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Centro de Control & Cambios Rápidos */}
            <div className="bg-zinc-950/95 border-b border-white/5 p-3 sm:px-6 shrink-0 transition-all">
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Control Rápido de Estados</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickPageNameInput(settings.storeName);
                      setQuickPageTaglineInput(settings.tagline || '');
                      setIsEditPageNameOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-500 text-[11px] text-zinc-300 hover:text-white transition-all shadow-xs"
                    title="Editar nombre de la página web"
                  >
                    <Edit2 className="w-3 h-3 text-amber-400" />
                    <span>Nombre: <strong className="text-white">{settings.storeName}</strong></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[11px] text-amber-300 font-semibold transition-all shadow-xs active:scale-95"
                    title="Ver enlace y descargar código QR para imprimir"
                  >
                    <Share2 className="w-3 h-3 text-amber-400" />
                    <span>Compartir Carta & QR</span>
                  </button>

                  <a
                    href="/carta.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold transition-all shadow-xs active:scale-95"
                    title="Abrir versión en 1 solo archivo HTML sin servidores"
                  >
                    <FileCode className="w-3 h-3 text-emerald-400" />
                    <span>Carta HTML</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSwitchboardCollapsed(!isSwitchboardCollapsed)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-[11px] font-medium flex items-center gap-1.5 transition-colors shrink-0"
                  title={isSwitchboardCollapsed ? 'Expandir todos los interruptores' : 'Minimizar para tener más espacio para editar productos'}
                >
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">{isSwitchboardCollapsed ? 'Ver Todos los Interruptores' : 'Minimizar (Más Espacio)'}</span>
                  {isSwitchboardCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>

              {/* Si está colapsado: barra compacta horizontal con botones clicables */}
              {isSwitchboardCollapsed ? (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {/* Local general */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.isOpen;
                      updateSettings({ isOpen: nextState });
                      showToast(nextState ? '🟢 Local marcado como ABIERTO' : '🔴 Local marcado como CERRADO');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.isOpen
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                    <span>Local: {settings.isOpen ? 'ABIERTO' : 'CERRADO'}</span>
                  </button>

                  {/* Delivery */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.isDeliveryAvailable;
                      updateSettings({ isDeliveryAvailable: nextState });
                      showToast(nextState ? '🟢 Delivery ACTIVADO' : '🟡 Delivery PAUSADO');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.isDeliveryAvailable
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                    }`}
                  >
                    <span>🛵 Delivery: {settings.isDeliveryAvailable ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Salón */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.isSalonAvailable;
                      updateSettings({ isSalonAvailable: nextState });
                      showToast(nextState ? '🟢 Salón ABIERTO' : '🟡 Salón PAUSADO');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.isSalonAvailable
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                    }`}
                  >
                    <span>🍽️ Salón: {settings.isSalonAvailable ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Retiro */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextState = !settings.isPickupAvailable;
                      updateSettings({ isPickupAvailable: nextState });
                      showToast(nextState ? '🟢 Retiro ACTIVADO' : '🟡 Retiro PAUSADO');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.isPickupAvailable
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                    }`}
                  >
                    <span>🏪 Retiro: {settings.isPickupAvailable ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* Carta */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleMenuVisibility();
                      const next = !settings.showMenu;
                      showToast(next ? '🟢 Carta VISIBLE al público' : '🔴 Carta OCULTADA');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.showMenu !== false
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    <span>📜 Carta: {settings.showMenu !== false ? 'VISIBLE' : 'OCULTA'}</span>
                  </button>

                  {/* Reservas */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleReservationsVisibility();
                      const next = !settings.showReservations;
                      showToast(next ? '🟢 Reservas VISIBLES' : '🔴 Reservas OCULTADAS');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.showReservations !== false
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    <span>📅 Reservas: {settings.showReservations !== false ? 'ACTIVAS' : 'OCULTAS'}</span>
                  </button>

                  {/* Pagos */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleAllPaymentMethods();
                      const next = !settings.showPaymentMethods;
                      showToast(next ? '🟢 Formas de pago VISIBLES' : '🔴 Formas de pago OCULTAS');
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${
                      settings.showPaymentMethods
                        ? 'bg-zinc-900 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/60 border-red-500/50 text-red-300'
                    }`}
                  >
                    <span>💳 Pagos: {settings.showPaymentMethods ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              ) : (
                /* Modo Expandido: 3 filas limpias y legibles */
                <div className="space-y-3 pt-1">
                  {/* Fila 1: Servicios del Local */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* 1. Local General */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !settings.isOpen;
                        updateSettings({ isOpen: nextState });
                        showToast(nextState ? '🟢 Local marcado como ABIERTO' : '🔴 Local marcado como CERRADO');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 shadow-sm ${
                        settings.isOpen
                          ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60'
                          : 'bg-red-950/40 border-red-500/50 hover:bg-red-950/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-zinc-400 font-medium">Local General</span>
                        <span className={`w-2 h-2 rounded-full ${settings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-xs sm:text-sm font-bold font-display ${settings.isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                          {settings.isOpen ? 'ABIERTO' : 'CERRADO'}
                        </span>
                        <span className="text-[9px] text-zinc-400 uppercase">Cambiar</span>
                      </div>
                    </button>

                    {/* 2. Delivery */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !settings.isDeliveryAvailable;
                        updateSettings({ isDeliveryAvailable: nextState });
                        showToast(nextState ? '🟢 Delivery ACTIVADO' : '🟡 Delivery PAUSADO');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 shadow-sm ${
                        settings.isDeliveryAvailable
                          ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60'
                          : 'bg-zinc-900 border-zinc-700/60 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3 text-red-400" />
                          <span>Delivery</span>
                        </span>
                        <span className={`w-2 h-2 rounded-full ${settings.isDeliveryAvailable ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-xs sm:text-sm font-bold font-display ${settings.isDeliveryAvailable ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {settings.isDeliveryAvailable ? 'DISPONIBLE' : 'PAUSADO'}
                        </span>
                        <span className="text-[9px] text-zinc-400 uppercase">Cambiar</span>
                      </div>
                    </button>

                    {/* 3. Salón */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !settings.isSalonAvailable;
                        updateSettings({ isSalonAvailable: nextState });
                        showToast(nextState ? '🟢 Salón / Mesas ABIERTO' : '🟡 Salón PAUSADO');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 shadow-sm ${
                        settings.isSalonAvailable
                          ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60'
                          : 'bg-zinc-900 border-zinc-700/60 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-red-400" />
                          <span>Salón / Mesas</span>
                        </span>
                        <span className={`w-2 h-2 rounded-full ${settings.isSalonAvailable ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-xs sm:text-sm font-bold font-display ${settings.isSalonAvailable ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {settings.isSalonAvailable ? 'DISPONIBLE' : 'PAUSADO'}
                        </span>
                        <span className="text-[9px] text-zinc-400 uppercase">Cambiar</span>
                      </div>
                    </button>

                    {/* 4. Retiro en Local */}
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !settings.isPickupAvailable;
                        updateSettings({ isPickupAvailable: nextState });
                        showToast(nextState ? '🟢 Retiro en local ACTIVADO' : '🟡 Retiro PAUSADO');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all active:scale-95 shadow-sm ${
                        settings.isPickupAvailable
                          ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60'
                          : 'bg-zinc-900 border-zinc-700/60 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                          <Building className="w-3 h-3 text-red-400" />
                          <span>Retiro en Local</span>
                        </span>
                        <span className={`w-2 h-2 rounded-full ${settings.isPickupAvailable ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-xs sm:text-sm font-bold font-display ${settings.isPickupAvailable ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {settings.isPickupAvailable ? 'DISPONIBLE' : 'PAUSADO'}
                        </span>
                        <span className="text-[9px] text-zinc-400 uppercase">Cambiar</span>
                      </div>
                    </button>
                  </div>

                  {/* Fila 2: Visibilidad de Carta y Reservas + Formas de Pago */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    {/* Secciones Carta y Reservas */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 shrink-0">
                        <Layers className="w-3.5 h-3.5 text-red-400" />
                        <span>Secciones:</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        {/* Botón Ocultar / Mostrar Carta */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleMenuVisibility();
                            const next = !settings.showMenu;
                            showToast(next ? '🟢 Carta VISIBLE al público' : '🔴 Carta OCULTADA');
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                            settings.showMenu !== false
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                              : 'bg-red-950/50 border-red-500/50 text-red-300 hover:bg-red-900/50'
                          }`}
                          title="Toca para mostrar u ocultar la carta digital"
                        >
                          <Utensils className="w-3.5 h-3.5" />
                          {settings.showMenu !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Carta: VISIBLE</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-red-400" />
                              <span>Carta: OCULTA</span>
                            </>
                          )}
                        </button>

                        {/* Botón Ocultar / Mostrar Reserva */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleReservationsVisibility();
                            const next = !settings.showReservations;
                            showToast(next ? '🟢 Reservas VISIBLES al público' : '🔴 Reservas OCULTADAS');
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                            settings.showReservations !== false
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                              : 'bg-red-950/50 border-red-500/50 text-red-300 hover:bg-red-900/50'
                          }`}
                          title="Toca para mostrar u ocultar el módulo de reservas"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {settings.showReservations !== false ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Reservas: ACTIVAS</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-red-400" />
                              <span>Reservas: OCULTAS</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Formas de Pago */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 shrink-0">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pagos:</span>
                      </span>
                      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto no-scrollbar">
                        {/* Switch Maestro */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleAllPaymentMethods();
                            const next = !settings.showPaymentMethods;
                            showToast(next ? '🟢 Formas de pago VISIBLES en carrito' : '🔴 Formas de pago OCULTAS');
                          }}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
                            settings.showPaymentMethods
                              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                              : 'bg-red-950/50 border-red-500/50 text-red-300'
                          }`}
                        >
                          <span>{settings.showPaymentMethods ? 'Todas ON' : 'Todas OFF'}</span>
                        </button>

                        {/* Individuales */}
                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('transferencia');
                            const next = !settings.enabledPaymentMethods?.transferencia;
                            showToast(next ? '🟢 Transferencia: VISIBLE' : '🟡 Transferencia: OCULTA');
                          }}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
                            settings.enabledPaymentMethods?.transferencia
                              ? 'bg-zinc-900 border-zinc-700 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                          }`}
                        >
                          <span>Transf. {settings.enabledPaymentMethods?.transferencia ? '✓' : '✗'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('efectivo');
                            const next = !settings.enabledPaymentMethods?.efectivo;
                            showToast(next ? '🟢 Efectivo: VISIBLE' : '🟡 Efectivo: OCULTO');
                          }}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
                            settings.enabledPaymentMethods?.efectivo
                              ? 'bg-zinc-900 border-zinc-700 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                          }`}
                        >
                          <span>Efectivo {settings.enabledPaymentMethods?.efectivo ? '✓' : '✗'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('debito');
                            const next = !settings.enabledPaymentMethods?.debito;
                            showToast(next ? '🟢 Débito/POS: VISIBLE' : '🟡 Débito/POS: OCULTO');
                          }}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
                            settings.enabledPaymentMethods?.debito
                              ? 'bg-zinc-900 border-zinc-700 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-500 line-through'
                          }`}
                        >
                          <span>Débito {settings.enabledPaymentMethods?.debito ? '✓' : '✗'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-white/5 bg-zinc-950 shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('products')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Utensils className="w-4 h-4 text-red-500" />
                <span>Productos & Precios ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-red-500" />
                <span>Categorías ({categories.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reservations')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'reservations'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Gestión de Reservas</span>
                {reservations.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {reservations.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                <Settings className="w-4 h-4 text-red-500" />
                <span>Configuración del Local</span>
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* TAB 1: PRODUCTS & PRICES */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Banner si la carta está oculta */}
                  {settings.showMenu === false && (
                    <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2.5 text-xs text-red-200">
                        <EyeOff className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-red-300">La Carta Digital está actualmente OCULTA a los clientes</span>
                          <span className="text-[11px] text-zinc-300">Los visitantes ven el aviso de carta en mantención. Puedes editar productos aquí y mostrarla cuando esté lista.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMenuVisibility();
                          showToast('🟢 Carta marcada como VISIBLE al público');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-md active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Botón Mostrar Carta</span>
                      </button>
                    </div>
                  )}

                  {/* Controls Bar & Fast Filters */}
                  <div className="space-y-2.5 bg-zinc-900/60 p-3 sm:p-4 rounded-2xl border border-white/5">
                    {/* Top Row: Search, Category, View Mode Toggle, Action Buttons */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        {/* Search input with quick clear */}
                        <div className="relative w-full sm:w-56">
                          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            className="w-full pl-8 pr-7 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                          />
                          {productSearch && (
                            <button
                              type="button"
                              onClick={() => setProductSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Category Dropdown */}
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="all">Todas las Categorías ({categories.length})</option>
                          {categories.map((c) => {
                            const count = products.filter((p) => p.categoryId === c.id).length;
                            return (
                              <option key={c.id} value={c.id}>
                                {c.name} ({count})
                              </option>
                            );
                          })}
                        </select>

                        {/* View Mode Toggle: Tarjetas vs Tabla */}
                        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                          <button
                            type="button"
                            onClick={() => setProductViewMode('grid')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              productViewMode === 'grid'
                                ? 'bg-amber-500 text-black shadow-xs font-bold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Vista Cuadrícula con fotos (Más visual y amigable)"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tarjetas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductViewMode('table')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              productViewMode === 'table'
                                ? 'bg-amber-500 text-black shadow-xs font-bold'
                                : 'text-zinc-400 hover:text-white'
                            }`}
                            title="Vista Lista / Tabla compacta"
                          >
                            <List className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tabla</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Botón Pantalla Completa para Editar Productos */}
                        <button
                          type="button"
                          onClick={() => {
                            const next = !isFullScreen;
                            setIsFullScreen(next);
                            showToast(next ? '⛶ Pantalla Completa activada para editar productos' : '🗗 Modo ventana restaurado');
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 border ${
                            isFullScreen
                              ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 hover:bg-amber-500/35 ring-1 ring-amber-400/30'
                              : 'bg-zinc-950 hover:bg-zinc-800 text-amber-400 hover:text-amber-300 border-amber-500/40'
                          }`}
                          title={isFullScreen ? 'Salir de pantalla completa' : 'Visualizar panel en pantalla completa para editar productos cómodamente'}
                        >
                          {isFullScreen ? (
                            <>
                              <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Salir Pantalla Completa</span>
                            </>
                          ) : (
                            <>
                              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                              <span>⛶ Pantalla Completa</span>
                            </>
                          )}
                        </button>

                        {/* Botón de Creación de Nuevas Categorías */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('categories');
                            setIsAddingCategory(true);
                          }}
                          className="px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          title="Crear nueva categoría"
                        >
                          <Plus className="w-3.5 h-3.5 text-red-400" />
                          <span>+ Categoría</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(true)}
                          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Nuevo Producto</span>
                        </button>
                      </div>
                    </div>

                    {/* Category Chips Carousel for 1-Click Fast Filtering */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Categorías (1 Clic para filtrar):</span>
                        </span>
                        {selectedCategoryFilter !== 'all' && (
                          <button
                            type="button"
                            onClick={() => setSelectedCategoryFilter('all')}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                          >
                            Ver Todas
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                            selectedCategoryFilter === 'all'
                              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                              : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800'
                          }`}
                        >
                          Todas ({products.length})
                        </button>
                        {categories.map((c) => {
                          const count = products.filter((p) => p.categoryId === c.id).length;
                          const isSelected = selectedCategoryFilter === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCategoryFilter(c.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-sm'
                                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
                              }`}
                            >
                              <span>{c.name}</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  isSelected ? 'bg-black/20 text-black font-bold' : 'bg-zinc-800 text-zinc-400'
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Row: Quick Status Filter Pills & Count */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <span className="text-[11px] text-zinc-500 uppercase font-bold mr-1">Estado:</span>
                        <button
                          type="button"
                          onClick={() => setFilterAvailability('all')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                            filterAvailability === 'all'
                              ? 'bg-white/10 text-white font-semibold'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          Todos ({products.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterAvailability('available')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            filterAvailability === 'available'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Disponibles ({products.filter((p) => p.available).length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterAvailability('soldout')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            filterAvailability === 'soldout'
                              ? 'bg-red-950/80 text-red-300 border border-red-500/40 font-semibold'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>Agotados ({products.filter((p) => !p.available).length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterAvailability('popular')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                            filterAvailability === 'popular'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40 font-semibold'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>★ Más Pedidos ({products.filter((p) => p.isPopular).length})</span>
                        </button>
                      </div>

                      <span className="text-[11px] text-zinc-400 font-mono">
                        Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
                      </span>
                    </div>
                  </div>

                  {/* Banner de Ayuda y Cambios Amigables */}
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-transparent border border-amber-500/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="text-[11px] text-zinc-300">
                        <strong className="text-white font-semibold">Atajos para cambios rápidos:</strong> Clic directo en cualquier precio <span className="text-amber-300 font-mono font-bold">$X.XXX</span> para cambiarlo • Toca <span className="text-emerald-400 font-bold">Disponible</span> / <span className="text-red-400 font-bold">Agotado</span> para pausar platos • Toca <span className="text-amber-300 font-bold">Foto</span> para cambiar imágenes.
                      </div>
                    </div>
                  </div>

                  {/* Add Product Modal Drawer */}
                  {isAddingProduct && (
                    <form
                      onSubmit={handleSaveNewProduct}
                      className="p-4 sm:p-5 bg-zinc-900/90 border border-red-500/30 rounded-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-sm font-bold text-white font-display">
                          Agregar Nuevo Rollo / Producto
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const next = !isFullScreen;
                              setIsFullScreen(next);
                              showToast(next ? '⛶ Pantalla Completa activada para agregar productos' : '🗗 Modo ventana restaurado');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                            title={isFullScreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa para agregar productos con comodidad'}
                          >
                            {isFullScreen ? (
                              <>
                                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Salir Pantalla Completa</span>
                              </>
                            ) : (
                              <>
                                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Pantalla Completa</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingProduct(false)}
                            className="text-zinc-400 hover:text-white p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Nombre del Producto *</label>
                          <input
                            type="text"
                            required
                            value={newProdName}
                            onChange={(e) => setNewProdName(e.target.value)}
                            placeholder="Ej: Ebi Hot Panko Roll"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Precio en CLP *</label>
                          <input
                            type="number"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            placeholder="Ej: 5990"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Descripción / Relleno</label>
                          <input
                            type="text"
                            value={newProdDesc}
                            onChange={(e) => setNewProdDesc(e.target.value)}
                            placeholder="Ej: Camarón panko, palta, queso crema frito en tempura"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">N° de Piezas</label>
                            <input
                              type="number"
                              value={newProdPieces}
                              onChange={(e) => setNewProdPieces(e.target.value)}
                              placeholder="10"
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                            />
                          </div>

                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newProdPopular}
                                onChange={(e) => setNewProdPopular(e.target.checked)}
                                className="rounded bg-zinc-950 border-zinc-800 text-red-600"
                              />
                              <span>Destacado</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Photo Section for New Product */}
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                        <label className="text-[11px] text-zinc-400 block font-medium">Foto del Producto</label>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {newProdImage ? (
                              <img src={newProdImage} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                          <div className="flex-1 w-full space-y-2">
                            <input
                              type="text"
                              value={newProdImage}
                              onChange={(e) => setNewProdImage(e.target.value)}
                              placeholder="Pega la URL de la foto o sube un archivo"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>Subir Foto del Dispositivo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      setNewProdImage(evt.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => setNewProdImage(defaultLogoImg)}
                                className="px-2.5 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800"
                              >
                                Usar Logo de la Casa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Guardar Producto
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Edit Product Modal / Fullscreen Studio */}
                  {editingProduct && isEditorFullScreen ? (
                    /* ESTUDIO DE EDICIÓN EN PANTALLA COMPLETA */
                    <div className="fixed inset-0 z-[60] bg-[#0c0e12] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
                      {/* Studio Top Navbar */}
                      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditorFullScreen(false)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            title="Salir del modo pantalla completa"
                          >
                            <Minimize2 className="w-4 h-4 text-amber-400" />
                            <span className="hidden sm:inline">Modo Ventana</span>
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                ⛶ Estudio de Edición en Pantalla Completa
                              </span>
                              <h3 className="text-base sm:text-lg font-bold text-white font-display truncate max-w-md">
                                {editingProduct.name || 'Sin nombre'}
                              </h3>
                            </div>
                            <span className="text-[11px] text-zinc-400">
                              Vista amplia con edición de fotos y vista previa en tiempo real
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Botón directo de fotos */}
                          <button
                            type="button"
                            onClick={() => setPhotoEditorProduct(editingProduct)}
                            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                            title="Abrir editor y recortador de fotos"
                          >
                            <Camera className="w-4 h-4 text-amber-400" />
                            <span className="hidden md:inline">📸 Botón de Edición de Fotos</span>
                            <span className="md:hidden">Fotos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setIsEditorFullScreen(false);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-medium transition-colors"
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            onClick={handleUpdateEditingProduct}
                            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-950/50 active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            <span>Guardar Cambios</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setIsEditorFullScreen(false);
                            }}
                            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                            title="Cerrar editor"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </header>

                      {/* Studio Body Content */}
                      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                        {/* Columna Izquierda: Foto y Vista Previa en Vivo (5 columnas) */}
                        <div className="lg:col-span-5 space-y-6">
                          {/* Foto del Producto Box */}
                          <div className="p-5 bg-zinc-900/80 border border-white/10 rounded-2xl space-y-4 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <Camera className="w-4 h-4 text-amber-400" />
                                <span>Foto del Producto</span>
                              </h4>
                              <span className="text-[11px] text-zinc-400 font-mono">Formato sugerido 4:3</span>
                            </div>

                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-white/10 shadow-inner group">
                              <img
                                src={editingProduct.image}
                                alt={editingProduct.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                                <button
                                  type="button"
                                  onClick={() => setPhotoEditorProduct(editingProduct)}
                                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Abrir Editor de Fotos</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setPhotoEditorProduct(editingProduct)}
                                className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                              >
                                <Camera className="w-4 h-4" />
                                <span>📸 Botón de Edición de Fotos</span>
                              </button>

                              <label className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition-colors">
                                <Upload className="w-4 h-4 text-zinc-300" />
                                <span>Subir Archivo de Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (evt) => {
                                      setEditingProduct({
                                        ...editingProduct,
                                        image: evt.target?.result as string,
                                      });
                                      showToast('Foto cargada');
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>

                            <div>
                              <label className="text-[11px] text-zinc-400 block mb-1">O ingresar URL de imagen externa:</label>
                              <input
                                type="text"
                                value={editingProduct.image}
                                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                placeholder="https://..."
                                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          {/* Vista Previa en Vivo (Live Store Card Preview) */}
                          <div className="p-5 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Vista Previa en Tienda (Clientes)</span>
                              </h4>
                              <span className="text-[10px] text-zinc-500 font-mono">Actualización en vivo</span>
                            </div>

                            <div className="max-w-xs mx-auto">
                              {/* Live rendered Card */}
                              <article className="flex flex-col bg-[#14171d] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-900">
                                  <img
                                    src={editingProduct.image}
                                    alt={editingProduct.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {!editingProduct.available && (
                                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2 text-center">
                                      <span className="text-xs font-semibold uppercase tracking-wider text-red-300 bg-red-950/80 px-2.5 py-1 rounded-md border border-red-800">
                                        Agotado por hoy
                                      </span>
                                    </div>
                                  )}
                                  {editingProduct.isPopular && editingProduct.available && (
                                    <div className="absolute top-2.5 left-2.5">
                                      <span className="text-[10px] font-semibold text-amber-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded border border-amber-500/30">
                                        ★ Más Pedido
                                      </span>
                                    </div>
                                  )}
                                  {editingProduct.piecesCount && (
                                    <div className="absolute bottom-2.5 right-2.5">
                                      <span className="text-[10px] font-semibold text-zinc-200 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 font-mono">
                                        {editingProduct.piecesCount} piezas
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                                  <div>
                                    <h5 className="font-bold text-white text-sm line-clamp-1">
                                      {editingProduct.name || 'Nombre del producto'}
                                    </h5>
                                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">
                                      {editingProduct.description || 'Sin descripción'}
                                    </p>
                                  </div>
                                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                                    <span className="text-base font-bold font-mono text-white">
                                      {formatCLP(editingProduct.price || 0)}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-red-600/30 text-red-400 border border-red-500/30 text-[10px] font-bold">
                                      Agregar +
                                    </span>
                                  </div>
                                </div>
                              </article>
                            </div>
                          </div>
                        </div>

                        {/* Columna Derecha: Formulario Completo de Edición (7 columnas) */}
                        <div className="lg:col-span-7 space-y-6">
                          <div className="p-6 bg-zinc-900/80 border border-white/10 rounded-2xl space-y-5 shadow-xl">
                            <div className="border-b border-white/5 pb-2 flex items-center justify-between">
                              <h4 className="text-sm font-bold text-white font-display">
                                Información &amp; Atributos del Producto
                              </h4>
                              <span className="text-xs text-zinc-400">Edición en pantalla completa</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="sm:col-span-2">
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  Nombre del Rollo / Producto *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                  placeholder="Ej: Ebi Hot Panko Roll"
                                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-sm text-white focus:outline-none transition-colors"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  Categoría *
                                </label>
                                <select
                                  value={editingProduct.categoryId}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                                >
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  Precio en CLP *
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">$</span>
                                  <input
                                    type="number"
                                    required
                                    value={editingProduct.price}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        price: parseInt(e.target.value, 10) || 0,
                                      })
                                    }
                                    placeholder="5990"
                                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-sm text-white font-mono focus:outline-none transition-colors"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  N° de Piezas (Opcional)
                                </label>
                                <input
                                  type="number"
                                  value={editingProduct.piecesCount || ''}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      piecesCount: e.target.value ? parseInt(e.target.value, 10) : undefined,
                                    })
                                  }
                                  placeholder="Ej: 10"
                                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white font-mono focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  Ingredientes Principales (separados por coma)
                                </label>
                                <input
                                  type="text"
                                  value={editingProduct.ingredients?.join(', ') || ''}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      ingredients: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                                    })
                                  }
                                  placeholder="Ej: Salmón, Palta, Queso Crema, Panko"
                                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="text-xs text-zinc-300 font-medium block mb-1">
                                  Descripción Completa para el Menú
                                </label>
                                <textarea
                                  rows={3}
                                  value={editingProduct.description}
                                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                  placeholder="Describe el producto, rellenos, salsas y presentación..."
                                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl text-xs text-white focus:outline-none transition-colors"
                                />
                              </div>
                            </div>

                            {/* Estado de Disponibilidad & Destacados */}
                            <div className="pt-3 border-t border-white/5 space-y-3">
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                                Estado de Venta & Destacado
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Switch Disponibilidad */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      available: !editingProduct.available,
                                    })
                                  }
                                  className={`p-3.5 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                                    editingProduct.available
                                      ? 'bg-emerald-950/40 border-emerald-500/50 hover:bg-emerald-950/60'
                                      : 'bg-red-950/40 border-red-500/50 hover:bg-red-950/60'
                                  }`}
                                >
                                  <div>
                                    <span className="text-xs font-bold block text-white">Disponibilidad en Tienda</span>
                                    <span className="text-[11px] text-zinc-400">
                                      {editingProduct.available ? 'El producto se puede pedir' : 'Marcado como AGOTADO por hoy'}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                      editingProduct.available
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-red-600 text-white'
                                    }`}
                                  >
                                    {editingProduct.available ? 'Disponible' : 'Agotado'}
                                  </span>
                                </button>

                                {/* Switch Destacado / Popular */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      isPopular: !editingProduct.isPopular,
                                    })
                                  }
                                  className={`p-3.5 rounded-xl border text-left transition-all active:scale-95 flex items-center justify-between ${
                                    editingProduct.isPopular
                                      ? 'bg-amber-950/40 border-amber-500/50 hover:bg-amber-950/60'
                                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                                  }`}
                                >
                                  <div>
                                    <span className="text-xs font-bold block text-white">Plato Destacado / Popular</span>
                                    <span className="text-[11px] text-zinc-400">
                                      {editingProduct.isPopular ? 'Muestra medalla "Más Pedido"' : 'Normal en la carta'}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                      editingProduct.isPopular
                                        ? 'bg-amber-500 text-black'
                                        : 'bg-zinc-800 text-zinc-400'
                                    }`}
                                  >
                                    {editingProduct.isPopular ? '★ Destacado' : 'Estándar'}
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(null);
                                  setIsEditorFullScreen(false);
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={handleUpdateEditingProduct}
                                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/40 active:scale-95"
                              >
                                <Check className="w-4 h-4" />
                                <span>Guardar Cambios del Producto</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : editingProduct && (
                    /* MODO VENTANA INLINE */
                    <div className="p-4 sm:p-5 bg-zinc-900 border border-amber-500/30 rounded-2xl space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-amber-400 font-display">
                            Editar Producto: {editingProduct.name}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                            ID: {editingProduct.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Botón de Pantalla Completa para Editar Producto */}
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditorFullScreen(true);
                              showToast('⛶ Estudio de Edición en Pantalla Completa activado');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                            title="Editar este producto en pantalla completa con vista previa en vivo"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                            <span>Pantalla Completa para Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(null);
                              setIsEditorFullScreen(false);
                            }}
                            className="text-zinc-400 hover:text-white p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Banner de Acceso a Pantalla Completa para Editar Producto */}
                      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3 text-xs text-amber-200">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/40">
                            <Maximize2 className="w-4 h-4 text-amber-400" />
                          </div>
                          <div>
                            <span className="font-bold block text-white text-xs sm:text-sm">¿Deseas editar en Pantalla Completa?</span>
                            <span className="text-[11px] text-zinc-300">
                              Abre el estudio con vista previa de cliente en vivo, recortador de fotos de alta resolución y más espacio.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditorFullScreen(true);
                            showToast(`⛶ Editando "${editingProduct.name}" en Pantalla Completa`);
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Visualizar Pantalla Completa</span>
                        </button>
                      </div>
                      <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 relative group">
                          <img src={editingProduct.image} alt={editingProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1.5 w-full text-left">
                          <span className="text-[11px] text-zinc-400 font-medium block">Foto del Producto</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Botón de Edición de Fotos */}
                            <button
                              type="button"
                              onClick={() => setPhotoEditorProduct(editingProduct)}
                              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                              title="Abrir editor de fotos completo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>📸 Botón de Edición de Fotos</span>
                            </button>

                            <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-zinc-700">
                              <Upload className="w-3 h-3" />
                              <span>Subir Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    setEditingProduct({
                                      ...editingProduct,
                                      image: evt.target?.result as string,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Nombre</label>
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Precio CLP</label>
                          <input
                            type="number"
                            value={editingProduct.price}
                            onChange={(e) => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Categoría</label>
                          <select
                            value={editingProduct.categoryId}
                            onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Descripción</label>
                        <input
                          type="text"
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(null);
                            setIsEditorFullScreen(false);
                          }}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateEditingProduct}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Products Content: Grid or Table with Quick Changes */}
                  {filteredProducts.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-zinc-900/40 rounded-2xl border border-white/5">
                      <Search className="w-8 h-8 text-zinc-600 mx-auto" />
                      <h4 className="text-sm font-bold text-white">No se encontraron productos</h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        {productSearch
                          ? `No hay productos que coincidan con "${productSearch}" en este filtro.`
                          : 'No hay productos en esta categoría o estado de disponibilidad seleccionados.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setProductSearch('');
                          setSelectedCategoryFilter('all');
                          setFilterAvailability('all');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition-colors"
                      >
                        Restablecer todos los filtros
                      </button>
                    </div>
                  ) : productViewMode === 'grid' ? (
                    /* VISTA 1: CUADRÍCULA VISUAL (MÁS AMIGABLE) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredProducts.map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId);
                        const isEditingThisPrice = quickPriceEditingId === p.id;
                        return (
                          <div
                            key={p.id}
                            className={`bg-zinc-900/80 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-zinc-700 hover:shadow-xl shadow-md group/card ${
                              p.available ? 'border-white/5' : 'border-red-900/40 bg-zinc-950/70'
                            }`}
                          >
                            {/* Product Image Slot */}
                            <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                              />

                              {/* Availability Badge Button (1-Click toggle) */}
                              <div className="absolute top-2.5 left-2.5">
                                <button
                                  type="button"
                                  onClick={() => toggleProductAvailability(p.id)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 backdrop-blur-md ${
                                    p.available
                                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/90'
                                      : 'bg-red-950/95 text-red-300 border border-red-500/60 hover:bg-red-900/95'
                                  }`}
                                  title="Toca para cambiar la disponibilidad (Disponible / Agotado)"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${p.available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                                  <span>{p.available ? 'Disponible' : 'Agotado'}</span>
                                </button>
                              </div>

                              {/* Direct Photo Edit Button */}
                              <button
                                type="button"
                                onClick={() => setPhotoEditorProduct(p)}
                                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 hover:bg-black text-amber-400 hover:text-amber-300 border border-white/15 text-[10px] font-semibold flex items-center gap-1 shadow-md transition-all active:scale-95 backdrop-blur-md"
                                title="Editar o cambiar foto del producto"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Foto</span>
                              </button>

                              {/* Popular Badge Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleProductPopular(p)}
                                className={`absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md transition-all active:scale-95 flex items-center gap-1 backdrop-blur-md ${
                                  p.isPopular
                                    ? 'bg-amber-500 text-black border border-amber-400'
                                    : 'bg-black/70 hover:bg-black text-zinc-400 hover:text-white border border-white/10'
                                }`}
                                title={p.isPopular ? 'Toca para quitar de destacados' : 'Toca para marcar como Más Pedido / Destacado'}
                              >
                                <span>{p.isPopular ? '★ Más Pedido' : '☆ Destacar'}</span>
                              </button>

                              {p.piecesCount && (
                                <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-zinc-200 text-[10px] font-mono border border-white/10 backdrop-blur-md">
                                  {p.piecesCount} piezas
                                </span>
                              )}
                            </div>

                            {/* Card Content */}
                            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                              <div>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block truncate">
                                  {cat?.name || p.categoryId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsEditorFullScreen(false);
                                  }}
                                  className="font-bold text-white text-sm line-clamp-1 mt-0.5 text-left hover:text-amber-400 transition-colors w-full cursor-pointer flex items-center justify-between group/title"
                                  title="Clic para editar este producto"
                                >
                                  <span className="truncate">{p.name}</span>
                                  <Edit2 className="w-3 h-3 text-zinc-600 group-hover/title:text-amber-400 opacity-0 group-hover/title:opacity-100 transition-opacity shrink-0 ml-1" />
                                </button>
                                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                                  {p.description || 'Sin descripción'}
                                </p>
                              </div>

                              {/* Price Row with Fast Inline Edit */}
                              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] text-zinc-500 uppercase font-medium block">
                                    Precio CLP (Clic para editar)
                                  </span>
                                  {isEditingThisPrice ? (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <div className="relative w-24">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                                        <input
                                          type="number"
                                          autoFocus
                                          value={quickPriceValue}
                                          onChange={(e) => setQuickPriceValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleQuickPriceSave(p.id);
                                            if (e.key === 'Escape') setQuickPriceEditingId(null);
                                          }}
                                          className="w-full pl-5 pr-1 py-1 bg-zinc-950 border border-amber-500 rounded text-xs text-white font-mono focus:outline-none"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickPriceSave(p.id)}
                                        className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                        title="Guardar precio"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setQuickPriceEditingId(null)}
                                        className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                                        title="Cancelar"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuickPriceEditingId(p.id);
                                        setQuickPriceValue(p.price.toString());
                                      }}
                                      className="group/pbtn flex items-center gap-1.5 py-1 px-2 -ml-1 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/60 text-sm font-bold font-mono text-white hover:text-amber-300 transition-all shadow-xs"
                                      title="Clic para cambiar precio rápido"
                                    >
                                      <span>{formatCLP(p.price)}</span>
                                      <Edit2 className="w-3 h-3 text-zinc-500 group-hover/pbtn:text-amber-400" />
                                    </button>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                  {/* Botón Pantalla Completa */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsEditorFullScreen(true);
                                      showToast(`⛶ Editando "${p.name}" en Pantalla Completa`);
                                    }}
                                    className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all active:scale-95"
                                    title="Visualizar y editar en Pantalla Completa"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Botón Editar Ventana */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setIsEditorFullScreen(false);
                                    }}
                                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                    title="Editar producto"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Botón Eliminar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`¿Eliminar ${p.name}?`)) {
                                        deleteProduct(p.id);
                                        showToast('Producto eliminado');
                                      }
                                    }}
                                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-500 hover:text-red-400 transition-colors"
                                    title="Eliminar producto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* VISTA 2: TABLA COMPACTA CON EDICIÓN RÁPIDA DE PRECIOS */
                    <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-950/80 text-zinc-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="py-3 px-4">Producto</th>
                              <th className="py-3 px-4">Categoría</th>
                              <th className="py-3 px-4">Precio (CLP)</th>
                              <th className="py-3 px-4">Disponibilidad</th>
                              <th className="py-3 px-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-zinc-300">
                            {filteredProducts.map((p) => {
                              const cat = categories.find((c) => c.id === p.categoryId);
                              const isEditingThisPrice = quickPriceEditingId === p.id;
                              return (
                                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-4 font-medium text-white">
                                    <div className="flex items-center gap-2.5">
                                      <button
                                        type="button"
                                        onClick={() => setPhotoEditorProduct(p)}
                                        className="w-9 h-9 rounded-lg bg-zinc-800 overflow-hidden shrink-0 relative group/thumb cursor-pointer border border-zinc-700/60"
                                        title="Click para editar foto"
                                      >
                                        <img
                                          src={p.image}
                                          alt={p.name}
                                          className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                                        </div>
                                      </button>
                                      <div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditingProduct(p);
                                            setIsEditorFullScreen(false);
                                          }}
                                          className="flex items-center gap-1.5 text-left hover:text-amber-400 transition-colors cursor-pointer group/tblname"
                                          title="Clic para editar este producto"
                                        >
                                          <span className="font-semibold text-white group-hover/tblname:text-amber-300">{p.name}</span>
                                          {p.isPopular && (
                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                                              ★ Más Pedido
                                            </span>
                                          )}
                                        </button>
                                        {p.piecesCount && (
                                          <span className="text-[10px] text-zinc-500 block">
                                            {p.piecesCount} piezas
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4 text-zinc-400">
                                    {cat?.name || p.categoryId}
                                  </td>

                                  {/* Quick Price Edit in place */}
                                  <td className="py-3 px-4">
                                    {isEditingThisPrice ? (
                                      <div className="flex items-center gap-1">
                                        <div className="relative w-24">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">$</span>
                                          <input
                                            type="number"
                                            autoFocus
                                            value={quickPriceValue}
                                            onChange={(e) => setQuickPriceValue(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleQuickPriceSave(p.id);
                                              if (e.key === 'Escape') setQuickPriceEditingId(null);
                                            }}
                                            className="w-full pl-5 pr-1 py-1 bg-zinc-950 border border-amber-500 rounded text-xs text-white font-mono focus:outline-none"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickPriceSave(p.id)}
                                          className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                                          title="Guardar precio"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setQuickPriceEditingId(null)}
                                          className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white"
                                          title="Cancelar"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setQuickPriceEditingId(p.id);
                                          setQuickPriceValue(p.price.toString());
                                        }}
                                        className="group/tblprice flex items-center gap-1.5 py-1 px-2 -ml-1 rounded-lg bg-zinc-950/80 border border-zinc-800 hover:border-amber-500/60 transition-all shadow-xs"
                                        title="Clic para cambiar precio rápidamente"
                                      >
                                        <span className="font-mono font-bold text-white tabular-nums group-hover/tblprice:text-amber-400">
                                          {formatCLP(p.price)}
                                        </span>
                                        <Edit2 className="w-3 h-3 text-zinc-500 group-hover/tblprice:text-amber-400" />
                                      </button>
                                    )}
                                  </td>

                                  {/* Quick Stock Toggle */}
                                  <td className="py-3 px-4">
                                    <button
                                      type="button"
                                      onClick={() => toggleProductAvailability(p.id)}
                                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                                        p.available
                                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                          : 'bg-red-950/80 text-red-400 border border-red-800'
                                      }`}
                                      title="Click para cambiar disponibilidad"
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          p.available ? 'bg-emerald-400' : 'bg-red-400'
                                        }`}
                                      />
                                      <span>{p.available ? 'Disponible' : 'Agotado'}</span>
                                    </button>
                                  </td>

                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                      {/* Botón de Edición en Pantalla Completa */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingProduct(p);
                                          setIsEditorFullScreen(true);
                                          showToast(`⛶ Editando "${p.name}" en Pantalla Completa`);
                                        }}
                                        className="px-2.5 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                                        title="Visualizar y editar este producto en Pantalla Completa"
                                      >
                                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                                        <span className="whitespace-nowrap hidden sm:inline">Editar Pantalla Completa</span>
                                        <span className="sm:hidden">Pantalla Completa</span>
                                      </button>

                                      {/* Botón de Edición de Fotos */}
                                      <button
                                        type="button"
                                        onClick={() => setPhotoEditorProduct(p)}
                                        className="px-2 py-1.5 hover:bg-zinc-800 rounded-md text-amber-400 hover:text-amber-300 border border-amber-500/20 flex items-center gap-1 text-[11px]"
                                        title="Editar foto del producto"
                                      >
                                        <Camera className="w-3.5 h-3.5" />
                                        <span className="hidden xl:inline">Foto</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingProduct(p);
                                          setIsEditorFullScreen(false);
                                        }}
                                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white"
                                        title="Editar Rápido (Modo Ventana)"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm(`¿Eliminar ${p.name}?`)) {
                                            deleteProduct(p.id);
                                            showToast('Producto eliminado');
                                          }
                                        }}
                                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400"
                                        title="Eliminar"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-4">
                  {/* Top Header with Botón de Creación de Nuevas Categorías */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
                    <div>
                      <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                        <Layers className="w-4 h-4 text-red-500" />
                        <span>Gestión y Edición de Categorías</span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Organiza las secciones del menú para que tus clientes encuentren rápidamente sus rolls
                      </p>
                    </div>

                    {/* Botón de creación de nuevas categorías */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(true);
                        setEditingCategory(null);
                        setNewCatOrder(categories.length + 1);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Nueva Categoría</span>
                    </button>
                  </div>

                  {/* Formulario de Creación de Nueva Categoría */}
                  {isAddingCategory && (
                    <form
                      onSubmit={handleCreateCategory}
                      className="p-4 sm:p-5 bg-zinc-900/90 border border-red-500/40 rounded-2xl space-y-4 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                          <FolderPlus className="w-4 h-4 text-red-500" />
                          <span>Crear Nueva Categoría</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-zinc-400 block mb-1">Nombre de la Categoría *</label>
                          <input
                            type="text"
                            required
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            placeholder="Ej: Postres Japoneses & Helados"
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Posición / Orden</label>
                          <input
                            type="number"
                            min={1}
                            value={newCatOrder}
                            onChange={(e) => setNewCatOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Descripción (Opcional)</label>
                        <input
                          type="text"
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          placeholder="Ej: Deliciosos postres para acompañar tu sushi"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Categoría</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Formulario de Edición de Categoría */}
                  {editingCategory && (
                    <form
                      onSubmit={handleUpdateCategory}
                      className="p-4 sm:p-5 bg-zinc-900 border border-amber-500/40 rounded-2xl space-y-4 animate-in fade-in"
                    >
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h4 className="text-sm font-bold text-amber-400 font-display flex items-center gap-2">
                          <Edit2 className="w-4 h-4 text-amber-400" />
                          <span>Editar Categoría: {editingCategory.name}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] text-zinc-400 block mb-1">Nombre de la Categoría *</label>
                          <input
                            type="text"
                            required
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-zinc-400 block mb-1">Posición / Orden</label>
                          <input
                            type="number"
                            min={1}
                            value={editCatOrder}
                            onChange={(e) => setEditCatOrder(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 block mb-1">Descripción</label>
                        <input
                          type="text"
                          value={editCatDesc}
                          onChange={(e) => setEditCatDesc(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Guardar Cambios de Categoría</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Tabla / Lista de Categorías */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-950/80 text-zinc-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4 w-14">Orden</th>
                            <th className="py-3 px-4">Nombre de la Categoría</th>
                            <th className="py-3 px-4">Descripción</th>
                            <th className="py-3 px-4 text-center">Productos</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                          {[...categories]
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                            .map((cat, idx, arr) => {
                              const count = products.filter((p) => p.categoryId === cat.id).length;
                              return (
                                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                                  {/* Orden / Reorganizar */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono font-bold text-zinc-400 text-xs">
                                        {cat.order || idx + 1}
                                      </span>
                                      <div className="flex flex-col">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => moveCategoryOrder(cat, 'up')}
                                          className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                                          title="Mover arriba"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={idx === arr.length - 1}
                                          onClick={() => moveCategoryOrder(cat, 'down')}
                                          className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20"
                                          title="Mover abajo"
                                        >
                                          <ArrowDown className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Nombre */}
                                  <td className="py-3 px-4 font-bold text-white">
                                    <span>{cat.name}</span>
                                    <span className="block text-[10px] text-zinc-500 font-mono">
                                      ID: {cat.id}
                                    </span>
                                  </td>

                                  {/* Descripción */}
                                  <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                                    {cat.description || '—'}
                                  </td>

                                  {/* Cantidad de productos */}
                                  <td className="py-3 px-4 text-center">
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                                      {count}
                                    </span>
                                  </td>

                                  {/* Botón Edición de Categoría y Eliminar */}
                                  <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Botón Edición de Categorías */}
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditCategory(cat)}
                                        className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                                        title="Editar Categoría"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                        <span>Editar</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400"
                                        title="Eliminar Categoría"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: RESERVATIONS */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {/* Banner si las reservas están ocultas */}
                  {settings.showReservations === false && (
                    <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2.5 text-xs text-red-200">
                        <EyeOff className="w-5 h-5 text-red-400 shrink-0" />
                        <div>
                          <span className="font-bold block text-red-300">El Módulo de Reservas está actualmente OCULTO al público</span>
                          <span className="text-[11px] text-zinc-300">Los clientes no ven la opción de reservar mesa online hasta que la actives.</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          toggleReservationsVisibility();
                          showToast('🟢 Reservas marcadas como VISIBLES al público');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0 shadow-md active:scale-95"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Botón Mostrar Reserva</span>
                      </button>
                    </div>
                  )}

                  {/* Reservation KPI Header */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[11px] text-zinc-400 block">Total Reservas</span>
                      <span className="text-xl font-bold font-mono text-white">
                        {reservations.length}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[11px] text-amber-400 block">Por Confirmar</span>
                      <span className="text-xl font-bold font-mono text-amber-400">
                        {reservations.filter((r) => r.status === 'pending').length}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[11px] text-emerald-400 block">Confirmadas</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        {reservations.filter((r) => r.status === 'confirmed').length}
                      </span>
                    </div>

                    <div className="bg-zinc-900/80 p-3.5 rounded-xl border border-white/5">
                      <span className="text-[11px] text-zinc-400 block">Capacidad Turno</span>
                      <span className="text-xl font-bold font-mono text-white">
                        {settings.maxGuestsPerSlot} pers
                      </span>
                    </div>
                  </div>

                  {/* Reservations Table */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-950/80 text-zinc-400 border-b border-white/5 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Código / Cliente</th>
                            <th className="py-3 px-4">Fecha & Hora</th>
                            <th className="py-3 px-4">Comensales</th>
                            <th className="py-3 px-4">Sector / Ocasión</th>
                            <th className="py-3 px-4">Estado</th>
                            <th className="py-3 px-4 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-zinc-300">
                          {reservations.map((r) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-semibold text-white">
                                  <span className="text-red-400 font-mono mr-1.5">#{r.id}</span>
                                  {r.customerName}
                                </div>
                                <div className="text-[11px] text-zinc-500 font-mono">
                                  {r.customerPhone}
                                </div>
                                {r.specialRequests && (
                                  <div className="text-[10px] text-amber-300/80 italic mt-0.5">
                                    Nota: {r.specialRequests}
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-mono text-white">{r.date}</div>
                                <div className="text-[11px] text-zinc-400 font-mono">{r.time} hrs</div>
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-white">
                                {r.guests} pers.
                              </td>

                              <td className="py-3 px-4">
                                <span className="capitalize block font-medium text-white">{r.area}</span>
                                <span className="text-[10px] text-zinc-400 block">{r.occasion}</span>
                              </td>

                              <td className="py-3 px-4">
                                <select
                                  value={r.status}
                                  onChange={(e) => updateReservationStatus(r.id, e.target.value as ReservationStatus)}
                                  className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                                    r.status === 'confirmed'
                                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                      : r.status === 'pending'
                                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                                      : r.status === 'completed'
                                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                      : 'bg-red-950 text-red-400 border-red-800'
                                  }`}
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="confirmed">Confirmada</option>
                                  <option value="completed">Completada</option>
                                  <option value="cancelled">Cancelada</option>
                                </select>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleContactCustomer(r)}
                                    title="Contactar al cliente por WhatsApp"
                                    className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`¿Eliminar reserva #${r.id}?`)) {
                                        deleteReservation(r.id);
                                        showToast('Reserva eliminada');
                                      }
                                    }}
                                    title="Eliminar"
                                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STORE SETTINGS */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
                  {/* Logo Management */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <h4 className="text-sm font-bold text-white font-display">
                        Logo &amp; Marca del Local
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Este logo se muestra en la cabecera, portada, pie de página y tickets de tu local.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 p-3.5 rounded-xl bg-zinc-950/60 border border-white/5">
                      {/* Logo Preview */}
                      <div className="flex flex-col items-center justify-center p-3 bg-zinc-900/90 rounded-xl border border-white/10 shrink-0">
                        <Logo size="lg" overrideLogoUrl={logoUrlInput || defaultLogoImg} variant="emblem" />
                        <span className="text-[10px] text-zinc-400 mt-2 font-mono">Vista Previa</span>
                      </div>

                      {/* Upload and URL controls */}
                      <div className="flex-1 w-full space-y-3">
                        <div>
                          <label className="text-xs text-zinc-300 font-medium block mb-1.5 flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-red-400" />
                            <span>Subir Logo desde tu Teléfono o Computador</span>
                          </label>
                          <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-zinc-500 cursor-pointer text-xs text-zinc-300 hover:text-white transition-all">
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span className="font-medium">Seleccionar imagen (PNG, JPG, SVG)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            Recomendado: imagen cuadrada o circular (máx 4MB).
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">O ingresar URL de imagen:</label>
                            <input
                              type="text"
                              value={logoUrlInput}
                              onChange={(e) => setLogoUrlInput(e.target.value)}
                              placeholder="https://ejemplo.com/logo.png"
                              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                            />
                          </div>

                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={handleResetOfficialLogo}
                              className="w-full px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-amber-400 hover:text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Usar Logo Oficial Los Aromos</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nombre de la Página Web & Identidad */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="border-b border-white/5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                          <Globe className="w-4 h-4 text-red-400" />
                          <span>Nombre de la Página Web & Identidad</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Personaliza el título que aparece en la pestaña del navegador, cabecera y tickets de WhatsApp.
                        </p>
                      </div>

                      {/* Botón directo de Guardar Nombre de Página */}
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = storeNameInput.trim();
                          if (!trimmed) {
                            showToast('El nombre de la página no puede estar vacío');
                            return;
                          }
                          updateStoreName(trimmed);
                          updateSettings({ storeName: trimmed });
                          showToast(`✓ Nombre de página guardado: "${trimmed}"`);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-red-950/30 self-start sm:self-auto active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Guardar Nombre</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-300 font-medium block mb-1">
                          Nombre de la Página / Local *
                        </label>
                        <input
                          type="text"
                          value={storeNameInput}
                          onChange={(e) => setStoreNameInput(e.target.value)}
                          placeholder="Ej: Kitchen Los Aromos"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">
                          Sugerencias de nombres rápidos:
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {['Kitchen Los Aromos', 'Los Aromos Sushi Bar', 'Los Aromos Delivery'].map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setStoreNameInput(suggestion);
                                updateStoreName(suggestion);
                                updateSettings({ storeName: suggestion });
                                showToast(`✓ Nombre cambiado a "${suggestion}"`);
                              }}
                              className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-white border border-zinc-800 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white font-display border-b border-white/5 pb-2">
                      Información del Local & WhatsApp
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">
                          WhatsApp de Pedidos & Alertas (Ej: 56979553144)
                        </label>
                        <input
                          type="text"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Dirección del Local</label>
                        <input
                          type="text"
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-xs text-zinc-400 block mb-1">Horarios de Atención</label>
                        <input
                          type="text"
                          value={openingHoursInput}
                          onChange={(e) => setOpeningHoursInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Capacity */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white font-display border-b border-white/5 pb-2">
                      Costos de Delivery & Aforo de Reservas
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Costo de Despacho (CLP)</label>
                        <input
                          type="number"
                          value={deliveryFeeInput}
                          onChange={(e) => setDeliveryFeeInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Envío Gratis desde (CLP)</label>
                        <input
                          type="number"
                          value={freeDeliveryInput}
                          onChange={(e) => setFreeDeliveryInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Capacidad Máx por Turno</label>
                        <input
                          type="number"
                          value={maxCapacityInput}
                          onChange={(e) => setMaxCapacityInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visibilidad de Formas de Pago */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="border-b border-white/5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-amber-400" />
                          <span>Visibilidad de Formas de Pago en Carrito</span>
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Controla si los clientes ven opciones de pago en el checkout o si se coordinan por WhatsApp.
                        </p>
                      </div>

                      {/* Botón Maestro de Ocultar / Mostrar Formas de Pago */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleAllPaymentMethods();
                          const next = !settings.showPaymentMethods;
                          showToast(next ? '🟢 Formas de pago VISIBLES al público' : '🔴 Formas de pago OCULTAS al público');
                        }}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 self-start sm:self-auto ${
                          settings.showPaymentMethods
                            ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900/70'
                            : 'bg-red-950/70 border-red-500/60 text-red-300 hover:bg-red-900/70'
                        }`}
                      >
                        {settings.showPaymentMethods ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>VISIBLES (Toca para Ocultar Todo)</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-red-400" />
                            <span>OCULTAS (Toca para Mostrar Todo)</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Grid of 3 Payment Methods with individual toggle buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Transferencia */}
                      <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Transferencia Bancaria</span>
                          <span className={`w-2 h-2 rounded-full ${settings.enabledPaymentMethods?.transferencia ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Muestra los datos bancarios y solicita comprobante.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('transferencia');
                            const next = !settings.enabledPaymentMethods?.transferencia;
                            showToast(next ? '🟢 Transferencia: VISIBLE' : '🟡 Transferencia: OCULTA');
                          }}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            settings.enabledPaymentMethods?.transferencia
                              ? 'bg-zinc-900 hover:bg-zinc-800 border-emerald-500/50 text-emerald-400'
                              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {settings.enabledPaymentMethods?.transferencia ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Visible (Ocultar)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              <span>Oculta (Mostrar)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 2. Efectivo */}
                      <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Efectivo contra Entrega</span>
                          <span className={`w-2 h-2 rounded-full ${settings.enabledPaymentMethods?.efectivo ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Permite al cliente indicar con cuánto paga para vuelto.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('efectivo');
                            const next = !settings.enabledPaymentMethods?.efectivo;
                            showToast(next ? '🟢 Efectivo: VISIBLE' : '🟡 Efectivo: OCULTO');
                          }}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            settings.enabledPaymentMethods?.efectivo
                              ? 'bg-zinc-900 hover:bg-zinc-800 border-emerald-500/50 text-emerald-400'
                              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {settings.enabledPaymentMethods?.efectivo ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Visible (Ocultar)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              <span>Oculto (Mostrar)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 3. Débito / POS */}
                      <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Débito / Tarjeta POS</span>
                          <span className={`w-2 h-2 rounded-full ${settings.enabledPaymentMethods?.debito ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Avisa al repartidor o local llevar máquina POS.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            togglePaymentMethodVisibility('debito');
                            const next = !settings.enabledPaymentMethods?.debito;
                            showToast(next ? '🟢 Débito/POS: VISIBLE' : '🟡 Débito/POS: OCULTO');
                          }}
                          className={`w-full py-1.5 px-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            settings.enabledPaymentMethods?.debito
                              ? 'bg-zinc-900 hover:bg-zinc-800 border-emerald-500/50 text-emerald-400'
                              : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {settings.enabledPaymentMethods?.debito ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span>Visible (Ocultar)</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              <span>Oculto (Mostrar)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Visibilidad de Secciones: Carta y Reservas */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <div className="border-b border-white/5 pb-2">
                      <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                        <Layers className="w-4 h-4 text-red-400" />
                        <span>Visibilidad de Secciones: Carta y Reservas</span>
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Oculta o muestra secciones completas de la página web según las necesidades operativas de tu local.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Control Carta */}
                      <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-white">Carta Digital & Pedidos</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            settings.showMenu !== false
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950 text-red-400 border border-red-500/30'
                          }`}>
                            {settings.showMenu !== false ? 'Visible' : 'Oculta'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Al ocultar la carta, los visitantes verán un aviso amigable de carta en preparación y no podrán agregar productos, pero podrán contactar por WhatsApp o reservar mesa.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            toggleMenuVisibility();
                            const next = !settings.showMenu;
                            showToast(next ? '🟢 Carta VISIBLE al público' : '🔴 Carta OCULTADA al público');
                          }}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                            settings.showMenu !== false
                              ? 'bg-red-950/40 hover:bg-red-900/50 border-red-500/40 text-red-300'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {settings.showMenu !== false ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-red-400" />
                              <span>Botón Ocultar Carta</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Botón Mostrar Carta</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Control Reservas */}
                      <div className="p-4 bg-zinc-950 rounded-xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-white">Módulo de Reservas de Mesas</span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            settings.showReservations !== false
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-950 text-red-400 border border-red-500/30'
                          }`}>
                            {settings.showReservations !== false ? 'Visible' : 'Ocultas'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Al ocultar las reservas, el botón de "Reservar Mesa" no se mostrará a los clientes o indicará que las reservas online están pausadas temporalmente.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            toggleReservationsVisibility();
                            const next = !settings.showReservations;
                            showToast(next ? '🟢 Reservas VISIBLES al público' : '🔴 Reservas OCULTADAS al público');
                          }}
                          className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${
                            settings.showReservations !== false
                              ? 'bg-red-950/40 hover:bg-red-900/50 border-red-500/40 text-red-300'
                              : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {settings.showReservations !== false ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-red-400" />
                              <span>Botón Ocultar Reserva</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Botón Mostrar Reserva</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-sm font-bold text-white font-display border-b border-white/5 pb-2">
                      Datos de Transferencia Bancaria
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Banco</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Tipo de Cuenta</label>
                        <input
                          type="text"
                          value={bankAccountType}
                          onChange={(e) => setBankAccountType(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">N° de Cuenta</label>
                        <input
                          type="text"
                          value={bankAccountNumber}
                          onChange={(e) => setBankAccountNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">RUT</label>
                        <input
                          type="text"
                          value={bankRut}
                          onChange={(e) => setBankRut(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Titular</label>
                        <input
                          type="text"
                          value={bankHolder}
                          onChange={(e) => setBankHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">PIN Admin</label>
                        <input
                          type="password"
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions & Backup */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-950/40"
                    >
                      Guardar Todas las Configuraciones
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const json = exportCatalogJson();
                          navigator.clipboard.writeText(json);
                          showToast('Catálogo copiado al portapapeles en formato JSON');
                        }}
                        className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs border border-zinc-800 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exportar JSON</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Restablecer la carta y productos a los valores iniciales?')) {
                            resetToDefaults();
                            showToast('Menú restablecido por defecto');
                          }
                        }}
                        className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 text-xs border border-zinc-800 flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Carta</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Modal: Edición Rápida del Nombre de la Página */}
        {isEditPageNameOpen && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
            <div className="bg-[#151921] border border-white/10 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      Editar Nombre de la Página
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Actualiza el nombre visible de tu web y pedidos
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditPageNameOpen(false)}
                  className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form inputs */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">
                    Nombre Principal de la Página / Tienda *
                  </label>
                  <input
                    type="text"
                    value={quickPageNameInput}
                    onChange={(e) => setQuickPageNameInput(e.target.value)}
                    placeholder="Ej: Kitchen Los Aromos"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl text-sm text-white font-medium focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">
                    Eslogan o Subtítulo (Opcional)
                  </label>
                  <input
                    type="text"
                    value={quickPageTaglineInput}
                    onChange={(e) => setQuickPageTaglineInput(e.target.value)}
                    placeholder="Ej: Sushi de Autor, Hand Rolls & Fast Food"
                    className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-lg text-xs text-zinc-300 focus:outline-none"
                  />
                </div>

                {/* Preset Suggestions */}
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1.5">
                    Sugerencias Rápidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Kitchen Los Aromos', 'Los Aromos Sushi Bar', 'Los Aromos Delivery & Kitchen'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuickPageNameInput(preset)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] border border-zinc-800 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1.5 text-left text-xs">
                  <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Vista Previa en Vivo:
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-500">Pestaña Navegador:</span>
                    <span className="font-semibold text-white truncate max-w-[220px]">
                      {quickPageNameInput.trim() || 'Kitchen Los Aromos'} - Sushi...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="text-zinc-500">Cabecera Web:</span>
                    <span className="font-bold text-amber-400 truncate max-w-[220px]">
                      {quickPageNameInput.trim() || 'Kitchen Los Aromos'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsEditPageNameOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = quickPageNameInput.trim();
                    if (!trimmed) {
                      showToast('El nombre de la página no puede estar vacío');
                      return;
                    }
                    updateStoreName(trimmed);
                    updateSettings({
                      storeName: trimmed,
                      tagline: quickPageTaglineInput.trim(),
                    });
                    setStoreNameInput(trimmed);
                    setIsEditPageNameOpen(false);
                    showToast(`✓ Nombre de la página actualizado a "${trimmed}"`);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-red-950/40 active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar Nombre</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
