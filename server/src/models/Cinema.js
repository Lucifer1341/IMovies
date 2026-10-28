import mongoose from 'mongoose';

const seatConfigSchema = new mongoose.Schema({
  row: { type: String, required: true },
  seatNumbers: [{ type: Number }],
  category: {
    type: String,
    enum: ['standard', 'vip', 'student_saver', 'accessible'],
    default: 'standard',
  },
});

const auditoriumSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  rows: [seatConfigSchema],
  formats: [{ type: String }], // e.g. ['Standard', '4K', 'IMAX']
});

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    timeZone: { type: String, default: 'Asia/Kolkata' },
    auditoriums: [auditoriumSchema],
    amenities: [{ type: String }],
    phone: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

cinemaSchema.index({ location: 1 });
cinemaSchema.index({ isActive: 1 });

export default mongoose.model('Cinema', cinemaSchema);
