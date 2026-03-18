import api from './api';
import type { Overview, CategoryData, TrendData, LendingSummary } from '../types';

export const dashboardService = {
  async getOverview(year: number, month: number): Promise<Overview> {
    const { data } = await api.get('/dashboard/overview', { params: { year, month } });
    return data.overview ?? data;
  },

  async getExpensesByCategory(year: number, month: number): Promise<CategoryData[]> {
    const { data } = await api.get('/dashboard/expenses-by-category', { params: { year, month } });
    return data.categories ?? data ?? [];
  },

  async getTrends(year: number): Promise<TrendData[]> {
    const { data } = await api.get('/dashboard/trends', { params: { year } });
    return data.trends ?? data ?? [];
  },
};
