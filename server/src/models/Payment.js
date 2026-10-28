import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    provider: { type: String, enum: ['demo', 'razorpay', 'stripe'], default: 'demo' },
    transactionRef: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
    idempotencyRef: { type: String, unique: true, sparse: true },
    // Never store card numbers, CVVs, or real credentials
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });
paymentSchema.index({ transactionRef: 1 });

export default mongoose.model('Payment', paymentSchema);
