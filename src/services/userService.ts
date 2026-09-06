import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import api from './api';
import type { User } from '../types';

// The API rejects anything over 2MB and stores whatever it is given, so the
// phone has to do the shrinking. A 512px JPEG lands far under the limit no
// matter how large the original camera shot was, and an avatar is never
// rendered bigger than that anyway.
const AVATAR_SIZE = 512;
const AVATAR_QUALITY = 0.7;

export const userService = {
  /**
   * Resizes a picked image, uploads it, and returns the hosted URL.
   */
  async uploadProfileImage(uri: string): Promise<{ photoURL: string; user?: User }> {
    const rendered = await ImageManipulator.manipulate(uri)
      .resize({ width: AVATAR_SIZE })
      .renderAsync();
    const resized = await rendered.saveAsync({ compress: AVATAR_QUALITY, format: SaveFormat.JPEG });

    const form = new FormData();
    form.append('image', { uri: resized.uri, name: 'profile.jpg', type: 'image/jpeg' } as any);

    // api defaults every request to application/json, and axios quietly turns a
    // FormData body into JSON when it sees that content type — the file would
    // vanish and the server would answer "Image file is required". React
    // Native's networking layer supplies the multipart boundary itself, so
    // naming the type without one is safe here.
    const { data } = await api.post('/users/profile/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { photoURL: data.photoURL, user: data.user };
  },
};
