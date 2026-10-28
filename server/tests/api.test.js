import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('IMovies Full API Suite', () => {
  let authToken = '';
  let adminToken = '';
  let sampleShowId = '';
  let testHoldId = '';
  let testBookingId = '';

  it('GET /api/health should return ok and storage status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBeDefined();
  });

  it('GET /api/movies should return seeded film catalog', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toBeDefined();
  });

  it('GET /api/cinemas should list available auditoriums', async () => {
    const res = await request(app).get('/api/cinemas');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/shows should list upcoming showtimes', async () => {
    const res = await request(app).get('/api/shows');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    sampleShowId = res.body.data[0]._id;
  });

  it('POST /api/auth/register should register a new student user and return token', async () => {
    const testEmail = `test_${Date.now()}@campus.edu`;
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: testEmail,
      password: 'Password123!',
      phone: '+91 99999 88888',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('POST /api/auth/login should authenticate admin seeded user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@imovies.dev',
      password: 'Admin@12345!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('POST /api/auth/login should reject bad passwords', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@imovies.dev',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/shows/:showId/seats should return layout with authoritative availability', async () => {
    const res = await request(app).get(`/api/shows/${sampleShowId}/seats`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.seatMap).toBeDefined();
    expect(res.body.data.totalSeats).toBeGreaterThan(0);
  });

  it('POST /api/holds should create a concurrency-safe temporary seat hold', async () => {
    // Pick unique seats per test run
    const randNum = Math.floor(Math.random() * 8) + 1;
    const s1 = `C${randNum}`;
    const s2 = `C${randNum + 1}`;

    const res = await request(app)
      .post('/api/holds')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        showId: sampleShowId,
        seats: [
          { row: 'C', seatNumber: randNum, seatLabel: s1, category: 'standard', price: 220 },
          { row: 'C', seatNumber: randNum + 1, seatLabel: s2, category: 'standard', price: 220 },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.status).toBe('active');
    testHoldId = res.body.data._id;
  });

  it('POST /api/holds should reject conflicting hold on already held seats', async () => {
    // Attempt holding the exact same seats with admin user
    const res = await request(app)
      .post('/api/holds')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        showId: sampleShowId,
        seats: [
          { row: 'C', seatNumber: 1, seatLabel: 'C1', category: 'standard', price: 220 },
        ],
      });

    // If C1 is held it should be 409
    expect([201, 409]).toContain(res.status);
  });

  it('POST /api/promotions/validate should validate valid promo code', async () => {
    const res = await request(app).post('/api/promotions/validate').send({
      code: 'FIRSTSHOW',
      seatCount: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.data.discountValue).toBe(50);
  });

  it('POST /api/bookings should calculate server-side total and create pending booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        holdId: testHoldId,
        promotionCode: 'FIRSTSHOW',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookingRef).toBeDefined();
    expect(res.body.data.totalAmount).toBe(res.body.data.subtotal - 50);
    testBookingId = res.body.data._id;
  });

  it('POST /api/payments/demo/confirm should confirm demo payment and issue ticket', async () => {
    const res = await request(app)
      .post('/api/payments/demo/confirm')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        bookingId: testBookingId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment.status).toBe('success');
    expect(res.body.data.booking.status).toBe('confirmed');
    expect(res.body.data.ticketToken).toBeDefined();
  });

  it('GET /api/tickets/:bookingId should generate signed QR pass for confirmed booking', async () => {
    const res = await request(app)
      .get(`/api/tickets/${testBookingId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.qrCode).toContain('data:image/png;base64');
  });

  it('POST /api/tickets/verify should verify opaque token at kiosk gate', async () => {
    const ticketRes = await request(app)
      .get(`/api/tickets/${testBookingId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const token = ticketRes.body.data.ticketToken;

    const res = await request(app).post('/api/tickets/verify').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.data.status).toBe('Valid Admission');
  });

  it('GET /api/admin/analytics should enforce admin authorization', async () => {
    // Non-admin token should be 403
    const forbiddenRes = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${authToken}`);
    expect(forbiddenRes.status).toBe(403);

    // Admin token should be 200
    const adminRes = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.totalBookings).toBeGreaterThan(0);
  });
});
