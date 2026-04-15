import axiosInstance from './axiosInstance';
import {
  Product, Artist, ArtistStats, Collection, CMSContent,
  QuizQuestion, OrderResponse, CreateOrderRequest,
  LoginCredentials, AuthResponse,
} from '../types/api';

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (data: { name: string; email: string; password: string }): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return response.data;
};

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------
export const getProducts = async (params?: {
  type?: string;
  collectionId?: string;
  artistId?: string;
}) => {
  const response = await axiosInstance.get<Product[]>('/products', { params });
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

export const updateProduct = async (id: string, data: Partial<Product>) => {
  const response = await axiosInstance.put<Product>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// ARTISTS
// ---------------------------------------------------------------------------
export const getArtists = async () => {
  const response = await axiosInstance.get<Artist[]>('/artists');
  return response.data;
};

export const getArtistById = async (id: string) => {
  const response = await axiosInstance.get<Artist>(`/artists/${id}`);
  return response.data;
};

export const createArtist = async (data: Partial<Artist>) => {
  const response = await axiosInstance.post<Artist>('/artists', data);
  return response.data;
};

export const updateArtist = async (id: string, data: Partial<Artist>) => {
  const response = await axiosInstance.put<Artist>(`/artists/${id}`, data);
  return response.data;
};

export const deleteArtist = async (id: string) => {
  const response = await axiosInstance.delete(`/artists/${id}`);
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

// ---------------------------------------------------------------------------
// COLLECTIONS
// ---------------------------------------------------------------------------
export const getCollections = async () => {
  const response = await axiosInstance.get<Collection[]>('/collections');
  return response.data;
};

export const getCollectionById = async (id: string) => {
  const response = await axiosInstance.get<Collection>(`/collections/${id}`);
  return response.data;
};

export const createCollection = async (data: Partial<Collection>) => {
  const response = await axiosInstance.post<Collection>('/collections', data);
  return response.data;
};

export const updateCollection = async (id: string, data: Partial<Collection>) => {
  const response = await axiosInstance.put<Collection>(`/collections/${id}`, data);
  return response.data;
};

export const deleteCollection = async (id: string) => {
  const response = await axiosInstance.delete(`/collections/${id}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// CMS CONTENT
// ---------------------------------------------------------------------------
export const getCMSByKey = async (key: string) => {
  const response = await axiosInstance.get<CMSContent>(`/cms/${key}`);
  return response.data;
};

export const getAllCMS = async () => {
  const response = await axiosInstance.get<CMSContent[]>('/cms');
  return response.data;
};

export const createCMS = async (data: Partial<CMSContent>) => {
  const response = await axiosInstance.post<CMSContent>('/cms', data);
  return response.data;
};

export const updateCMS = async (id: string, data: Partial<CMSContent>) => {
  const response = await axiosInstance.put<CMSContent>(`/cms/${id}`, data);
  return response.data;
};

export const deleteCMS = async (id: string) => {
  const response = await axiosInstance.delete(`/cms/${id}`);
  return response.data;
};

// ---------------------------------------------------------------------------
// QUIZ
// ---------------------------------------------------------------------------
export const getQuiz = async () => {
  const response = await axiosInstance.get<QuizQuestion[]>('/quiz');
  return response.data;
};

export const getRecommendation = async (answers: any) => {
  const response = await axiosInstance.post<any>('/quiz/recommend', { answers });
  return response.data;
};

// ---------------------------------------------------------------------------
// ORDERS
// ---------------------------------------------------------------------------
export const createOrder = async (data: CreateOrderRequest) => {
  const response = await axiosInstance.post<OrderResponse>('/orders', data);
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await axiosInstance.get<any[]>('/payment-methods');
  return response.data;
};

// ---------------------------------------------------------------------------
// NEWSLETTER
// ---------------------------------------------------------------------------
export const subscribeNewsletter = async (email: string) => {
  const response = await axiosInstance.post('/newsletter/subscribe', { email });
  return response.data;
};
