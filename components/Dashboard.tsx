

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Player, AllDailyResults, GameResult, UserState, AllDailyMatchups, PlayerWithStats, AllDailyAttendance, LeagueConfig, CourtResults, CoachingTip, AdminFeedback, PlayerFeedback, AppData } from '../types';
import { generateCoachingTip } from '../services/geminiService';
import { generateDailyMatchups, getAllCourtNames } from '../utils/leagueLogic';
import { sortPlayersWithTieBreaking } from '../utils/rankingLogic';
import { getActiveDay } from '../utils/auth';
import { initializePlayerStats, processDayResults } from '../utils/statsLogic';
import Header from './Header';
import Leaderboard from './Leaderboard';
import DaySelector from './DaySelector';
import DailyGroups from './DailyGroups';
import PlayerTable from './PlayerTable';
import ScoreEntryDashboard from './ScoreEntryDashboard';
import Announcements from './Announcements';
import AdminPanel from './AdminPanel';
import LinksAndShare from './LinksAndShare';
import PlayerAttendancePanel from './PlayerAttendancePanel';
import { IconTrophy, IconUserSwap, IconLightbulb, IconQuote, IconVolleyball, IconAcademicCap, IconVideo } from './Icon';
import PlayerCard from './PlayerCard';
import { videoTips } from '../data/videoTips';

interface DashboardProps {
    appData: AppData;
    setAppData: React.Dispatch<React.SetStateAction<AppData | null>>;
    leagueConfig: LeagueConfig;
    userState: UserState;
    onLoginClick: () => void;
    onLogout: () => void;
    onDeleteLeague: () => void;
    onSwitchLeague: () => void;
    onAnnouncementsSave: (newText: string) => void;
    onScheduleSave: (newSchedules: Record<number, string>) => void;
    onViewProfile: (playerId: number) => void;
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void;
    onSaveAdminFeedback: (feedbackText: string) => void;
    onSetPlayerDailyAttendance: (day: number, playerId: number, isPresent: boolean) => void;
    onToggleDayLock: (day: number) => void;
    gameResults: AllDailyResults;
    setGameResults: React.Dispatch<React.SetStateAction<AllDailyResults>>;
    allMatchups: AllDailyMatchups;
    setAllMatchups: React.Dispatch<React.SetStateAction<AllDailyMatchups>>;
    allAttendance: AllDailyAttendance;
    setAllAttendance: React.Dispatch<React.SetStateAction<AllDailyAttendance>>;
    allAdminFeedback: AdminFeedback[];
    allPlayerFeedback: PlayerFeedback[];
    allPlayerPINs: Record<number, string>;
    onResetPlayerPIN: (playerId: number) => void;
}

