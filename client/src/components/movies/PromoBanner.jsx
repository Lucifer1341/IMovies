import React from 'react';
import { Sparkles, GraduationCap, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PromoBanner = () => {
  return (
    <section className="my-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-elevated via-surface-card to-surface-elevated border border-cinema-red/30 p-8 sm:p-10 shadow-cinema-glow">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cinema-red/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Main Student Pass Feature */}
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-cinema-red/20 border border-cinema-red/40 px-3 py-1 rounded-full text-xs font-bold text-cinema-red">
              <GraduationCap className="w-4 h-4" />
              <span>Campus Film Society Exclusive</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Student Saver Pass: Flat 20% Off + ₹149 Tickets
            </h2>

            <p className="text-sm text-text-secondary max-w-xl leading-relaxed">
              Unlock verified student pricing with code <span className="text-white font-mono font-bold bg-surface-primary px-2 py-0.5 rounded border border-white/10">STUDENT20</span> across all weekday screenings, plus dedicated Student Saver rows with complementary snack vouchers.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Instant verification with .edu email
              </span>
              <span>•</span>
              <span>Group discounts available for 4+ tickets</span>
            </div>
          </div>

          {/* Action Cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <div className="bg-surface-primary/70 backdrop-blur-md p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-accent" />
                  Film Society Group Booking
                </span>
                <span className="text-amber-accent font-mono">15% OFF</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Use code <span className="font-mono text-white">CAMPUSFEST</span> at checkout for 3+ tickets.
              </p>
            </div>

            <div className="bg-surface-primary/70 backdrop-blur-md p-4 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cinema-red" />
                  First Booking Welcome Offer
                </span>
                <span className="text-cinema-red font-mono">₹60 OFF</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-tight">
                Use code <span className="font-mono text-white">FIRSTSHOW</span> for instant discount.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
