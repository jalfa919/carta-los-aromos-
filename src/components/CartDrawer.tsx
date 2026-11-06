import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Building,
  Check,
  CreditCard,
  DollarSign,
  Minus,
  MapPin,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CustomerOrderInfo, OrderType, PaymentMethod } from '../types';
import { formatCLP } from '../utils/formatters';
import { Logo } from './Logo';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    settings,
    checkoutToWhatsApp,
  } = useStore();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transferencia');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Payment visibility checks
  const isTransEnabled = settings.showPaymentMethods && (settings.enabledPaymentMethods?.transferencia ?? true);
  const isCashEnabled = settings.showPaymentMethods && (settings.enabledPaymentMethods?.efectivo ?? true);
  const isDebitEnabled = settings.showPaymentMethods && (settings.enabledPaymentMethods?.debito ?? true);
  const hasAnyPaymentMethod = isTransEnabled || isCashEnabled || isDebitEnabled;

  // Auto-switch payment method if selected one is hidden/disabled
  useEffect(() => {
    if (!hasAnyPaymentMethod) return;
    if (paymentMethod === 'transferencia' && !isTransEnabled) {
      if (isCashEnabled) setPaymentMethod('efectivo');
      else if (isDebitEnabled) setPaymentMethod('debito');
    } else if (paymentMethod === 'efectivo' && !isCashEnabled) {
      if (isTransEnabled) setPaymentMethod('transferencia');
      else if (isDebitEnabled) setPaymentMethod('debito');
    } else if (paymentMethod === 'debito' && !isDebitEnabled) {
      if (isTransEnabled) setPaymentMethod('transferencia');
      else if (isCashEnabled) setPaymentMethod('efectivo');
    }
  }, [isTransEnabled, isCashEnabled, isDebitEnabled, paymentMethod, hasAnyPaymentMethod]);

  if (!isCartOpen) return null;

  const isDelivery = orderType === 'delivery';
  const deliveryFee = isDelivery
    ? cartSubtotal >= settings.freeDeliveryThreshold
      ? 0
      : settings.deliveryFee
    : 0;
  const finalTotal = cartSubtotal + deliveryFee;
  const isMinOrderMet = cartSubtotal >= settings.minOrderAmount;

  const handleCheckout = () => {
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg('Tu carro está vacío. Agrega rolls o promociones.');
      return;
    }

    if (!isMinOrderMet) {
      setErrorMsg(`El pedido mínimo es de ${formatCLP(settings.minOrderAmount)}.`);
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu número de WhatsApp para coordinar.');
      return;
    }

    if (isDelivery && !address.trim()) {
      setErrorMsg('Por favor ingresa tu dirección de entrega.');
      return;
    }

    const parsedCash = cashAmount ? parseInt(cashAmount.replace(/\D/g, ''), 10) : undefined;
    if (paymentMethod === 'efectivo' && parsedCash && parsedCash < finalTotal) {
      setErrorMsg(`El monto en efectivo debe ser mayor o igual al total (${formatCLP(finalTotal)}).`);
      return;
    }

    const orderInfo: CustomerOrderInfo = {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      orderType,
      address: isDelivery ? address.trim() : settings.address,
      addressNotes: addressNotes.trim() || undefined,
      paymentMethod,
      cashAmount: parsedCash,
      generalNotes: generalNotes.trim() || undefined,
    };

    const waUrl = checkoutToWhatsApp(orderInfo);
    // Open WhatsApp in new tab / app
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#11141a] border-l border-white/10 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <Logo size="xs" variant="emblem" />
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg font-display">
                  Tu Pedido
                </h3>
                <span className="text-xs text-zinc-400">
                  {cart.length} {cart.length === 1 ? 'producto' : 'productos'} en {settings.storeName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Content Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto opacity-30 stroke-1" />
                <p className="text-sm font-medium text-zinc-400">Tu carro de compras está vacío</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Explora la carta y agrega tus promociones, hand rolls o rolls calientes favoritos.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3 bg-zinc-900/70 border border-white/5 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white leading-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-xs text-zinc-400 font-mono tabular-nums">
                            {formatCLP(item.product.price)} c/u
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono tabular-nums">
                          {formatCLP(item.itemTotal)}
                        </span>
                      </div>

                      {/* Sauces & utensils summary */}
                      <div className="text-[11px] text-zinc-400 space-y-0.5">
                        <div className="flex flex-wrap gap-x-2">
                          {item.sauceOptions.soya > 0 && <span>Soya: {item.sauceOptions.soya}</span>}
                          {item.sauceOptions.teriyaki > 0 && <span>Teriyaki: {item.sauceOptions.teriyaki}</span>}
                          {item.sauceOptions.wasabi && <span>Wasabi</span>}
                          {item.sauceOptions.jengibre && <span>Jengibre</span>}
                          {item.sauceOptions.chopsticks > 0 && (
                            <span>Palitos: {item.sauceOptions.chopsticks}p</span>
                          )}
                        </div>
                        {item.notes && (
                          <div className="text-amber-400/90 italic">Nota: {item.notes}</div>
                        )}
                      </div>

                      {/* Quantity Stepper & Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1.5 bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                            className="w-6 h-6 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center font-mono text-xs text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                            className="w-6 h-6 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery or Retiro selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                    Modalidad de Entrega
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      disabled={!settings.isDeliveryAvailable}
                      onClick={() => setOrderType('delivery')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        orderType === 'delivery'
                          ? 'bg-red-600 text-white shadow-md'
                          : settings.isDeliveryAvailable
                          ? 'text-zinc-400 hover:text-white'
                          : 'opacity-40 cursor-not-allowed text-zinc-600 line-through'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{settings.isDeliveryAvailable ? 'Delivery' : 'Delivery Pausado'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={!settings.isPickupAvailable}
                      onClick={() => setOrderType('pickup')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        orderType === 'pickup'
                          ? 'bg-red-600 text-white shadow-md'
                          : settings.isPickupAvailable
                          ? 'text-zinc-400 hover:text-white'
                          : 'opacity-40 cursor-not-allowed text-zinc-600 line-through'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>{settings.isPickupAvailable ? 'Retiro en Local' : 'Retiro Pausado'}</span>
                    </button>
                  </div>
                </div>

                {/* Local Closed Banner if applicable */}
                {!settings.isOpen && (
                  <div className="p-3 bg-amber-950/70 border border-amber-800/80 rounded-xl text-xs text-amber-200 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Local actualmente CERRADO</span>
                    </div>
                    <p className="text-[11px] text-amber-200/90 leading-tight">
                      Tu pedido se enviará por WhatsApp y será preparado en cuanto abra el local ({settings.openingHoursText}).
                    </p>
                  </div>
                )}

                {/* Customer Information Form */}
                <div className="space-y-3 bg-zinc-900/60 p-3.5 rounded-xl border border-white/5 text-xs">
                  <h4 className="font-semibold text-zinc-300 uppercase tracking-wider text-[11px]">
                    Datos para el Envío por WhatsApp
                  </h4>

                  <div>
                    <label className="text-zinc-400 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Teléfono Móvil (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej: +56 9 1234 5678"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  {isDelivery ? (
                    <>
                      <div>
                        <label className="text-zinc-400 block mb-1">Dirección de Entrega *</label>
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle, Número, Comuna"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1">Depto / Torre / Indicaciones</label>
                        <input
                          type="text"
                          value={addressNotes}
                          onChange={(e) => setAddressNotes(e.target.value)}
                          placeholder="Ej: Depto 402, timbre rojo"
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-2.5 bg-zinc-950 rounded-lg border border-white/5 text-zinc-300">
                      <span className="text-[11px] text-zinc-500 block">Retiro en:</span>
                      <span className="font-medium text-xs text-white">{settings.address}</span>
                    </div>
                  )}

                  {/* Payment Method Selector or Hidden Notice */}
                  {settings.showPaymentMethods && hasAnyPaymentMethod ? (
                    <div>
                      <label className="text-zinc-400 block mb-1.5">Forma de Pago</label>
                      <div className={`grid gap-1.5 ${
                        [isTransEnabled, isCashEnabled, isDebitEnabled].filter(Boolean).length === 3
                          ? 'grid-cols-3'
                          : [isTransEnabled, isCashEnabled, isDebitEnabled].filter(Boolean).length === 2
                          ? 'grid-cols-2'
                          : 'grid-cols-1'
                      }`}>
                        {isTransEnabled && (
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('transferencia')}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              paymentMethod === 'transferencia'
                                ? 'bg-zinc-800 border-red-500 text-white font-medium'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5 mx-auto mb-1 text-red-400" />
                            <span className="text-[10px] block leading-tight font-medium">Transferencia</span>
                          </button>
                        )}

                        {isCashEnabled && (
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('efectivo')}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              paymentMethod === 'efectivo'
                                ? 'bg-zinc-800 border-red-500 text-white font-medium'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <DollarSign className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                            <span className="text-[10px] block leading-tight font-medium">Efectivo</span>
                          </button>
                        )}

                        {isDebitEnabled && (
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('debito')}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              paymentMethod === 'debito'
                                ? 'bg-zinc-800 border-red-500 text-white font-medium'
                                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5 mx-auto mb-1 text-amber-400" />
                            <span className="text-[10px] block leading-tight font-medium">Débito / POS</span>
                          </button>
                        )}
                      </div>

                      {paymentMethod === 'transferencia' && isTransEnabled && (
                        <div className="mt-2.5 p-2.5 bg-zinc-950 rounded-lg border border-white/5 space-y-1 text-[11px] text-zinc-400 animate-in fade-in">
                          <div className="font-semibold text-zinc-300">Datos Bancarios para Transferir:</div>
                          <div>Banco: <span className="text-white">{settings.bankDetails.bank}</span></div>
                          <div>Tipo: <span className="text-white">{settings.bankDetails.accountType}</span></div>
                          <div>N°: <span className="text-white font-mono">{settings.bankDetails.accountNumber}</span></div>
                          <div>RUT: <span className="text-white font-mono">{settings.bankDetails.rut}</span></div>
                          <div>Titular: <span className="text-white">{settings.bankDetails.holderName}</span></div>
                          <div className="text-[10px] text-zinc-500 italic mt-1">
                            (Enviar comprobante al chat de WhatsApp al enviar pedido)
                          </div>
                        </div>
                      )}

                      {paymentMethod === 'efectivo' && isCashEnabled && (
                        <div className="mt-2 animate-in fade-in">
                          <label className="text-zinc-400 block mb-1">¿Con cuánto pagas? (Para llevar vuelto)</label>
                          <input
                            type="text"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            placeholder={`Ej: ${formatCLP(finalTotal + 5000)}`}
                            className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-950/70 rounded-xl border border-dashed border-zinc-800 space-y-1 text-left">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
                        <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                        <span>Forma de Pago</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">
                        Formas de pago ocultas por administración. El pago se coordina directamente por WhatsApp al confirmar tu pedido.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-zinc-400 block mb-1">Comentario adicional (Opcional)</label>
                    <input
                      type="text"
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder="Ej: Timbre no funciona, llamar al llegar"
                      className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer with Totals & WhatsApp Button */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-zinc-950 border-t border-white/10 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-white">{formatCLP(cartSubtotal)}</span>
                </div>

                {isDelivery && (
                  <div className="flex justify-between">
                    <span>Costo de Despacho</span>
                    <span className="font-mono tabular-nums text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-semibold">¡Gratis!</span>
                      ) : (
                        formatCLP(deliveryFee)
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-white/5">
                  <span className="font-display">Total a Pagar</span>
                  <span className="font-mono tabular-nums text-red-400 text-lg">
                    {formatCLP(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Big WhatsApp CTA */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Pedido por WhatsApp</span>
              </button>

              <div className="text-[11px] text-zinc-500 text-center">
                Se abrirá WhatsApp con el resumen de tu pedido listo para enviar al +{settings.phone}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
