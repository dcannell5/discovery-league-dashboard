import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Crucial check: Ensure Vercel Blob storage is configured on the server.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ error: 'Image storage is not configured. Please connect a Vercel Blob store to your project in the Vercel dashboard.' });
  }

  try {
    const { file: fileAsDataURL, fileName } = req.body;

    if (!fileAsDataURL || typeof fileAsDataURL !== 'string' || !fileName) {
      return res.status(400).json({ error: 'Invalid file data or missing filename.' });
    }

    // Extract the base64 part of the data URL
    const base64Data = fileAsDataURL.split(';base64,').pop();
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid data URL format.' });
    }

    // Convert base64 to a Buffer
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    const blob = await put(fileName, fileBuffer, {
      access: 'public',
      // You could add caching headers here if needed, e.g.,
      // cacheControlMaxAge: 31536000, 
    });

    return res.status(200).json({ url: blob.url });
  } catch (error: any) {
    console.error('Error uploading to Vercel Blob:', error);
    return res.status(500).json({ error: 'Failed to upload image.', details: error.message });
  }
}
