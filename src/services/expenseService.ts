import api from './api';
import type { Expense } from '../types';

export const expenseService = {
  async getAll(startDate: string, endDate: string, category?: string): Promise<Expense[]> {
    const { data } = await api.get('/expenses', { params: { startDate, endDate, ...(category ? { category } : {}) } });
    return data.expenses ?? data ?? [];
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
