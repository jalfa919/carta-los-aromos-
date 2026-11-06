import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_RESERVATIONS,
  INITIAL_STORE_SETTINGS,
} from '../data/initialData';
import {
  CartItem,
  Category,
  CustomerOrderInfo,
  DiningArea,
  ItemSauceOptions,
  Product,
  Reservation,
  ReservationStatus,
  StoreSettings,
} from '../types';
import { formatCLP, sanitizeWhatsAppPhone } from '../utils/formatters';

interface LastOrderTicket {
  text: string;
  waLink: string;
  total: number;
  info: CustomerOrderInfo;
}

export interface NewReservationPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  area: DiningArea;
  occasion: string;
  specialRequests?: string;
}

interface SlotAvailability {
  available: boolean;
  bookedGuests: number;
  remainingGuests: number;
  isFull: boolean;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isAdminLoggedIn: boolean;
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProductForModal: Product | null;
  setSelectedProductForModal: (product: Product | null) => void;
  photoEditorProduct: Product | null;
  setPhotoEditorProduct: (product: Product | null) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;
  categoryModalMode: 'list' | 'create' | 'edit';
  setCategoryModalMode: (mode: 'list' | 'create' | 'edit') => void;
  categoryToEdit: Category | null;
  setCategoryToEdit: (cat: Category | null) => void;
  openCreateCategoryModal: () => void;
  openEditCategoryModal: (cat?: Category) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  lastOrderTicket: LastOrderTicket | null;
  setLastOrderTicket: (ticket: LastOrderTicket | null) => void;

  // View state
  currentView: 'menu' | 'reservas';
  setCurrentView: (view: 'menu' | 'reservas') => void;

  // Reservations
  reservations: Reservation[];
  unreadReservationsAlert: number;
  lastReservationConfirmed: Reservation | null;
  setLastReservationConfirmed: (r: Reservation | null) => void;
  createReservation: (data: NewReservationPayload) => { reservation: Reservation; waLink: string };
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  deleteReservation: (id: string) => void;
  checkSlotAvailability: (date: string, time: string, requestedGuests?: number) => SlotAvailability;
  markReservationsAsRead: () => void;

  // Cart operations
  addToCart: (
    product: Product,
    quantity: number,
    sauceOptions: ItemSauceOptions,
    notes?: string
  ) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Product Admin
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;

  // Category Admin
  addCategory: (name: string, description?: string) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  // Settings Admin
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateStoreName: (name: string) => void;
  toggleAllPaymentMethods: () => void;
  togglePaymentMethodVisibility: (method: 'transferencia' | 'efectivo' | 'debito') => void;
  toggleMenuVisibility: () => void;
  toggleReservationsVisibility: () => void;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  resetToDefaults: () => void;
  exportCatalogJson: () => string;
  importCatalogJson: (json: string) => boolean;

