import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  ShieldCheck,
  Tag,
  AlertCircle,
  CreditCard,
  Ticket,
  CheckCircle,
  Film,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CheckoutPage = () => {
  const { holdId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hold, setHold] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [paying, setPaying] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    fetchHold();
  }, [holdId]);

  // Expiration countdown
  useEffect(() => {
    if (!hold?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(hold.expiresAt).getTime();
      const diffSeconds = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diffSeconds);

      if (diffSeconds === 0) {
        setCheckoutError('Hold session has expired. Please select seats again.');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [hold]);

  const fetchHold = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/holds/${holdId}`);
      if (res.data.success) {
        setHold(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load hold session', err);
      setCheckoutError(err.response?.data?.message || 'Hold not found or already expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError('');

    try {
      const res = await api.post('/promotions/validate', {
        code: promoCode.trim(),
        seatCount: hold?.seats?.length || 1,
      });

      if (res.data.success && res.data.valid) {
        setPromoApplied(res.data.data);
      } else {
        setPromoError(res.data.message || 'Invalid promotion code');
        setPromoApplied(null);
      }
    } catch (err) {
      setPromoError('Failed to validate promotion');
    }
  };

  const calculateSubtotal = () => {
    return hold?.seats?.reduce((sum, s) => sum + s.price, 0) || 0;
  };

  const calculateDiscount = () => {
    if (!promoApplied) return 0;
    const sub = calculateSubtotal();
    if (promoApplied.discountType === 'percentage') {
      const disc = Math.round((sub * promoApplied.discountValue) / 100);
      return promoApplied.maxDiscountAmount ? Math.min(disc, promoApplied.maxDiscountAmount) : disc;
    }
    return Math.min(promoApplied.discountValue, sub);
  };

  const handleConfirmDemoPayment = async () => {
    if (timeLeft === 0) {
      setCheckoutError('Hold session has expired. Return to seating map.');
      return;
    }

    try {
      setPaying(true);
      setCheckoutError('');

      // Step 1: Create booking with authoritative price on backend
      const bookingRes = await api.post('/bookings', {
        holdId,
        promotionCode: promoApplied?.code,
      });

      if (!bookingRes.data.success) {
        throw new Error(bookingRes.data.message || 'Booking creation failed');
      }

      const booking = bookingRes.data.data;

      // Step 2: Confirm simulated payment
      const paymentRes = await api.post('/payments/demo/confirm', {
        bookingId: booking._id,
      });

      if (paymentRes.data.success) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        // Navigate to digital ticket
        navigate(`/tickets/${booking._id}`);
      }
    } catch (err) {
      console.error('Payment error', err);
      setCheckoutError(err.response?.data?.message || 'Payment simulation failed. Please try again.');
    } finally {
      setPaying(false);
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
  const discount = calculateDiscount();
  const convenienceFee = Math.round(subtotal * 0.05); // 5% standard convenience charge
  const finalTotal = Math.max(0, subtotal - discount + convenienceFee);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Expiration Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-primary p-6 rounded-3xl border border-surface-card shadow-xl">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Ticket className="w-6 h-6 text-cinema-red" />
              Checkout & Ticket Issuance
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Review your reserved seats and simulate instant confirmation
            </p>
          </div>

          <div className="flex items-center gap-3 bg-surface-card px-4 py-2.5 rounded-2xl border border-cinema-red/30 self-start sm:self-auto">
            <Clock className="w-5 h-5 text-amber-accent animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-text-muted block">
                Time Remaining on Hold
              </span>
              <span className={`font-mono font-black text-base ${timeLeft < 60 ? 'text-cinema-red' : 'text-white'}`}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {checkoutError && (
          <div className="p-4 rounded-2xl bg-red-950/60 border border-cinema-red text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-cinema-red" />
            <span>{checkoutError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie & Cinema Info Card */}
            <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Film className="w-4 h-4 text-cinema-red" />
                Screening Summary
              </h2>

              <div className="flex gap-4 items-start pt-1">
                <div className="w-20 rounded-xl overflow-hidden bg-surface-primary shrink-0 border border-white/10">
                  <img
                    src={hold?.show?.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=200'}
                    alt="Poster"
                    className="w-full h-auto object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">
                    {hold?.show?.movie?.title || 'Screening'}
                  </h3>
                  <p className="text-xs text-text-secondary flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-cinema-red" />
                    {hold?.show?.cinema?.name} • {hold?.show?.auditoriumName}
                  </p>
                  <p className="text-xs text-text-muted">
                    {hold?.show?.startTime ? new Date(hold.show.startTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : 'Today'}
                  </p>
                </div>
              </div>

              {/* Reserved Seats List */}
              <div className="pt-4 border-t border-surface-elevated">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2.5">
                  Assigned Seats ({hold?.seats?.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {hold?.seats?.map((seat) => (
                    <div
                      key={seat.seatLabel}
                      className="bg-surface-elevated px-3 py-1.5 rounded-xl border border-white/5 text-xs flex items-center gap-2"
                    >
                      <span className="font-bold text-white">{seat.seatLabel}</span>
                      <span className="text-[10px] text-text-muted uppercase">({seat.category})</span>
                      <span className="font-mono text-cinema-red">₹{seat.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-accent" />
                Promotion or Student Pass
              </h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. STUDENT20, FIRSTSHOW"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 bg-surface-primary border border-surface-card rounded-xl text-xs uppercase font-mono text-white focus:outline-none focus:border-cinema-red"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-5 py-2.5 bg-surface-elevated hover:bg-surface-primary text-xs font-bold text-white rounded-xl border border-white/10 transition-colors"
                >
                  Apply
                </button>
              </div>

              {promoApplied && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                  <span>Code <strong>{promoApplied.code}</strong> applied ({promoApplied.description})</span>
                  <button onClick={() => setPromoApplied(null)} className="text-[11px] text-red-400 underline">
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-xs text-cinema-red">{promoError}</p>
              )}
            </div>
          </div>

          {/* Right Column: Price Breakdown & Simulated Payment */}
          <div className="space-y-6">
            <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                Payment Breakdown
              </h2>

              <div className="space-y-2.5 text-xs text-text-secondary pt-2">
                <div className="flex justify-between">
                  <span>Base Ticket Price ({hold?.seats?.length} seats)</span>
                  <span className="font-mono text-white">₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount Savings ({promoApplied?.code})</span>
                    <span className="font-mono">-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Booking & Tech Convenience Fee (5%)</span>
                  <span className="font-mono text-white">₹{convenienceFee}</span>
                </div>

                <div className="pt-3 border-t border-surface-elevated flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Final Total</span>
                  <span className="text-2xl font-black text-white font-mono">
                    ₹{finalTotal}
                  </span>
                </div>
              </div>

              {/* Demo Notice Disclaimer */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed space-y-1">
                <p className="font-bold flex items-center gap-1 text-amber-accent">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Simulation Mode Active
                </p>
                <p>
                  No real credit or debit card is charged. Clicking confirm creates an authoritative test booking with cryptographically verifiable demo ticket pass.
                </p>
              </div>

              {/* Confirm Demo Payment Button */}
              <button
                disabled={paying || timeLeft === 0}
                onClick={handleConfirmDemoPayment}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-cinema-glow flex items-center justify-center gap-2 ${
                  !paying && timeLeft > 0
                    ? 'bg-cinema-red hover:bg-cinema-red-hover text-white cursor-pointer transform hover:-translate-y-0.5'
                    : 'bg-surface-elevated text-text-muted cursor-not-allowed opacity-50'
                }`}
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Digital Ticket...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Simulate Payment (₹{finalTotal})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
