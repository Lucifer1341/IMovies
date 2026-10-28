import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true },
    maxDiscountAmount: { type: Number }, // cap for percentage discounts
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    eligibility: {
      studentOnly: { type: Boolean, default: false },
      minTickets: { type: Number, default: 1 },
    },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, validUntil: 1 });

export default mongoose.model('Promotion', promotionSchema);
