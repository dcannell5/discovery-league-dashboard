import { Player, PlayerWithStats, DailyCourtMatchups, GameMatchup, Team, LeagueConfig } from '../types';

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Creates game matchups from a group of players for a court.
 * @param courtPlayers The players on the court for the day.
 * @param playersPerTeam The number of players on each team (for custom mode, this is per side).
 * @param gamesPerDay The number of games to generate.
 * @returns An array of GameMatchup objects.
 */
function createMatchupsForCourt(courtPlayers: Player[], playersPerTeam: number, gamesPerDay: number): GameMatchup[] {
    const matchups: GameMatchup[] = [];
    const playersPerCourt = playersPerTeam * 2;
    if (courtPlayers.length < playersPerCourt) {
        console.warn(`Attempted to create matchups for a group of ${courtPlayers.length} players. Required: ${playersPerCourt}.`);
        return Array(gamesPerDay).fill({ teamA: [], teamB: [] });
    }

    for (let i = 0; i < gamesPerDay; i++) {
        const shuffled = shuffle(courtPlayers);
        const teamA: Team = shuffled.slice(0, playersPerTeam);
        const teamB: Team = shuffled.slice(playersPerTeam, playersPerCourt);
        matchups.push({ teamA, teamB });
    }
    return matchups;
}

export function getDefaultCourtName(index: number, totalCourts: number): string {
    if (totalCourts === 3) {
        if (index === 0) return 'Royalty Court';
        if (index === 1) return 'Challenger Court';
        if (index === 2) return 'Foundation Court';
    }
    if (totalCourts === 1) {
        return 'Royalty Court';
    }
    if (totalCourts === 2) {
        return index === 0 ? 'Royalty Court' : 'Foundation Court';
    }
    if (index === 0) return 'Royalty Court';
    if (index === totalCourts - 1) return 'Foundation Court';
    
    return `Challenger Court ${index}`;
}


/**
 * Gets a list of all court names for the league.
 * Prioritizes custom names from config, otherwise generates default hierarchical names.
 * @param leagueConfig The configuration object for the league.
 * @returns An array of court name strings in the correct hierarchical order.
 */
export function getAllCourtNames(leagueConfig: LeagueConfig): string[] {
    const { numCourts, courtNames } = leagueConfig;
    
    if (numCourts === 0) return [];

    // Use custom court names if they are provided and match the required number
    if (courtNames && courtNames.length === numCourts) {
        return courtNames;
    }

    // Otherwise, generate default names
    const defaultNames: string[] = [];
    for (let i = 0; i < numCourts; i++) {
        defaultNames.push(getDefaultCourtName(i, numCourts));
    }
    return defaultNames;
}


/**
 * Generates matchups for an event where all players are mixed for each game.
 * Used for Day 1 of Standard Leagues or all days of Custom Tournaments.
 * @param allPlayers The entire list of players in the league.
 * @param leagueConfig The configuration object for the league.
 * @returns A DailyCourtMatchups object with varied players on each court for each game.
 */
function generateDiscoveryPairingMatchups(allPlayers: Player[], leagueConfig: LeagueConfig): DailyCourtMatchups {
    const { playersPerTeam, numCourts, gamesPerDay } = leagueConfig;
    const playersPerCourt = playersPerTeam * 2;
    
    if (numCourts === 0) return {};

    const courtNames = getAllCourtNames(leagueConfig);
    const dailyMatchups: DailyCourtMatchups = {};
    courtNames.forEach(name => dailyMatchups[name] = []);

    // Generate games, re-shuffling all players for each game to ensure variation
    for (let gameIndex = 0; gameIndex < gamesPerDay; gameIndex++) {
        const playerPool = shuffle([...allPlayers]);

        // Assign players to courts for this specific game
        for (let courtIndex = 0; courtIndex < numCourts; courtIndex++) {
            const courtName = courtNames[courtIndex];
            
            if (playerPool.length < playersPerCourt) {
                // Not enough players left for a full game on this court
                dailyMatchups[courtName].push({ teamA: [], teamB: [] });
                continue;
            }

            const courtPlayers = playerPool.splice(0, playersPerCourt);
            const teamA = courtPlayers.slice(0, playersPerTeam);
            const teamB = courtPlayers.slice(playersPerTeam);
            
            dailyMatchups[courtName].push({ teamA, teamB });
        }
    }
    return dailyMatchups;
}

/**
 * Generates matchups for Day 2+ of a Standard League, where players are grouped by rank onto courts.
 * @param sortedPlayers Players pre-sorted by their rank/points.
 * @param leagueConfig The configuration object for the league.
 * @returns A DailyCourtMatchups object with fixed player groups on each court.
 */
function generateRankedMatchups(sortedPlayers: PlayerWithStats[], leagueConfig: LeagueConfig): DailyCourtMatchups {
    const matchups: DailyCourtMatchups = {};
    const { playersPerTeam, numCourts, gamesPerDay } = leagueConfig;
    const playersPerCourt = playersPerTeam * 2;

    if (numCourts === 0) return {};
    
    const courtNames = getAllCourtNames(leagueConfig);

    for (let i = 0; i < numCourts; i++) {
        const courtName = courtNames[i];
        const startIndex = i * playersPerCourt;
        const endIndex = startIndex + playersPerCourt;
        
        if (sortedPlayers.length < endIndex) continue; // Not enough players for this court
        
        const courtPlayers = sortedPlayers.slice(startIndex, endIndex);
        matchups[courtName] = createMatchupsForCourt(courtPlayers, playersPerTeam, gamesPerDay);
    }
    
    return matchups;
}


/**
 * Generates all game matchups for a given day based on league rules.
 * This function acts as a dispatcher to different generation logics.
 * @param day The day number (1-based).
 * @param players A list of players, which should be pre-sorted for days 2+.
 * @param leagueConfig The configuration object for the league.
 * @returns A DailyCourtMatchups object containing all matchups for all courts.
 */
export function generateDailyMatchups(day: number, players: PlayerWithStats[], leagueConfig: LeagueConfig): DailyCourtMatchups {
    const { leagueType } = leagueConfig;

    if (leagueType === 'custom') {
        // Custom tournaments always use discovery pairing
        return generateDiscoveryPairingMatchups(players, leagueConfig);
    } 
    
    // Standard League Logic
    if (day === 1) {
        // For Day 1, use the special mixing logic. It ignores pre-sorting.
        return generateDiscoveryPairingMatchups(players, leagueConfig);
    } else {
        // For Day 2+, use ranking-based grouping. It requires pre-sorted players.
        return generateRankedMatchups(players, leagueConfig);
    }
}
