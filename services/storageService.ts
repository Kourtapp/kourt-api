import { supabase } from '@/lib/supabase';
import { readAsStringAsync } from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export const storageService = {
  /**
   * Upload avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
    try {
      // Read file as base64
      const base64 = await readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Get file extension
      const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      // Generate unique filename
      const fileName = `${userId}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  },

  /**
   * Delete old avatar from storage
   */
  async deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
      // Extract path from URL
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/avatars/');
      if (pathParts.length < 2) return false;

      const filePath = pathParts[1];

      const { error } = await supabase.storage.from('avatars').remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  },

  /**
   * Upload generic image (for courts, matches, etc.)
   */
  async uploadImage(
    bucket: string,
    path: string,
    imageUri: string
  ): Promise<string | null> {
    try {
      const base64 = await readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), {
          contentType,
          upsert: true,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  },
};
