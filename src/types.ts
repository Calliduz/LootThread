export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'gamer' | 'artist';
  bio?: string;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'skin' | 'attachment';
  subCategory?: string;
  images: string[];
  artistId?: string;
  specs?: Record<string, any>;
  inventory: number;
  tags: string[];
  createdAt: any;
}

export interface Order {
  id: string;
  buyerId: string;
  items: {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    artistId?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
}
