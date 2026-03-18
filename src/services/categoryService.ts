import api from './api';
import type { Category } from '../types';

export const categoryService = {
  async getAll(type?: 'income' | 'expense'): Promise<Category[]> {
    const { data } = await api.get('/categories', { params: type ? { type } : {} });
    return data.categories ?? data ?? [];
  },

  async create(payload: Omit<Category, '_id' | 'isDefault'>): Promise<Category> {
    const { data } = await api.post('/categories', payload);
    return data.category ?? data;
  },

  async update(id: string, payload: Partial<Category>): Promise<Category> {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data.category ?? data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
