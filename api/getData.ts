
import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';

// A minimal, empty structure to initialize the database on first load.
// This is defined directly here to avoid build issues with cross-directory imports in Vercel serverless functions.
const initialAppData: AppData = {
  leagues: {},
  dailyResults: {},
  allDailyMatchups: {},
  allDailyAttendance: {},
  allPlayerProfiles: {},
  allRefereeNotes: {},
  allAdminFeedback: {},
  allPlayerFeedback: {},
  allPlayerPINs: {},
  loginCounters: {},
  activeLeagueId: null,
  upcomingEvent: {
    title: 'Next League Registration Open!',
    description: 'Registration for the Fall Discovery League is now open. Sign up early to secure your spot!',
    buttonText: 'Register Now',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/',
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await kv.get('discoveryLeagueData');

    // If no data exists in the database (e.g., first-time run),
    // seed it with a clean, minimal initial state.
    if (!appData) {
      console.log('No data found in Vercel KV, initializing with empty data structure.');
      appData = initialAppData;
      await kv.set('discoveryLeagueData', appData);
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("Error fetching data from Vercel KV:", error);
    // If the database connection fails, return the default empty state
    // so the app can still load, but don't save it to the DB.
    res.status(500).json(initialAppData);
  }
}
