import api from './api';
import type { Expense } from '../types';

export interface PaginatedExpenses {
  expenses: Expense[];
  total: number;
  page: number;
  totalPages: number;
  periodTotal: number;
}

// One object rather than six positional arguments: the screens now pass a
// filter object straight through, and a new filter is a field, not a slot
// every caller has to count past.
export interface ExpenseQuery {
  // Absent for the "all time" period, which filters by no date at all.
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const expenseService = {
  async getAll({ startDate, endDate, category, search, page = 1, limit = 15 }: ExpenseQuery): Promise<PaginatedExpenses> {
    const { data } = await api.get('/expenses', {
      params: {
        page, limit,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
      },
    });
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
