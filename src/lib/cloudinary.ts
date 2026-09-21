/**
 * Cloudinary image delivery and transformation helpers
 * Handles dynamic crops, webp/avif auto-formatting, and quality optimization.
 */

const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  aspectRatio?: '4:5' | '16:9' | '1:1' | string;
  crop?: 'fill' | 'scale' | 'thumb' | 'fit';
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  blur?: number;
}

export function getOptimizedImageUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url) return '';

  // If already a direct HTTPS asset (e.g. Google Storage / starter previews), return directly
  // unless Cloudinary fetch proxy is enabled
  if (!cloudName) {
    return url;
  }

  const {
    width,
    height,
    aspectRatio,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (crop) transforms.push(`c_${crop}`);
  if (aspectRatio) transforms.push(`ar_${aspectRatio.replace(':', ':')}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);

  const transformString = transforms.join(',');

  // If it is a Cloudinary upload ID or path
  if (!url.startsWith('http')) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${url}`;
  }

  // Cloudinary fetch proxy for external images
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformString}/${encodeURIComponent(url)}`;
}
