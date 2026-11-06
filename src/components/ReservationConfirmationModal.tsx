import React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  MessageSquare,
  Share2,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeWhatsAppPhone } from '../utils/formatters';

export const ReservationConfirmationModal: React.FC = () => {
  const {
    lastReservationConfirmed,
    setLastReservationConfirmed,
    settings,
    setCurrentView,
  } = useStore();

  if (!lastReservationConfirmed) return null;

  const r = lastReservationConfirmed;
  const cleanPhone = sanitizeWhatsAppPhone(settings.phone);

  const areaLabels = {
    salon: 'Salón Principal',
    terraza: 'Terraza al aire libre',
    barra: 'Barra de Sushi (Vista al Chef)',
  };

  const handleDownloadCalendar = () => {
    // Basic .ics file download
    const title = `Reserva Mesa en ${settings.storeName}`;
    const description = `Reserva #${r.id} para ${r.guests} personas en ${areaLabels[r.area]}.`;
    const location = settings.address;

    const startDateTime = `${r.date.replace(/-/g, '')}T${r.time.replace(':', '')}00`;
    const endHour = (parseInt(r.time.split(':')[0], 10) + 2).toString().padStart(2, '0');
    const endDateTime = `${r.date.replace(/-/g, '')}T${endHour}${r.time.split(':')[1]}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kuro Sushi//Reservas//ES',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `DTSTART:${startDateTime}`,
      `DTEND:${endDateTime}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `reserva-${r.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReopenWhatsApp = () => {
    const alertMessage = `🛎️ *CONSULTA / CONFIRMACIÓN DE RESERVA*
Código: *#${r.id}*
Cliente: ${r.customerName}
Fecha: ${r.date} a las ${r.time} hrs
Comensales: ${r.guests} personas
Sector: ${areaLabels[r.area]}`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertMessage)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#14171d] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl text-center space-y-6">
        <button
          onClick={() => setLastReservationConfirmed(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
            ¡Reserva Registrada con Éxito!
          </h3>
          <p className="text-xs text-zinc-400">
            Hemos recibido tu solicitud y se ha enviado la notificación directa al local.
          </p>
        </div>

        {/* Ticket Summary Card */}
        <div className="bg-zinc-950/80 rounded-2xl p-4 border border-white/5 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <span className="text-zinc-400">Código de Reserva:</span>
            <span className="font-mono font-bold text-sm text-red-400">#{r.id}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-zinc-300">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-red-400" />
              <span>{r.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>{r.time} hrs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-red-400" />
              <span>{r.guests} personas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="truncate">{areaLabels[r.area]}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 text-[11px] text-zinc-400">
            Titular: <span className="text-white font-medium">{r.customerName}</span> ({r.customerPhone})
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleReopenWhatsApp}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir WhatsApp con el Local</span>
          </button>

          <button
            onClick={handleDownloadCalendar}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Guardar en Mi Calendario (.ics)</span>
          </button>

          <button
            onClick={() => {
              setLastReservationConfirmed(null);
              setCurrentView('menu');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-medium text-xs flex items-center justify-center gap-2"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Explorar la Carta de Rolls</span>
          </button>
        </div>
      </div>
    </div>
  );
};
