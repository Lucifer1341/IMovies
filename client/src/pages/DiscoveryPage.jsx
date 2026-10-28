import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MovieCard } from '../components/movies/MovieCard';
import { HeroBanner } from '../components/movies/HeroBanner';
import { PromoBanner } from '../components/movies/PromoBanner';
import { Film, Sparkles, Filter, Clapperboard, Calendar } from 'lucide-react';

const GENRES = ['All', 'Sci-Fi', 'Action', 'Thriller', 'Drama', 'Cyberpunk', 'Mystery', 'Adventure'];

export const DiscoveryPage = ({ searchTerm = '' }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [activeTab, setActiveTab] = useState('now_showing');

  useEffect(() => {
    fetchMovies();
  }, [selectedGenre, searchTerm]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/movies', { params });
      if (res.data.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load movies', err);
    } finally {
      setLoading(false);
    }
  };

  const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');
  const comingSoonMovies = movies.filter((m) => m.status === 'coming_soon');
  const heroMovie = nowShowingMovies[0] || movies[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Movie Hero Banner */}
      {!searchTerm && selectedGenre === 'All' && heroMovie && (
        <HeroBanner movie={heroMovie} />
      )}

      {/* Main Discoverable Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Genre Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-cinema-red" />
            <span className="font-semibold uppercase tracking-wider">Genres</span>
          </div>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedGenre === genre
                  ? 'bg-cinema-red text-white shadow-cinema-glow'
                  : 'bg-surface-elevated text-text-secondary hover:text-white hover:bg-surface-card border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Section Tabs: Now Showing vs Coming Soon */}
        <div className="flex items-center justify-between mt-8 mb-6 border-b border-surface-card pb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('now_showing')}
              className={`flex items-center gap-2 text-lg sm:text-xl font-bold pb-2 -mb-4 transition-all relative ${
                activeTab === 'now_showing'
                  ? 'text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Clapperboard className="w-5 h-5 text-cinema-red" />
              Now Showing
              <span className="text-xs bg-surface-card px-2 py-0.5 rounded-full text-text-secondary">
                {nowShowingMovies.length}
              </span>
              {activeTab === 'now_showing' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-red" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('coming_soon')}
              className={`flex items-center gap-2 text-lg sm:text-xl font-bold pb-2 -mb-4 transition-all relative ${
                activeTab === 'coming_soon'
                  ? 'text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5 text-amber-accent" />
              Coming Soon
              <span className="text-xs bg-surface-card px-2 py-0.5 rounded-full text-text-secondary">
                {comingSoonMovies.length}
              </span>
              {activeTab === 'coming_soon' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-accent" />
              )}
            </button>
          </div>

          <span className="text-xs text-text-muted hidden sm:inline">
            Authoritative Server Catalog
          </span>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-surface-card rounded-2xl aspect-[2/3] w-full" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'now_showing' ? (
              nowShowingMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {nowShowingMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-text-secondary space-y-2">
                  <Film className="w-12 h-12 text-text-muted mx-auto stroke-1" />
                  <p className="text-base font-semibold text-white">No active screenings found</p>
                  <p className="text-xs text-text-muted">Try clearing genre filters or searching for another title.</p>
                </div>
              )
            ) : (
              comingSoonMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {comingSoonMovies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-text-secondary space-y-2">
                  <Calendar className="w-12 h-12 text-text-muted mx-auto stroke-1" />
                  <p className="text-base font-semibold text-white">No unreleased movies listed</p>
                  <p className="text-xs text-text-muted">Stay tuned for upcoming season announcements.</p>
                </div>
              )
            )}
          </>
        )}

        {/* Student Society Banner */}
        <PromoBanner />
      </main>
    </div>
  );
};
