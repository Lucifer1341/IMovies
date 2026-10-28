import mongoose from 'mongoose';

const castMemberSchema = new mongoose.Schema({
  name: String,
  role: String,
  photoUrl: String,
});

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    synopsis: { type: String, required: true },
    posterUrl: { type: String, default: '' },
    backdropUrl: { type: String, default: '' },
    trailerUrl: { type: String, default: '' },
    genres: [{ type: String }],
    runtime: { type: Number, required: true }, // minutes
    language: { type: String, default: 'English' },
    languages: [{ type: String }],
    releaseDate: { type: Date, required: true },
    cast: [castMemberSchema],
    rating: { type: Number, min: 0, max: 10, default: 0 },
    ratingSource: { type: String, default: 'Sample Data' },
    ratingCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
    },
    isActive: { type: Boolean, default: true },
    ageRating: { type: String, default: 'U/A' },
    director: { type: String },
  },
  { timestamps: true }
);

movieSchema.index({ slug: 1 });
movieSchema.index({ status: 1, isActive: 1 });
movieSchema.index({ genres: 1 });
movieSchema.index({ title: 'text', synopsis: 'text' });

export default mongoose.model('Movie', movieSchema);
