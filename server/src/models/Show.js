import mongoose from 'mongoose';

const categoryPricingSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['standard', 'vip', 'student_saver', 'accessible'],
    required: true,
  },
  price: { type: Number, required: true },
  studentDiscount: { type: Number, default: 0 }, // percentage
});

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: 'Cinema', required: true },
    auditoriumName: { type: String, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    format: { type: String, default: 'Standard' },
    language: { type: String, default: 'English' },
    categoryPricing: [categoryPricingSchema],
    currency: { type: String, default: 'INR' },
    bookingCutoffMinutes: { type: Number, default: 30 }, // minutes before show
    isActive: { type: Boolean, default: true },
    totalSeats: { type: Number, required: true },
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, startTime: 1 });
showSchema.index({ cinema: 1, startTime: 1 });
showSchema.index({ startTime: 1 });
showSchema.index({ isActive: 1 });

export default mongoose.model('Show', showSchema);