  // Checkout
  checkoutToWhatsApp: (info: CustomerOrderInfo) => string;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEYS = {
  PRODUCTS: 'kitchen_los_aromos_products_v4',
  CATEGORIES: 'kitchen_los_aromos_categories_v4',
  SETTINGS: 'kitchen_los_aromos_settings_v4',
  CART: 'kitchen_los_aromos_cart_v4',
  RESERVATIONS: 'kitchen_los_aromos_reservations_v4',
  ADMIN_AUTH: 'kitchen_los_aromos_admin_auth_v4',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!saved) return INITIAL_STORE_SETTINGS;
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STORE_SETTINGS,
        ...parsed,
        showPaymentMethods: parsed.showPaymentMethods !== undefined ? parsed.showPaymentMethods : true,
        enabledPaymentMethods: {
          ...INITIAL_STORE_SETTINGS.enabledPaymentMethods,
          ...(parsed.enabledPaymentMethods || {}),
        },
        showMenu: parsed.showMenu !== undefined ? parsed.showMenu : true,
        showReservations:
          parsed.showReservations !== undefined
            ? parsed.showReservations
            : (parsed.allowReservations !== undefined ? parsed.allowReservations : true),
        logoUrl: parsed.logoUrl || INITIAL_STORE_SETTINGS.logoUrl,
      };
    } catch {
      return INITIAL_STORE_SETTINGS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });

  const [currentView, setCurrentView] = useState<'menu' | 'reservas'>('menu');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [photoEditorProduct, setPhotoEditorProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'list' | 'create' | 'edit'>('list');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const openCreateCategoryModal = () => {
    setCategoryToEdit(null);
    setCategoryModalMode('create');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat?: Category) => {
    if (cat) {
      setCategoryToEdit(cat);
      setCategoryModalMode('edit');
    } else {
      setCategoryToEdit(null);
      setCategoryModalMode('list');
    }
    setIsCategoryModalOpen(true);
  };

  const [lastOrderTicket, setLastOrderTicket] = useState<LastOrderTicket | null>(null);
  const [lastReservationConfirmed, setLastReservationConfirmed] = useState<Reservation | null>(null);
  const [unreadReservationsAlert, setUnreadReservationsAlert] = useState<number>(0);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    if (settings.storeName) {
      document.title = `${settings.storeName} - Sushi, Hand Rolls & Fast Food`;
    }
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
    // Calculate pending / new reservations
    const pendingCount = reservations.filter((r) => r.status === 'pending').length;
    setUnreadReservationsAlert(pendingCount);
  }, [reservations]);

  // Real-time slot availability check
  const checkSlotAvailability = (
    date: string,
    time: string,
    requestedGuests: number = 0
  ): SlotAvailability => {
    const slotReservations = reservations.filter(
      (r) => r.date === date && r.time === time && r.status !== 'cancelled'
    );
    const bookedGuests = slotReservations.reduce((acc, curr) => acc + curr.guests, 0);
    const maxCapacity = settings.maxGuestsPerSlot || 24;
    const remainingGuests = Math.max(0, maxCapacity - bookedGuests);
    const available = remainingGuests >= requestedGuests && remainingGuests > 0;
    const isFull = remainingGuests === 0;

    return {
      available,
      bookedGuests,
      remainingGuests,
      isFull,
    };
  };

  const createReservation = (data: NewReservationPayload) => {
    const id = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: Reservation = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);
    setLastReservationConfirmed(newReservation);

    // Format WhatsApp notification for local manager/admin
    const areaLabels: Record<DiningArea, string> = {
      salon: 'Salón Principal',
      terraza: 'Terraza al aire libre',
      barra: 'Barra de Sushi (Vista al Chef)',
    };

    const alertMessage = `🛎️ *NUEVA RESERVA DE MESA - ${settings.storeName.toUpperCase()}* 🛎️
Código: *#${id}*
━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${data.customerName}
📞 *Teléfono:* ${data.customerPhone}
${data.customerEmail ? `✉️ *Email:* ${data.customerEmail}` : ''}
👥 *Comensales:* ${data.guests} persona(s)
📅 *Fecha:* ${data.date}
⏰ *Hora:* ${data.time} hrs
📍 *Sector:* ${areaLabels[data.area]}
🎉 *Ocasión:* ${data.occasion || 'General'}
${data.specialRequests ? `📝 *Peticiones:* ${data.specialRequests}` : ''}
━━━━━━━━━━━━━━━━━━━━━
_Enviado desde el sistema de reservas móvil de Sushi_`;

    const cleanPhone = sanitizeWhatsAppPhone(settings.phone);
    const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMessage)}`;

    return { reservation: newReservation, waLink };
  };

  const updateReservationStatus = (id: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const deleteReservation = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
  };

  const markReservationsAsRead = () => {
    setUnreadReservationsAlert(0);
  };

  // Cart totals
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  // Cart operations
  const addToCart = (
    product: Product,
    quantity: number,
    sauceOptions: ItemSauceOptions,
    notes?: string
  ) => {
    const itemTotal = product.price * quantity;
    const cartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const newItem: CartItem = {
      cartItemId,
      product,
      quantity,
      sauceOptions,
      notes: notes?.trim() || undefined,
      itemTotal,
    };

    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity,
            itemTotal: item.product.price * quantity,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Admin Product actions
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const toggleProductAvailability = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  // Category actions
  const addCategory = (name: string, description?: string) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `cat-${Date.now()}`;
    const newCat: Category = {
      id,
      name,
      description: description || '',
      order: categories.length + 1,
    };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (updated: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updated.id ? updated : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateStoreName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSettings((prev) => ({ ...prev, storeName: trimmed }));
    document.title = `${trimmed} - Sushi, Hand Rolls & Fast Food`;
  };

  const toggleAllPaymentMethods = () => {
    setSettings((prev) => ({
      ...prev,
      showPaymentMethods: !prev.showPaymentMethods,
    }));
  };

  const togglePaymentMethodVisibility = (method: 'transferencia' | 'efectivo' | 'debito') => {
    setSettings((prev) => ({
      ...prev,
      enabledPaymentMethods: {
        ...prev.enabledPaymentMethods,
        [method]: !prev.enabledPaymentMethods?.[method],
      },
    }));
  };

  const toggleMenuVisibility = () => {
    setSettings((prev) => ({
      ...prev,
      showMenu: prev.showMenu !== undefined ? !prev.showMenu : false,
    }));
  };

  const toggleReservationsVisibility = () => {
    setSettings((prev) => {
      const next = prev.showReservations !== undefined ? !prev.showReservations : !prev.allowReservations;
      return {
        ...prev,
        showReservations: next,
        allowReservations: next,
      };
    });
  };

  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === settings.adminPin.trim()) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_STORE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const exportCatalogJson = (): string => {
    return JSON.stringify({ products, categories, settings }, null, 2);
  };

  const importCatalogJson = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data.products)) setProducts(data.products);
      if (Array.isArray(data.categories)) setCategories(data.categories);
      if (data.settings && typeof data.settings === 'object') {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      return true;
    } catch {
      return false;
    }
  };

  // WhatsApp Checkout ticket formatter
  const checkoutToWhatsApp = (info: CustomerOrderInfo): string => {
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const isDelivery = info.orderType === 'delivery';
    const deliveryCost = isDelivery
      ? cartSubtotal >= settings.freeDeliveryThreshold
        ? 0
        : settings.deliveryFee
      : 0;
    const finalTotal = cartSubtotal + deliveryCost;

    let itemsText = '';
    cart.forEach((item, index) => {
      itemsText += `\n${index + 1}. *${item.quantity}x ${item.product.name}* (${formatCLP(item.itemTotal)})`;
      if (item.product.piecesCount) {
        itemsText += `\n    🍣 ${item.product.piecesCount * item.quantity} piezas`;
      }
      // Sauces & utensils
      const saucesList: string[] = [];
      if (item.sauceOptions.soya > 0) saucesList.push(`${item.sauceOptions.soya} Soya`);
      if (item.sauceOptions.teriyaki > 0) saucesList.push(`${item.sauceOptions.teriyaki} Teriyaki`);
      if (item.sauceOptions.wasabi) saucesList.push('Wasabi');
      if (item.sauceOptions.jengibre) saucesList.push('Jengibre');
      if (item.sauceOptions.chopsticks > 0) saucesList.push(`${item.sauceOptions.chopsticks} palitos`);

      if (saucesList.length > 0) {
        itemsText += `\n    🥢 Acompañamiento: ${saucesList.join(', ')}`;
      }
      if (item.notes) {
        itemsText += `\n    ⚠️ Nota: ${item.notes}`;
      }
    });

    let paymentText = '';
    const hasAnyEnabledMethod =
      settings.showPaymentMethods &&
      (settings.enabledPaymentMethods?.transferencia ||
        settings.enabledPaymentMethods?.efectivo ||
        settings.enabledPaymentMethods?.debito);

    if (!settings.showPaymentMethods || !hasAnyEnabledMethod) {
      paymentText = '💳 *Medio de pago:* A coordinar por WhatsApp';
    } else if (info.paymentMethod === 'transferencia') {
      paymentText = `💳 *Medio de pago:* Transferencia Bancaria\n(Adjuntaré el comprobante tras este mensaje)`;
    } else if (info.paymentMethod === 'efectivo') {
      const cash = info.cashAmount && info.cashAmount > finalTotal ? info.cashAmount : null;
      paymentText = `💵 *Medio de pago:* Efectivo`;
      if (cash) {
        paymentText += ` (Paga con ${formatCLP(cash)} | Vuelto: ${formatCLP(cash - finalTotal)})`;
      }
    } else {
      paymentText = `💳 *Medio de pago:* Débito / Tarjeta al recibir (Llevar máquina POS)`;
    }

    const ticket = `🍣 *NUEVO PEDIDO - ${settings.storeName.toUpperCase()}* 🍣