const InfoCard: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode, className?: string}> = ({icon, title, children, className}) => (
    <div className={`bg-gray-700/50 p-4 rounded-lg flex flex-col ${className}`}>
        <h4 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
            {icon}
            {title}
        </h4>
        <div className="text-gray-300 text-sm flex-grow">{children}</div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({
    appData, setAppData, leagueConfig, userState, onLoginClick, onLogout, onDeleteLeague, onSwitchLeague, onAnnouncementsSave, onScheduleSave, onViewProfile, onSaveRefereeNote,
    onSaveAdminFeedback,
    onSetPlayerDailyAttendance,
    onToggleDayLock,
    gameResults, setGameResults, allMatchups, setAllMatchups, allAttendance, setAllAttendance,
    allAdminFeedback, allPlayerFeedback, allPlayerPINs, onResetPlayerPIN
}) => {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [coachingTip, setCoachingTip] = useState<CoachingTip | null>(null);
  const [isLoadingCoachingTip, setIsLoadingCoachingTip] = useState<boolean>(false);
  const [coachingTipError, setCoachingTipError] = useState<string>('');
  const [featuredVideoId, setFeaturedVideoId] = useState<string | null>(null);
  const [isSwapMode, setIsSwapMode] = useState(false);
  const [playerToSwap, setPlayerToSwap] = useState<{ player: Player; gameIndex: number } | null>(null);

  const realCurrentLeagueDay = useMemo(() => getActiveDay(new Date(), leagueConfig), [leagueConfig]);
  const isDayLocked = !!leagueConfig.lockedDays?.[currentDay];

  useEffect(() => {
    // Set the initial current day based on the schedule for all users.
    setCurrentDay(realCurrentLeagueDay);
  }, [realCurrentLeagueDay]);

  // Effect to generate matchups for the current day if they don't exist.
  useEffect(() => {
    if ((allMatchups[currentDay] && Object.keys(allMatchups[currentDay]).length > 0) || leagueConfig.players.length === 0) {
      return; // Matchups already exist or no players
    }

    // This logic calculates player ranks *before* the current day to generate matchups
    const playerStats = initializePlayerStats(leagueConfig.players);
    const startDay = leagueConfig.seededStats ? 4 : 1;

    // Apply seeded stats as a baseline if they exist
    if (leagueConfig.seededStats) {
        Object.entries(leagueConfig.seededStats).forEach(([playerIdStr, seeded]) => {
            const playerId = parseInt(playerIdStr);
            if (playerStats[playerId] && seeded) {
                Object.assign(playerStats[playerId], seeded);
                playerStats[playerId].dailyPoints = {}; 
            }
        });
    }

    // Calculate stats for days AFTER the seed and BEFORE the current day
    for (let day = startDay; day < currentDay; day++) {
        processDayResults(playerStats, day, gameResults[day], allMatchups[day], allAttendance[day]);
    }

    // Sum total points from new daily points and seeded points
    Object.values(playerStats).forEach(p => {
        const newDailyTotal = Object.values(p.dailyPoints).reduce((sum: number, points: number) => sum + points, 0);
        p.leaguePoints = (p.leaguePoints || 0) + newDailyTotal; 
        p.pointDifferential = (p.pointsFor || 0) - (p.pointsAgainst || 0);
    });

    const playersForGenerator = (leagueConfig.leagueType === 'standard' && currentDay === 1)
        ? Object.values(playerStats)
        : sortPlayersWithTieBreaking(Object.values(playerStats), allMatchups, gameResults, currentDay - 1);

    const newDayMatchups = generateDailyMatchups(currentDay, playersForGenerator, leagueConfig);

    if (Object.keys(newDayMatchups).length > 0) {
      setAllMatchups(prev => ({
        ...prev,
        [currentDay]: newDayMatchups,
      }));
    }
  }, [currentDay, allMatchups, gameResults, allAttendance, leagueConfig, setAllMatchups]);
  
  // Memoized calculation for display data.
  const memoizedDisplayData = useMemo(() => {
    const stats = initializePlayerStats(leagueConfig.players);
    const startDay = leagueConfig.seededStats ? 4 : 1;

    // Apply seeded stats as a baseline if they exist
    if (leagueConfig.seededStats) {
        Object.entries(leagueConfig.seededStats).forEach(([playerIdStr, seeded]) => {
            const playerId = parseInt(playerIdStr);
            if (stats[playerId] && seeded) {
                Object.assign(stats[playerId], seeded);
                stats[playerId].dailyPoints = {};
            }
        });
    }

    // Process results for subsequent days up to the currently viewed day
    for (let day = startDay; day <= currentDay; day++) {
        processDayResults(stats, day, gameResults[day], allMatchups[day], allAttendance[day]);
    }

    // Sum up total points from *new* daily points and the seeded points.
    Object.values(stats).forEach(p => {
        const newDailyTotal = Object.values(p.dailyPoints).reduce((sum: number, points: number) => sum + points, 0);
        p.leaguePoints = (p.leaguePoints || 0) + newDailyTotal;
        p.pointDifferential = (p.pointsFor || 0) - (p.pointsAgainst || 0);
    });
    
    const displayStats = Object.values(stats);
    const sortedDisplayPlayers = sortPlayersWithTieBreaking(displayStats, allMatchups, gameResults, currentDay);

    const courtKeys = getAllCourtNames(leagueConfig);

    const dailyCourtGroups: Record<string, PlayerWithStats[]> = {};
    const matchupsForCurrentDay = allMatchups[currentDay];
    
    if (matchupsForCurrentDay && Object.keys(matchupsForCurrentDay).length > 0) {
        courtKeys.forEach(courtKey => {
            const playersMap = new Map<number, Player>();
            // Use all games to gather all players on the court for the day
            matchupsForCurrentDay[courtKey]?.forEach(game => {
                 [...game.teamA, ...game.teamB].forEach(p => {
                    if(!playersMap.has(p.id)) playersMap.set(p.id, p);
                });
            })
           
            const courtPlayersWithStats = Array.from(playersMap.keys()).map(id => sortedDisplayPlayers.find(p => p.id === id)).filter(Boolean) as PlayerWithStats[];
            dailyCourtGroups[courtKey] = sortPlayersWithTieBreaking(courtPlayersWithStats, allMatchups, gameResults, currentDay);
        });
    }

    return { 
        sortedDisplayPlayers, 
        dailyCourtGroups,
        courtKeys
    };
  }, [gameResults, currentDay, allMatchups, allAttendance, leagueConfig]);
  
  const { sortedDisplayPlayers, dailyCourtGroups, courtKeys } = memoizedDisplayData;

  useEffect(() => {
    setCoachingTip(null);
    setFeaturedVideoId(null);
    setCoachingTipError('');
  }, [currentDay]);

  const leader = useMemo(() => sortedDisplayPlayers[0] || null, [sortedDisplayPlayers]);

  const handleGameResultChange = useCallback((day: number, court: string, gameIndex: number, result: GameResult) => {
    if (leagueConfig.lockedDays?.[day]) {
      alert("This day is locked. Please ask a Super Admin to unlock it before making changes.");
      return;
    }
    setGameResults(prev => {
        const newResults: AllDailyResults = JSON.parse(JSON.stringify(prev));
        if (!newResults[day]) newResults[day] = {};
        if (!newResults[day][court]) {
            newResults[day][court] = Array(leagueConfig.gamesPerDay).fill('unplayed') as CourtResults;
        }
        newResults[day][court][gameIndex] = result;
        return newResults;
    });
  }, [setGameResults, leagueConfig.gamesPerDay, leagueConfig.lockedDays]);

  const handleAttendanceChange = useCallback((day: number, playerId: number, gameIndex: number, isPresent: boolean) => {
      if (leagueConfig.lockedDays?.[day]) {
        alert("This day is locked and attendance cannot be changed.");
        return;
      }
      setAllAttendance(prev => {
          const newAttendance: AllDailyAttendance = JSON.parse(JSON.stringify(prev));
          if (!newAttendance[day]) newAttendance[day] = {};
          if (!newAttendance[day][playerId]) newAttendance[day][playerId] = Array(leagueConfig.gamesPerDay).fill(true);
          newAttendance[day][playerId]![gameIndex] = isPresent;
          return newAttendance;
      });
  }, [setAllAttendance, leagueConfig.gamesPerDay, leagueConfig.lockedDays]);

  const handlePlayerMoveInTeam = useCallback((day: number, court: string, gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => {
    if (leagueConfig.lockedDays?.[day]) {
        alert("This day is locked and players cannot be moved.");
        return;
      }
    setAllMatchups(prev => {
        const newAllMatchups: AllDailyMatchups = JSON.parse(JSON.stringify(prev));
        const matchup = newAllMatchups[day]?.[court]?.[gameIndex];
        if (!matchup) return prev;
        const toTeam = fromTeam === 'teamA' ? 'teamB' : 'teamA';
        const playerIndex = matchup[fromTeam].findIndex((p: Player) => p.id === playerId);
        if (playerIndex === -1) return prev;
        const [player] = matchup[fromTeam].splice(playerIndex, 1);
        matchup[toTeam].push(player);
        return newAllMatchups;
    });
  }, [setAllMatchups, leagueConfig.lockedDays]);

    const handlePlayerSwapInGame = useCallback((day: number, gameIndex: number, p1: Player, p2: Player) => {
        if (leagueConfig.lockedDays?.[day]) {
            alert("This day is locked and players cannot be swapped.");
            return;
        }
        setAllMatchups(prev => {
            const newAllMatchups: AllDailyMatchups = JSON.parse(JSON.stringify(prev));
            const dayMatchups = newAllMatchups[day];
            if (!dayMatchups) return prev;

            let p1Location: { court: string, team: 'teamA' | 'teamB', playerIndex: number } | null = null;
            let p2Location: { court: string, team: 'teamA' | 'teamB', playerIndex: number } | null = null;
            
            // Find players in the specified game index across all courts
            for (const court of Object.keys(dayMatchups)) {
                const game = dayMatchups[court]?.[gameIndex];
                if (!game) continue;

                let p1Idx = game.teamA.findIndex(p => p.id === p1.id);
                if (p1Idx !== -1 && !p1Location) {
                    p1Location = { court, team: 'teamA', playerIndex: p1Idx };
                } else {
                    p1Idx = game.teamB.findIndex(p => p.id === p1.id);
                    if (p1Idx !== -1 && !p1Location) {
                        p1Location = { court, team: 'teamB', playerIndex: p1Idx };
                    }
                }

                let p2Idx = game.teamA.findIndex(p => p.id === p2.id);
                if (p2Idx !== -1 && !p2Location) {
                    p2Location = { court, team: 'teamA', playerIndex: p2Idx };
                } else {
                    p2Idx = game.teamB.findIndex(p => p.id === p2.id);
                    if (p2Idx !== -1 && !p2Location) {
                        p2Location = { court, team: 'teamB', playerIndex: p2Idx };
                    }
                }
            }
            
            // If both found, perform the swap
            if (p1Location && p2Location) {
                const p1Full = dayMatchups[p1Location.court][gameIndex][p1Location.team][p1Location.playerIndex];
                const p2Full = dayMatchups[p2Location.court][gameIndex][p2Location.team][p2Location.playerIndex];

                dayMatchups[p1Location.court][gameIndex][p1Location.team][p1Location.playerIndex] = p2Full;
                dayMatchups[p2Location.court][gameIndex][p2Location.team][p2Location.playerIndex] = p1Full;
            } else {
                console.error("Could not find both players to swap in game", gameIndex);
                return prev; // Return original state if swap failed
            }
            
            return newAllMatchups;
        });
    }, [setAllMatchups, leagueConfig.lockedDays]);

    const toggleSwapMode = useCallback(() => {
        if (isDayLocked) return;
        setIsSwapMode(prev => !prev);
        setPlayerToSwap(null); // Reset on toggle
    }, [isDayLocked]);

    const handlePlayerSelectForSwap = useCallback((player: Player, gameIndex: number) => {
        if (!isSwapMode || isDayLocked) return;

        if (!playerToSwap) {
            setPlayerToSwap({ player, gameIndex });
        } else {
            // Can't swap with self
            if (playerToSwap.player.id === player.id) {
                setPlayerToSwap(null);
                return;
            }
            // Can only swap within the same game index
            if (playerToSwap.gameIndex !== gameIndex) {
                 alert(`You can only swap players within the same game. Please select a player from Game ${playerToSwap.gameIndex + 1}.`);
                return;
            }

            handlePlayerSwapInGame(currentDay, gameIndex, playerToSwap.player, player);
            // Reset after swap
            setIsSwapMode(false);
            setPlayerToSwap(null);
        }
    }, [isSwapMode, isDayLocked, playerToSwap, handlePlayerSwapInGame, currentDay]);

  const handleGenerateCoachingTip = useCallback(async () => {
    if (!leader) return;
    setIsLoadingCoachingTip(true);
    setCoachingTip(null);
    setCoachingTipError('');
    setFeaturedVideoId(videoTips[Math.floor(Math.random() * videoTips.length)]);
    try {
      const tip = await generateCoachingTip(leagueConfig.title, leader.name, leader.leaguePoints);
      if (tip) {
        setCoachingTip(tip);
      } else {
        setCoachingTipError("Sorry, we couldn't generate a coaching tip at this time. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to generate coaching tip:", error);
      setCoachingTipError("An unexpected error occurred while generating the tip.");
    } finally {
      setIsLoadingCoachingTip(false);
    }
  }, [leader, leagueConfig.title]);
  
  const formatScheduledDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return ` - ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`;
    } catch(e) {
        return '';
    }
  };

  const isClickable = userState.role !== 'NONE';
  const showDiscoveryView = leagueConfig.leagueType === 'custom' || (leagueConfig.leagueType === 'standard' && currentDay === 1);
  const isPlayerOrParent = userState.role === 'PLAYER' || userState.role === 'PARENT';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="container mx-auto p-4 md:p-8">
        <Header 
            title={leagueConfig.title} 
            userState={userState} 
            onLoginClick={onLoginClick} 
            onLogout={onLogout} 
            onDeleteLeague={onDeleteLeague}
            onSwitchLeague={onSwitchLeague}
            onViewProfile={onViewProfile} 
        />
        
        <Announcements 
            text={leagueConfig.announcements}
            userRole={userState.role}
            onSave={onAnnouncementsSave}
        />

        {userState.role === 'NONE' && <LinksAndShare leagueTitle={leagueConfig.title} />}
        {isPlayerOrParent && (
          <PlayerAttendancePanel 
            leagueConfig={leagueConfig}
            userState={userState}
            allAttendance={allAttendance}
            onSetPlayerDailyAttendance={onSetPlayerDailyAttendance}
            realCurrentLeagueDay={realCurrentLeagueDay}
          />
        )}
        {userState.role === 'SUPER_ADMIN' && (
          <>
            <AdminPanel 
                appData={appData}
                leagueConfig={leagueConfig} 
                onScheduleSave={onScheduleSave} 
                allPlayerPINs={allPlayerPINs}
                onResetPlayerPIN={onResetPlayerPIN}
                allAdminFeedback={allAdminFeedback}
                allPlayerFeedback={allPlayerFeedback}
            />
          </>
        )}


        <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center justify-center">
                <IconTrophy className="w-6 h-6 mr-3"/>
                Standings: Day {currentDay}
                <span className="text-lg text-gray-400 ml-2 font-normal">{formatScheduledDate(leagueConfig.daySchedules?.[currentDay])}</span>
            </h2>
            <DaySelector
                currentDay={currentDay}
                totalDays={leagueConfig.totalDays}
                daySchedules={leagueConfig.daySchedules}
                lockedDays={leagueConfig.lockedDays}
                onDayChange={setCurrentDay}
                userRole={userState.role}
                realCurrentLeagueDay={realCurrentLeagueDay}
            />
            <Leaderboard players={sortedDisplayPlayers.slice(0, 3)} />
        </div>

        <ScoreEntryDashboard 
            currentDay={currentDay}
            courtKeys={courtKeys}
            matchupsForDay={allMatchups[currentDay]}
            resultsForDay={gameResults[currentDay]}
            attendanceForDay={allAttendance[currentDay]}
            gamesPerDay={leagueConfig.gamesPerDay}
            onGameResultChange={(court, gameIndex, result) => handleGameResultChange(currentDay, court, gameIndex, result)}
            onAttendanceChange={(playerId, gameIndex, isPresent) => handleAttendanceChange(currentDay, playerId, gameIndex, isPresent)}
            onPlayerMove={(court, gameIndex, playerId, fromTeam) => handlePlayerMoveInTeam(currentDay, court, gameIndex, playerId, fromTeam)}
            onSaveRefereeNote={onSaveRefereeNote}
            onSaveAdminFeedback={onSaveAdminFeedback}
            onToggleDayLock={onToggleDayLock}
            isDayLocked={isDayLocked}
            userState={userState}
            isSwapMode={isSwapMode}
            playerToSwap={playerToSwap}
            toggleSwapMode={toggleSwapMode}
            onPlayerSelectForSwap={handlePlayerSelectForSwap}
        />

        <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 md:mb-0">Coach's Playbook</h2>
            {userState.role !== 'NONE' && (
              <button 
                onClick={handleGenerateCoachingTip}
                disabled={isLoadingCoachingTip || !leader}
                className="px-4 py-2 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
              >
                {isLoadingCoachingTip ? 'Generating...' : "Get a New Playbook Tip"}
              </button>
            )}
          </div>
          
            {isLoadingCoachingTip && <div className="text-center text-gray-400">Generating new tip...</div>}
            {coachingTipError && <div className="p-4 bg-red-900/50 rounded-lg text-red-300 text-center">{coachingTipError}</div>}

            { (coachingTip || featuredVideoId) &&
              <div className="space-y-4">
                {featuredVideoId && (
                  <InfoCard icon={<IconVideo className="w-4 h-4" />} title="Featured Video Tip" className="col-span-1 md:col-span-2 lg:col-span-3">
                     <div className="aspect-video bg-black rounded-md overflow-hidden">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${featuredVideoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                  </InfoCard>
                )}
                {coachingTip && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-3 gap-4">
                      <InfoCard icon={<IconLightbulb className="w-4 h-4"/>} title={coachingTip.volleyballTip.title} className="lg:col-span-2">
                          <p className="whitespace-pre-wrap">{coachingTip.volleyballTip.content}</p>
                      </InfoCard>
                      <InfoCard icon={<IconTrophy className="w-4 h-4"/>} title="Leader Shoutout">
                          <p>{coachingTip.leaderShoutout}</p>
                      </InfoCard>
                      <InfoCard icon={<IconQuote className="w-4 h-4"/>} title="Food for Thought">
                          <blockquote className="italic">
                              "{coachingTip.positiveQuote.quote}"
                              <footer className="not-italic text-right mt-2 text-gray-400">— {coachingTip.positiveQuote.author}</footer>
                          </blockquote>
                      </InfoCard>
                      <InfoCard icon={<IconVolleyball className="w-4 h-4"/>} title="The Discovery Method">
                          <p>{coachingTip.leaguePhilosophy}</p>
                      </InfoCard>
                      <InfoCard icon={<IconAcademicCap className="w-4 h-4"/>} title="Academy Spotlight">
                          <p>{coachingTip.academyPlug}</p>
                      </InfoCard>
                  </div>
                )}
              </div>
            }
            { !coachingTip && !featuredVideoId && !isLoadingCoachingTip && !coachingTipError && (
                 <p className="text-gray-500 text-center py-8">
                  {userState.role !== 'NONE' ? "Click the button to get your first playbook tip!" : "The daily coach's playbook will appear here once generated by a league member."}
                </p>
            )}
        </div>

        {showDiscoveryView ? (
            <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
                <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">
                    {leagueConfig.leagueType === 'standard' ? 'Day 1 Discovery Round' : 'All Players'}
                </h2>
                <p className="text-center text-gray-400 max-w-2xl mx-auto mb-8">For this event format, all players are mixed and will play with different teammates to promote discovery and varied competition.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {sortedDisplayPlayers.map(player => (
                        <PlayerCard 
                            key={player.id} 
                            player={player} 
                            onClick={onViewProfile}
                            isClickable={isClickable}
                        />
                    ))}
                </div>
            </div>
        ) : (
             <div>
                 <h2 className="text-3xl font-bold text-yellow-400 mt-8 mb-4 text-center">Daily Groups</h2>
                <DailyGroups 
                    dailyCourtGroups={dailyCourtGroups}
                    courtOrder={courtKeys}
                    onPlayerClick={onViewProfile} 
                    userState={userState}
                />
            </div>
        )}

        <div className="mt-12">
          <PlayerTable players={sortedDisplayPlayers} onPlayerClick={onViewProfile} userState={userState} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;