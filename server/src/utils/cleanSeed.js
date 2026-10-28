import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../config/index.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Show from '../models/Show.js';

// High-definition cinematic trailers and movie assets
const HIGH_DEF_MOVIES = [
  {
    title: 'Interstellar Odyssey',
    slug: 'interstellar-odyssey',
    synopsis: 'A team of explorers travel through a newly discovered wormhole near Saturn in an attempt to ensure humanity\'s survival as earth faces irreversible atmospheric collapse. Directed with breathtaking visual fidelity.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-space-travel-through-stars-in-the-universe-42998-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 169,
    language: 'English',
    languages: ['English', 'Hindi', 'Tamil'],
    releaseDate: new Date('2026-10-01'),
    rating: 8.9,
    ratingSource: 'IMovies Certified Audience',
    ratingCount: 38400,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'Christopher Vance',
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper' },
      { name: 'Anne Hathaway', role: 'Brand' },
      { name: 'Jessica Chastain', role: 'Murph' }
    ],
    isActive: true,
  },
  {
    title: 'Cyberpunk 2099: Neon Horizon',
    slug: 'cyberpunk-2099-neon-horizon',
    synopsis: 'In a rain-soaked megalopolis illuminated by holographic skyscrapers, an augmented mercenary is hired for a dangerous heist that exposes an artificial consciousness conspiracy controlling the city government.',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-and-skyscrapers-42006-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=b0w36GAyZIA',
    genres: ['Cyberpunk', 'Action', 'Sci-Fi'],
    runtime: 142,
    language: 'English',
    languages: ['English', 'Japanese'],
    releaseDate: new Date('2026-10-15'),
    rating: 8.7,
    ratingSource: 'IMovies Certified Audience',
    ratingCount: 29100,
    status: 'now_showing',
    ageRating: 'A',
    director: 'Denis Villeneuve',
    cast: [
      { name: 'Ryan Gosling', role: 'Officer K' },
      { name: 'Ana de Armas', role: 'Joi' }
    ],
    isActive: true,
  },
  {
    title: 'Dune: Awakening of Arrakis',
    slug: 'dune-awakening-of-arrakis',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking vengeance against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the known universe.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-flying-over-a-desert-with-sand-dunes-42512-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    runtime: 166,
    language: 'English',
    languages: ['English', 'Hindi', 'Telugu'],
    releaseDate: new Date('2026-09-28'),
    rating: 8.8,
    ratingSource: 'IMovies Certified Audience',
    ratingCount: 42000,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'Frank Herbert',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides' },
      { name: 'Zendaya', role: 'Chani' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica' }
    ],
    isActive: true,
  },
  {
    title: 'The Dark Knight Protocol',
    slug: 'the-dark-knight-protocol',
    synopsis: 'When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    genres: ['Action', 'Crime', 'Thriller'],
    runtime: 152,
    language: 'English',
    languages: ['English', 'Hindi'],
    releaseDate: new Date('2026-10-10'),
    rating: 9.0,
    ratingSource: 'IMovies Certified Audience',
    ratingCount: 52000,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'Christopher Nolan',
    cast: [
      { name: 'Christian Bale', role: 'Bruce Wayne / Batman' },
      { name: 'Heath Ledger', role: 'Joker' }
    ],
    isActive: true,
  },
  {
    title: 'Avatar: The Deep Oceans',
    slug: 'avatar-the-deep-oceans',
    synopsis: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora. Once a familiar threat returns to finish what was previously started, Jake must work with Neytiri and the army of the Na\'vi race to protect their home.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-underwater-view-of-a-coral-reef-and-fish-42861-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
    genres: ['Sci-Fi', 'Adventure', 'Fantasy'],
    runtime: 192,
    language: 'English',
    languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
    releaseDate: new Date('2026-10-20'),
    rating: 8.5,
    ratingSource: 'IMovies Certified Audience',
    ratingCount: 31000,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'James Cameron',
    cast: [
      { name: 'Sam Worthington', role: 'Jake Sully' },
      { name: 'Zoe Saldana', role: 'Neytiri' }
    ],
    isActive: true,
  },
  {
    title: 'Galactic Conquest: Dynasty',
    slug: 'galactic-conquest-dynasty',
    synopsis: 'Coming soon exclusively in IMAX 70mm. An ancient empire spanning thousands of solar systems faces rebellion when a hidden lineage of star pilots resurfaces after centuries in exile.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=85',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=85',
    videoTrailerUrl: 'https://assets.mixkit.co/videos/preview/mixkit-earth-seen-from-space-with-clouds-and-stars-41584-large.mp4',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Sci-Fi', 'Space Opera', 'Action'],
    runtime: 155,
    language: 'English',
    languages: ['English'],
    releaseDate: new Date('2026-12-15'),
    rating: 0,
    ratingSource: 'Unreleased',
    ratingCount: 0,
    status: 'coming_soon',
    ageRating: 'U/A',
    director: 'Ridley Scott',
    cast: [
      { name: 'Adam Driver', role: 'Lord Valerius' },
      { name: 'Daisy Ridley', role: 'Kaelen' }
    ],
    isActive: true,
  }
];

