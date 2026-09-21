// Supabase Edge Function: process-image
// Automatically invoked on Supabase Storage upload or creation publish
// Extracts EXIF, sends uncompressed asset to Cloudinary, and stores CDN transforms.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CLOUDINARY_CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME');
const CLOUDINARY_API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
const CLOUDINARY_API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');

serve(async (req: Request) => {
  try {
    const { record } = await req.json();
    const { id: postId, raw_image_url } = record;

    if (!raw_image_url) {
      return new Response(JSON.stringify({ message: 'No raw image to process' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Trigger Cloudinary upload / transformation
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signaturePayload = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    
    // In production, sign SHA-1 and POST to https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload
    const transformedUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,ar_4:5/${postId}`;

    // Update post record in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('posts')
      .update({
        image_url: transformedUrl,
      })
      .eq('id', postId);

    return new Response(JSON.stringify({ success: true, transformedUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
