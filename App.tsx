
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LeagueConfig, UserState, AppData, AllDailyResults, AllDailyMatchups, AllDailyAttendance, RefereeNote, UpcomingEvent, PlayerProfile, AllPlayerProfiles, AdminFeedback, PlayerFeedback, LoginCounts } from './types';
import { SUPER_ADMIN_CODE, getRefereeCodeForCourt, getPlayerCode, getParentCode } from './utils/auth';
import { getAllCourtNames } from './utils/leagueLogic';
import SetupScreen from './components/SetupScreen';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import { initialAppData } from './data/initialData';

const APP_DATA_KEY = 'discoveryLeagueAppData';

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(null);
  const [userState, setUserState] = useState<UserState>({ role: 'NONE' });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [viewingProfileOfPlayerId, setViewingProfileOfPlayerId] = useState<number | null>(null);
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent>({
    title: 'Next League Registration Open!',
    description: 'Registration for the Fall Discovery League is now open. Sign up early to secure your spot!',
    buttonText: 'Register Now',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/'
  });

  useEffect(() => {
    const savedData = localStorage.getItem(APP_DATA_KEY);
    if (savedData) {
      try {
        const parsedData: AppData = JSON.parse(savedData);
        // Ensure new fields exist for backward compatibility
        if (!parsedData.allAdminFeedback) parsedData.allAdminFeedback = {};
        if (!parsedData.allPlayerFeedback) parsedData.allPlayerFeedback = {};
        if (!parsedData.allPlayerPINs) parsedData.allPlayerPINs = {};
        if (!parsedData.loginCounters) parsedData.loginCounters = {};

        Object.values(parsedData.leagues).forEach(league => {
            if (!league.lockedDays) league.lockedDays = {};
        });

        // --- ONE-TIME DATA MIGRATION SCRIPT ---
        // This script checks for old court names and updates them to the correct format.
        Object.keys(parsedData.leagues).forEach(leagueId => {
          const league = parsedData.leagues[leagueId];
          const oldNames = ['Royalty Court', 'Challenger Court 1', 'Foundation Court'];
          const newNames = ['Royalty Court 1', 'Challenger Court 2', 'Foundation Court 3'];

          if (league && league.courtNames && league.courtNames.length === 3 && league.courtNames.join(',') === oldNames.join(',')) {
              console.log(`Applying one-time court name migration for league: ${league.title}`);
              
              // 1. Update league config with new names
              league.courtNames = newNames;

              const nameMap: Record<string, string> = {
                  [oldNames[0]]: newNames[0],
                  [oldNames[1]]: newNames[1],
                  [oldNames[2]]: newNames[2],
              };

              const migrateKeys = (dataObject: Record<string, any> | undefined) => {
                  if (!dataObject) return;
                  Object.keys(nameMap).forEach(oldKey => {
                      if (dataObject[oldKey]) {
                          dataObject[nameMap[oldKey]] = dataObject[oldKey];
                          delete dataObject[oldKey];
                      }
                  });
              };

              // 2. Update keys in dailyResults
              const leagueResults = parsedData.dailyResults[leagueId];
              if (leagueResults) {
                  Object.values(leagueResults).forEach(migrateKeys);
              }

              // 3. Update keys in allDailyMatchups
              const leagueMatchups = parsedData.allDailyMatchups[leagueId];
              if (leagueMatchups) {
                  Object.values(leagueMatchups).forEach(migrateKeys);
              }
          }
        });
        // --- END OF MIGRATION SCRIPT ---
        
        setAppData(parsedData);
        
        const leagueIds = Object.keys(parsedData.leagues);
        if (leagueIds.length === 1) {
            setActiveLeagueId(leagueIds[0]);
        } else {
            setActiveLeagueId(parsedData.activeLeagueId || null);
        }

        if (parsedData.upcomingEvent) {
          setUpcomingEvent(parsedData.upcomingEvent);
        }
      } catch (error) {
        console.error("Failed to parse app data from localStorage, resetting state.", error);
        setAppData(initialAppData);
        const leagueIds = Object.keys(initialAppData.leagues);
        if (leagueIds.length === 1) {
            setActiveLeagueId(leagueIds[0]);
        } else {
            setActiveLeagueId(initialAppData.activeLeagueId || null);
        }
        if (initialAppData.upcomingEvent) {
            setUpcomingEvent(initialAppData.upcomingEvent);
        }
      }
    } else {
      setAppData(initialAppData);
      const leagueIds = Object.keys(initialAppData.leagues);
      if (leagueIds.length === 1) {
          setActiveLeagueId(leagueIds[0]);
      } else {
          setActiveLeagueId(initialAppData.activeLeagueId || null);
      }
      if (initialAppData.upcomingEvent) {
        setUpcomingEvent(initialAppData.upcomingEvent);
      }
    }
  }, []);

  useEffect(() => {
    if (appData) {
      const dataToSave: AppData = { ...appData, activeLeagueId, upcomingEvent };
      localStorage.setItem(APP_DATA_KEY, JSON.stringify(dataToSave));
    }
  }, [appData, activeLeagueId, upcomingEvent]);

  const activeLeague = useMemo((): LeagueConfig | null => {
    if (!appData || !activeLeagueId) return null;
    const config = appData.leagues[activeLeagueId];
    return config ? { ...config, id: activeLeagueId } : null;
  }, [appData, activeLeagueId]);
  
  const activeDataSlices = useMemo(() => {
    if (!appData || !activeLeagueId) return { dailyResults: {}, allDailyMatchups: {}, allDailyAttendance: {}, allPlayerProfiles: {}, allRefereeNotes: {}, allAdminFeedback: [], allPlayerFeedback: [], allPlayerPINs: {}, loginCounters: {} };
    return {
      dailyResults: appData.dailyResults[activeLeagueId] || {},
      allDailyMatchups: appData.allDailyMatchups[activeLeagueId] || {},
      allDailyAttendance: appData.allDailyAttendance[activeLeagueId] || {},
      allPlayerProfiles: appData.allPlayerProfiles[activeLeagueId] || {},
      allRefereeNotes: appData.allRefereeNotes[activeLeagueId] || {},
      allAdminFeedback: appData.allAdminFeedback?.[activeLeagueId] || [],
      allPlayerFeedback: appData.allPlayerFeedback?.[activeLeagueId] || [],
      allPlayerPINs: appData.allPlayerPINs?.[activeLeagueId] || {},
      loginCounters: appData.loginCounters?.[activeLeagueId] || {},
    };
  }, [appData, activeLeagueId]);

  const updateAppData = useCallback((updater: (prevData: AppData) => AppData) => {
    setAppData(prev => prev ? updater(prev) : null);
  }, []);
  
  const handleUpdateUpcomingEvent = useCallback((event: UpcomingEvent) => {
    setUpcomingEvent(event);
    updateAppData(prev => ({
      ...prev,
      upcomingEvent: event
    }));
  }, [updateAppData]);

  const handleCreateLeague = useCallback((config: Omit<LeagueConfig, 'id'>) => {
    const newLeagueId = `league-${Date.now()}`;
    updateAppData(prev => ({
      ...prev,
      leagues: { ...prev.leagues, [newLeagueId]: {...config, lockedDays: {}} },
      dailyResults: { ...prev.dailyResults, [newLeagueId]: {} },
      allDailyMatchups: { ...prev.allDailyMatchups, [newLeagueId]: {} },
      allDailyAttendance: { ...prev.allDailyAttendance, [newLeagueId]: {} },
      allPlayerProfiles: { ...prev.allPlayerProfiles, [newLeagueId]: {} },
      allRefereeNotes: { ...prev.allRefereeNotes, [newLeagueId]: {} },
      allAdminFeedback: { ...prev.allAdminFeedback, [newLeagueId]: [] },
      allPlayerFeedback: { ...prev.allPlayerFeedback, [newLeagueId]: [] },
      allPlayerPINs: { ...prev.allPlayerPINs, [newLeagueId]: {} },
      loginCounters: { ...prev.loginCounters, [newLeagueId]: {} },
    }));
    setActiveLeagueId(newLeagueId);
  }, [updateAppData]);

  const handleCancelCreateLeague = useCallback(() => {
    if (appData && Object.keys(appData.leagues).length > 0) {
        setActiveLeagueId(null); // Go back to hub if leagues exist
    } else {
        setActiveLeagueId(null);
    }
  }, [appData]);

  const handleLogin = useCallback((code: string) => {
    setAuthError('');
    const upperCaseCode = code.trim().toUpperCase();

    if (upperCaseCode === SUPER_ADMIN_CODE) {
        setUserState({ role: 'SUPER_ADMIN' });
        setShowLoginModal(false);
        return;
    }
    
    if (appData?.leagues) {
        for (const leagueId in appData.leagues) {
            const leagueConfig = { ...appData.leagues[leagueId], id: leagueId };

            // Referee check first
            const courtNames = getAllCourtNames(leagueConfig);
            for (const courtName of courtNames) {
                if (upperCaseCode === getRefereeCodeForCourt(new Date(), courtName)) {
                    setUserState({ role: 'REFEREE', court: courtName });
                    setActiveLeagueId(leagueId);
                    setShowLoginModal(false);
                    return;
                }
            }
            
            // Player/Parent check
            for (const player of leagueConfig.players) {
                const playerPINs = appData.allPlayerPINs?.[leagueId] || {};
                let successfulRole: 'PLAYER' | 'PARENT' | null = null;

                // Priority: Custom PIN, Player Code, Parent Code
                if (playerPINs[player.id] && upperCaseCode === playerPINs[player.id]) {
                    successfulRole = 'PLAYER'; // Assumption: PIN login is for the player
                } else if (upperCaseCode === getPlayerCode(player)) { 
                    successfulRole = 'PLAYER';
                } else if (upperCaseCode === getParentCode(player)) { 
                    successfulRole = 'PARENT';
                }

                if (successfulRole) {
                    setUserState({ role: successfulRole, playerId: player.id });
                    setActiveLeagueId(leagueId);
                    setShowLoginModal(false);

                    // Increment login counter
                    updateAppData(prev => {
                        const counters = prev.loginCounters || {};
                        const leagueCounters = counters[leagueId] || {};
                        const playerCounters = leagueCounters[player.id] || { playerLogins: 0, parentLogins: 0 };

                        if (successfulRole === 'PLAYER') {
                            playerCounters.playerLogins = (playerCounters.playerLogins || 0) + 1;
                        } else if (successfulRole === 'PARENT') {
                            playerCounters.parentLogins = (playerCounters.parentLogins || 0) + 1;
                        }

                        const newLeagueCounters = { ...leagueCounters, [player.id]: playerCounters };
                        const newAllCounters = { ...counters, [leagueId]: newLeagueCounters };
                        
                        return { ...prev, loginCounters: newAllCounters };
                    });
                    return;
                }
            }
        }
    }
    setAuthError('Invalid access code. Please try again.');
}, [appData, updateAppData]);

  const handleLogout = useCallback(() => {
    setUserState({ role: 'NONE' });
    setViewingProfileOfPlayerId(null);
  }, []);
  
  const handleAnnouncementsSave = useCallback((newAnnouncements: string) => {
      if (!activeLeagueId) return;
      updateAppData(prev => {
          const league = prev.leagues[activeLeagueId];
          if (!league) return prev; 

          return {
              ...prev,
              leagues: {
                  ...prev.leagues,
                  [activeLeagueId]: { ...league, announcements: newAnnouncements }
              }
          };
      });
  }, [activeLeagueId, updateAppData]);

  const handleDeleteLeague = useCallback(() => {
    if (!activeLeagueId || !activeLeague) return;
    if (window.confirm(`Are you sure you want to permanently delete the "${activeLeague.title}" event? All data will be lost.`)) {
      updateAppData(prev => {
        const { [activeLeagueId]: _, ...remainingLeagues } = prev.leagues;
        const { [activeLeagueId]: __, ...remainingGameResults } = prev.dailyResults;
        const { [activeLeagueId]: ___, ...remainingAllMatchups } = prev.allDailyMatchups;
        const { [activeLeagueId]: ____, ...remainingAllAttendance } = prev.allDailyAttendance;
        const { [activeLeagueId]: _____, ...remainingAllPlayerProfiles } = prev.allPlayerProfiles;
        const { [activeLeagueId]: ______, ...remainingAllRefereeNotes } = prev.allRefereeNotes;
        const { [activeLeagueId]: _______, ...remainingAllPlayerPINs } = prev.allPlayerPINs || {};
        const { [activeLeagueId]: ________, ...remainingAdminFeedback } = prev.allAdminFeedback || {};
        const { [activeLeagueId]: _________, ...remainingPlayerFeedback } = prev.allPlayerFeedback || {};
        const { [activeLeagueId]: __________, ...remainingLoginCounters } = prev.loginCounters || {};

        return {
          leagues: remainingLeagues,
          dailyResults: remainingGameResults,
          allDailyMatchups: remainingAllMatchups,
          allDailyAttendance: remainingAllAttendance,
          allPlayerProfiles: remainingAllPlayerProfiles,
          allRefereeNotes: remainingAllRefereeNotes,
          allAdminFeedback: remainingAdminFeedback,
          allPlayerFeedback: remainingPlayerFeedback,
          allPlayerPINs: remainingAllPlayerPINs,
          loginCounters: remainingLoginCounters,
        };
      });
      setActiveLeagueId(null);
    }
  }, [activeLeagueId, activeLeague, updateAppData]);

  const createActiveLeagueSetter = <T,>(dataKey: keyof AppData) => useCallback((value: React.SetStateAction<T>) => {
      if (!activeLeagueId) return;
      updateAppData(prev => {
          const dataSlice = prev[dataKey] as Record<string, T>;
          const leagueData = dataSlice ? (dataSlice[activeLeagueId] || {}) : {};
          
          const newValue = typeof value === 'function' 
              ? (value as (prevState: T) => T)(leagueData as T) 
              : value;

          return {
              ...prev,
              [dataKey]: { ...(prev[dataKey] as object), [activeLeagueId]: newValue }
          };
      });
  }, [activeLeagueId, updateAppData]);

  const setDailyResults = createActiveLeagueSetter<AllDailyResults>('dailyResults');
  const setAllDailyMatchups = createActiveLeagueSetter<AllDailyMatchups>('allDailyMatchups');
  const setAllDailyAttendance = createActiveLeagueSetter<AllDailyAttendance>('allDailyAttendance');
  
  const handleSetPlayerDailyAttendance = useCallback((day: number, playerId: number, isPresent: boolean) => {
    if (!activeLeague || activeLeague.lockedDays?.[day]) return;
    setAllDailyAttendance(prev => {
        const newAttendance: AllDailyAttendance = JSON.parse(JSON.stringify(prev));
        if (!newAttendance[day]) newAttendance[day] = {};
        const gamesPerDay = activeLeague.gamesPerDay;
        newAttendance[day][playerId] = Array(gamesPerDay).fill(isPresent);
        return newAttendance;
    });
  }, [activeLeague, setAllDailyAttendance]);

  const handleSaveRefereeNote = useCallback((playerId: number, note: string, day: number) => {
    if (!activeLeagueId || userState.role !== 'REFEREE') return;
    const newNote: RefereeNote = { note, day, court: userState.court, date: new Date().toISOString() };
    updateAppData(prev => {
        const currentNotes = prev.allRefereeNotes[activeLeagueId] || {};
        const playerNotes = currentNotes[playerId] || [];
        return {
            ...prev,
            allRefereeNotes: { ...prev.allRefereeNotes, [activeLeagueId]: { ...currentNotes, [playerId]: [...playerNotes, newNote] } }
        };
    });
  }, [activeLeagueId, updateAppData, userState]);
  
  const handleSaveAdminFeedback = useCallback((feedbackText: string) => {
    if (!activeLeagueId || userState.role !== 'REFEREE') return;
    const newFeedback: AdminFeedback = {
      id: `feedback-${Date.now()}`,
      feedbackText,
      submittedBy: { role: 'REFEREE', court: userState.court },
      submittedAt: new Date().toISOString(),
    };
    updateAppData(prev => {
        const allFeedback = prev.allAdminFeedback || {};
        const currentFeedback = allFeedback[activeLeagueId] || [];
        const newAllFeedback = {
            ...allFeedback,
            [activeLeagueId]: [...currentFeedback, newFeedback]
        };
        return { ...prev, allAdminFeedback: newAllFeedback };
    });
  }, [activeLeagueId, updateAppData, userState]);

  const handleSavePlayerFeedback = useCallback((feedbackText: string) => {
    if (!activeLeagueId || !activeLeague || (userState.role !== 'PLAYER' && userState.role !== 'PARENT')) return;
    
    const player = activeLeague.players.find(p => p.id === userState.playerId);
    if (!player) return;

    const newFeedback: PlayerFeedback = {
      id: `player-feedback-${Date.now()}`,
      feedbackText,
      submittedBy: {
        role: userState.role,
        playerId: player.id,
        playerName: player.name
      },
      submittedAt: new Date().toISOString(),
    };

    updateAppData(prev => {
        const allFeedback = prev.allPlayerFeedback || {};
        const currentFeedback = allFeedback[activeLeagueId] || [];
        const newAllFeedback = {
            ...allFeedback,
            [activeLeagueId]: [...currentFeedback, newFeedback]
        };
        return { ...prev, allPlayerFeedback: newAllFeedback };
    });
  }, [activeLeagueId, activeLeague, updateAppData, userState]);

  const handleScheduleSave = useCallback((newSchedules: Record<number, string>) => {
    if (!activeLeagueId) return;
    updateAppData(prev => {
        const league = prev.leagues[activeLeagueId];
        if (!league) return prev;
        return {
            ...prev,
            leagues: {
                ...prev.leagues,
                [activeLeagueId]: { ...league, daySchedules: newSchedules }
            }
        };
    });
}, [activeLeagueId, updateAppData]);


  const handleProfileSave = useCallback((playerId: number, newProfile: PlayerProfile) => {
    if (!activeLeagueId) return;
    updateAppData(prev => {
      const currentProfiles = prev.allPlayerProfiles[activeLeagueId] || {};
      const newAllPlayerProfiles: Record<string, AllPlayerProfiles> = { ...prev.allPlayerProfiles, [activeLeagueId]: { ...currentProfiles, [playerId]: newProfile } };
      return { ...prev, allPlayerProfiles: newAllPlayerProfiles };
    });
  }, [activeLeagueId, updateAppData]);

  const handleSetPlayerPIN = useCallback((playerId: number, pin: string) => {
    if (!activeLeagueId) return;
    updateAppData(prev => {
      const allPINs = prev.allPlayerPINs || {};
      const leaguePINs = allPINs[activeLeagueId] || {};
      const newLeaguePINs = { ...leaguePINs, [playerId]: pin };
      const newAllPINs = { ...allPINs, [activeLeagueId]: newLeaguePINs };
      return { ...prev, allPlayerPINs: newAllPINs };
    });
  }, [activeLeagueId, updateAppData]);

  const handleResetPlayerPIN = useCallback((playerId: number) => {
    if (!activeLeagueId) return;
    updateAppData(prev => {
      const allPINs = prev.allPlayerPINs || {};
      const leaguePINs = allPINs[activeLeagueId] || {};
      const { [playerId]: _, ...remainingPINs } = leaguePINs;
      const newAllPINs = { ...allPINs, [activeLeagueId]: remainingPINs };
      return { ...prev, allPlayerPINs: newAllPINs };
    });
  }, [activeLeagueId, updateAppData]);
  
  const handleToggleDayLock = useCallback((day: number) => {
    if (!activeLeagueId) return;
    updateAppData(prev => {
      const league = prev.leagues[activeLeagueId];
      if (!league) return prev;
      
      const isCurrentlyLocked = league.lockedDays?.[day] || false;
      const action = isCurrentlyLocked ? "unlock" : "lock";
      const confirmationMessage = `Are you sure you want to ${action} Day ${day}? ${!isCurrentlyLocked ? 'Scores will become read-only.' : 'Scores will become editable.'}`;

      if (window.confirm(confirmationMessage)) {
        const currentLockedDays = league.lockedDays || {};
        const newLockedDays = { ...currentLockedDays, [day]: !isCurrentlyLocked };
        const newLeagues = { ...prev.leagues, [activeLeagueId]: { ...league, lockedDays: newLockedDays } };
        
        if (!isCurrentlyLocked) { // If we are locking the day
            alert(`Day ${day} has been locked. It is highly recommended to export a backup from the Admin Panel.`);
        }
        return { ...prev, leagues: newLeagues };
      }
      return prev;
    });
  }, [activeLeagueId, updateAppData]);

  const handleViewProfile = useCallback((playerId: number) => {
    if (userState.role !== 'NONE') setViewingProfileOfPlayerId(playerId);
    else setShowLoginModal(true);
  }, [userState.role]);

  if (!appData) return <div className="bg-gray-900 min-h-screen"></div>;

  let pageContent;

  if (activeLeagueId === 'new') {
      pageContent = <SetupScreen 
          onSetupComplete={handleCreateLeague} 
          onCancel={handleCancelCreateLeague} 
      />;
  } else if (activeLeague) {
      const viewingPlayer = viewingProfileOfPlayerId ? activeLeague.players.find(p => p.id === viewingProfileOfPlayerId) : null;
      if (viewingPlayer) {
          pageContent = <ProfilePage 
              player={viewingPlayer}
              profile={activeDataSlices.allPlayerProfiles[viewingPlayer.id] || {}}
              userState={userState}
              onSave={handleProfileSave}
              onBack={() => setViewingProfileOfPlayerId(null)}
              refereeNotes={activeDataSlices.allRefereeNotes[viewingPlayer.id] || []}
              currentPIN={activeDataSlices.allPlayerPINs[viewingPlayer.id]}
              onSetPIN={(pin) => handleSetPlayerPIN(viewingPlayer.id, pin)}
              onSavePlayerFeedback={handleSavePlayerFeedback}
          />;
      } else {
          pageContent = <Dashboard
              appData={appData}
              leagueConfig={activeLeague}
              userState={userState}
              onLoginClick={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              onDeleteLeague={handleDeleteLeague}
              onSwitchLeague={() => setActiveLeagueId(null)}
              onAnnouncementsSave={handleAnnouncementsSave}
              onScheduleSave={handleScheduleSave}
              onViewProfile={handleViewProfile}
              onSaveRefereeNote={handleSaveRefereeNote}
              onSaveAdminFeedback={handleSaveAdminFeedback}
              onSetPlayerDailyAttendance={handleSetPlayerDailyAttendance}
              onToggleDayLock={handleToggleDayLock}
              gameResults={activeDataSlices.dailyResults}
              setGameResults={setDailyResults}
              allMatchups={activeDataSlices.allDailyMatchups}
              setAllMatchups={setAllDailyMatchups}
              allAttendance={activeDataSlices.allDailyAttendance}
              setAllAttendance={setAllDailyAttendance}
              allAdminFeedback={activeDataSlices.allAdminFeedback}
              allPlayerFeedback={activeDataSlices.allPlayerFeedback}
              allPlayerPINs={activeDataSlices.allPlayerPINs}
              onResetPlayerPIN={handleResetPlayerPIN}
              loginCounters={activeDataSlices.loginCounters}
          />;
      }
  } else {
      pageContent = <LoginPage 
          appData={appData}
          setAppData={setAppData}
          onSelectLeague={setActiveLeagueId} 
          onCreateNew={() => setActiveLeagueId('new')}
          userState={userState}
          upcomingEvent={upcomingEvent}
          onUpdateUpcomingEvent={handleUpdateUpcomingEvent}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
      />;
  }

  return (
    <>
      {pageContent}
      {showLoginModal && (
        <LoginScreen
          onLogin={handleLogin}
          error={authError}
          onClose={() => {
            setShowLoginModal(false)
            setAuthError('');
          }}
        />
      )}
    </>
  );
};

export default App;