const AUDITORIUM_CONFIG = [
  { row: 'A', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'standard' },
  { row: 'B', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'standard' },
  { row: 'C', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'standard' },
  { row: 'D', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'standard' },
  { row: 'E', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'student_saver' },
  { row: 'F', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], category: 'student_saver' },
  { row: 'G', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'vip' },
  { row: 'H', seatNumbers: [1, 2, 3, 4], category: 'accessible' },
];

const CINEMAS_DATA = [
  {
    name: 'PVR INOX Gold — Forum Rex Walk',
    location: 'Brigade Road, Bengaluru',
    address: 'Rex Walk, Brigade Road, Shanthala Nagar',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['Laser IMAX', 'Dolby Atmos 7.1', 'Gourmet Lounge', 'Recliner Loungers'],
    auditoriums: [
      { name: 'Audi 1 — IMAX with Laser', totalSeats: 86, rows: AUDITORIUM_CONFIG, formats: ['IMAX', '4K'] },
      { name: 'Audi 2 — Dolby Atmos', totalSeats: 86, rows: AUDITORIUM_CONFIG, formats: ['Standard', '4K'] },
    ],
    isActive: true,
  },
  {
    name: 'Cinepolis VIP — Orion Mall',
    location: 'Malleshwaram, Bengaluru',
    address: 'Orion Mall, Dr. Rajkumar Road',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['4K RGB Laser', 'In-Seat Dining', 'Valet Parking', 'Wheelchair Access'],
    auditoriums: [
      { name: 'VIP Screen 1', totalSeats: 86, rows: AUDITORIUM_CONFIG, formats: ['4K'] },
      { name: 'Screen 2 (Macro XE)', totalSeats: 86, rows: AUDITORIUM_CONFIG, formats: ['Standard'] },
    ],
    isActive: true,
  },
  {
    name: 'PVR Nexus Mall IMAX',
    location: 'Koramangala, Bengaluru',
    address: 'Nexus Mall, Hosur Road, Koramangala 7th Block',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['IMAX Commercial', 'Dolby Surround', 'Campus Hub', 'Snack Bar'],
    auditoriums: [
      { name: 'IMAX Grand Hall', totalSeats: 86, rows: AUDITORIUM_CONFIG, formats: ['IMAX'] },
    ],
    isActive: true,
  }
];

const categoryPricing = [
  { category: 'standard', price: 250, studentDiscount: 0 },
  { category: 'student_saver', price: 160, studentDiscount: 20 },
  { category: 'vip', price: 480, studentDiscount: 0 },
  { category: 'accessible', price: 190, studentDiscount: 0 },
];

async function seedCleanShows() {
  console.log('[CleanSeed] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  console.log('[CleanSeed] Connected');

  console.log('[CleanSeed] Clearing stale movies, cinemas and shows...');
  await Promise.all([
    Movie.deleteMany({}),
    Cinema.deleteMany({}),
    Show.deleteMany({}),
  ]);

  console.log('[CleanSeed] Inserting high-definition movies...');
  const createdMovies = await Movie.insertMany(HIGH_DEF_MOVIES);
  console.log(`[CleanSeed] Created ${createdMovies.length} movies.`);

  console.log('[CleanSeed] Inserting multiplex theatres...');
  const createdCinemas = await Cinema.insertMany(CINEMAS_DATA);
  console.log(`[CleanSeed] Created ${createdCinemas.length} cinemas.`);

  // Generate shows for next 7 days across today and future days
  console.log('[CleanSeed] Generating authoritative show schedules for all movies...');
  const showsToInsert = [];
  const now = new Date();

  const nowShowingMovies = createdMovies.filter(m => m.status === 'now_showing');

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const targetDay = new Date(now);
    targetDay.setDate(targetDay.getDate() + dayOffset);

    // Standard show hours: 10:30 AM, 1:45 PM, 5:15 PM, 8:45 PM, 11:15 PM
    const showHours = [
      { h: 10, m: 30 },
      { h: 13, m: 45 },
      { h: 17, m: 15 },
      { h: 20, m: 45 },
      { h: 23, m: 15 },
    ];

    for (const cinema of createdCinemas) {
      for (const audi of cinema.auditoriums) {
        for (const movie of nowShowingMovies) {
          for (const time of showHours) {
            const startTime = new Date(targetDay);
            startTime.setHours(time.h, time.m, 0, 0);

            // Skip past shows on today
            if (dayOffset === 0 && startTime < now) continue;

            const endTime = new Date(startTime.getTime() + movie.runtime * 60000 + 30 * 60000);

            showsToInsert.push({
              movie: movie._id,
              cinema: cinema._id,
              auditoriumName: audi.name,
              startTime,
              endTime,
              format: audi.formats[0] || 'Standard',
              language: movie.language,
              categoryPricing,
              currency: 'INR',
              bookingCutoffMinutes: 15,
              isActive: true,
              totalSeats: audi.totalSeats,
            });
          }
        }
      }
    }
  }

  console.log(`[CleanSeed] Inserting ${showsToInsert.length} active showtimes...`);
  await Show.insertMany(showsToInsert);
  console.log('[CleanSeed] Shows generated successfully!');

  await mongoose.disconnect();
}

seedCleanShows().catch(err => {
  console.error('[CleanSeed] Error:', err);
  process.exit(1);
});
