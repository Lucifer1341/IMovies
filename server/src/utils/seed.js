/**
 * Database seed script for IMovies development.
 * Run: node server/src/utils/seed.js
 *
 * Creates: admin user, movies, cinemas, shows, promotions.
 * WARNING: This will overwrite existing seed data. Do not run in production.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Cinema from '../models/Cinema.js';
import Show from '../models/Show.js';
import Promotion from '../models/Promotion.js';

const SEED_MOVIES = [
  {
    title: 'The Quantum Paradox',
    slug: 'the-quantum-paradox',
    synopsis: 'A physicist discovers a flaw in spacetime that threatens to collapse the universe. With only 48 hours left, she must make an impossible choice between saving her world and saving herself.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    runtime: 142,
    language: 'English',
    languages: ['English', 'Hindi'],
    releaseDate: new Date('2026-10-01'),
    cast: [
      { name: 'Elena Vasquez', role: 'Dr. Sarah Chen', photoUrl: '' },
      { name: 'Marcus Webb', role: 'Agent Ryker', photoUrl: '' },
    ],
    rating: 8.4,
    ratingSource: 'Sample Data — Not a real rating',
    ratingCount: 12840,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'James Nolan',
  },
  {
    title: 'Crimson Tide Rising',
    slug: 'crimson-tide-rising',
    synopsis: 'An underwater archaeologist uncovers evidence of an ancient civilisation beneath the Pacific Ocean, triggering a geopolitical crisis as world powers race to claim the discovery.',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Action', 'Adventure', 'Mystery'],
    runtime: 128,
    language: 'English',
    languages: ['English', 'Hindi', 'Telugu'],
    releaseDate: new Date('2026-09-20'),
    cast: [
      { name: 'Priya Sharma', role: 'Dr. Nadia Kapoor', photoUrl: '' },
      { name: 'Chris Holloway', role: 'Commander Torres', photoUrl: '' },
    ],
    rating: 7.8,
    ratingSource: 'Sample Data — Not a real rating',
    ratingCount: 9230,
    status: 'now_showing',
    ageRating: 'U/A',
    director: 'Sofia Mendez',
  },
  {
    title: 'Echoes of Tomorrow',
    slug: 'echoes-of-tomorrow',
    synopsis: 'After a catastrophic solar flare wipes out digital memory across the globe, a young archivist must rebuild human history using only handwritten letters recovered from a rural library.',
    posterUrl: 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Drama', 'Romance', 'Post-Apocalyptic'],
    runtime: 116,
    language: 'English',
    languages: ['English'],
    releaseDate: new Date('2026-10-15'),
    cast: [
      { name: 'Aisha Okonkwo', role: 'Maya', photoUrl: '' },
      { name: 'Leon Marchetti', role: 'Ezra', photoUrl: '' },
    ],
    rating: 8.1,
    ratingSource: 'Sample Data — Not a real rating',
    ratingCount: 7640,
    status: 'now_showing',
    ageRating: 'U',
    director: 'Yuki Tanaka',
  },
  {
    title: 'Neon Shadows',
    slug: 'neon-shadows',
    synopsis: 'In a rain-soaked cyberpunk metropolis, a retired detective is pulled into one final case that exposes a conspiracy reaching the highest levels of the corporate dystopia she once served.',
    posterUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Noir', 'Sci-Fi', 'Thriller'],
    runtime: 135,
    language: 'English',
    languages: ['English', 'Japanese'],
    releaseDate: new Date('2026-10-22'),
    cast: [
      { name: 'Rena Katsura', role: 'Detective Yui', photoUrl: '' },
      { name: 'Damien Cross', role: 'Viktor Orlov', photoUrl: '' },
    ],
    rating: 8.7,
    ratingSource: 'Sample Data — Not a real rating',
    ratingCount: 18200,
    status: 'now_showing',
    ageRating: 'A',
    director: 'Hiro Nakamura',
  },
  {
    title: 'The Last Cartographer',
    slug: 'the-last-cartographer',
    synopsis: 'A medieval mapmaker discovers that his maps are not just records of the world — they actively shape it. When a warlord steals his latest creation, the fate of kingdoms hangs in the balance.',
    posterUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Fantasy', 'Adventure', 'Historical'],
    runtime: 155,
    language: 'English',
    languages: ['English', 'Hindi'],
    releaseDate: new Date('2026-11-15'),
    cast: [
      { name: 'Tobias Crane', role: 'Edmund', photoUrl: '' },
      { name: 'Isabella Vance', role: 'Lady Miriam', photoUrl: '' },
    ],
    rating: 0,
    ratingSource: 'Sample Data — Unreleased',
    ratingCount: 0,
    status: 'coming_soon',
    ageRating: 'U/A',
    director: 'Emily Rhodes',
  },
  {
    title: 'Sakura Protocol',
    slug: 'sakura-protocol',
    synopsis: 'A deep-cover intelligence operative must protect a whistleblower who holds evidence of a global bioweapon programme, all while racing across Tokyo during cherry blossom season.',
    posterUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400&h=600&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1551817958-c5b51e7b4a33?w=1280&h=720&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    genres: ['Action', 'Spy', 'Thriller'],
    runtime: 122,
    language: 'Japanese',
    languages: ['Japanese', 'English'],
    releaseDate: new Date('2026-12-01'),
    cast: [
      { name: 'Kenji Watanabe', role: 'Agent Hiro', photoUrl: '' },
      { name: 'Natasha Volkov', role: 'Elena', photoUrl: '' },
    ],
    rating: 0,
    ratingSource: 'Sample Data — Unreleased',
    ratingCount: 0,
    status: 'coming_soon',
    ageRating: 'U/A',
    director: 'Akira Suzuki',
  },
];

const buildAuditorium = (name, format = ['Standard']) => ({
  name,
  totalSeats: 80,
  formats: format,
  rows: [
    { row: 'A', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'standard' },
    { row: 'B', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'standard' },
    { row: 'C', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'standard' },
    { row: 'D', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'standard' },
    { row: 'E', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'student_saver' },
    { row: 'F', seatNumbers: [1,2,3,4,5,6,7,8,9,10], category: 'student_saver' },
    { row: 'G', seatNumbers: [1,2,3,4,5,6,7,8], category: 'vip' },
    { row: 'H', seatNumbers: [1,2], category: 'accessible' },
  ],
});

const SEED_CINEMAS = [
  {
    name: 'PVR Cinemas — Nexus Mall',
    location: 'Koramangala, Bengaluru',
    address: 'Nexus Mall, 45 Outer Ring Road, Koramangala',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Parking'],
    auditoriums: [
      buildAuditorium('Screen 1', ['Standard', '4K']),
      buildAuditorium('Screen 2 — IMAX', ['IMAX', '4K']),
    ],
  },
  {
    name: 'INOX Megaplex — Forum Mall',
    location: 'Koramangala, Bengaluru',
    address: 'Forum Mall, 21 Hosur Road',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['4K Laser', 'VIP Lounge', 'Parking'],
    auditoriums: [
      buildAuditorium('Audi 1', ['Standard']),
      buildAuditorium('Audi 2 — Premium', ['4K']),
    ],
  },
  {
    name: 'Cinepolis — Orion East',
    location: 'Whitefield, Bengaluru',
    address: 'Orion East Mall, Whitefield Main Road',
    city: 'Bengaluru',
    timeZone: 'Asia/Kolkata',
    amenities: ['Standard', 'Online Booking', 'Food Counter'],
    auditoriums: [
      buildAuditorium('Hall A', ['Standard']),
    ],
  },
];

const categoryPricing = [
  { category: 'standard', price: 220, studentDiscount: 0 },
  { category: 'vip', price: 450, studentDiscount: 0 },
  { category: 'student_saver', price: 149, studentDiscount: 15 },
  { category: 'accessible', price: 180, studentDiscount: 0 },
];

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function seedShows(movies, cinemas) {
  const showData = [];
  const now = new Date();
  const showingMovies = movies.filter((m) => m.status === 'now_showing');

  for (const cinema of cinemas) {
    for (const auditorium of cinema.auditoriums) {
      for (const movie of showingMovies.slice(0, 3)) {
        // Create shows for the next 7 days
        for (let day = 0; day < 7; day++) {
          const baseDate = new Date(now);
          baseDate.setDate(baseDate.getDate() + day);
          baseDate.setHours(0, 0, 0, 0);

          const showTimes = [10, 14, 18, 21]; // 10am, 2pm, 6pm, 9pm
          for (const hour of showTimes) {
            const startTime = new Date(baseDate);
            startTime.setHours(hour, 0, 0, 0);
            if (startTime < now) continue; // Skip past shows

            const endTime = addHours(startTime, Math.ceil(movie.runtime / 60) + 0.5);
            showData.push({
              movie: movie._id,
              cinema: cinema._id,
              auditoriumName: auditorium.name,
              startTime,
              endTime,
              format: auditorium.formats[0],
              language: movie.language,
              categoryPricing,
              currency: 'INR',
              bookingCutoffMinutes: 30,
              isActive: true,
              totalSeats: auditorium.totalSeats,
            });
          }
        }
      }
    }
  }
  return Show.insertMany(showData);
}

async function main() {
  console.log('[Seed] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  console.log('[Seed] Connected');

  if (process.env.SEED_WIPE !== 'true') {
    console.log('[Seed] Skipping wipe (set SEED_WIPE=true to clear existing data)');
  } else {
    console.log('[Seed] Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Cinema.deleteMany({}),
      Show.deleteMany({}),
      Promotion.deleteMany({}),
    ]);
    console.log('[Seed] Cleared');
  }

  // Admin user
  console.log('[Seed] Creating admin user...');
  const existingAdmin = await User.findOne({ email: config.adminSeedEmail });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(config.adminSeedPassword, 12);
    await User.create({
      name: 'IMovies Admin',
      email: config.adminSeedEmail,
      passwordHash,
      role: 'admin',
      status: 'active',
    });
    console.log(`[Seed] Admin created: ${config.adminSeedEmail}`);
  } else {
    console.log(`[Seed] Admin already exists: ${config.adminSeedEmail}`);
  }

  // Movies
  console.log('[Seed] Seeding movies...');
  let movies = await Movie.find({ slug: { $in: SEED_MOVIES.map((m) => m.slug) } });
  if (movies.length === 0) {
    movies = await Movie.insertMany(SEED_MOVIES);
    console.log(`[Seed] Created ${movies.length} movies`);
  } else {
    console.log(`[Seed] Movies already exist (${movies.length}), skipping`);
  }

  // Cinemas
  console.log('[Seed] Seeding cinemas...');
  let cinemas = await Cinema.find({ name: { $in: SEED_CINEMAS.map((c) => c.name) } });
  if (cinemas.length === 0) {
    cinemas = await Cinema.insertMany(SEED_CINEMAS);
    console.log(`[Seed] Created ${cinemas.length} cinemas`);
  } else {
    console.log(`[Seed] Cinemas already exist (${cinemas.length}), skipping`);
  }

  // Shows
  console.log('[Seed] Seeding shows...');
  const showCount = await Show.countDocuments({ startTime: { $gte: new Date() } });
  if (showCount < 10) {
    const shows = await seedShows(movies, cinemas);
    console.log(`[Seed] Created ${shows.length} shows`);
  } else {
    console.log(`[Seed] Shows already exist (${showCount}), skipping`);
  }

  // Promotions
  console.log('[Seed] Seeding promotions...');
  const promoCount = await Promotion.countDocuments();
  if (promoCount === 0) {
    await Promotion.insertMany([
      {
        code: 'STUDENT20',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 100,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2027-12-31'),
        usageLimit: null,
        perUserLimit: 3,
        eligibility: { studentOnly: true, minTickets: 1 },
        description: '20% off for verified students (max ₹100)',
        isActive: true,
      },
      {
        code: 'FIRSTSHOW',
        discountType: 'flat',
        discountValue: 50,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2027-12-31'),
        usageLimit: 500,
        perUserLimit: 1,
        eligibility: { studentOnly: false, minTickets: 2 },
        description: 'Flat ₹50 off on your first booking (min 2 tickets)',
        isActive: true,
      },
      {
        code: 'GROUPBOOK',
        discountType: 'percentage',
        discountValue: 15,
        maxDiscountAmount: 200,
        validFrom: new Date('2026-01-01'),
        validUntil: new Date('2027-12-31'),
        usageLimit: null,
        perUserLimit: 5,
        eligibility: { studentOnly: false, minTickets: 4 },
        description: '15% off for groups of 4 or more',
        isActive: true,
      },
    ]);
    console.log('[Seed] Promotions created');
  }

  console.log('\n[Seed] ✅ Database seeded successfully');
  console.log(`[Seed] Admin login: ${config.adminSeedEmail} / ${config.adminSeedPassword}`);
  console.log('[Seed] NOTE: All data is sample/demo data for development purposes');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
