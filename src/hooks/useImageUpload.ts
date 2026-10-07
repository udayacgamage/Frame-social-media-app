import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export type StorageBucket = 'posts' | 'avatars' | 'stories';

interface UploadResult {
  uri: string;
  publicUrl: string;
  error: string | null;
}

interface UploadOptions {
  upsert?: boolean;
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Use global atob if available (Web and Hermes React Native)
  if (typeof atob === 'function') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Pure JavaScript base64 decoder fallback
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  const len = base64.length;
  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;
  }

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < len; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    if (base64[i + 2] !== '=') bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    if (base64[i + 3] !== '=') bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
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
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      return result.assets[0];
    },
    []
  );

  const takePhoto = useCallback(
    async (options?: {
      allowsEditing?: boolean;
      aspect?: [number, number];
      quality?: number;
    }): Promise<ImagePicker.ImagePickerAsset | null> => {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect || [4, 5],
        quality: options?.quality ?? 0.8,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return null;
      }

      return result.assets[0];
    },
    []
  );

  const uploadImage = useCallback(
    async (
      asset: ImagePicker.ImagePickerAsset,
      bucket: StorageBucket = 'posts',
      options: UploadOptions = {}
    ): Promise<UploadResult> => {
      if (isMockMode || !user?.id) {
        // In mock mode or when unauthenticated, return the local URI
        return { uri: asset.uri, publicUrl: asset.uri, error: null };
      }

      setUploading(true);
      setProgress(10);

      try {
        const rawExt = (asset.uri.split('.').pop() || 'jpg').split('?')[0].toLowerCase();
        const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
        const fileName = `${user.id}/${Date.now()}.${ext}`;

        // Prepare upload body: Uint8Array from base64 (fastest & reliable on RN) or Blob on web
        let uploadBody: any;
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(asset.uri);
            uploadBody = await response.blob();
          } catch {
            if (asset.base64) {
              uploadBody = base64ToUint8Array(asset.base64);
            } else {
              throw new Error('Unable to read selected image data');
            }
          }
        } else if (asset.base64) {
          uploadBody = base64ToUint8Array(asset.base64);
        } else {
          const response = await fetch(asset.uri);
          uploadBody = await response.blob();
        }

        setProgress(40);

        const contentType =
          asset.mimeType ||
          (ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'png'
            ? 'image/png'
            : ext === 'webp'
            ? 'image/webp'
            : `image/${ext}`);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, uploadBody, {
            contentType,
            upsert: options.upsert ?? false,
          });

        setProgress(85);

        if (error) {
          setUploading(false);
          setProgress(0);
          return { uri: asset.uri, publicUrl: '', error: error.message };
        }

        // Generate public URL
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
      } catch (err: any) {
        setUploading(false);
        setProgress(0);
        return {
          uri: asset.uri,
          publicUrl: '',
          error: err?.message || 'Failed to upload image',
        };
      }
    },
    [user?.id, isMockMode]
  );

  return { pickImage, takePhoto, uploadImage, uploading, progress };
}

