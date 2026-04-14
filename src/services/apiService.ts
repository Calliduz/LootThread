import axiosInstance from '../api/axiosInstance';
import { Product, Artist, ArtistStats, QuizQuestion, OrderResponse, CreateOrderRequest } from '../types/api';

/**
 * LOOT THREAD API SERVICE
 */

export const apiService = {
  // PRODUCTS
  getProducts: async () => {
    const response = await axiosInstance.get<Product[]>('/products');
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await axiosInstance.get<Product>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: Partial<Product>) => {
    const response = await axiosInstance.post<Product>('/products', data);
    return response.data;
  },

  // ARTISTS
  getArtists: async () => {
    const response = await axiosInstance.get<Artist[]>('/artists');
    return response.data;
  },

  getArtistStats: async (id: string) => {
    const response = await axiosInstance.get<ArtistStats>(`/artists/${id}/stats`);
    return response.data;
  },

  getArtistAnalytics: async (id: string) => {
    const response = await axiosInstance.get<any>(`/artists/${id}/analytics`);
    return response.data;
  },

  // AUTH
  login: async (credentials: any) => {
    const response = await axiosInstance.post<{ token: string; artist: Artist }>('/artists/login', credentials);
    return response.data;
  },

  // QUIZ
  getQuiz: async () => {
    const response = await axiosInstance.get<QuizQuestion[]>('/quiz');
    return response.data;
  },

  getRecommendation: async (answers: any) => {
    const response = await axiosInstance.post<any>('/quiz/recommend', { answers });
    return response.data;
  },

  // ORDERS
  createOrder: async (data: CreateOrderRequest) => {
    const response = await axiosInstance.post<OrderResponse>('/orders', data);
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await axiosInstance.get<any[]>('/payment-methods');
    return response.data;
  }
};
