import {
  Player,
  PlayerWithStats,
  DailyResults,
  DailyCourtMatchups,
  DailyAttendance,
  GameResult
} from '../types';

export const initializePlayerStats = (players: Player[]): Record<number, PlayerWithStats> => {
    const stats: Record<number, PlayerWithStats> = {};
    players.forEach(p => {
        stats[p.id] = { ...p, dailyPoints: {}, leaguePoints: 0, gamesPlayed: 0, wins: 0, losses: 0, ties: 0, pointsFor: 0, pointsAgainst: 0, pointDifferential: 0 };
    });
    return stats;
};

export const processDayResults = (playerStats: Record<number, PlayerWithStats>, day: number, dayResults: DailyResults | undefined, dayMatchups: DailyCourtMatchups | undefined, dayAttendance: DailyAttendance | undefined) => {
    const dailyPointsMap = new Map<number, number>();
    if (!dayResults || !dayMatchups) return;

    // Use a composite key to track processed players, preventing cross-court conflicts.
    const processedPlayersByGame = new Map<string, Set<number>>(); // Map<court-gameIndex, Set<playerId>>

    Object.keys(dayMatchups).forEach(court => {
        const courtResults = dayResults[court];
        const courtMatchups = dayMatchups[court];
        if (!courtResults || !courtMatchups) return;

        courtResults.forEach((result: GameResult, gameIndex: number) => {
            if (result === 'unplayed' || result.teamAScore === null || result.teamBScore === null) return;
            const matchup = courtMatchups[gameIndex];
            if (!matchup) return;
            
            const gameKey = `${court}-${gameIndex}`;
            if (!processedPlayersByGame.has(gameKey)) {
                processedPlayersByGame.set(gameKey, new Set<number>());
            }
            const processedPlayersThisGame = processedPlayersByGame.get(gameKey)!;

            const { teamAScore, teamBScore } = result;

            const processTeam = (team: Player[], ownScore: number, opponentScore: number) => {
                const outcome = ownScore > opponentScore ? 'win' : ownScore < opponentScore ? 'loss' : 'tie';

                team.forEach((p: Player) => {
                    if (processedPlayersThisGame.has(p.id)) {
                        return; 
                    }
                    processedPlayersThisGame.add(p.id);
                    
                    const player = playerStats[p.id];
                    if (!player) return;

                    // Ensure every player in a matchup has an entry in the daily points map, defaulting to 0.
                    if (!dailyPointsMap.has(p.id)) {
                        dailyPointsMap.set(p.id, 0);
                    }

                    const playerIsPresent = dayAttendance?.[p.id]?.[gameIndex] ?? true;
                    
                    // Only process stats if the player is marked as present for this specific game.
                    // Absent players will receive 0 points and no change to their other stats for this game.
                    if (playerIsPresent) {
                        player.gamesPlayed++;
                        player.pointsFor += ownScore;
                        player.pointsAgainst += opponentScore;

                        if (outcome === 'win') {
                            player.wins++;
                            dailyPointsMap.set(p.id, (dailyPointsMap.get(p.id) || 0) + 3);
                        } else if (outcome === 'tie') {
                            player.ties++;
                            dailyPointsMap.set(p.id, (dailyPointsMap.get(p.id) || 0) + 1);
                        } else if(outcome === 'loss') {
                            player.losses++;
                        }
                    }
                });
            };

            processTeam(matchup.teamA, teamAScore, teamBScore);
            processTeam(matchup.teamB, teamBScore, teamAScore);
        });
    });

    for (const id in playerStats) {
        if(dailyPointsMap.has(parseInt(id))) {
            playerStats[id].dailyPoints[day] = dailyPointsMap.get(parseInt(id)) || 0;
        }
    }
};
