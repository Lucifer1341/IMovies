import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/layout/Logo';
import { Lock, Mail, User as UserIcon, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthPage = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const returnUrl = location.state?.returnUrl || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.phone);
      }
      navigate(returnUrl, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        (isLogin ? 'Invalid credentials provided' : 'Registration failed. Please review your input.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="large" className="justify-center" />
        <h2 className="text-2xl font-black text-white tracking-tight">
          {isLogin ? 'Sign in to your account' : 'Create an IMovies account'}
        </h2>
        <p className="text-xs text-text-secondary">
          {isLogin ? 'Access saved bookings, campus discounts & digital passes' : 'Join film societies with verified student tickets'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface-card py-8 px-6 sm:px-10 rounded-3xl border border-surface-card shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-cinema-red text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-cinema-red" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials Info */}
          {isLogin && (
            <div className="p-3 rounded-2xl bg-surface-elevated border border-white/5 text-[11px] text-text-secondary space-y-1">
              <span className="font-bold text-white block">Demo Quick Access Accounts:</span>
              <div className="flex justify-between">
                <span>Admin Login:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, email: 'admin@imovies.dev', password: 'Admin@12345!' })}
                  className="font-mono text-amber-accent underline"
                >
                  admin@imovies.dev
                </button>
              </div>
              <div className="flex justify-between">
                <span>Student Login:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, email: 'student@campus.edu', password: 'User@12345!' })}
                  className="font-mono text-cinema-red underline"
                >
                  student@campus.edu
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Priya Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-surface-elevated rounded-xl text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-surface-elevated rounded-xl text-xs text-white focus:outline-none focus:border-cinema-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-surface-elevated rounded-xl text-xs text-white focus:outline-none focus:border-cinema-red"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-surface-elevated rounded-xl text-xs text-white focus:outline-none focus:border-cinema-red"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white font-bold text-xs uppercase tracking-wider shadow-cinema-glow transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-surface-elevated text-center text-xs text-text-secondary">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-cinema-red hover:underline">
                  Register here
                </Link>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <Link to="/login" className="font-bold text-cinema-red hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
