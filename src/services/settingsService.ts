import api from './api';
import type { Settings } from '../types';

export const settingsService = {
  async get(): Promise<Settings> {
    const { data } = await api.get('/users/settings');
    return data.settings ?? data;
  },

  async update(settings: Partial<Settings>): Promise<Settings> {
    const { data } = await api.put('/users/settings', settings);
    return data.settings ?? data;
  },
};
