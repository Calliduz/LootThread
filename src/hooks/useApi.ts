import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import { Product, Artist, ArtistStats, CreateOrderRequest } from '../types/api';

/**
 * HOOKS: PRODUCTS
 */
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: apiService.getProducts,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiService.getProductById(id),
    enabled: !!id,
  });
};

/**
 * HOOKS: ARTISTS
 */
export const useArtists = () => {
  return useQuery({
    queryKey: ['artists'],
    queryFn: apiService.getArtists,
  });
};

/**
 * Parallel Queries for Dashboard
 */
export const useArtistDashboard = (id: string) => {
  const statsQuery = useQuery({
    queryKey: ['artist-dashboard', 'stats', id],
    queryFn: () => apiService.getArtistStats(id),
    enabled: !!id,
    staleTime: 0, // Ensure fresh stats on refresh
  });

  const analyticsQuery = useQuery({
    queryKey: ['artist-dashboard', 'analytics', id],
    queryFn: () => apiService.getArtistAnalytics(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes for analytics
  });

  return {
    stats: statsQuery.data,
    analytics: analyticsQuery.data,
    isLoading: statsQuery.isLoading || analyticsQuery.isLoading,
    isError: statsQuery.isError || analyticsQuery.isError,
    error: statsQuery.error || analyticsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      analyticsQuery.refetch();
    }
  };
};

/**
 * MUTATIONS
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: any) => apiService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('artist', JSON.stringify(data.artist));
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderRequest) => apiService.createOrder(data),
    onSuccess: () => {
      // Strategic invalidation: refresh dashboard stats when sales occur
      queryClient.invalidateQueries({ queryKey: ['artist-dashboard'] });
    },
  });
};

/**
 * HOOKS: QUIZ
 */
export const useQuiz = () => {
  return useQuery({
    queryKey: ['quiz'],
    queryFn: apiService.getQuiz,
  });
};
