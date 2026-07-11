import api from './api';
import type { Expense } from '../types';

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
  periodTotal: number;
}

export const expenseService = {
  async getAll(startDate: string, endDate: string, category?: string, page = 1, limit = 15): Promise<PaginatedExpenses> {
    const { data } = await api.get('/expenses', { params: { startDate, endDate, page, limit, ...(category ? { category } : {}) } });
    return data;
  },

  async create(payload: Omit<Expense, '_id'>): Promise<Expense> {
    const { data } = await api.post('/expenses', payload);
    return data.expense ?? data;
  },

  async update(id: string, payload: Partial<Expense>): Promise<Expense> {
    const { data } = await api.put(`/expenses/${id}`, payload);
    return data.expense ?? data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
