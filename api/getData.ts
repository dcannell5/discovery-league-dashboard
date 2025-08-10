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
      // Use a new, non-nullable variable for type safety within this block.
      const data = appData;

      // --- One-time data migration for "Making the Cut" camps ---
      const allCampPlayers = [
        { id: 1, name: 'Addelyn L' }, { id: 2, name: 'Alexis H' }, { id: 3, name: 'Alexis R' }, { id: 4, name: 'Aylee M' },
        { id: 5, name: 'Brielle L' }, { id: 6, name: 'Claire F' }, { id: 7, name: 'Claire K' }, { id: 8, name: 'Dana J' },
        { id: 9, name: 'Davis A' }, { id: 10, name: 'Ellis R' }, { id: 11, name: 'Estella B' }, { id: 12, name: 'Hailey C' },
        { id: 13, name: 'Kenlyn B' }, { id: 14, name: 'Liliann C' }, { id: 15, name: 'Makayla R' }, { id: 16, name: 'Mihret W' },
        { id: 17, name: 'Nico O' }, { id: 18, name: 'Noa B' }, { id: 19, name: 'Pari R' }, { id: 20, name: 'Raychel M' },
        { id: 21, name: 'Reese G' }, { id: 22, name: 'Rylee M' }, { id: 23, name: 'Sara B' }, { id: 24, name: 'Sloane M' },
        { id: 25, name: 'Sophia Z' }, { id: 26, name: 'Stella S' }, { id: 27, name: 'Yasaman R' }, { id: 28, name: 'Yuna C' },
        { id: 29, name: 'Alexander E' }, { id: 30, name: 'Andrei R' }, { id: 31, name: 'Anthony R' }, { id: 32, name: 'Augustine S' },
        { id: 33, name: 'Austin S' }, { id: 34, name: 'Avery H' }, { id: 35, name: 'Azariah M' }, { id: 36, name: 'Braden M' },
        { id: 37, name: 'Brady L' }, { id: 38, name: 'Brayley P' }, { id: 39, name: 'Carter L' }, { id: 40, name: 'Cooper N' },
        { id: 41, name: 'Dexon S' }, { id: 42, name: 'Ellis D' }, { id: 43, name: 'Eric L' }, { id: 44, name: 'Grady W' },
        { id: 45, name: 'Graeme P' }, { id: 46, name: 'Grayson P' }, { id: 47, name: 'Griffin B' }, { id: 48, name: 'Jack W' },
        { id: 49, name: 'Josh K' }, { id: 50, name: 'Jvan M' }, { id: 51, name: 'Leo K' }, { id: 52, name: 'Nick S' },
        { id: 53, name: 'Nico J' }, { id: 54, name: 'Oliver J' }, { id: 55, name: 'Peyton S' }, { id: 56, name: 'Rylan M' },
        { id: 57, name: 'Sage L' }, { id: 58, name: 'Wesley P' }, { id: 59, name: 'Amaya R' }, { id: 60, name: 'Annabelle V' },
        { id: 61, name: 'Arravela E' }, { id: 62, name: 'Avery W' }, { id: 63, name: 'Blake M' }, { id: 64, name: 'Callie D' },
        { id: 65, name: 'Eve L' }, { id: 66, name: 'Julia S' }, { id: 67, name: 'Lydiah Ne' }, { id: 68, name: 'Maire C' },
        { id: 69, name: 'Malu P' }, { id: 70, name: 'Samantha A' }, { id: 71, name: 'Savannah D' }, { id: 72, name: 'Shaye B' },
        { id: 73, name: 'Sloan B' }, { id: 74, name: 'Teagan S' }, { id: 75, name: 'Alix A' }, { id: 76, name: 'Caitlyn G' },
        { id: 77, name: 'Charmelle S' }, { id: 78, name: 'Desirae W' }, { id: 79, name: 'Emma A' }, { id: 80, name: 'Emmy Y' },
        { id: 81, name: 'Nash T' }, { id: 82, name: 'Shayla K' }, { id: 83, name: 'Sydney E' }, { id: 84, name: 'Alana H' },
        { id: 85, name: 'Alexandra C' }, { id: 86, name: 'Alexis S' }, { id: 87, name: 'Allie C' }, { id: 88, name: 'Amaris A' },
        { id: 89, name: 'Anya C' }, { id: 90, name: 'Ashlyn H' }, { id: 91, name: 'Audrey R' }, { id: 92, name: 'Aurora P' },
        { id: 93, name: 'Bailey G' }, { id: 94, name: 'Brae U' }, { id: 95, name: 'Breanna P' }, { id: 96, name: 'Brielle I' },
        { id: 97, name: 'Brielle L' }, { id: 98, name: 'Brooklyn K' }, { id: 99, name: 'Brynn M' }, { id: 100, name: 'Brynn R' },
        { id: 101, name: 'Caris S' }, { id: 102, name: 'Danika M' }, { id: 103, name: 'Ella L' }, { id: 104, name: 'Emma V' },
        { id: 105, name: 'Emma W' }, { id: 106, name: 'Haylee F' }, { id: 107, name: 'Ifeoma U' }, { id: 108, name: 'Isabella N' },
        { id: 109, name: 'Isabella T' }, { id: 110, name: 'Isadora L' }, { id: 111, name: 'Isla M' }, { id: 112, name: 'Jadyn R' },
        { id: 113, name: 'Jordyn W' }, { id: 114, name: 'Josee R' }, { id: 115, name: 'Kendall H' }, { id: 116, name: 'Kira P' },
        { id: 117, name: 'Kya T' }, { id: 118, name: 'Leah T' }, { id: 119, name: 'Linsey L' }, { id: 120, name: 'Lizzy L' },
        { id: 121, name: 'Loah B' }, { id: 122, name: 'Lyla R' }, { id: 123, name: 'Marlo B' }, { id: 124, name: 'Mikayla W' },
        { id: 125, name: 'Misha D' }, { id: 126, name: 'Myla R' }, { id: 127, name: 'Noa K' }, { id: 128, name: 'Obimgolibe I' },
        { id: 129, name: 'Peyton P' }, { id: 130, name: 'Rachel M' }, { id: 131, name: 'Rebekah M' }, { id: 132, name: 'Sadie L' },
        { id: 133, name: 'Summer M' }, { id: 134, name: 'Vera H' }, { id: 135, name: 'Victoria M' }, { id: 136, name: 'Ziqi W' },
        { id: 137, name: 'Addy B' }, { id: 138, name: 'Athena M' }, { id: 139, name: 'Azrielle M' }, { id: 140, name: 'Bailee C' },
        { id: 141, name: 'Cindel S' }, { id: 142, name: 'Claire J' }, { id: 143, name: 'Eleanor B' }, { id: 144, name: 'Emily S' },
        { id: 145, name: 'Jahnika J' }, { id: 146, name: 'Jayden A' }, { id: 147, name: 'Kaitlyn F' }, { id: 148, name: 'Katana-M' },
        { id: 149, name: 'Katelyn H' }, { id: 150, name: 'Kaylee Y' }, { id: 151, name: 'Kendall T' }, { id: 152, name: 'Lauren M' },
        { id: 153, name: 'Lauren M' }, { id: 154, name: 'Lily B' }, { id: 155, name: 'Liv M' }, { id: 156, name: 'MINA S' },
        { id: 157, name: 'Madison M' }, { id: 158, name: 'Makenna B' }, { id: 159, name: 'Natasha S' }, { id: 160, name: 'Neven V' },
        { id: 161, name: 'Reed M' }, { id: 162, name: 'Rilynn C' }, { id: 163, name: 'Samantha Y' }, { id: 164, name: 'Shurupa S' },
        { id: 165, name: 'Sophie W' }, { id: 166, name: 'Teghan D' }, { id: 167, name: 'Violet O' }, { id: 168, name: 'Alyssa P' },
        { id: 169, name: 'Ashlynn R' }, { id: 170, name: 'Ava R' }, { id: 171, name: 'Becca B' }, { id: 172, name: 'Bennett B' },
        { id: 173, name: 'Brynn B' }, { id: 174, name: 'Cameron S' }, { id: 175, name: 'Caryss Q' }, { id: 176, name: 'Claire E' },
        { id: 177, name: 'Ella B' }, { id: 178, name: 'Elsa S' }, { id: 179, name: 'Eva M' }, { id: 180, name: 'Hayley J' },
        { id: 181, name: 'Jacine S' }, { id: 182, name: 'Jacy S' }, { id: 183, name: 'Katie H' }, { id: 184, name: 'Kenzie H' },
        { id: 185, name: 'Kloey F' }, { id: 186, name: 'Lauren B' }, { id: 187, name: 'Melia L' }, { id: 188, name: 'Nita C' },
        { id: 189, name: 'Olivia P' }, { id: 190, name: 'Peyton F' }, { id: 191, name: 'Rebekah N' }, { id: 192, name: 'Samantha M' },
        { id: 193, name: 'Sienna T' }, { id: 194, name: 'Stella M' }, { id: 195, name: 'Sydney F' }, { id: 196, name: 'Talia H' },
        { id: 197, name: 'Tasia F' }, { id: 198, name: 'Torrence I' }, { id: 199, name: 'Willow P' }
      ];

      const makingTheCutLeagues = [
        { id: 'mtc-boys-aug-11-14', title: 'Making the Cut Camp Boys August 11-14' },
        { id: 'mtc-elem-aug-11-14', title: 'Making the Cut Camp Elementary August 11-14' },
        { id: 'mtc-elite2-aug-18-21', title: 'Making the Cut Camp Elite 2 August 18-21' },
        { id: 'mtc-jr-girls-aug-18-21', title: 'Making the Cut Camp Junior Girls August 18-21' },
        { id: 'mtc-sr-girls-aug-25-28', title: 'Making the Cut Camp Senior Girls August 25-28' },
        { id: 'mtc-elite1-aug-25-28', title: 'Making the Cut Elite 1 August 25-28' }
      ].map(camp => ({
        ...camp,
        totalDays: 4,
        players: allCampPlayers,
        announcements: `Welcome to the ${camp.title}!`,
        leagueType: 'standard' as const,
        numCourts: 2,
        playersPerTeam: 4,
        gamesPerDay: 3,
        lockedDays: {},
      }));

      let needsSave = false;

      // Defensively ensure all top-level objects exist before migrating
      data.leagues = data.leagues || {};
      data.dailyResults = data.dailyResults || {};
      data.allDailyMatchups = data.allDailyMatchups || {};
      data.allDailyAttendance = data.allDailyAttendance || {};
      data.allPlayerProfiles = data.allPlayerProfiles || {};
      data.allRefereeNotes = data.allRefereeNotes || {};
      data.allAdminFeedback = data.allAdminFeedback || {};
      data.allPlayerFeedback = data.allPlayerFeedback || {};
      data.allPlayerPINs = data.allPlayerPINs || {};
      data.loginCounters = data.loginCounters || {};
      data.projectLogs = data.projectLogs || [];

      makingTheCutLeagues.forEach(league => {
        if (!data.leagues[league.id]) {
          console.log(`Migrating data: Adding league '${league.title}'`);
          const { id, ...config } = league;
          data.leagues[id] = config;

          // Initialize empty data slices for the new league
          data.dailyResults[id] = {};
          data.allDailyMatchups[id] = {};
          data.allDailyAttendance[id] = {};
          data.allPlayerProfiles[id] = {};
          data.allRefereeNotes[id] = {};
          data.allAdminFeedback[id] = [];
          data.allPlayerFeedback[id] = [];
          data.allPlayerPINs[id] = {};
          data.loginCounters[id] = {};
          needsSave = true;
        }
      });

      if (needsSave) {
        await kv.set('discoveryLeagueData', data);
        console.log('Finished migrating new leagues to database.');
      }

      // --- One-time data migration for recap blog post ---
      const recapPost = {
        id: 'recap-2025-08-09',
        date: '2025-08-09',
        title: 'A Day of Foundational Improvements: Data Integrity, Testing, and New Content',
        isPublished: true,
        content: `Today was a hugely productive day for the academy application. We tackled several core challenges and laid a robust foundation for future growth. Here’s a quick recap of what we accomplished together:

### 1. Solved a Critical Data Persistence Bug
We started by fixing a major issue where the application's data would occasionally be wiped on Vercel. We implemented a new data integrity check (an "initialization flag") to make the app's connection to its database much more resilient. This ensures that all the league and player data you input is safe from accidental resets caused by temporary server errors.

### 2. Introduced an Automated Test Suite
To improve long-term stability and prevent future bugs, we integrated the **Vitest** testing framework into the project. I wrote the first set of tests for the core API, which validates the data handling logic we just hardened. This is a critical step in building a professional, scalable application.

### 3. Migrated New "Making the Cut" Content
This was our biggest task and a great example of collaborative development. My initial approach was to add the camp info as a simple page, but your insight that each camp was its own four-day league allowed us to pivot to a much better solution. We successfully modeled all six camps as proper leagues within the app's data structure. This is the right way to do it, and it paves the way for adding more complex features like registration and scheduling for these events down the road.

We hit a few environmental snags with the local development server, but we pushed through them and got the code into a solid state.

Overall, today was all about building a strong, reliable foundation. The app is now more robust, better tested, and better structured to support the exciting vision you have for it.`
      };

      const recapPostExists = data.projectLogs?.some(log => log.id === recapPost.id);
      if (!recapPostExists) {
        console.log("Migrating data: Adding recap blog post.");
        data.projectLogs = data.projectLogs || [];
        data.projectLogs.unshift(recapPost);
        // Save the data again if this migration runs
        await kv.set('discoveryLeagueData', data);
      }

      return res.status(200).json(data);
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
