import { PlayerWithStats, AllDailyMatchups, AllDailyResults, GameMatchup } from "../types";

/**
 * Calculates the head-to-head wins between two players.
 * @returns 'a' if playerA won more, 'b' if playerB won more, 'tie' otherwise.
 */
function getHeadToHeadResult(playerA: PlayerWithStats, playerB: PlayerWithStats, allMatchups: AllDailyMatchups, allResults: AllDailyResults, maxDay: number): 'a' | 'b' | 'tie' {
    let aWins = 0;
    let bWins = 0;

    for (let day = 1; day <= maxDay; day++) {
        const dayMatchups = allMatchups[day];
        const dayResults = allResults[day];
        if (!dayMatchups || !dayResults) continue;

        for (const court of Object.keys(dayMatchups)) {
            const courtMatchups = dayMatchups[court as keyof typeof dayMatchups]!;
            const courtResults = dayResults[court as keyof typeof dayResults];
            if (!courtResults) continue;

            courtMatchups.forEach((matchup: GameMatchup, gameIndex: number) => {
                const result = courtResults[gameIndex];
                if (result === 'unplayed' || result.teamAScore === null || result.teamBScore === null) return;

                const aOnTeamA = matchup.teamA.some(p => p.id === playerA.id);
                const bOnTeamA = matchup.teamA.some(p => p.id === playerB.id);
                const aOnTeamB = matchup.teamB.some(p => p.id === playerA.id);
                const bOnTeamB = matchup.teamB.some(p => p.id === playerB.id);

                // Check if they played against each other
                if ((aOnTeamA && bOnTeamB) || (aOnTeamB && bOnTeamA)) {
                    if (result.teamAScore > result.teamBScore) { // Team A wins
                        if (aOnTeamA) aWins++; else bWins++;
                    } else if (result.teamBScore > result.teamAScore) { // Team B wins
                        if (aOnTeamB) aWins++; else bWins++;
                    }
                }
            });
        }
    }

    if (aWins > bWins) return 'a';
    if (bWins > aWins) return 'b';
    return 'tie';
}


/**
 * Sorts players using a multi-level tie-breaking system.
 */
export function sortPlayersWithTieBreaking(
    players: PlayerWithStats[], 
    allMatchups: AllDailyMatchups, 
    allResults: AllDailyResults, 
    maxDay: number = Infinity
): PlayerWithStats[] {
    const sortedPlayers = [...players];

    sortedPlayers.sort((a, b) => {
        // 1. League Points (Primary)
        if (a.leaguePoints !== b.leaguePoints) {
            return b.leaguePoints - a.leaguePoints;
        }

        // --- TIE-BREAKING CRITERIA ---

        // 2. PF/PA Ratio
        const ratioA = a.pointsAgainst === 0 ? (a.pointsFor > 0 ? Infinity : 0) : a.pointsFor / a.pointsAgainst;
        const ratioB = b.pointsAgainst === 0 ? (b.pointsFor > 0 ? Infinity : 0) : b.pointsFor / b.pointsAgainst;
        if (ratioA !== ratioB) {
            return ratioB - ratioA;
        }

        // 3. Points For
        if (a.pointsFor !== b.pointsFor) {
            return b.pointsFor - a.pointsFor;
        }
        
        // 4. Points Against (lower is better)
        if (a.pointsAgainst !== b.pointsAgainst) {
            return a.pointsAgainst - b.pointsAgainst;
        }

        // 5. Head-to-Head (as a deeper tie-breaker)
        const h2h = getHeadToHeadResult(a, b, allMatchups, allResults, maxDay);
        if (h2h === 'a') return -1;
        if (h2h === 'b') return 1;


        // 6. Stable Sort Key (Player ID)
        return a.id - b.id;
    });

    return sortedPlayers;
}
