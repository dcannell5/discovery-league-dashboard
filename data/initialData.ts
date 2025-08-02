
export interface Player {
  id: number;
  name: string;
  grade?: number; // Optional as it might not be part of initial data
}

export interface PlayerWithStats extends Player {
    leaguePoints: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    ties: number;
    dailyPoints: Record<number, number>;
    pointsFor: number;
    pointsAgainst: number;
    pointDifferential: number;
}

export type Team = Player[];

export type GameResult = { teamAScore: number | null; teamBScore: number | null } | 'unplayed';

export type CourtResults = GameResult[];

export type DailyResults = {
  [courtKey: string]: CourtResults;
};

export type AllDailyResults = Record<number, DailyResults>;

export interface GameMatchup {
  teamA: Team;
  teamB: Team;
}

export type DailyCourtMatchups = Record<string, GameMatchup[]>;

export type AllDailyMatchups = Record<number, DailyCourtMatchups>;

// --- User and Auth Types ---
export type UserState = 
  | { role: 'NONE' }
  | { role: 'SUPER_ADMIN' }
  | { role: 'REFEREE', court: string }
  | { role: 'PLAYER', playerId: number }
  | { role: 'PARENT', playerId: number };

// --- Attendance Types ---
export type PlayerDailyAttendance = boolean[];
export type DailyAttendance = Record<number, PlayerDailyAttendance>;
export type AllDailyAttendance = Record<number, DailyAttendance>;

// --- League Configuration ---
export interface LeagueConfig {
    id: string; // Unique ID for each league
    title: string;
    totalDays: number;
    players: Player[];
    announcements: string;
    daySchedules?: Record<number, string>;
    lockedDays?: Record<number, boolean>;
    
    // New structure for flexibility
    leagueType: 'standard' | 'custom';
    numCourts: number;
    playersPerTeam: number;
    gamesPerDay: number;
    
    // Optional custom names
    courtNames?: string[];

    // Optional seeded stats for import
    seededStats?: Record<number, Partial<PlayerWithStats>>;
}

// --- Player Profile Types ---
export interface PlayerProfile {
  imageUrl?: string;
  bio?: string;
  suggestions?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
}

export type AllPlayerProfiles = Record<number, PlayerProfile>;

// --- Referee Notes Types ---
export interface RefereeNote {
  note: string;
  day: number;
  court: string;
  date: string;
}
export type AllRefereeNotes = Record<number, RefereeNote[]>; // Keyed by Player ID

// --- Admin Feedback Types ---
export interface AdminFeedback {
  id: string;
  feedbackText: string;
  submittedBy: {
    role: 'REFEREE';
    court: string;
  };
  submittedAt: string;
}

export interface PlayerFeedback {
  id: string;
  feedbackText: string;
  submittedBy: {
    role: 'PLAYER' | 'PARENT';
    playerId: number;
    playerName: string;
  };
  submittedAt: string;
}


// --- AI Service Types ---
export interface CoachingTip {
    skillTip: {
        title: string;
        content: string;
    };
    quote: {
        text: string;
        author: string;
    };
    communicationTip: string;
}

// --- Upcoming Event Type ---
export interface UpcomingEvent {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
}

// --- Login Tracking Types ---
export interface LoginCounts {
  playerLogins: number;
  parentLogins: number;
}


// --- Top-level Application Data Structure for Multi-League ---
export interface AppData {
    leagues: Record<string, Omit<LeagueConfig, 'id'>>;
    dailyResults: Record<string, AllDailyResults>;
    allDailyMatchups: Record<string, AllDailyMatchups>;
    allDailyAttendance: Record<string, AllDailyAttendance>;
    allPlayerProfiles: Record<string, AllPlayerProfiles>;
    allRefereeNotes: Record<string, AllRefereeNotes>;
    allAdminFeedback?: Record<string, AdminFeedback[]>; // leagueId -> referee feedback[]
    allPlayerFeedback?: Record<string, PlayerFeedback[]>; // leagueId -> player/parent feedback[]
    allPlayerPINs?: Record<string, Record<number, string>>; // leagueId -> playerId -> PIN
    loginCounters?: Record<string, Record<number, LoginCounts>>; // leagueId -> playerId -> LoginCounts
    activeLeagueId?: string | null;
    upcomingEvent?: UpcomingEvent;
}
