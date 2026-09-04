export type Gender = 'men' | 'women' | 'unisex';
export type GenderFilter = Gender | 'all';

export type Category = 
  | 'T-Shirts'
  | 'Shirts'
  | 'Jeans'
  | 'Hoodies'
  | 'Jackets'
  | 'Trousers'
  | 'Tops'
  | 'Dresses'
  | 'Coats & Trench'
  | 'Knitwear & Cashmere'
  | 'Blazers & Tailoring'
  | 'Tailored Trousers'
  | 'Dresses & Gowns'
  | 'Silk & Satin Tops';

export type ProductCategory = Category;

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title?: string;
  comment: string;
  verified?: boolean;
  verifiedPurchase?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number; // e.g. 20 for 20%
  category: Category;
  gender: Gender;
  sizes: string[];
  colors: ProductColor[];
  images: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  stock: number;
  material: string;
  fit: string;
  careInstructions?: string[];
  details?: string[];
  reviews?: ProductReview[];
}

export interface CartItem {
  id: string; // unique item id (combining product id + size + color)
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
  addedAt?: string;
}

export type OrderStatus = 
  | 'Order Placed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered';

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  price: number;
  size: string;
  color: ProductColor;
  quantity: number;
}

export interface ShippingAddress {
  fullName?: string;
  email?: string;
  phone?: string;
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  zipCode?: string;
  country: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface RazorpayPaymentDetails {
  orderId?: string;
  paymentId?: string;
  signature?: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber?: string;
  user?: { id?: string; _id?: string; name?: string; email?: string } | string;
  userId?: string;
  guestEmail?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
  subtotal: number;
  shipping?: number;
  shippingFee?: number;
  discount: number;
  total: number;
  status: OrderStatus | string;
  shippingAddress: ShippingAddress;
  deliveryMethod?: 'standard' | 'express';
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  razorpay?: RazorpayPaymentDetails;
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingUpdates?: {
    status: OrderStatus | string;
    timestamp: string | Date;
    description: string;
  }[];
}

export interface AdminProfile {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface AdminDashboardData {
  stats: {
    userCount: number;
    productCount: number;
    orderCount: number;
    revenue: number;
    paidOrders?: number;
    pendingOrders?: number;
    unreadContacts?: number;
  };
  lowStock: Array<{
    id?: string;
    _id?: string;
    name: string;
    stock: number;
    brand?: string;
    category?: string;
    price?: number;
  }>;
  recentOrders?: Order[];
  database?: {
    connected: boolean;
    type: string;
    host: string;
    database: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  memberSince?: string;
  createdAt?: string;
  savedAddresses?: ShippingAddress[];
  address?: ShippingAddress;
  orders?: Order[];
}

export interface FilterState {
  gender: Gender | 'all';
  categories: Category[];
  sizes: string[];
  colors: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  isNewOnly: boolean;
}

export type SortOption = 
  | 'featured'
  | 'newest'
  | 'popular'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc';
