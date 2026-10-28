import mongoose from 'mongoose';

const heldSeatSchema = new mongoose.Schema({
  row: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  seatLabel: { type: String, required: true }, // e.g. "A5"
});

const seatHoldSchema = new mongoose.Schema(
  {
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seats: [heldSeatSchema],
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'converted', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

seatHoldSchema.index({ show: 1, status: 1 });
seatHoldSchema.index({ user: 1, status: 1 });
seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index — MongoDB auto-deletes
// Note: TTL index removes documents but we also check status programmatically

export default mongoose.model('SeatHold', seatHoldSchema);
