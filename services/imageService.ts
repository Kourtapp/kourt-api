import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ImageService {
  // Request camera permissions
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  // Request media library permissions
  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  // Pick image from library
  async pickImage(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<string | null> {
    const hasPermission = await this.requestMediaLibraryPermission();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return result.assets[0].uri;
  }

  // Take photo with camera
  async takePhoto(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<string | null> {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return result.assets[0].uri;
  }

  // Upload image to Supabase Storage
  async uploadProfileImage(
    userId: string,
    imageUri: string
  ): Promise<ImageUploadResult> {
    try {
      // Get base64 from URI
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;

      // Generate unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', userId);

      return { success: true, url: urlData.publicUrl };
    } catch (err: any) {
      console.error('Upload error:', err);
      return { success: false, error: err.message || 'Erro ao fazer upload' };
    }
  }

  // Upload match photo
  async uploadMatchPhoto(
    matchId: string,
    userId: string,
    imageUri: string
  ): Promise<ImageUploadResult> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64 = await base64Promise;

      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${matchId}/${userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('match-photos')
        .upload(fileName, decode(base64), {
          contentType: `image/${fileExt}`,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('match-photos')
        .getPublicUrl(fileName);

      return { success: true, url: urlData.publicUrl };
    } catch (err: any) {
      console.error('Upload error:', err);
      return { success: false, error: err.message || 'Erro ao fazer upload' };
    }
  }

  // Delete image from storage
  async deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      return !error;
    } catch {
      return false;
    }
  }
}

export const imageService = new ImageService();
