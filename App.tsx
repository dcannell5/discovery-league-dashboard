


import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { LeagueConfig, UserState, AppData, AllDailyResults, AllDailyMatchups, AllDailyAttendance, RefereeNote, UpcomingEvent, PlayerProfile, AllPlayerProfiles, AdminFeedback, PlayerFeedback, AiMessage, ProjectLogEntry } from './types';
import { SUPER_ADMIN_CODE, getRefereeCodeForCourt, getPlayerCode, getParentCode } from './utils/auth';
import { getAllCourtNames } from './utils/leagueLogic';
import SetupScreen from './components/SetupScreen';
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import ProfilePage from './components/ProfilePage';
import LoginPage from './components/LoginPage';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import AiHelper from './components/AiHelper';
import AiHelperButton from './components/AiHelperButton';
import SaveStatusIndicator from './components/SaveStatusIndicator';
import { IconVolleyball } from './components/Icon';
import BlogPage from './components/BlogPage';


const SevereWarningModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ show, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText === 'RESET';

  useEffect(() => {
    if (show) {
      setConfirmText(''); // Reset on open
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="w-full max-w-lg mx-auto p-8 bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-500 text-center"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-red-400 mb-4">Permanent Action Required</h2>
        <p className="text-gray-300 mb-6">You are about to <strong className="text-red-400">permanently delete ALL data from the central database</strong>, including all leagues, scores, and settings. This cannot be undone.</p>
        <p className="text-gray-300 mb-4">To confirm, please type <strong className="text-yellow-300 tracking-widest">RESET</strong> into the box below:</p>
        
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900 border-2 border-gray-600 rounded-lg text-white text-center text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-red-400"
          autoFocus
        />

        <div className="flex justify-end gap-4 mt-8">
            <button onClick={onClose} className="px-6 py-2 text-sm font-bold rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">Cancel</button>
            <button 
              onClick={onConfirm} 
              disabled={!isConfirmEnabled}
              className="px-6 py-2 text-sm font-bold rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:bg-red-900/50 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Permanently Reset Data
            </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userState, setUserState] = useState<UserState>({ role: 'NONE' });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [viewingProfileOfPlayerId, setViewingProfileOfPlayerId] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false);
  const [aiConversation, setAiConversation] = useState<AiMessage[]>([]);
  const isInitialized = useRef(false);

  // Data persistence state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

  // Navigation states
  const [adminView, setAdminView] = useState<'hub' | 'leagueSelector'>('hub');
  const [currentView, setCurrentView] = useState<'app' | 'blog'>('app');

  // Load initial data from the backend
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/getData');
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch data: ${response.statusText} - ${errorText}`);
            }
            const data: AppData = await response.json();
            setAppData(data);
            setSaveStatus('saved'); // Initial data is considered saved
        } catch (error) {
            console.error("Could not load initial application data:", error);
            setAppData(null); // Set to null on error
            setSaveStatus('error');
        } finally {
            setIsLoading(false);
            isInitialized.current = true;
        }
    };
    fetchData();
  }, []);

  // Save data to the backend whenever it changes, with debouncing
  useEffect(() => {
      // Don't save on the initial load or if data is null
      if (!isInitialized.current || !appData || saveStatus === 'idle') {
          return;
      }

      // If status is saved, and data changes, it becomes unsaved.
      if (saveStatus === 'saved') {
          setSaveStatus('unsaved');
          return;
      }

      // This is the debounced save logic
      const handler = setTimeout(async () => {
          setSaveStatus('saving');
          try {
              const response = await fetch('/api/saveData', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(appData)
              });
              if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Failed to save data to backend:", errorText);
                  setSaveStatus('error');
              } else {
                  setSaveStatus('saved');
              }
          } catch (error) {
              console.error("Failed to save app data to backend:", error);
              setSaveStatus('error');
          }
      }, 1500); // Debounce save for 1.5 seconds

      return () => {
          clearTimeout(handler);
      };
  }, [appData, saveStatus]);


  // activeLeagueId and upcomingEvent are now derived from appData state
  const activeLeagueId = appData?.activeLeagueId;
  const upcomingEvent = appData?.upcomingEvent || {
    title: 'Next League Registration Open!',
    description: 'Registration for the Fall Discovery League is now open. Sign up early to secure your spot!',
    buttonText: 'Register Now',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/'
  };

  const updateAppData = useCallback((updater: (prevData: AppData) => AppData) => {
    setAppData(prev => (prev ? updater(prev) : prev));
  }, []);

  // Handler to be passed down to simple components
  const handleSetActiveLeagueId = (id: string | null) => {
    updateAppData(prev => ({ ...prev, activeLeagueId: id }));
  };
  
  const handleUpdateUpcomingEvent = useCallback((event: UpcomingEvent) => {
    updateAppData(prev => ({
      ...prev,
      upcomingEvent: event
    }));
  }, [updateAppData]);


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
      activeLeagueId: newLeagueId,
    }));
  }, [updateAppData]);

  const handleCancelCreateLeague = useCallback(() => {
    handleSetActiveLeagueId(null);
  }, []);
  
  const handleLogout = useCallback(() => {
    setUserState({ role: 'NONE' });
    setViewingProfileOfPlayerId(null);
    setAdminView('hub'); // Reset admin view on logout
    setCurrentView('app'); // Ensure we are on the main app view
  }, []);

  const executeReset = useCallback(async () => {
    try {
        const response = await fetch('/api/resetData', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to reset data on the server.');
        }
        alert("Application data has been reset. The page will now reload.");
        window.location.reload();
    } catch (error) {
        console.error("Failed to reset data:", error);
        alert("Failed to reset data. Please try again.");
    } finally {
        setShowResetConfirm(false);
    }
  }, []);

  const handleResetAllData = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleLogin = useCallback((code: string) => {
    setAuthError('');
    const upperCaseCode = code.trim().toUpperCase();

    if (upperCaseCode === SUPER_ADMIN_CODE) {
        setUserState({ role: 'SUPER_ADMIN' });
        setShowLoginModal(false);
        setAdminView('hub');
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
                    handleSetActiveLeagueId(leagueId);
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
                    handleSetActiveLeagueId(leagueId);
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
          ...prev,
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
          activeLeagueId: null,
        };
      });
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
  
  const handleAiQuery = useCallback(async (query: string) => {
    if (!appData) return;

    const userMessage: AiMessage = { id: `user-${Date.now()}`, role: 'user', content: query };
    const thinkingMessage: AiMessage = { id: `assistant-${Date.now()}`, role: 'assistant', content: '...', isThinking: true };
    
    setAiConversation(prev => [...prev, userMessage, thinkingMessage]);

    try {
        const apiResponse = await fetch('/api/aiHelper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, appData, userState })
        });
        
        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            throw new Error(errorData.response || 'AI helper request failed.');
        }

        const responseObject = await apiResponse.json();
      
      const assistantMessage: AiMessage = {
          id: `assistant-${Date.now()}-2`,
          role: 'assistant',
          content: responseObject.response,
      };

      setAiConversation(prev => [...prev.slice(0, -1), assistantMessage]); // Replace thinking message

    } catch (error) {
      console.error("AI Helper Error:", error);
      const errorMessageContent = error instanceof Error ? error.message : "Sorry, I encountered an error. Please check the server configuration or try again later.";
      const errorMessage: AiMessage = {
        id: `assistant-${Date.now()}-error`,
        role: 'assistant',
        content: errorMessageContent,
      };
      setAiConversation(prev => [...prev.slice(0, -1), errorMessage]); // Replace thinking message
    }
  }, [appData, userState]);

  const handleSaveProjectLog = useCallback((post: Omit<ProjectLogEntry, 'id' | 'date'>) => {
      const newLog: ProjectLogEntry = {
          id: `log-${Date.now()}`,
          date: new Date().toISOString(),
          ...post
      };
      updateAppData(prev => ({
          ...prev,
          projectLogs: [...(prev.projectLogs || []), newLog]
      }));
  }, [updateAppData]);


  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="flex flex-col items-center gap-4">
                <IconVolleyball className="w-16 h-16 text-yellow-400 animate-spin" />
                <p className="text-xl text-gray-300">Loading League Data...</p>
            </div>
        </div>
    );
  }

  if (!appData) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
             <div className="text-center">
                 <h2 className="text-2xl text-red-400 font-bold">Failed to Load Application Data</h2>
                 <p className="text-gray-400 mt-2">Could not retrieve league data from the server. Please try refreshing the page or contact an administrator.</p>
             </div>
        </div>
    );
  }

  let pageContent;

  if (currentView === 'blog') {
      pageContent = <BlogPage 
        logs={appData.projectLogs?.filter(log => log.isPublished) || []}
        onBack={() => setCurrentView('app')}
      />;
  } else if (userState.role === 'SUPER_ADMIN') {
      if (adminView === 'hub') {
          pageContent = <SuperAdminDashboard 
              onNavigateToLeagues={() => setAdminView('leagueSelector')}
              onLogout={handleLogout}
              projectLogs={appData.projectLogs || []}
              onSaveProjectLog={handleSaveProjectLog}
          />
      } else {
           // Admin is in league selector view, which is handled by the logic below
           pageContent = <LoginPage 
              appData={appData}
              setAppData={setAppData}
              onSelectLeague={handleSetActiveLeagueId} 
              onCreateNew={() => handleSetActiveLeagueId('new')}
              userState={userState}
              upcomingEvent={upcomingEvent}
              onUpdateUpcomingEvent={handleUpdateUpcomingEvent}
              onLoginClick={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              onResetAllData={handleResetAllData}
              onBackToAdminHub={() => setAdminView('hub')}
              onViewBlog={() => setCurrentView('blog')}
          />;
      }
  } else if (activeLeagueId === 'new') {
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
              onSwitchLeague={() => handleSetActiveLeagueId(null)}
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
          onSelectLeague={handleSetActiveLeagueId} 
          onCreateNew={() => handleSetActiveLeagueId('new')}
          userState={userState}
          upcomingEvent={upcomingEvent}
          onUpdateUpcomingEvent={handleUpdateUpcomingEvent}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onResetAllData={handleResetAllData}
          onViewBlog={() => setCurrentView('blog')}
      />;
  }

  const showSaveStatus = currentView === 'app' && userState.role !== 'NONE';

  return (
    <>
      {pageContent}
      {currentView === 'app' && (
        <>
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
            <SevereWarningModal 
                show={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={executeReset}
            />
            <AiHelperButton onClick={() => setIsAiHelperOpen(true)} />
            <AiHelper 
                isOpen={isAiHelperOpen}
                onClose={() => setIsAiHelperOpen(false)}
                conversation={aiConversation}
                onSendQuery={handleAiQuery}
            />
             {showSaveStatus && <SaveStatusIndicator status={saveStatus} />}
        </>
      )}
    </>
  );
};

export default App;