📅 _${dateFormatted}_
━━━━━━━━━━━━━━━━━━━━━
👤 *Cliente:* ${info.name}
📞 *Teléfono:* ${info.phone}
🛵 *Entrega:* ${isDelivery ? 'Delivery a Domicilio' : 'Retiro en Local'}
${isDelivery ? `📍 *Dirección:* ${info.address}` : `📍 *Retiro en:* ${settings.address}`}
${info.addressNotes ? `📝 *Detalle entrega:* ${info.addressNotes}` : ''}
━━━━━━━━━━━━━━━━━━━━━
📋 *DETALLE DEL PEDIDO:*${itemsText}

━━━━━━━━━━━━━━━━━━━━━
Subtotal: ${formatCLP(cartSubtotal)}
${isDelivery ? `Despacho: ${deliveryCost === 0 ? '¡GRATIS!' : formatCLP(deliveryCost)}` : 'Retiro: Gratis'}
⭐ *TOTAL A PAGAR: ${formatCLP(finalTotal)}*

${paymentText}
${info.generalNotes ? `\n💬 *Nota adicional:* ${info.generalNotes}` : ''}
━━━━━━━━━━━━━━━━━━━━━
_Enviado desde la Carta Móvil de Sushi_`;

    const cleanPhone = sanitizeWhatsAppPhone(settings.phone);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(ticket)}`;

    setLastOrderTicket({
      text: ticket,
      waLink: waUrl,
      total: finalTotal,
      info,
    });

    clearCart();
    setIsCartOpen(false);

    return waUrl;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        isAdminOpen,
        setIsAdminOpen,
        isAdminLoggedIn,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedProductForModal,
        setSelectedProductForModal,
        photoEditorProduct,
        setPhotoEditorProduct,
        isCategoryModalOpen,
        setIsCategoryModalOpen,
        categoryModalMode,
        setCategoryModalMode,
        categoryToEdit,
        setCategoryToEdit,
        openCreateCategoryModal,
        openEditCategoryModal,
        isShareModalOpen,
        setIsShareModalOpen,
        lastOrderTicket,
        setLastOrderTicket,
        currentView,
        setCurrentView,
        reservations,
        unreadReservationsAlert,
        lastReservationConfirmed,
        setLastReservationConfirmed,
        createReservation,
        updateReservationStatus,
        deleteReservation,
        checkSlotAvailability,
        markReservationsAsRead,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        updateStoreName,
        toggleAllPaymentMethods,
        togglePaymentMethodVisibility,
        toggleMenuVisibility,
        toggleReservationsVisibility,
        loginAdmin,
        logoutAdmin,
        resetToDefaults,
        exportCatalogJson,
        importCatalogJson,
        checkoutToWhatsApp,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
