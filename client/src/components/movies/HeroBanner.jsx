import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Info,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronRight,
  Flame,
} from 'lucide-react';

export const HeroBanner = ({ movie }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Attempt background autoplay when video URL exists
    if (movie?.videoTrailerUrl && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlayingVideo(true))
        .catch(() => setIsPlayingVideo(false));
    }
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="relative w-full min-h-[580px] lg:min-h-[660px] overflow-hidden flex items-end">
      {/* Background Media: High-Def Video with Poster Fallback */}
      <div className="absolute inset-0 bg-surface-primary">
        {movie.videoTrailerUrl ? (
          <video
            ref={videoRef}
            src={movie.videoTrailerUrl}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            poster={movie.backdropUrl || movie.posterUrl}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
        ) : (
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
        )}

        {/* Multi-layered cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-background/30 to-background/90" />
      </div>

      {/* Floating Sound Toggle */}
      {movie.videoTrailerUrl && (
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.muted = !isMuted;
              setIsMuted(!isMuted);
            }
          }}
          className="absolute top-24 right-8 z-20 p-3 rounded-full bg-surface-card/60 backdrop-blur-md border border-white/10 text-white hover:bg-surface-elevated transition-all shadow-xl"
          title={isMuted ? 'Unmute Ambient Video' : 'Mute Video'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-text-secondary" /> : <Volume2 className="w-5 h-5 text-cinema-red" />}
        </button>
      )}

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32 w-full">
        <div className="max-w-3xl space-y-5">
          {/* Badge Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-cinema-red to-[#99060e] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-cinema-glow">
              <Flame className="w-3.5 h-3.5 fill-white" />
              #1 Trending Premiere
            </span>

            <div className="flex items-center gap-1 bg-surface-primary/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-accent border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-accent" />
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.9'}</span>
              <span className="text-[10px] text-text-muted font-normal">/ 10</span>
            </div>

            <span className="bg-surface-elevated/70 backdrop-blur-md text-text-secondary text-xs font-semibold px-3 py-1 rounded-full border border-white/5">
              {movie.language || 'English'}
            </span>

            <span className="bg-surface-elevated/70 backdrop-blur-md text-text-secondary text-xs font-semibold px-2.5 py-1 rounded-full border border-white/5">
              {movie.ageRating || 'U/A'}
            </span>
          </div>

          {/* Title with subtle gradient glow */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-text-secondary">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Clock className="w-4 h-4 text-cinema-red" />
              {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '2h 29m'}
            </span>
            <span>•</span>
            <span className="text-text-secondary font-medium">{movie.genres?.join(', ')}</span>
            {movie.director && (
              <>
                <span>•</span>
                <span className="text-text-muted">Directed by {movie.director}</span>
              </>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-text-secondary line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
            {movie.synopsis}
          </p>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              to={`/movies/${movie.slug || movie._id}`}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-cinema-red hover:bg-cinema-red-hover text-white font-black text-sm uppercase tracking-wider shadow-cinema-glow transition-all transform hover:-translate-y-1 active:translate-y-0"
            >
              <Ticket className="w-5 h-5" />
              Select Seats & Book
            </Link>

            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-surface-elevated/80 hover:bg-surface-elevated text-white font-bold text-sm border border-white/10 backdrop-blur-md transition-all hover:border-white/30"
              >
                <Play className="w-4 h-4 text-cinema-red fill-cinema-red" />
                Watch Official Trailer
              </a>
            )}

            <Link
              to={`/movies/${movie.slug || movie._id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-white px-3 py-3"
            >
              <Info className="w-4 h-4" />
              Screening Times & Formats
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
