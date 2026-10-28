import mongoose from 'mongoose';
import crypto from 'crypto';

const ticketVerificationSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    tokenHash: { type: String, required: true }, // SHA-256 hash of the opaque token
    token: { type: String, required: true, unique: true }, // opaque UUID token (stored for QR)
    status: {
      type: String,
      enum: ['valid', 'used', 'revoked', 'expired'],
      default: 'valid',
    },
    usedAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

ticketVerificationSchema.index({ token: 1 });
ticketVerificationSchema.index({ booking: 1 });

ticketVerificationSchema.statics.createForBooking = async function (bookingId, showTime) {
  const token = crypto.randomUUID();
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  // Expires 24 hours after show
  const expiresAt = new Date(showTime.getTime() + 24 * 60 * 60 * 1000);
  return this.create({ booking: bookingId, token, tokenHash, expiresAt });
};

export default mongoose.model('TicketVerification', ticketVerificationSchema);
