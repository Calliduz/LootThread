import axiosInstance from './axiosInstance';
import { Product, Artist, ArtistStats, QuizQuestion, OrderResponse, CreateOrderRequest } from '../types/api';

/**
 * PRODUCTS ENDPOINTS
 */
export const getProducts = async () => {
  const response = await axiosInstance.get<Product[]>('/products');
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await axiosInstance.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product>) => {
  const response = await axiosInstance.post<Product>('/products', data);
  return response.data;
};

/**
 * ARTISTS ENDPOINTS
 */
export const getArtists = async () => {
  const response = await axiosInstance.get<Artist[]>('/artists');
  return response.data;
};

export const getArtistStats = async (id: string) => {
  const response = await axiosInstance.get<ArtistStats>(`/artists/${id}/stats`);
  return response.data;
};

export const getArtistAnalytics = async (id: string) => {
  const response = await axiosInstance.get<any>(`/artists/${id}/analytics`);
  return response.data;
};

/**
 * AUTH ENDPOINTS
 */
export const login = async (credentials: any) => {
  const response = await axiosInstance.post<{ token: string; artist: Artist }>('/artists/login', credentials);
  return response.data;
};

/**
 * QUIZ ENDPOINTS
 */
export const getQuiz = async () => {
  const response = await axiosInstance.get<QuizQuestion[]>('/quiz');
  return response.data;
};

export const getRecommendation = async (answers: any) => {
  const response = await axiosInstance.post<any>('/quiz/recommend', { answers });
  return response.data;
};

/**
 * ORDERS ENDPOINTS
 */
export const createOrder = async (data: CreateOrderRequest) => {
  const response = await axiosInstance.post<OrderResponse>('/orders', data);
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await axiosInstance.get<any[]>('/payment-methods');
  return response.data;
};
