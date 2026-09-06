import api from './api';
import type { Lending, LendingPayload, LendingSummary } from '../types';

export interface PaginatedLendings {
  lendings: Lending[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LendingQuery {
  startDate?: string;
  endDate?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const lendingService = {
  async getAll({ startDate, endDate, type, status, search, page = 1, limit = 15 }: LendingQuery = {}): Promise<PaginatedLendings> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (type) params.type = type;
    if (status) params.status = status;
    if (search) params.search = search;
    const { data } = await api.get('/lending', { params });
    return data;
  },

  async getSummary(): Promise<LendingSummary> {
    const { data } = await api.get('/lending/summary');
    return data;
  },

  async create(payload: LendingPayload): Promise<Lending> {
    const { data } = await api.post('/lending', payload);
    return data;
  },

  async update(id: string, payload: LendingPayload): Promise<Lending> {
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
