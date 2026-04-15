/**
 * CORE INTERFACES
 * These types are shared between the LootThread frontend and Express backend.
 */

export type ProductType = 'skin' | 'attachment' | 'apparel' | 'individual';

export interface Product {
  id: string;
  name: string;
  title?: string;
  description: string;
  price: number;
  type: ProductType;
  /** @deprecated Use `type` — kept for backward compat with old product cards */
  category?: 'skin' | 'attachment';
  subCategory?: string;
  imageUrl?: string;
  images?: string[];
  stockQuantity?: number;
  inventory?: number;
  tags?: string[];
  artistId?: string;
  collectionId?: string;
  createdAt: Date | string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  imageUrl?: string;
  salesCount?: string | number;
  rating?: number;
  totalRevenue?: number;
  activeSkinsCount?: number;
  isActive?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  releaseDate?: string;
  isActive?: boolean;
}

export interface CMSContent {
  id: string;
  key: string;
  type: 'text' | 'json' | 'image' | 'array';
  value?: any;
  isActive?: boolean;
}

/**
 * AUTH
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatarUrl?: string;
  isActive?: boolean;
  deliveryAddresses?: {
    id?: string;
    _id?: string;
    label: string;
    street: string;
    city: string;
    zip: string;
    country: string;
    isDefault: boolean;
  }[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * ANALYTICS & DASHBOARD
 */

export interface SalesTrend {
  name: string; // Mon, Tue, etc.
  sales: number;
  revenue: number;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface TopItem {
  name: string;
  sales: number;
}

export interface ArtistStats {
  totalRevenue: number;
  activeSkins: number;
  totalSales: number;
  revenueTrend: string;
  skinsTrend: string;
  salesTrend: string;
}

/**
 * QUIZ & RECOMMENDATIONS
 */

export interface QuizOption {
  id: string;
  label: string;
  icon?: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface RecommendationRequest {
  answers: Record<number, string>;
}

export interface RecommendationResponse {
  mouse: {
    name: string;
    description: string;
    image?: string;
  };
}

/**
 * ORDER & CHECKOUT
 */

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CreateOrderRequest {
  items: (Product & { quantity: number })[];
  totalAmount: number;
  paymentMethod: string;
}

export interface OrderResponse {
  orderId: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}
