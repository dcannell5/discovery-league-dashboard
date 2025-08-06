
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { dbData } from '../data/database.ts';
import type { AppData } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await kv.get('discoveryLeagueData');

    if (!appData) {
      console.log('No data found in Vercel KV, seeding with default data.');
      appData = dbData as AppData;
      // Also set it in KV for subsequent requests
      await kv.set('discoveryLeagueData', appData);
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("Error fetching data from Vercel KV:", error);
    // Return the fallback data in case of a KV error to keep the app functional
    res.status(500).json(dbData as AppData);
  }
}
