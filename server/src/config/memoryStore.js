import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// In-Memory fallback store
export const memoryStore = {
  users: [],
  movies: [],
  cinemas: [],
  shows: [],
  holds: [],
  bookings: [],
  payments: [],
  promotions: [],
  ticketVerifications: [],
};

// Seed initial memory store if MongoDB is not running
export async function seedMemoryStore(config) {
  if (memoryStore.movies.length > 0) return;

  const adminPasswordHash = await bcrypt.hash(config.adminSeedPassword || 'Admin@12345!', 10);
  const userPasswordHash = await bcrypt.hash('User@12345!', 10);

  // 1. Users
  const adminId = '660000000000000000000001';
  const demoUserId = '660000000000000000000002';

  memoryStore.users.push(
    {
      _id: adminId,
      name: 'IMovies Admin',
      email: config.adminSeedEmail || 'admin@imovies.dev',
      passwordHash: adminPasswordHash,
      role: 'admin',
      studentVerified: false,
      status: 'active',
      createdAt: new Date(),
    },
    {
      _id: demoUserId,
      name: 'Priya Sharma (Student)',
      email: 'student@campus.edu',
      passwordHash: userPasswordHash,
      role: 'user',
      studentVerified: true,
      phone: '+91 98765 43210',
      status: 'active',
      createdAt: new Date(),
    }
  );

  // 2. Movies
  const movie1Id = '661111111111111111111101';
  const movie2Id = '661111111111111111111102';
  const movie3Id = '661111111111111111111103';
  const movie4Id = '661111111111111111111104';
  const movie5Id = '661111111111111111111105';
  const movie6Id = '661111111111111111111106';

  memoryStore.movies.push(
    {
      _id: movie1Id,
      title: 'The Quantum Paradox',
      slug: 'the-quantum-paradox',
      synopsis: 'A brilliant theoretical physicist discovers a micro-fracture in spacetime that threatens to unravel the timeline. With only 48 hours before reality collapses, she races across alternate dimensions.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Sci-Fi', 'Thriller', 'Mystery'],
      runtime: 142,
      language: 'English',
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2026-10-01'),
      cast: [
        { name: 'Dr. Sarah Chen', role: 'Elena Vasquez', photoUrl: '' },
        { name: 'Marcus Webb', role: 'Agent Ryker', photoUrl: '' },
      ],
      rating: 8.4,
      ratingSource: 'Sample Verified Audience (Demo)',
      ratingCount: 14200,
      status: 'now_showing',
      ageRating: 'U/A',
      director: 'James Nolan',
      isActive: true,
    },
    {
      _id: movie2Id,
      title: 'Crimson Tide Rising',
      slug: 'crimson-tide-rising',
      synopsis: 'Deep in the Mariana Trench, an exploratory submarine unlocks an ancient energy source that awakens unprecedented tectonic activity. Humanity must unite to secure the future.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Action', 'Adventure', 'Thriller'],
      runtime: 130,
      language: 'English',
      languages: ['English', 'Hindi', 'Telugu'],
      releaseDate: new Date('2026-09-20'),
      cast: [
        { name: 'Priya Kapoor', role: 'Commander Torres', photoUrl: '' },
        { name: 'David Vance', role: 'Dr. Noah Hayes', photoUrl: '' },
      ],
      rating: 7.9,
      ratingSource: 'Sample Verified Audience (Demo)',
      ratingCount: 9400,
      status: 'now_showing',
      ageRating: 'U/A',
      director: 'Sofia Mendez',
      isActive: true,
    },
    {
      _id: movie3Id,
      title: 'Neon Shadows',
      slug: 'neon-shadows',
      synopsis: 'In a rain-drenched cyberpunk metropolis of 2088, an augmented detective is hired to investigate the theft of digital souls by a shadow corporation.',
      posterUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Cyberpunk', 'Noir', 'Action'],
      runtime: 138,
      language: 'English',
      languages: ['English', 'Japanese'],
      releaseDate: new Date('2026-10-15'),
      cast: [
        { name: 'Yui Katsura', role: 'Detective Jax', photoUrl: '' },
        { name: 'Damien Cross', role: 'Viktor Kane', photoUrl: '' },
      ],
      rating: 8.8,
      ratingSource: 'Sample Verified Audience (Demo)',
      ratingCount: 19800,
      status: 'now_showing',
      ageRating: 'A',
      director: 'Hiro Nakamura',
      isActive: true,
    },
    {
      _id: movie4Id,
      title: 'Echoes of Tomorrow',
      slug: 'echoes-of-tomorrow',
      synopsis: 'When global electromagnetic storms erase the world digital cloud, a secluded community relies on acoustic memories preserved on physical vinyl recordings.',
      posterUrl: 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Drama', 'Sci-Fi', 'Music'],
      runtime: 118,
      language: 'English',
      languages: ['English'],
      releaseDate: new Date('2026-10-22'),
      cast: [{ name: 'Aisha Okon', role: 'Maya Sterling', photoUrl: '' }],
      rating: 8.2,
      ratingSource: 'Sample Verified Audience (Demo)',
      ratingCount: 6500,
      status: 'now_showing',
      ageRating: 'U',
      director: 'Yuki Tanaka',
      isActive: true,
    },
    {
      _id: movie5Id,
      title: 'The Last Cartographer',
      slug: 'the-last-cartographer',
      synopsis: 'A master mapmaker in an uncharted continent realizes his maps predict historical events before they unfold. Coming soon to premium IMAX screens.',
      posterUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Fantasy', 'Adventure', 'Mystery'],
      runtime: 155,
      language: 'English',
      languages: ['English', 'Hindi'],
      releaseDate: new Date('2026-11-20'),
      cast: [{ name: 'Tobias Crane', role: 'Edmund Finch', photoUrl: '' }],
      rating: 0,
      ratingSource: 'Unreleased',
      ratingCount: 0,
      status: 'coming_soon',
      ageRating: 'U/A',
      director: 'Emily Rhodes',
      isActive: true,
    },
    {
      _id: movie6Id,
      title: 'Sakura Protocol',
      slug: 'sakura-protocol',
      synopsis: 'During peak spring in Tokyo, an elite counter-surveillance officer must escort a whistleblower across bullet trains before high-tech assassins intercept them.',
      posterUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=500&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1551817958-c5b51e7b4a33?w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      genres: ['Action', 'Thriller', 'Spy'],
      runtime: 125,
      language: 'Japanese',
      languages: ['Japanese', 'English'],
      releaseDate: new Date('2026-12-05'),
      cast: [{ name: 'Kenji Watanabe', role: 'Agent K', photoUrl: '' }],
      rating: 0,
      ratingSource: 'Unreleased',
      ratingCount: 0,
      status: 'coming_soon',
      ageRating: 'U/A',
      director: 'Akira Suzuki',
      isActive: true,
    }
  );

  // 3. Cinemas
  const cinema1Id = '662222222222222222222201';
  const cinema2Id = '662222222222222222222202';
  const cinema3Id = '662222222222222222222203';

  const defaultRows = [
    { row: 'A', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'standard' },
    { row: 'B', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'standard' },
    { row: 'C', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'standard' },
    { row: 'D', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'standard' },
    { row: 'E', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'student_saver' },
    { row: 'F', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], category: 'student_saver' },
    { row: 'G', seatNumbers: [1, 2, 3, 4, 5, 6, 7, 8], category: 'vip' },
    { row: 'H', seatNumbers: [1, 2], category: 'accessible' },
  ];

  memoryStore.cinemas.push(
    {
      _id: cinema1Id,
      name: 'IMovies Grand IMAX — Nexus Mall',
      location: 'Koramangala, Bengaluru',
      address: 'Nexus Mall, 4th Floor, Koramangala 7th Block',
      city: 'Bengaluru',
      timeZone: 'Asia/Kolkata',
      amenities: ['Laser IMAX', 'Dolby Atmos', 'Recliner Loungers', 'Student Hub'],
      auditoriums: [
        { name: 'IMAX Laser Hall 1', totalSeats: 70, rows: defaultRows, formats: ['IMAX', '4K'] },
        { name: 'Screen 2 (Dolby Atmos)', totalSeats: 70, rows: defaultRows, formats: ['Standard', '4K'] },
      ],
      isActive: true,
    },
    {
      _id: cinema2Id,
      name: 'IMovies CineDome — Forum South',
      location: 'Konanakunte, Bengaluru',
      address: 'Forum South City, 3rd Level',
      city: 'Bengaluru',
      timeZone: 'Asia/Kolkata',
      amenities: ['4K RGB Laser', 'VIP Dining', 'Valet Parking'],
      auditoriums: [
        { name: 'Screen 1 — Platinum', totalSeats: 70, rows: defaultRows, formats: ['Standard'] },
      ],
      isActive: true,
    },
    {
      _id: cinema3Id,
      name: 'IMovies Studio Cinema — Orion Gateway',
      location: 'Rajajinagar, Bengaluru',
      address: 'Orion Gateway Mall, Dr. Rajkumar Road',
      city: 'Bengaluru',
      timeZone: 'Asia/Kolkata',
      amenities: ['Dolby Atmos', 'Cafe & Bar', 'Accessibility Friendly'],
      auditoriums: [
        { name: 'Studio One', totalSeats: 70, rows: defaultRows, formats: ['Standard', '4K'] },
      ],
      isActive: true,
    }
  );

  // 4. Category Pricing
  const categoryPricing = [
    { category: 'standard', price: 250, studentDiscount: 0 },
    { category: 'student_saver', price: 160, studentDiscount: 20 },
    { category: 'vip', price: 480, studentDiscount: 0 },
    { category: 'accessible', price: 190, studentDiscount: 0 },
  ];

  // 5. Shows
  let showIdx = 1;
  const now = new Date();

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const showDay = new Date(now);
    showDay.setDate(showDay.getDate() + dayOffset);

    // Create 3 showtimes per day
    const times = [
      { h: 11, m: 0 },
      { h: 15, m: 30 },
      { h: 19, m: 45 },
    ];

    for (const time of times) {
      const startTime = new Date(showDay);
      startTime.setHours(time.h, time.m, 0, 0);
      const endTime = new Date(startTime.getTime() + 150 * 60000);

      const showId = `66333333333333333333${String(showIdx).padStart(4, '0')}`;
      showIdx++;

      memoryStore.shows.push({
        _id: showId,
        movie: movie1Id,
        cinema: cinema1Id,
        auditoriumName: 'IMAX Laser Hall 1',
        startTime,
        endTime,
        format: 'IMAX',
        language: 'English',
        categoryPricing,
        currency: 'INR',
        bookingCutoffMinutes: 15,
        isActive: true,
        totalSeats: 70,
      });

      // Second movie show
      const showId2 = `66333333333333333333${String(showIdx).padStart(4, '0')}`;
      showIdx++;
      memoryStore.shows.push({
        _id: showId2,
        movie: movie3Id,
        cinema: cinema1Id,
        auditoriumName: 'Screen 2 (Dolby Atmos)',
        startTime: new Date(startTime.getTime() + 30 * 60000),
        endTime: new Date(endTime.getTime() + 30 * 60000),
        format: '4K',
        language: 'English',
        categoryPricing,
        currency: 'INR',
        bookingCutoffMinutes: 15,
        isActive: true,
        totalSeats: 70,
      });
    }
  }

  // 6. Promotions
  memoryStore.promotions.push(
    {
      _id: '664444444444444444444401',
      code: 'STUDENT20',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 120,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      usageLimit: null,
      usageCount: 14,
      perUserLimit: 5,
      eligibility: { studentOnly: true, minTickets: 1 },
      description: '20% off for verified students (max ₹120)',
      isActive: true,
    },
    {
      _id: '664444444444444444444402',
      code: 'FIRSTSHOW',
      discountType: 'flat',
      discountValue: 60,
      maxDiscountAmount: null,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      usageLimit: 1000,
      usageCount: 82,
      perUserLimit: 1,
      eligibility: { studentOnly: false, minTickets: 2 },
      description: 'Flat ₹60 off on your first movie booking (min 2 tickets)',
      isActive: true,
    },
    {
      _id: '664444444444444444444403',
      code: 'CAMPUSFEST',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 200,
      validFrom: new Date('2026-01-01'),
      validUntil: new Date('2027-12-31'),
      usageLimit: 500,
      usageCount: 39,
      perUserLimit: 3,
      eligibility: { studentOnly: false, minTickets: 3 },
      description: '15% group discount for 3+ tickets',
      isActive: true,
    }
  );

  console.log(`[MemoryStore] Seeded: ${memoryStore.movies.length} movies, ${memoryStore.cinemas.length} cinemas, ${memoryStore.shows.length} shows, ${memoryStore.promotions.length} promos`);
}
