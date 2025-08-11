

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

    if (appData) {
      return res.status(200).json(appData);
    }

    // Data not found. Check if the database has ever been initialized.
    const isInitialized = await kv.get('db_initialized_flag');

    if (!isInitialized) {
      // This appears to be a genuine first-time setup.
      console.log('No data found and DB is not initialized. Seeding with preset data.');
      appData = createPresetAppData();
      // Set both the data and the initialization flag.
      await kv.set('discoveryLeagueData', appData);
      await kv.set('db_initialized_flag', 'true');
      return res.status(200).json(appData);
    } else {
      // The data is missing, but the DB was initialized.
      // This is a critical error, indicating data loss or a KV store issue.
      // We must not re-seed the data, as that would wipe the league.
      console.error("CRITICAL: 'discoveryLeagueData' key is missing, but 'db_initialized_flag' is set. This indicates a data loss event or a transient KV error. Returning an error response to prevent data overwrite.");

      // Return an error response with a minimal, valid data structure to prevent the frontend from crashing.
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
            title: 'Critical Error',
            description: 'The application database is in an inconsistent state. Please contact support.',
            buttonText: '',
            buttonUrl: '#',
          }
      };
      return res.status(500).json(minimalData);
    }
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
