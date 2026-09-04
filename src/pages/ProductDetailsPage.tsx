import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Star, CheckCircle, Send, MessageSquare } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { Product, ProductReview } from '../types';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { formatDate } from '../utils/formatDate';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // New review form states
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewsList, setReviewsList] = useState<ProductReview[]>([]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    window.scrollTo(0, 0);

    apiClient.getProductById(productId).then((data) => {
      if (data) {
        setProduct(data);
        setReviewsList(data.reviews || []);
      } else {
        setProduct(null);
      }
      setLoading(false);
    });
  }, [productId]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newReview: ProductReview = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      comment: reviewComment.trim(),
      verifiedPurchase: true,
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewAuthor('');
    setReviewComment('');
    setReviewRating(5);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="lg" label="Retrieving garment dossier..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <EmptyState
          title="Garment Not Found"
          description="The requested piece may have been archived or is no longer available in this seasonal edition."
          actionText="Return to Shop"
          actionHref="/shop"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400 mb-8 overflow-x-auto no-scrollbar">
        <Link to="/home" className="hover:text-stone-950 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0 text-stone-400 dark:text-stone-600" />
        <Link to="/shop" className="hover:text-stone-950 dark:hover:text-white transition-colors">
          Shop
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0 text-stone-400 dark:text-stone-600" />
        <Link
          to={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-stone-950 dark:hover:text-white transition-colors whitespace-nowrap"
        >
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3 flex-shrink-0 text-stone-400 dark:text-stone-600" />
        <span className="text-stone-950 dark:text-white font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Showcase Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Gallery (Thumbnails + Main Stage with Zoom) */}
        <div className="col-span-1 lg:col-span-7">
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Product Information, Selectors & Checkout Actions */}
        <div className="col-span-1 lg:col-span-5">
          <ProductInfo product={product} />
        </div>
      </div>

      {/* Reviews & Client Reflections Section */}
      <section id="reviews" className="pt-20 mt-20 border-t border-stone-200 dark:border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Review Stats & Write Review Form */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-500 dark:text-stone-400 block mb-1">
                Verified Feedback
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-stone-950 dark:text-white font-light">
                Client Impressions
              </h3>
            </div>

            {/* Score box */}
            <div className="flex items-center gap-4 p-6 bg-stone-100 dark:bg-zinc-900 rounded-xs border border-stone-200 dark:border-white/10 shadow-sm dark:shadow-lg">
              <span className="font-serif text-5xl font-light text-stone-950 dark:text-white">
                {product.rating.toFixed(1)}
              </span>
              <div className="space-y-1">
                <div className="flex text-amber-500 dark:text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating)
                          ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Based on {reviewsList.length} verified reflections
                </p>
              </div>
            </div>

            {/* Submit a Reflection Form */}
            <div className="p-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-xs space-y-4 shadow-sm dark:shadow-lg">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-950 dark:text-white">
                Submit Your Garment Reflection
              </h4>

              {reviewSubmitted ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xs text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Thank you. Your reflection has been documented in the atelier ledger.</span>
                </div>
              ) : (
                <form onSubmit={handleAddReview} className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-700 dark:text-stone-400 mb-1 font-medium">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Lauren M."
                      className="w-full px-3 py-2.5 bg-stone-50 dark:bg-black border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-700 dark:text-stone-400 mb-1 font-medium">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-500 dark:text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating
                                ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400'
                                : 'text-stone-300 dark:text-stone-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-700 dark:text-stone-400 mb-1 font-medium">
                      Your Reflection on Fit, Hand-Feel & Silhouette
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe the fabric weight, drape, and sizing experience..."
                      className="w-full px-3 py-2.5 bg-stone-50 dark:bg-black border border-stone-300 dark:border-white/15 text-xs text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 rounded-xs focus:outline-none focus:border-stone-900 dark:focus:border-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-stone-950 text-white hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-[#EAEAEA] text-[10px] uppercase tracking-[0.2em] font-bold rounded-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Reflection
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Reviews Feed */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-950 dark:text-white pb-3 border-b border-stone-200 dark:border-white/10">
              Customer Experiences ({reviewsList.length})
            </h4>

            {reviewsList.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                <MessageSquare className="w-8 h-8 text-stone-400 dark:text-stone-600" />
                <span>Be the first to record a review for this piece.</span>
              </div>
            ) : (
              <div className="divide-y divide-stone-200 dark:divide-white/10">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="py-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-950 dark:text-white">
                          {rev.author}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle className="w-3 h-3" /> Verified Client
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-500 font-light">
                        {formatDate(rev.date)}
                      </span>
                    </div>

                    <div className="flex text-amber-500 dark:text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating
                              ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400'
                              : 'text-stone-300 dark:text-stone-700'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-light">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Complementary Pieces ("Complete The Look") */}
      <RelatedProducts currentProduct={product} />
    </div>
  );
};
