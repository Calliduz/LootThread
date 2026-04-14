/**
 * CORE INTERFACES
 * These types are shared between the LootThread frontend and Express backend.
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'skin' | 'attachment';
  subCategory: string;
  images: string[];
  inventory: number;
  tags: string[];
  artistId?: string;
  createdAt: Date | string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  avatar: string;
  salesCount: string | number; // Frontend currently handles as "12K+"
  rating: number;
  totalRevenue?: number;
  activeSkinsCount?: number;
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
