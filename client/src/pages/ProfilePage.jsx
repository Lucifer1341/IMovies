import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, GraduationCap, ShieldCheck, Save, CheckCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await updateProfile(formData);
      setSuccessMsg('Profile updated successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black">Account Settings</h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage your personal credentials, communication preferences and student status
          </p>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/60 border border-emerald-600/50 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-950/60 border border-cinema-red rounded-2xl text-red-200 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="bg-surface-card p-6 sm:p-8 rounded-3xl border border-white/5 shadow-xl space-y-6">
          {/* Student Status Badge Banner */}
          <div className="p-4 rounded-2xl bg-surface-elevated border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cinema-red/20 text-cinema-red flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Campus Student Verification
                </span>
                <span className="text-[11px] text-text-muted">
                  {user?.studentVerified
                    ? 'Verified — 20% discount applies to Student Saver rows'
                    : 'Unverified — Contact campus society coordinator for verification tag'}
                </span>
              </div>
            </div>

            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                user?.studentVerified
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-600/30'
                  : 'bg-surface-card text-text-muted'
              }`}
            >
              {user?.studentVerified ? 'Verified' : 'Standard'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-surface-elevated rounded-xl text-xs text-white focus:outline-none focus:border-cinema-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Email Address (Permanent)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated/40 border border-surface-elevated rounded-xl text-xs text-text-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Phone Number
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white font-bold text-xs uppercase tracking-wider shadow-cinema-glow transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
