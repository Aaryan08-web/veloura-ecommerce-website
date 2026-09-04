import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    author: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: Number,
    discount: Number,
    // Broad department so the catalog covers clothes, cosmetics, shoes & accessories
    department: {
      type: String,
      enum: ['clothing', 'cosmetics', 'shoes', 'accessories'],
      default: 'clothing',
      index: true,
    },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true, index: true, trim: true },
    gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
    sizes: [String],
    colors: [{ name: String, hex: String }],
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 },
    material: String,
    fit: String,
    careInstructions: [String],
    details: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

productSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + this._id.toString().slice(-6);
  }
  next();
});

export default mongoose.model('Product', productSchema);
