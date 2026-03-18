import api from './api';
import type { Note } from '../types';

export const notesService = {
  async getAll(): Promise<Note[]> {
    const { data } = await api.get('/notes');
    return data.notes ?? data ?? [];
  },

  async create(payload: { title: string; content: string }): Promise<Note> {
    const { data } = await api.post('/notes', payload);
    return data.note ?? data;
  },

  async update(id: string, payload: { title?: string; content?: string }): Promise<Note> {
    const { data } = await api.put(`/notes/${id}`, payload);
    return data.note ?? data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
};
