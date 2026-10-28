import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import {
  Clock,
  ShieldAlert,
  ChevronLeft,
  Info,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Volume2,
} from 'lucide-react';

const CATEGORY_STYLES = {
  standard: {
    bg: 'bg-slate-700/80 hover:bg-slate-600 border-slate-500/50',
    label: 'Standard',
  },
  student_saver: {
    bg: 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60',
    label: 'Student Saver',
  },
  vip: {
    bg: 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/60',
    label: 'VIP Recliner',
  },
  accessible: {
    bg: 'bg-blue-950/80 hover:bg-blue-900 border-blue-500/60',
    label: 'Accessible',
  },
};

export const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [seatData, setSeatData] = useState(null);
  const [show, setShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holding, setHolding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchSeats();

    // Socket.io for live concurrency seat state synchronization
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, { withCredentials: true });

    socket.emit('join-show', showId);
    socket.on('seat-update', () => {
      fetchSeats(false);
    });

    const interval = setInterval(() => {
      fetchSeats(false);
    }, 10000);

    return () => {
      socket.emit('leave-show', showId);
      socket.disconnect();
      clearInterval(interval);
    };
  }, [showId]);

  const fetchSeats = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      const [seatRes, showRes] = await Promise.all([
        api.get(`/shows/${showId}/seats`),
        api.get(`/shows/${showId}`),
      ]);

      if (seatRes.data.success) {
        setSeatData(seatRes.data.data);
      }
      if (showRes.data.success) {
        setShow(showRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load seat layout', err);
      setErrorMsg('Failed to connect to cinema seat inventory engine.');
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.state === 'booked' || seat.state === 'held') return;

    setErrorMsg('');
    const exists = selectedSeats.some((s) => s.label === seat.label);

    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => s.label !== seat.label));
    } else {
      if (selectedSeats.length >= 10) {
        setErrorMsg('Maximum 10 seats allowed per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateStudentSavings = () => {
    if (!user?.studentVerified) return 0;
    return selectedSeats.reduce((sum, s) => {
      if (s.category === 'student_saver' && s.studentDiscount > 0) {
        return sum + Math.round((s.price * s.studentDiscount) / 100);
      }
      return sum;
    }, 0);
  };

  const handleProceedToHold = async () => {
    if (!user) {
      navigate('/login', { state: { returnUrl: `/shows/${showId}/seats` } });
      return;
    }
    if (selectedSeats.length === 0) {
      setErrorMsg('Please select at least 1 seat to proceed.');
      return;
    }

    try {
      setHolding(true);
      setErrorMsg('');

      // Send reservation request to backend to create temporary atomic seat hold
      const res = await api.post('/holds', {
        showId,
        seats: selectedSeats.map((s) => ({
          row: s.row,
          seatNumber: s.number,
          seatLabel: s.label,
          category: s.category,
          price: s.price,
        })),
      });

      if (res.data.success) {
        const holdId = res.data.data._id;
        navigate(`/checkout/${holdId}`);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Selected seats could not be held. Please choose other available seats.'
      );
      fetchSeats(false);
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const studentSavings = calculateStudentSavings();
  const total = subtotal - studentSavings;

  return (
    <div className="min-h-screen bg-background text-white pb-32">
      {/* Top Bar with Show Info */}
      <div className="bg-surface-primary border-b border-surface-card sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-surface-card hover:bg-surface-elevated text-text-secondary hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-base sm:text-lg leading-tight text-white">
                {show?.movie?.title || 'Screening Selection'}
              </h1>
              <p className="text-xs text-text-secondary">
                {show?.cinema?.name} • {seatData?.auditoriumName} • <span className="text-cinema-red font-bold">{seatData?.format}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs bg-surface-card px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-text-secondary">
              Authoritative Live Availability:
            </span>
            <span className="font-bold text-white">
              {seatData?.availableSeats} / {seatData?.totalSeats} Available
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-cinema-red text-red-200 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertTriangle className="w-5 h-5 shrink-0 text-cinema-red" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Curved Cinema Screen Graphic & Light Projection */}
        <div className="my-8 text-center relative">
          <div className="curved-screen-indicator mb-3" />
          <p className="text-[11px] font-black tracking-widest uppercase text-text-muted">
            All Eyes On The Screen
          </p>
        </div>

        {/* Interactive Auditorium Seating Matrix */}
        <div className="bg-surface-card rounded-3xl p-6 sm:p-10 border border-white/5 shadow-2xl overflow-x-auto">
          <div className="min-w-[680px] mx-auto space-y-3.5">
            {seatData?.seatMap?.map((rowGroup) => (
              <div key={rowGroup.row} className="flex items-center justify-center gap-3 sm:gap-4">
                {/* Left Row Identifier */}
                <span className="w-6 text-center text-xs font-black text-text-muted select-none">
                  {rowGroup.row}
                </span>

                {/* Seat Matrix */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {rowGroup.seats.map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.label === seat.label);
                    const isBooked = seat.state === 'booked';
                    const isHeld = seat.state === 'held';

                    let seatClasses = 'cursor-pointer text-white ';

                    if (isBooked) {
                      seatClasses = 'bg-surface-elevated/40 border-surface-card text-text-muted cursor-not-allowed opacity-25';
                    } else if (isHeld) {
                      seatClasses = 'bg-amber-950/40 border-amber-600/50 text-amber-500 cursor-not-allowed opacity-50';
                    } else if (isSelected) {
                      seatClasses = 'bg-cinema-red border-cinema-red text-white shadow-cinema-glow scale-110 font-black';
                    } else {
                      seatClasses += CATEGORY_STYLES[seat.category]?.bg || CATEGORY_STYLES.standard.bg;
                    }

                    return (
                      <button
                        key={seat.label}
                        disabled={isBooked || isHeld}
                        onClick={() => handleSeatClick(seat)}
                        title={`${seat.label} • ${CATEGORY_STYLES[seat.category]?.label || 'Seat'} • ₹${seat.price}${isHeld ? ' (Locked by other)' : isBooked ? ' (Reserved)' : ''}`}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border text-[11px] font-bold flex items-center justify-center transition-all duration-200 select-none transform hover:scale-108 active:scale-95 ${seatClasses}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                </div>

                {/* Right Row Identifier */}
                <span className="w-6 text-center text-xs font-black text-text-muted select-none">
                  {rowGroup.row}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Seat Category Legend */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary bg-surface-primary/60 py-4 px-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-slate-700 border border-slate-500 inline-block" />
            <span>Standard (₹250)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-emerald-950 border border-emerald-500 inline-block" />
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              Student Saver (₹160)
              <GraduationCap className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-amber-950 border border-amber-500 inline-block" />
            <span>VIP Lounger (₹480)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-cinema-red shadow-cinema-glow inline-block" />
            <span className="text-white font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-surface-elevated/40 opacity-30 inline-block" />
            <span>Sold</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-primary/95 backdrop-blur-md border-t border-surface-card p-4 sm:p-5 z-40">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-text-secondary font-medium">
              Selected ({selectedSeats.length} seats):{' '}
              <strong className="text-white font-mono text-sm">
                {selectedSeats.length > 0
                  ? selectedSeats.map((s) => s.label).join(', ')
                  : 'Please pick seats'}
              </strong>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                ₹{total}
              </span>
              {studentSavings > 0 && (
                <span className="text-xs text-emerald-400 font-bold">
                  (Student Savings Applied: -₹{studentSavings})
                </span>
              )}
              <span className="text-[11px] text-text-muted">Taxes included</span>
            </div>
          </div>

          <button
            disabled={selectedSeats.length === 0 || holding}
            onClick={handleProceedToHold}
            className={`w-full sm:w-auto px-9 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-cinema-glow flex items-center justify-center gap-2.5 ${
              selectedSeats.length > 0 && !holding
                ? 'bg-cinema-red hover:bg-cinema-red-hover text-white cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-surface-elevated text-text-muted cursor-not-allowed opacity-50'
            }`}
          >
            {holding ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Reserving Lock...
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Reserve & Proceed To Checkout ({selectedSeats.length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
