import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Star,
  Clock,
  Calendar,
  Play,
  MapPin,
  ChevronRight,
  Shield,
  GraduationCap,
  Sparkles,
  Ticket,
  Film,
  Building,
} from 'lucide-react';

export const MovieDetailsPage = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Generate next 7 booking dates
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  });

  useEffect(() => {
    setSelectedDate(availableDates[0].iso);
    fetchMovieDetails();
  }, [movieId]);

  useEffect(() => {
    if (movie) {
      fetchShows();
    }
  }, [movie, selectedCinemaId, selectedDate]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const [movieRes, cinemasRes] = await Promise.all([
        api.get(`/movies/${movieId}`),
        api.get('/cinemas'),
      ]);

      if (movieRes.data.success) {
        setMovie(movieRes.data.data);
      }
      if (cinemasRes.data.success) {
        setCinemas(cinemasRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching movie details', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const params = { movieId: movie._id };
      if (selectedCinemaId) params.cinemaId = selectedCinemaId;
      if (selectedDate) params.date = selectedDate;

      const res = await api.get('/shows', { params });
      if (res.data.success) {
        setShows(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching shows', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cinema-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-text-secondary">The requested title could not be located in our current catalog.</p>
        <Link to="/" className="px-5 py-2.5 rounded-xl bg-cinema-red text-white font-semibold">
          Return to Movies
        </Link>
      </div>
    );
  }

  // Group shows by Cinema
  const showsByCinema = cinemas.reduce((acc, cinema) => {
    const cinemaShows = shows.filter(s => s.cinema?._id === cinema._id || s.cinema === cinema._id);
    if (cinemaShows.length > 0) {
      acc.push({ cinema, shows: cinemaShows });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Backdrop Hero Media with controlled cinematic gradients */}
      <div className="relative w-full h-[400px] sm:h-[480px] overflow-hidden">
        {movie.videoTrailerUrl ? (
          <video
            src={movie.videoTrailerUrl}
            autoPlay
            loop
            muted
            playsInline
            poster={movie.backdropUrl || movie.posterUrl}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-52 relative z-10">
        {/* Movie Info Header Block */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Card */}
          <div className="w-52 sm:w-64 shrink-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-surface-card transform hover:scale-102 transition-transform">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="bg-surface-elevated/90 px-3 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                {movie.ageRating || 'U/A'}
              </span>
              <span className="bg-cinema-red/20 text-cinema-red border border-cinema-red/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {movie.status === 'now_showing' ? '● In Theatres Now' : 'Premiere Release'}
              </span>
              <div className="flex items-center gap-1.5 bg-surface-primary/80 px-3 py-1 rounded-full text-xs font-bold text-amber-accent border border-white/10">
                <Star className="w-3.5 h-3.5 fill-amber-accent" />
                <span>{movie.rating ? movie.rating.toFixed(1) : '8.8'}</span>
                <span className="text-[10px] text-text-muted">({movie.ratingCount ? movie.ratingCount.toLocaleString() : '12,400'} ratings)</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-secondary font-medium">
              <span className="flex items-center gap-1.5 text-white">
                <Clock className="w-4 h-4 text-cinema-red" />
                {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '2h 15m'}
              </span>
              <span>•</span>
              <span>{movie.genres?.join(', ')}</span>
              <span>•</span>
              <span>{movie.language || 'English'}</span>
              {movie.director && (
                <>
                  <span>•</span>
                  <span className="text-text-muted">Dir: {movie.director}</span>
                </>
              )}
            </div>

            <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
              {movie.synopsis}
            </p>

            {/* Cast badges */}
            {movie.cast?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-2">
                  Starring Cast
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-elevated px-3 py-1.5 rounded-xl border border-white/5 text-xs text-white"
                    >
                      <span className="font-bold">{actor.name}</span>
                      {actor.role && <span className="text-text-muted"> as {actor.role}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Real Commercial Showtime Booking Section */}
        <div className="mt-14 bg-surface-card rounded-3xl p-6 sm:p-10 border border-white/5 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-elevated">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <Ticket className="w-7 h-7 text-cinema-red" />
                Select Cinema & Showtime
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Real-time synchronized seating availability across premium Bengaluru screens
              </p>
            </div>

            {/* Cinema Dropdown Filter */}
            <div className="flex items-center gap-2 bg-surface-elevated px-4 py-2.5 rounded-2xl border border-white/10">
              <MapPin className="w-4 h-4 text-cinema-red" />
              <select
                value={selectedCinemaId}
                onChange={(e) => setSelectedCinemaId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-surface-elevated text-white">All Theatres ({cinemas.length})</option>
                {cinemas.map((c) => (
                  <option key={c._id} value={c._id} className="bg-surface-elevated text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {availableDates.map((item) => {
              const isSelected = selectedDate === item.iso;
              return (
                <button
                  key={item.iso}
                  onClick={() => setSelectedDate(item.iso)}
                  className={`flex flex-col items-center justify-center min-w-[84px] py-3.5 px-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-cinema-red border-cinema-red text-white shadow-cinema-glow scale-105'
                      : 'bg-surface-elevated border-white/5 text-text-secondary hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">
                    {item.dayName}
                  </span>
                  <span className="text-2xl font-black mt-0.5">
                    {item.dateNum}
                  </span>
                  <span className="text-[10px] font-semibold text-text-muted">
                    {item.month}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grouped Showtimes By Multiplex */}
          <div className="space-y-6 pt-2">
            {showsByCinema.length > 0 ? (
              showsByCinema.map(({ cinema, shows: cinemaShows }) => (
                <div
                  key={cinema._id}
                  className="p-6 rounded-3xl bg-surface-primary/70 border border-white/5 space-y-4 hover:border-cinema-red/20 transition-colors"
                >
                  {/* Multiplex Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-card pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-cinema-red" />
                        <h3 className="text-base font-black text-white">{cinema.name}</h3>
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-text-muted" />
                        {cinema.address || cinema.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {cinema.amenities?.map((amenity) => (
                        <span
                          key={amenity}
                          className="text-[10px] bg-surface-card text-text-secondary px-2 py-0.5 rounded border border-white/5"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {cinemaShows.map((show) => {
                      const startTime = new Date(show.startTime);
                      const timeString = startTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });

                      return (
                        <Link
                          key={show._id}
                          to={`/shows/${show._id}/seats`}
                          className="group relative flex flex-col items-center justify-center min-w-[110px] p-3 rounded-2xl bg-surface-elevated hover:bg-cinema-red border border-white/5 hover:border-cinema-red transition-all shadow-md transform hover:-translate-y-1"
                        >
                          <span className="text-sm font-black text-white group-hover:text-white">
                            {timeString}
                          </span>
                          <span className="text-[10px] font-bold text-cinema-red group-hover:text-white/90 uppercase tracking-wider mt-0.5">
                            {show.format || 'Standard'}
                          </span>
                          <span className="text-[9px] text-text-muted group-hover:text-white/80 mt-1">
                            {show.auditoriumName}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-14 text-center text-text-secondary space-y-3 bg-surface-primary/40 rounded-3xl border border-white/5">
                <Ticket className="w-12 h-12 text-text-muted mx-auto stroke-1" />
                <p className="text-base font-bold text-white">No showtimes found on selected date</p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Please click on another upcoming date or clear the cinema filter to view all available multiplexes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
