import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UploadResult {
  uri: string;
  publicUrl: string;
  error: string | null;
}

export function useImageUpload() {
  const { user, isMockMode } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickImage = useCallback(
    async (options?: {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
      mediaTypes?: ImagePicker.MediaType;
    }): Promise<ImagePicker.ImagePickerAsset | null> => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options?.mediaTypes || ('images' as ImagePicker.MediaType),
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect || [4, 5],
        quality: options?.quality ?? 0.8,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      return result.assets[0];
    },
    []
  );

  const takePhoto = useCallback(async (): Promise<ImagePicker.ImagePickerAsset | null> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return result.assets[0];
  }, []);

  const uploadImage = useCallback(
    async (asset: ImagePicker.ImagePickerAsset, bucket = 'posts'): Promise<UploadResult> => {
      if (isMockMode || !user?.id) {
        // In mock mode, just return the local URI
        return { uri: asset.uri, publicUrl: asset.uri, error: null };
      }

      setUploading(true);
      setProgress(0);

      try {
        const ext = asset.uri.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        // Read file as blob
        const response = await fetch(asset.uri);
        const blob = await response.blob();

        setProgress(30);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, blob, {
            contentType: asset.mimeType || `image/${ext}`,
            upsert: false,
          });

        setProgress(80);

        if (error) {
          setUploading(false);
          setProgress(0);
          return { uri: asset.uri, publicUrl: '', error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        setProgress(100);
        setUploading(false);

        return {
          uri: asset.uri,
          publicUrl: urlData.publicUrl,
          error: null,
        };
      } catch (err) {
        setUploading(false);
        setProgress(0);
        return {
          uri: asset.uri,
          publicUrl: '',
          error: (err as Error).message,
        };
      }
    },
    [user?.id, isMockMode]
  );

  return { pickImage, takePhoto, uploadImage, uploading, progress };
}
