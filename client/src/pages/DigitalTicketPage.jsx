import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Ticket as TicketIcon,
  Printer,
  Share2,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Sparkles,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const DigitalTicketPage = () => {
  const { bookingId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [bookingId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/${bookingId}`);
      if (res.data.success) {
        setTicketData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching ticket', err);
      setError(err.response?.data?.message || 'Could not load digital ticket pass');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `IMovies Ticket: ${ticketData?.booking?.movieTitle}`,
        text: `Cinema pass for ${ticketData?.booking?.movieTitle} at ${ticketData?.booking?.cinemaName}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Ticket Unavailable</h2>
        <p className="text-text-secondary">{error || 'This booking may not be confirmed.'}</p>
        <Link to="/bookings" className="px-5 py-2.5 rounded-xl bg-cinema-red text-white font-semibold">
          View My Bookings
        </Link>
      </div>
    );
  }

  const { booking, qrCode, ticketToken } = ticketData;

  return (
    <div className="min-h-screen bg-background text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Success Alert Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Booking Confirmed!</h1>
          <p className="text-xs text-text-secondary">
            Present this QR code or admission token at the theatre kiosk for entry
          </p>
        </div>

        {/* Perforated Cinematic Ticket Container */}
        <div className="relative bg-surface-primary rounded-3xl overflow-hidden border border-surface-card shadow-2xl">
          {/* Top Notch Left & Right */}
          <div className="relative p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cinema-red block mb-1">
                  IMovies Admission Pass
                </span>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  {booking.movieTitle}
                </h2>
                <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cinema-red" />
                  {booking.cinemaName} • {booking.auditoriumName}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-text-muted font-bold block uppercase">
                  Booking Ref
                </span>
                <span className="font-mono text-sm font-black text-amber-accent">
                  {booking.bookingRef}
                </span>
              </div>
            </div>

            {/* Time & Format Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-elevated/70 p-4 rounded-2xl border border-white/5 text-xs">
              <div>
                <span className="text-text-muted block text-[10px] font-semibold uppercase">Date</span>
                <span className="font-bold text-white">
                  {new Date(booking.showStartTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-text-muted block text-[10px] font-semibold uppercase">Showtime</span>
                <span className="font-bold text-white">
                  {new Date(booking.showStartTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-text-muted block text-[10px] font-semibold uppercase">Screen Format</span>
                <span className="font-bold text-cinema-red">{booking.showFormat || 'Standard'}</span>
              </div>
            </div>

            {/* Reserved Seats Row */}
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block mb-2">
                Reserved Seats ({booking.seats?.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {booking.seats?.map((seat) => (
                  <span
                    key={seat.seatLabel}
                    className="px-3 py-1 rounded-lg bg-cinema-red/20 border border-cinema-red/40 text-cinema-red font-mono font-black text-xs"
                  >
                    {seat.seatLabel}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Perforated Divider Bar */}
          <div className="relative flex items-center justify-between px-2">
            <div className="w-6 h-6 rounded-full bg-background -ml-5 border-r border-surface-card" />
            <div className="flex-1 border-t-2 border-dashed border-surface-card mx-2" />
            <div className="w-6 h-6 rounded-full bg-background -mr-5 border-l border-surface-card" />
          </div>

          {/* Bottom QR Section */}
          <div className="p-6 sm:p-8 bg-surface-card/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                ● Cryptographically Signed QR
              </span>
              <p className="text-xs text-text-secondary max-w-[240px]">
                Scan at the auditorium turnstile for instant admission verification.
              </p>
              <p className="text-[10px] font-mono text-text-muted truncate max-w-[220px]">
                Token: {ticketToken}
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
              {qrCode ? (
                <img src={qrCode} alt="Ticket QR Code" className="w-32 h-32" />
              ) : (
                <div className="w-32 h-32 bg-slate-200 animate-pulse" />
              )}
            </div>
          </div>

          {/* Disclaimer Footer Strip */}
          <div className="bg-amber-500/10 border-t border-amber-500/20 py-2.5 px-6 text-center">
            <span className="text-[10px] font-medium text-amber-200">
              ⚠️ ACADEMIC DEMO TICKET — For software engineering demonstration purposes only.
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card hover:bg-surface-elevated text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Printer className="w-4 h-4 text-cinema-red" />
            Print Ticket
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-card hover:bg-surface-elevated text-white text-xs font-semibold border border-white/10 transition-colors"
          >
            <Share2 className="w-4 h-4 text-amber-accent" />
            {copied ? 'Link Copied!' : 'Share Pass'}
          </button>

          <Link
            to="/bookings"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold transition-all shadow-cinema-glow"
          >
            <TicketIcon className="w-4 h-4" />
            All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
};
