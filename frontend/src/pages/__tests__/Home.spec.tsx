import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../Home';
import * as apiClient from '../../api/client';

// Mock the API client
vi.mock('../../api/client', () => ({
  apiFetch: vi.fn()
}));

// Mock ProductCard component
vi.mock('../../components/ProductCard', () => ({
  default: ({ product, onClick }: any) => (
    <div data-testid={`product-${product.id}`} onClick={() => onClick(product)}>
      {product.name} - {product.brand}
    </div>
  )
}));

const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    brand: 'Test Brand 1',
    category: 'Куртки',
    price: 100,
    isActive: true
  },
  {
    id: 2,
    name: 'Test Product 2',
    brand: 'Test Brand 2',
    category: 'Толстовки',
    price: 200,
    isActive: true
  }
];

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Home />);

    expect(screen.getByText('Загрузка товаров...')).toBeInTheDocument();
  });

  it('should render products after successful fetch', async () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockResolvedValue({
      success: true,
      data: mockProducts
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Винтажная одежда')).toBeInTheDocument();
      expect(screen.getByTestId('product-1')).toBeInTheDocument();
      expect(screen.getByTestId('product-2')).toBeInTheDocument();
    });
  });

  it('should render error state when fetch fails', async () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockRejectedValue(new Error('API Error'));

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки товаров')).toBeInTheDocument();
    });
  });

  it('should render filters and handle filter changes', async () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockResolvedValue({
      success: true,
      data: mockProducts
    });

    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Фильтры')).toBeInTheDocument();
    });

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Поиск по названию...');
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'test search');
    expect(searchInput).toHaveValue('test search');

    // Test category filter
    const categorySelect = screen.getByDisplayValue('Все категории');
    expect(categorySelect).toBeInTheDocument();

    await user.selectOptions(categorySelect, 'Куртки');
    expect(categorySelect).toHaveValue('Куртки');
  });

  it('should show clear filters button when filters are applied', async () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockResolvedValue({
      success: true,
      data: mockProducts
    });

    const user = userEvent.setup();
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Фильтры')).toBeInTheDocument();
    });

    // Apply a filter
    const searchInput = screen.getByPlaceholderText('Поиск по названию...');
    await user.type(searchInput, 'test');

    // Clear filters button should appear
    await waitFor(() => {
      expect(screen.getByText('Очистить фильтры')).toBeInTheDocument();
    });

    // Click clear filters
    await user.click(screen.getByText('Очистить фильтры'));

    // Search input should be cleared
    expect(searchInput).toHaveValue('');
  });

  it('should show "no products found" message when products array is empty', async () => {
    const mockApiFetch = vi.mocked(apiClient.apiFetch);
    mockApiFetch.mockResolvedValue({
      success: true,
      data: []
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Товары не найдены')).toBeInTheDocument();
    });
  });
});