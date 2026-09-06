import api from './api';
import type { Note, NotePayload, NotesPage } from '../types';

export const notesService = {
  async getAll(params?: { search?: string; page?: number; limit?: number }): Promise<NotesPage> {
    const { data } = await api.get('/notes', { params });
    return {
      notes: data.notes ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
    };
  },

  async create(payload: NotePayload): Promise<Note> {
    const { data } = await api.post('/notes', payload);
    return data.note ?? data;
  },

  async update(id: string, payload: Partial<NotePayload>): Promise<Note> {
    const { data } = await api.put(`/notes/${id}`, payload);
    return data.note ?? data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
};
