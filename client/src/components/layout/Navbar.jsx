import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  MapPin,
  User as UserIcon,
  Ticket,
  Shield,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const Navbar = ({ onSearchChange, searchTerm = '' }) => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-surface-primary/90 border-b border-surface-card transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Logo />

        {/* Location Selector */}
        <div className="hidden md:flex items-center gap-2 bg-surface-elevated/70 px-3.5 py-1.5 rounded-full border border-surface-card text-sm text-text-secondary hover:text-white hover:border-text-secondary/30 transition-all cursor-pointer">
          <MapPin className="w-4 h-4 text-cinema-red" />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none text-xs font-semibold cursor-pointer"
          >
            <option value="Bengaluru" className="bg-surface-elevated text-white">Bengaluru</option>
            <option value="Mumbai" className="bg-surface-elevated text-white">Mumbai</option>
            <option value="Delhi-NCR" className="bg-surface-elevated text-white">Delhi-NCR</option>
            <option value="Hyderabad" className="bg-surface-elevated text-white">Hyderabad</option>
          </select>
        </div>

        {/* Live Search Input (Shown when on discovery page) */}
        {location.pathname === '/' && (
          <div className="flex-1 max-w-md hidden lg:block">
            <div className="relative">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies, languages, directors..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-elevated/80 border border-surface-card rounded-full text-sm text-white placeholder-text-secondary focus:outline-none focus:border-cinema-red focus:ring-1 focus:ring-cinema-red transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/' ? 'text-cinema-red' : 'text-text-secondary hover:text-white'
            }`}
          >
            Movies
          </Link>

          {user && (
            <Link
              to="/bookings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/bookings' ? 'text-cinema-red' : 'text-text-secondary hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              My Bookings
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-accent border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-surface-card">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-card hover:bg-surface-elevated text-sm text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-cinema-red/20 text-cinema-red flex items-center justify-center font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate font-medium text-xs">
                  {user.name}
                </span>
                {user.studentVerified && (
                  <span title="Verified Student" className="text-[10px] bg-cinema-red/20 text-cinema-red font-bold px-1.5 py-0.5 rounded">
                    EDU
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 text-text-secondary hover:text-white hover:bg-surface-card rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:text-white hover:bg-surface-elevated transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-cinema-red hover:bg-cinema-red-hover shadow-cinema-glow transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-text-secondary hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-surface-primary border-b border-surface-card space-y-3">
          {location.pathname === '/' && (
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-surface-card rounded-lg text-sm text-white focus:outline-none"
              />
            </div>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-card"
          >
            Explore Movies
          </Link>

          {user && (
            <>
              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-card"
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-card"
              >
                Profile Settings
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-amber-accent hover:bg-surface-card"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-surface-card flex gap-2">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 bg-surface-card hover:bg-surface-elevated text-sm font-medium text-white rounded-lg"
              >
                Sign Out ({user.name})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-surface-card text-sm font-medium text-white rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 bg-cinema-red text-sm font-medium text-white rounded-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
