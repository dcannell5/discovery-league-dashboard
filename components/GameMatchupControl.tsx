


import React from 'react';
import { GameResult, UserState, GameMatchup, Player, DailyAttendance } from '../types';
import { IconArrowsRightLeft, IconMessage } from './Icon';
import GameControl from './GameControl';

type PlayerToSwap = { player: Player; gameIndex: number };

interface GameMatchupControlProps {
    gameIndex: number;
    currentDay: number;
    matchup: GameMatchup;
    result: GameResult;
    attendanceForDay?: DailyAttendance;
    onResultChange: (gameIndex: number, result: GameResult) => void;
    onPlayerMove: (gameIndex: number, playerId: number, fromTeam: 'teamA' | 'teamB') => void;
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void;
    userState: UserState;
    isDayLocked: boolean;
    isSwapMode: boolean;
    playerToSwap: PlayerToSwap | null;
    onPlayerSelectForSwap: (player: Player, gameIndex: number) => void;
}

const TeamList: React.FC<{
    team: Player[], 
    title: string, 
    teamKey: 'teamA' | 'teamB',
    currentDay: number,
    gameIndex: number,
    attendanceForDay?: DailyAttendance;
    onPlayerMove: (playerId: number, fromTeam: 'teamA' | 'teamB') => void,
    onSaveRefereeNote: (playerId: number, note: string, day: number) => void,
    userState: UserState;
    isDayLocked: boolean;
    isSwapMode: boolean;
    playerToSwap: PlayerToSwap | null;
    onPlayerSelectForSwap: (player: Player, gameIndex: number) => void;
}> = ({team, title, teamKey, currentDay, gameIndex, onPlayerMove, onSaveRefereeNote, userState, isDayLocked, isSwapMode, playerToSwap, onPlayerSelectForSwap, attendanceForDay}) => {
    const canEdit = userState.role === 'REFEREE' || userState.role === 'SUPER_ADMIN';
    const isReferee = userState.role === 'REFEREE';

    const handleAddNote = (playerId: number, playerName: string) => {
        const note = prompt(`Enter a private note for ${playerName} (visible only to admins):`);
        if(note) {
            onSaveRefereeNote(playerId, note, currentDay);
            alert(`Note for ${playerName} saved.`);
        }
    };
    
    const handlePlayerClick = (player: Player) => {
      if (isSwapMode && userState.role === 'SUPER_ADMIN' && !isDayLocked) {
        onPlayerSelectForSwap(player, gameIndex);
      }
    };

    return (
    <div>
        <h4 className="font-bold text-white mb-1 text-center">{title}</h4>
        <ul className="text-xs space-y-1 text-gray-300 bg-gray-900/50 p-2 rounded-md min-h-[120px]">
            {team.map(player => {
                const isPresent = attendanceForDay?.[player.id]?.[gameIndex] ?? true;
                const isSelectedForSwap = playerToSwap?.player.id === player.id;
                const isTargetable = !playerToSwap || playerToSwap.gameIndex === gameIndex;

                const liClasses = [
                    "truncate flex items-center justify-between gap-1 p-1 rounded-md transition-colors",
                    isSwapMode && isTargetable && !isDayLocked ? "cursor-pointer hover:bg-yellow-500/20" : "",
                    isSwapMode && !isTargetable ? "opacity-50 cursor-not-allowed" : "",
                    isSelectedForSwap ? "bg-yellow-500/30 ring-2 ring-yellow-400" : "",
                    !isPresent ? "opacity-50 text-gray-500 line-through" : ""
                ].join(" ");
                return (
                <li key={player.id} className={liClasses} onClick={() => isTargetable && handlePlayerClick(player)}>
                    <span className="flex-1 truncate">{player.name}</span>
                    <div className="flex items-center">
                        {isReferee && (
                             <button 
                                onClick={(e) => { e.stopPropagation(); handleAddNote(player.id, player.name); }} 
                                className="ml-1 text-gray-500 hover:text-blue-400 transition-colors"
                                aria-label={`Add note for ${player.name}`}
                            >
                                <IconMessage className="w-3 h-3" />
                            </button>
                        )}
                        {canEdit && !isSwapMode && !isDayLocked && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onPlayerMove(player.id, teamKey); } } 
                                className="ml-1 text-gray-500 hover:text-yellow-400 transition-colors"
                                aria-label={`Switch ${player.name} to other team`}
                            >
                                <IconArrowsRightLeft className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </li>
            )})}
        </ul>
    </div>
    );
};

const GameMatchupControl: React.FC<GameMatchupControlProps> = ({ 
    gameIndex, currentDay, matchup, result, onResultChange, onPlayerMove, onSaveRefereeNote, userState,
    isDayLocked, isSwapMode, playerToSwap, onPlayerSelectForSwap, attendanceForDay
}) => {
    const canEdit = userState.role === 'REFEREE' || userState.role === 'SUPER_ADMIN';

    const handlePlayerMove = (playerId: number, fromTeam: 'teamA' | 'teamB') => {
        onPlayerMove(gameIndex, playerId, fromTeam);
    };

    const scores = result === 'unplayed' ? { teamAScore: null, teamBScore: null } : result;

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col gap-3">
            <div className="text-center font-semibold text-white mb-2">
                Game {gameIndex + 1}
            </div>
            <div className="grid grid-cols-2 gap-3 items-start">
                <TeamList 
                    team={matchup.teamA} 
                    title="Team A" 
                    teamKey="teamA"
                    currentDay={currentDay}
                    gameIndex={gameIndex}
                    attendanceForDay={attendanceForDay}
                    onPlayerMove={handlePlayerMove}
                    onSaveRefereeNote={onSaveRefereeNote}
                    userState={userState}
                    isDayLocked={isDayLocked}
                    isSwapMode={isSwapMode}
                    playerToSwap={playerToSwap}
                    onPlayerSelectForSwap={onPlayerSelectForSwap}
                />
                <TeamList 
                    team={matchup.teamB} 
                    title="Team B" 
                    teamKey="teamB"
                    currentDay={currentDay}
                    gameIndex={gameIndex}
                    attendanceForDay={attendanceForDay}
                    onPlayerMove={handlePlayerMove}
                    onSaveRefereeNote={onSaveRefereeNote}
                    userState={userState}
                    isDayLocked={isDayLocked}
                    isSwapMode={isSwapMode}
                    playerToSwap={playerToSwap}
                    onPlayerSelectForSwap={onPlayerSelectForSwap}
                />
            </div>
             
            {canEdit && !isSwapMode ? (
                <GameControl
                    gameIndex={gameIndex}
                    result={result}
                    onResultChange={onResultChange}
                    userRole={userState.role}
                    isDayLocked={isDayLocked}
                />
            ) : result !== 'unplayed' ? (
                <div className="mt-3 text-center bg-gray-900/50 py-2 rounded-lg">
                    <span className="text-white font-bold text-xl">{scores.teamAScore ?? '-'}</span>
                    <span className="text-gray-400 mx-2">-</span>
                    <span className="text-white font-bold text-xl">{scores.teamBScore ?? '-'}</span>
                </div>
            ) : null}
        </div>
    );
};

export default GameMatchupControl;