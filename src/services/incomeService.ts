import api from './api';
import type { Income } from '../types';

export interface PaginatedIncomes {
  incomes: Income[];
  total: number;
  page: number;
  totalPages: number;
  periodTotal: number;
}

export interface IncomeQuery {
  // Absent for the "all time" period, which filters by no date at all.
  startDate?: string;
  endDate?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const incomeService = {
  async getAll({ startDate, endDate, category, search, page = 1, limit = 15 }: IncomeQuery): Promise<PaginatedIncomes> {
    const { data } = await api.get('/income', {
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

  async create(payload: Omit<Income, '_id'>): Promise<Income> {
    const { data } = await api.post('/income', payload);
    return data.income ?? data;
  },

  async update(id: string, payload: Partial<Income>): Promise<Income> {
    const { data } = await api.put(`/income/${id}`, payload);
    return data.income ?? data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/income/${id}`);
  },
};
