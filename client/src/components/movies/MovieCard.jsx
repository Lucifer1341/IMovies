import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Sparkles, Film } from 'lucide-react';

export const MovieCard = ({ movie }) => {
  const isNowShowing = movie.status === 'now_showing';

  return (
    <div className="group relative bg-surface-card rounded-3xl overflow-hidden border border-white/5 hover:border-cinema-red/50 transition-all duration-300 hover:shadow-cinema-glow flex flex-col transform hover:-translate-y-1.5">
      {/* Poster Media */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-primary">
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80';
          }}
        />

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-card via-transparent to-black/40 opacity-90" />

        {/* Rating Pill */}
        {movie.rating > 0 ? (
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1 bg-surface-primary/80 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-black text-amber-accent border border-white/10 shadow-lg">
            <Star className="w-3.5 h-3.5 fill-amber-accent" />
            <span>{movie.rating.toFixed(1)}</span>
          </div>
        ) : (
          <div className="absolute top-3.5 left-3.5 bg-cinema-red/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase text-white shadow-lg">
            COMING SOON
          </div>
        )}

        {/* Age Rating Badge */}
        <div className="absolute top-3.5 right-3.5">
          <span className="bg-surface-primary/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-text-secondary border border-white/10">
            {movie.ageRating || 'U/A'}
          </span>
        </div>

        {/* Hover Quick Action Card Overlay */}
        <div className="absolute inset-0 bg-surface-primary/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
          <p className="text-[11px] text-text-secondary line-clamp-2 mb-3">
            {movie.synopsis}
          </p>

          <Link
            to={`/movies/${movie.slug || movie._id}`}
            className="w-full py-3.5 px-4 rounded-xl bg-cinema-red hover:bg-cinema-red-hover text-white text-center font-black text-xs uppercase tracking-wider shadow-cinema-glow transition-all transform translate-y-3 group-hover:translate-y-0"
          >
            {isNowShowing ? 'Book Tickets' : 'View Premiere Info'}
          </Link>
        </div>
      </div>

      {/* Content Meta */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-black text-white text-base sm:text-lg line-clamp-1 group-hover:text-cinema-red transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary font-medium">
            <span>{movie.language || 'English'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-cinema-red" />
              {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '135m'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {movie.genres?.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[10px] font-semibold bg-surface-elevated text-text-secondary px-2.5 py-0.5 rounded-md border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-surface-elevated flex items-center justify-between text-xs">
          <span className="text-text-muted text-[11px] truncate max-w-[130px]">
            {movie.director ? `Dir: ${movie.director}` : movie.ratingSource || 'Verified Cinema'}
          </span>

          <Link
            to={`/movies/${movie.slug || movie._id}`}
            className="font-bold text-cinema-red hover:underline flex items-center gap-1 text-xs"
          >
            {isNowShowing ? 'Book' : 'Details'}
            <Ticket className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
