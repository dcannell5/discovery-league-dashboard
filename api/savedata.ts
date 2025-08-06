
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const appData = req.body as AppData;

    if (!appData || !appData.leagues) {
        return res.status(400).json({ error: 'Invalid appData format' });
    }

    await kv.set('discoveryLeagueData', appData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving data to Vercel KV:", error);
    res.status(500).json({ error: 'Failed to save data' });
  }
}
