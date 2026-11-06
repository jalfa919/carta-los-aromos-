export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  piecesCount?: number;
  image: string;
  available: boolean;
  isPromo?: boolean;
  isPopular?: boolean;
  ingredients?: string[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface ItemSauceOptions {
  soya: number;
  teriyaki: number;
  wasabi: boolean;
  jengibre: boolean;
  chopsticks: number;
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  quantity: number;
  sauceOptions: ItemSauceOptions;
  notes?: string;
  itemTotal: number;
}

export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'transferencia' | 'efectivo' | 'debito';

export interface CustomerOrderInfo {
  name: string;
  phone: string;
  orderType: OrderType;
  address: string;
  addressNotes?: string;
  paymentMethod: PaymentMethod;
  cashAmount?: number;
  generalNotes?: string;
}

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type DiningArea = 'salon' | 'terraza' | 'barra';

export interface Reservation {
  id: string; // e.g. RSV-8492
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  guests: number;
  area: DiningArea;
  occasion: string;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface BankDetails {
  bank: string;
  accountType: string;
  accountNumber: string;
  rut: string;
  holderName: string;
  email: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string; // WhatsApp phone e.g. 56979553144
  address: string;
  deliveryFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  isOpen: boolean; // Estado general: Abierto / Cerrado
  openingHoursText: string;
  estimatedDeliveryTime: string;
  bankDetails: BankDetails;
  adminPin: string;

  // Modos de atención y disponibilidad
  isDeliveryAvailable: boolean; // Delivery activo o pausado
  isSalonAvailable: boolean;    // Salón / Reservas activo o pausado
  isPickupAvailable: boolean;   // Retiro en local activo o pausado
  closedMessage?: string;

  // Formas de pago visibles / ocultas
  showPaymentMethods: boolean; // Control general para mostrar u ocultar formas de pago
  enabledPaymentMethods: {
    transferencia: boolean;
    efectivo: boolean;
    debito: boolean;
  };

  // Visibilidad de secciones principales: Carta y Reservas
  showMenu: boolean;            // Control general para mostrar u ocultar la Carta / Menú digital
  showReservations: boolean;    // Control general para mostrar u ocultar las Reservas

  // Reservation management settings
  maxGuestsPerSlot: number;
  allowReservations: boolean;
  reservationTimeSlots: string[];
  logoUrl?: string;
  customShareUrl?: string;
}


