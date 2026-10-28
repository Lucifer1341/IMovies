import React from 'react';
import { Logo } from './Logo';
import { Heart, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-surface-primary border-t border-surface-card text-text-secondary mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Logo />
            <p className="text-xs text-text-secondary leading-relaxed">
              IMovies is a premier cinematic discovery and seamless ticket reservation platform built for film enthusiasts, campus societies, and modern moviegoers.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-accent font-medium">
              <GraduationCap className="w-4 h-4" />
              <span>Engineered for Academic Software Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-cinema-red transition-colors">Now Showing</a></li>
              <li><a href="/#coming-soon" className="hover:text-cinema-red transition-colors">Upcoming Premieres</a></li>
              <li><a href="/#promotions" className="hover:text-cinema-red transition-colors">Campus Pass Discounts</a></li>
              <li><a href="/#campus-screening" className="hover:text-cinema-red transition-colors">Society Screenings</a></li>
            </ul>
          </div>

          {/* Technical Architecture */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Tech Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                React 18 + Vite + Tailwind CSS
              </li>
              <li className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Node.js + Express + Mongoose
              </li>
              <li className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Real-Time Socket.IO Synchronization
              </li>
              <li className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Cryptographic QR Admission Passes
              </li>
            </ul>
          </div>

          {/* Transparency & Disclaimer */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Verification Notice
            </h4>
            <p className="text-xs text-text-muted leading-relaxed mb-3">
              This application is an educational simulation. Payments are processed in demo mode and tickets generated are not valid for admission at commercial theatres.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] bg-surface-elevated px-3 py-1.5 rounded-lg border border-surface-card text-emerald-400 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Demo Payment Mode</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-card flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} IMovies Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-cinema-red fill-cinema-red" /> for modern cinema discovery
          </p>
        </div>
      </div>
    </footer>
  );
};
