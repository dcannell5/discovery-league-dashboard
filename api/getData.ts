

import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AppData } from '../types';
import { presetData } from '../data/presetSchedule.js';

const createPresetAppData = (): AppData => {
  const newLeagueId = 'summer-league-preset-2025';
  const { config, matchups, dailyResults } = presetData;

  const appData: AppData = {
    leagues: {
      [newLeagueId]: config
    },
    allDailyMatchups: {
      [newLeagueId]: matchups
    },
    dailyResults: {
      [newLeagueId]: dailyResults
    },
    allDailyAttendance: {
      [newLeagueId]: {}
    },
    allPlayerProfiles: {
      [newLeagueId]: {}
    },
    allRefereeNotes: {
      [newLeagueId]: {}
    },
    allAdminFeedback: {
      [newLeagueId]: []
    },
    allPlayerFeedback: {
      [newLeagueId]: []
    },
    allPlayerPINs: {
      [newLeagueId]: {}
    },
    loginCounters: {
      [newLeagueId]: {}
    },
    activeLeagueId: null, // Start at the hub page
    upcomingEvent: {
      title: 'Next League Registration Open!',
      description: 'Registration for the Fall Discovery League is now open. Sign up early to secure your spot!',
      buttonText: 'Register Now',
      buttonUrl: 'https://canadianeliteacademy.corsizio.com/',
    },
  };
  return appData;
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let appData: AppData | null = await kv.get('discoveryLeagueData');

    // If no data exists in the database (e.g., first-time run),
    // seed it with the preset summer league data.
    if (!appData) {
      console.log('No data found in Vercel KV, initializing with preset league data.');
      appData = createPresetAppData();
      await kv.set('discoveryLeagueData', appData);
    }
    
    res.status(200).json(appData);
  } catch (error) {
    console.error("Error fetching data from Vercel KV:", error);
    // On error, return an empty but valid structure to prevent frontend crash
    const minimalData: AppData = {
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
          title: 'Error Loading Data',
          description: 'Could not connect to the database. Please try again later.',
          buttonText: '',
          buttonUrl: '#',
        }
    };
    res.status(500).json(minimalData);
  }
}
