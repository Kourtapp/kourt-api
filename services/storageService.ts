import { supabase } from '@/lib/supabase';
import { File } from 'expo-file-system/next';
import { decode } from 'base64-arraybuffer';

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const storageService = {
  /**
   * Upload avatar image to Supabase Storage
   */
  async uploadAvatar(userId: string, imageUri: string): Promise<string | null> {
    try {
      // Read file using new File API
      const file = new File(imageUri);
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

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
      // Read file using new File API
      const file = new File(imageUri);
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);

      const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, decode(base64), {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`Storage error [${bucket}]:`, error.message);
        // Check if bucket doesn't exist
        if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
          console.error(`Bucket "${bucket}" não existe. Crie-o no Supabase Dashboard > Storage.`);
        }
        throw error;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error?.message || error);
      return null;
    }
  },
};
