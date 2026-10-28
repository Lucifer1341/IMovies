import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Film,
  Building,
  Calendar,
  Ticket,
  Users,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Shield,
  Activity,
  CheckCircle,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Movie Form Modal State
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    slug: '',
    synopsis: '',
    posterUrl: '',
    backdropUrl: '',
    runtime: 120,
    language: 'English',
    genres: 'Sci-Fi, Action',
    rating: 8.0,
    status: 'now_showing',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, moviesRes, cinemasRes, showsRes, bookingsRes, usersRes] =
        await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/movies'),
          api.get('/admin/cinemas'),
          api.get('/admin/shows'),
          api.get('/admin/bookings'),
          api.get('/admin/users'),
        ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (moviesRes.data.success) setMovies(moviesRes.data.data);
      if (cinemasRes.data.success) setCinemas(cinemasRes.data.data);
      if (showsRes.data.success) setShows(showsRes.data.data);
      if (bookingsRes.data.success) setBookings(bookingsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        releaseDate: new Date(),
      };
      const res = await api.post('/admin/movies', payload);
      if (res.data.success) {
        setShowMovieModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating movie');
    }
  };

  const handleToggleStudent = async (userId, currentStatus) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, {
        studentVerified: !currentStatus,
      });
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update student verification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-card pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-accent border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                System Administration
              </span>
            </div>
            <h1 className="text-3xl font-black mt-1">IMovies Operations Console</h1>
            <p className="text-xs text-text-secondary">
              Authoritative management of movie schedules, cinema halls, occupancy metrics and accounts
            </p>
          </div>

          <button
            onClick={() => setShowMovieModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-xs font-bold uppercase tracking-wider shadow-cinema-glow transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Movie
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-surface-card text-xs font-bold scrollbar-none">
          {[
            { id: 'overview', label: 'Metrics & Analytics', icon: Activity },
            { id: 'movies', label: `Movies (${movies.length})`, icon: Film },
            { id: 'cinemas', label: `Theatres (${cinemas.length})`, icon: Building },
            { id: 'shows', label: `Schedules (${shows.length})`, icon: Calendar },
            { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Ticket },
            { id: 'users', label: `Users (${users.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-cinema-red text-white shadow-cinema-glow'
                    : 'bg-surface-card text-text-secondary hover:text-white hover:bg-surface-elevated'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-card p-5 rounded-3xl border border-white/5 space-y-2">
                <span className="text-xs text-text-muted font-bold uppercase">Total Bookings</span>
                <p className="text-3xl font-black text-white">{analytics.totalBookings}</p>
                <span className="text-[11px] text-emerald-400 font-medium">
                  {analytics.confirmedBookings} Confirmed Passes
                </span>
              </div>

              <div className="bg-surface-card p-5 rounded-3xl border border-white/5 space-y-2">
                <span className="text-xs text-text-muted font-bold uppercase">Demo Gross Revenue</span>
                <p className="text-3xl font-black text-amber-accent font-mono">
                  ₹{analytics.totalRevenue.toLocaleString()}
                </p>
                <span className="text-[10px] text-text-muted">Simulated payments only</span>
              </div>

              <div className="bg-surface-card p-5 rounded-3xl border border-white/5 space-y-2">
                <span className="text-xs text-text-muted font-bold uppercase">Active Catalog</span>
                <p className="text-3xl font-black text-white">{analytics.totalMovies} Movies</p>
                <span className="text-[11px] text-text-secondary">{analytics.totalShows} Scheduled Shows</span>
              </div>

              <div className="bg-surface-card p-5 rounded-3xl border border-white/5 space-y-2">
                <span className="text-xs text-text-muted font-bold uppercase">Registered Members</span>
                <p className="text-3xl font-black text-white">{analytics.totalUsers}</p>
                <span className="text-[11px] text-text-secondary">Community & Student Accounts</span>
              </div>
            </div>

            {/* Recent Confirmed Bookings Table */}
            <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
              <h2 className="text-base font-bold text-white">Recent Real-Time Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated text-text-muted uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Reference</th>
                      <th className="p-3">Movie</th>
                      <th className="p-3">Cinema</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-elevated">
                    {analytics.recentBookings?.map((b) => (
                      <tr key={b._id} className="hover:bg-surface-elevated/40">
                        <td className="p-3 font-mono font-bold text-amber-accent">{b.bookingRef}</td>
                        <td className="p-3 font-semibold text-white">{b.movieTitle}</td>
                        <td className="p-3 text-text-secondary">{b.cinemaName}</td>
                        <td className="p-3 font-mono font-bold text-white">₹{b.totalAmount}</td>
                        <td className="p-3">
                          <span className="bg-emerald-950/60 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MOVIES */}
        {activeTab === 'movies' && (
          <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white">Movie Titles</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Title</th>
                    <th className="p-3">Runtime</th>
                    <th className="p-3">Language</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-elevated">
                  {movies.map((m) => (
                    <tr key={m._id} className="hover:bg-surface-elevated/40">
                      <td className="p-3 font-bold text-white">{m.title}</td>
                      <td className="p-3 text-text-secondary">{m.runtime} mins</td>
                      <td className="p-3 text-text-secondary">{m.language}</td>
                      <td className="p-3">
                        <span className="bg-surface-elevated text-cinema-red font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-amber-accent font-bold">★ {m.rating}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: THEATRES */}
        {activeTab === 'cinemas' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cinemas.map((c) => (
              <div key={c._id} className="bg-surface-card p-6 rounded-3xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-cinema-red">
                  <Building className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">{c.name}</h3>
                </div>
                <p className="text-xs text-text-secondary">{c.location} • {c.city}</p>
                <div className="pt-2 border-t border-surface-elevated text-xs">
                  <span className="text-text-muted block text-[10px] uppercase font-bold mb-1">Auditoriums</span>
                  <ul className="space-y-1">
                    {c.auditoriums?.map((a, idx) => (
                      <li key={idx} className="flex justify-between text-text-secondary text-[11px]">
                        <span>{a.name}</span>
                        <span className="font-mono text-white">{a.totalSeats} seats</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SCHEDULES */}
        {activeTab === 'shows' && (
          <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white">Configured Showtimes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Show ID</th>
                    <th className="p-3">Start Time</th>
                    <th className="p-3">Auditorium</th>
                    <th className="p-3">Format</th>
                    <th className="p-3">Seats</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-elevated">
                  {shows.map((s) => (
                    <tr key={s._id} className="hover:bg-surface-elevated/40">
                      <td className="p-3 font-mono text-text-muted text-[10px]">{s._id}</td>
                      <td className="p-3 text-white font-semibold">
                        {new Date(s.startTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 text-text-secondary">{s.auditoriumName}</td>
                      <td className="p-3 font-bold text-cinema-red">{s.format}</td>
                      <td className="p-3 font-mono text-white">{s.totalSeats} seats</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white">All System Bookings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Ref</th>
                    <th className="p-3">Movie</th>
                    <th className="p-3">Customer Seats</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-elevated">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-surface-elevated/40">
                      <td className="p-3 font-mono font-bold text-amber-accent">{b.bookingRef}</td>
                      <td className="p-3 font-semibold text-white">{b.movieTitle}</td>
                      <td className="p-3 text-text-secondary">
                        {b.seats?.map((s) => s.seatLabel).join(', ')}
                      </td>
                      <td className="p-3 font-mono text-white">₹{b.totalAmount}</td>
                      <td className="p-3 text-[11px] font-mono text-emerald-400">{b.paymentStatus}</td>
                      <td className="p-3">
                        <span className="bg-surface-elevated px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: USERS */}
        {activeTab === 'users' && (
          <div className="bg-surface-card rounded-3xl p-6 border border-white/5 space-y-4">
            <h2 className="text-base font-bold text-white">Registered Users & Student Roles</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-text-muted uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Student Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-elevated">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-surface-elevated/40">
                      <td className="p-3 font-bold text-white">{u.name}</td>
                      <td className="p-3 font-mono text-text-secondary">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin' ? 'bg-amber-500/20 text-amber-accent' : 'bg-surface-elevated text-text-secondary'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.studentVerified ? (
                          <span className="text-emerald-400 font-semibold">Verified Student</span>
                        ) : (
                          <span className="text-text-muted">Standard</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleStudent(u._id, u.studentVerified)}
                          className="px-3 py-1 bg-surface-elevated hover:bg-surface-primary rounded-lg text-[10px] font-bold text-white border border-white/10"
                        >
                          Toggle Student Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Movie */}
      {showMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-card rounded-3xl border border-white/10 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Create Movie Listing</h3>
            <form onSubmit={handleCreateMovie} className="space-y-3 text-xs">
              <div>
                <label className="block text-text-secondary mb-1">Movie Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 bg-surface-primary border border-surface-elevated rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Synopsis</label>
                <textarea
                  required
                  rows="3"
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-primary border border-surface-elevated rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary mb-1">Runtime (Mins)</label>
                  <input
                    type="number"
                    value={movieForm.runtime}
                    onChange={(e) => setMovieForm({ ...movieForm, runtime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-primary border border-surface-elevated rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-text-secondary mb-1">Language</label>
                  <input
                    type="text"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-primary border border-surface-elevated rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-secondary mb-1">Poster Image URL (Unsplash)</label>
                <input
                  type="url"
                  value={movieForm.posterUrl}
                  placeholder="https://images.unsplash.com/..."
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-primary border border-surface-elevated rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMovieModal(false)}
                  className="px-4 py-2 bg-surface-elevated rounded-xl text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cinema-red text-white font-bold rounded-xl shadow-cinema-glow"
                >
                  Create Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
