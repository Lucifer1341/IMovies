import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Ticket,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  XCircle,
  Eye,
  CheckCircle2,
  Film,
} from 'lucide-react';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      const res = await api.get('/bookings/me', { params });
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket booking?')) return;

    try {
      setCancellingId(bookingId);
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Customer initiated cancellation',
      });
      if (res.data.success) {
        setActionMsg('Booking successfully cancelled. Simulated refund processed.');
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cancellation rejected by cinema rules.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2">
              <Ticket className="w-8 h-8 text-cinema-red" />
              My Bookings
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Your active admissions, digital barcode passes, and reservation history
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 bg-surface-card p-1.5 rounded-2xl border border-white/5">
            {['all', 'confirmed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                  filter === tab
                    ? 'bg-cinema-red text-white'
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {actionMsg && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl text-emerald-300 text-xs flex items-center justify-between">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg('')} className="text-text-muted hover:text-white">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-surface-card rounded-3xl h-36" />
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((b) => {
              const isConfirmed = b.status === 'confirmed';
              const isCancelled = b.status === 'cancelled';

              return (
                <div
                  key={b._id}
                  className="bg-surface-card rounded-3xl p-6 border border-white/5 hover:border-cinema-red/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-24 rounded-2xl overflow-hidden bg-surface-primary shrink-0 border border-white/10 hidden sm:block">
                      <img
                        src={b.moviePosterUrl || 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=200'}
                        alt="Poster"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{b.movieTitle}</h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isConfirmed
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30'
                              : isCancelled
                              ? 'bg-red-950/60 text-red-400 border border-red-600/30'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-600/30'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cinema-red" />
                        {b.cinemaName} • {b.auditoriumName}
                      </p>

                      <p className="text-xs text-text-muted">
                        {new Date(b.showStartTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-text-muted text-[11px]">Seats:</span>
                        {b.seats?.map((s) => (
                          <span
                            key={s.seatLabel}
                            className="bg-surface-elevated font-mono font-bold text-white px-2 py-0.5 rounded text-[11px]"
                          >
                            {s.seatLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-end justify-between gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">
                        Booking Total
                      </span>
                      <span className="text-lg font-mono font-black text-white">
                        ₹{b.totalAmount}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted block">
                        Ref: {b.bookingRef}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isConfirmed && (
                        <>
                          <Link
                            to={`/tickets/${b._id}`}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold transition-all shadow-cinema-glow"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Ticket
                          </Link>

                          <button
                            disabled={cancellingId === b._id}
                            onClick={() => handleCancelBooking(b._id)}
                            className="px-3 py-2 rounded-xl bg-surface-elevated hover:bg-red-950/40 text-text-secondary hover:text-red-400 text-xs font-semibold border border-white/5 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center text-text-secondary bg-surface-card/40 rounded-3xl border border-white/5 space-y-4">
            <Film className="w-12 h-12 text-text-muted mx-auto stroke-1" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-text-muted">You have not booked any screenings in this category.</p>
            </div>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-cinema-red text-white text-xs font-bold uppercase tracking-wider"
            >
              Explore Now Showing Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
