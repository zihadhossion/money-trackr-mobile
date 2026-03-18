import api from './api';
import type { Lending, LendingSummary } from '../types';

export const lendingService = {
  async getAll(startDate?: string, endDate?: string): Promise<Lending[]> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await api.get('/lending', { params });
    return Array.isArray(data) ? data : data.lendings ?? [];
  },

  async getSummary(): Promise<LendingSummary> {
    const { data } = await api.get('/lending/summary');
    return data;
  },

  async create(payload: Omit<Lending, '_id'>): Promise<Lending> {
    const { data } = await api.post('/lending', payload);
    return data;
  },

  async update(id: string, payload: Partial<Lending>): Promise<Lending> {
    const { amount, personName, type, date, dueDate, status, remainingAmount, notes } = payload;
    const clean: Partial<Lending> = { amount, personName, type, date, dueDate, status, remainingAmount, notes };
    (Object.keys(clean) as (keyof typeof clean)[]).forEach((k) => clean[k] === undefined && delete clean[k]);
    const { data } = await api.patch(`/lending/${id}`, clean);
    return data;
  },

  async addRepayment(id: string, amount: number): Promise<Lending> {
    const { data } = await api.post(`/lending/${id}/repayment`, { amount });
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/lending/${id}`);
  },
};
