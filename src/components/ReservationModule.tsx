import React, { useState } from 'react';
import {
  Calendar,
  Check,
  Clock,
  Eye,
  EyeOff,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DiningArea } from '../types';

export const ReservationModule: React.FC = () => {
  const {
    settings,
    checkSlotAvailability,
    createReservation,
    setCurrentView,
    isAdminLoggedIn,
    toggleReservationsVisibility,
  } = useStore();

  // Generate next 14 days dates
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString('es-CL', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('es-CL', { month: 'short' }),
      isToday: i === 0,
      isTomorrow: i === 1,
    };
  });

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[0].iso);
  const [guests, setGuests] = useState<number>(2);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<DiningArea>('salon');
  const [occasion, setOccasion] = useState<string>('Ninguna');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const timeSlots = settings.reservationTimeSlots || [
    '13:00', '13:30', '14:00', '14:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
  ];

  const occasionsList = [
    'Cena Casual',
    'Cumpleaños',
    'Aniversario / Cita Romántica',
    'Reunión de Amigos',
    'Negocios',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!settings.isSalonAvailable) {
      setErrorMsg('El servicio de salón y mesas se encuentra temporalmente pausado.');
      return;
    }

    if (!selectedTime) {
      setErrorMsg('Por favor selecciona una hora para tu reserva.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Por favor ingresa el nombre de la reserva.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMsg('Por favor ingresa tu número de WhatsApp para confirmar.');
      return;
    }

    // Availability double check
    const availability = checkSlotAvailability(selectedDate, selectedTime, guests);
    if (!availability.available) {
      setErrorMsg(`Lo sentimos, el horario de las ${selectedTime} solo tiene ${availability.remainingGuests} cupos disponibles.`);
      return;
    }

    const { waLink } = createReservation({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      date: selectedDate,
      time: selectedTime,
      guests,
      area: selectedArea,
      occasion,
      specialRequests: specialRequests.trim() || undefined,
    });

    // Notify admin via WhatsApp
    window.open(waLink, '_blank');
  };

  // If reservations are hidden and visitor is NOT admin: show friendly paused screen
  if (settings.showReservations === false && !isAdminLoggedIn) {
    return (
      <div className="py-16 sm:py-24 bg-[#0d0f12]">
        <div className="max-w-xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-red-950/60 border border-red-500/40 flex items-center justify-center mx-auto text-red-400 shadow-xl shadow-red-950/50">
            <Calendar className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
              Reservas Temporalmente Pausadas
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              El sistema de reservas de mesas online se encuentra temporalmente pausado por la administración. Para consultar disponibilidad inmediata, mesas o eventos especiales, contáctanos directamente por WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me gustaría consultar disponibilidad de mesas para reservar en el local')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>Consultar por WhatsApp</span>
            </a>

            {settings.showMenu !== false && (
              <button
                type="button"
                onClick={() => setCurrentView('menu')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Utensils className="w-4 h-4 text-red-400" />
                <span>Ver Carta Digital</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-[#0d0f12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin notice if reservations are hidden */}
        {settings.showReservations === false && isAdminLoggedIn && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-950/80 border border-red-500/50 flex flex-wrap items-center justify-between gap-3 text-xs text-red-200">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-red-400" />
              <span><strong>Modo Admin:</strong> El Módulo de Reservas está actualmente <strong>OCULTO</strong> a los clientes.</span>
            </div>
            <button
              type="button"
              onClick={toggleReservationsVisibility}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Botón Mostrar Reservas</span>
            </button>
          </div>
        )}

        {/* Module Header */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Reserva de Mesas en Vivo</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display mb-3 text-balance">
            Reserva tu experiencia en {settings.storeName}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Disponibilidad en tiempo real para salón, terraza o barra de sushi. Notificamos al local al instante.
          </p>
        </div>

        {/* Wizard Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#14171d] border border-white/5 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-8"
        >
          {/* Salon Paused Notification */}
          {!settings.isSalonAvailable && (
            <div className="p-4 bg-amber-950/70 border border-amber-800 rounded-2xl text-xs text-amber-200 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block text-amber-300">
                  Salón y Reservas Temporalmente Pausados
                </span>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  Hoy no estamos aceptando reservas de mesas en el salón. Sin embargo,{' '}
                  <strong>puedes seguir pidiendo tus rolls favoritos por Delivery o Retiro</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentView('menu')}
                  className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs"
                >
                  Ver Carta y Pedir para Llevar
                </button>
              </div>
            </div>
          )}
          {/* Step 1: Select Date */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span>1. Selecciona el Día</span>
            </label>

            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {availableDates.map((d) => {
                const isSelected = selectedDate === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d.iso);
                      setSelectedTime(''); // reset time on date change
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] sm:min-w-[80px] border transition-all ${
                      isSelected
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-950/40'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className="text-[11px] uppercase font-medium">
                      {d.isToday ? 'Hoy' : d.isTomorrow ? 'Mañana' : d.dayName}
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-mono my-0.5">
                      {d.dayNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {d.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Guests */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              <span>2. Número de Comensales</span>
            </label>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGuests(num)}
                  className={`py-2.5 rounded-xl border text-center transition-all ${
                    guests === num
                      ? 'bg-red-600 border-red-500 text-white font-bold shadow-md shadow-red-950/40'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-mono text-sm">{num}</span>
                  <span className="text-[10px] block text-zinc-400">
                    {num === 1 ? 'persona' : 'pers.'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Select Time Slot (with Real-time Availability) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <span>3. Horario Disponible en Vivo</span>
              </label>
              <span className="text-[11px] text-zinc-500">
                Aforo máx: {settings.maxGuestsPerSlot} pers / turno
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {timeSlots.map((time) => {
                const avail = checkSlotAvailability(selectedDate, time, guests);
                const isSelected = selectedTime === time;
                const isFull = avail.isFull || !avail.available;

                return (
                  <button
                    key={time}
                    type="button"
                    disabled={isFull}
                    onClick={() => setSelectedTime(time)}
                    className={`p-3 rounded-xl border text-center transition-all relative ${
                      isFull
                        ? 'bg-zinc-950/60 border-zinc-900 text-zinc-600 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950/40 font-bold'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span className="font-mono text-sm block">{time} hrs</span>
                    <span className="text-[10px] block mt-0.5">
                      {isFull ? (
                        <span className="text-red-500">Agotado</span>
                      ) : (
                        <span className="text-emerald-400">{avail.remainingGuests} cupos</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Area & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                4. Sector de Preferencia
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'salon', label: 'Salón', desc: 'Climático' },
                  { id: 'terraza', label: 'Terraza', desc: 'Aire libre' },
                  { id: 'barra', label: 'Barra', desc: 'Vista chef' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedArea(item.id as DiningArea)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedArea === item.id
                        ? 'bg-zinc-800 border-red-500 text-white font-medium'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{item.label}</span>
                    <span className="text-[10px] text-zinc-500 block">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                5. Motivo u Ocasión
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-red-500 focus:outline-none"
              >
                {occasionsList.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 5: Contact Details */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              6. Datos de Contacto para Confirmación
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Sofía Valenzuela"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Teléfono Móvil (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: +56 9 8765 4321"
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Peticiones Especiales (Opcional)</label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: Silla de bebé, mesa tranquila, intolerancias alimentarias..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('menu')}
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Volver a la Carta de Productos
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm transition-all shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Confirmar y Enviar Reserva a WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
