
import { AppData } from '../types';

export const initialAppData: AppData = {
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
