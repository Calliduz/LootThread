import { render, act, renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartProvider, useCart } from './CartContext';
import React from 'react';

// Mock AuthContext
vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({
        productId: '1',
        name: 'Test Item',
        price: 100,
        imageUrl: 'test.jpg',
      });
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].productId).toBe('1');
    expect(result.current.cartItems[0].quantity).toBe(1);
    expect(result.current.cartTotal).toBe(100);
  });

  it('increments quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ productId: '1', name: 'Item', price: 100 });
      result.current.addToCart({ productId: '1', name: 'Item', price: 100 });
    });

    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.cartTotal).toBe(200);
  });

  it('updates quantity via updateQuantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ productId: '1', name: 'Item', price: 100 });
    });

    act(() => {
      result.current.updateQuantity('1', 2); // +2 = 3 total
    });

    expect(result.current.cartItems[0].quantity).toBe(3);
    expect(result.current.cartTotal).toBe(300);

    act(() => {
      result.current.updateQuantity('1', -2); // -2 = 1 total
    });

    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('removes item when quantity reaches zero', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ productId: '1', name: 'Item', price: 100 });
    });

    act(() => {
      result.current.updateQuantity('1', -1);
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('removes item directly via removeFromCart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ productId: '1', name: 'Item', price: 100 });
    });

    act(() => {
      result.current.removeFromCart('1');
    });

    expect(result.current.cartItems).toHaveLength(0);
  });

  it('clears the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ productId: '1', name: 'Item 1', price: 100 });
      result.current.addToCart({ productId: '2', name: 'Item 2', price: 200 });
    });

    expect(result.current.cartItems).toHaveLength(2);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.cartItems).toHaveLength(0);
    expect(result.current.cartTotal).toBe(0);
  });
});
