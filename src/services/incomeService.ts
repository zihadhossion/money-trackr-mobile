import api from './api';
import type { Income } from '../types';

export const incomeService = {
  async getAll(startDate: string, endDate: string): Promise<Income[]> {
    const { data } = await api.get('/income', { params: { startDate, endDate } });
    return data.incomes ?? data ?? [];
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
