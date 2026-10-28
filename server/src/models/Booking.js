import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const seatSnapshotSchema = new mongoose.Schema({
  row: String,
  seatNumber: Number,
  seatLabel: String,
  category: String,
  price: Number,
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    hold: { type: mongoose.Schema.Types.ObjectId, ref: 'SeatHold' },
    bookingRef: {
      type: String,
      unique: true,
      default: () => 'BK' + uuidv4().replace(/-/g, '').slice(0, 10).toUpperCase(),
    },
    seats: [seatSnapshotSchema],
    // Price snapshots
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    promotionCode: { type: String },
    promotionDiscount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    // Movie/cinema snapshot
    movieTitle: { type: String },
    moviePosterUrl: { type: String },
    cinemaName: { type: String },
    auditoriumName: { type: String },
    showStartTime: { type: Date },
    showFormat: { type: String },
    // Status
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'failed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'demo_paid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    idempotencyKey: { type: String, unique: true, sparse: true },
    // Cancellation
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    refundStatus: { type: String, enum: ['none', 'requested', 'processed'], default: 'none' },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ bookingRef: 1 });
bookingSchema.index({ show: 1 });
bookingSchema.index({ idempotencyKey: 1 });

export default mongoose.model('Booking', bookingSchema);
