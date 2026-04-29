import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminOrders from './AdminOrders';
import * as api from '../../api/endpoints';
import React from 'react';

// Mock dependencies
vi.mock('../../api/endpoints');
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
    button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockOrders = [
  { _id: '1', status: 'pending', totalAmount: 100, createdAt: new Date().toISOString(), items: [] },
  { _id: '2', status: 'processing', totalAmount: 200, createdAt: new Date().toISOString(), items: [] },
];

describe('AdminOrders Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getAllOrders as any).mockResolvedValue(mockOrders);
  });

  it('renders orders and handles single selection', async () => {
    render(<AdminOrders />);
    
    await waitFor(() => expect(screen.getByText(/#1/i)).toBeInTheDocument());
    
    const checkbox1 = screen.getByTestId('select-order-1');
    fireEvent.click(checkbox1);
    
    // Check if batch bar appeared
    expect(screen.getByText(/1 Orders Selected/i)).toBeInTheDocument();
  });

  it('handles "Select All" toggle', async () => {
    render(<AdminOrders />);
    await waitFor(() => expect(screen.getByText(/#1/i)).toBeInTheDocument());

    const selectAllBtn = screen.getAllByRole('button').filter(b => b.querySelector('svg'))[1]; 
    fireEvent.click(selectAllBtn); 

    const processBtn = screen.getByTestId('bulk-process-btn');
    fireEvent.click(processBtn);

    await waitFor(() => {
      expect(api.updateBulkOrderStatus).toHaveBeenCalledWith(['1', '2'], 'processing');
    });
  });
});
