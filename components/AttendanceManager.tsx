

import React from 'react';
import { DailyAttendance, DailyCourtMatchups, Player } from '../types';
import PlayerAttendanceRow from './PlayerAttendanceRow';

interface AttendanceManagerProps {
    currentDay: number;
    matchupsForDay: DailyCourtMatchups;
    attendanceForDay?: DailyAttendance;
    onAttendanceChange: (playerId: number, gameIndex: number, isPresent: boolean) => void;
    courtOrder: string[];
    gamesPerDay: number;
    isDayLocked: boolean;
}

const AttendanceManager: React.FC<AttendanceManagerProps> = ({
    currentDay,
    matchupsForDay,
    attendanceForDay,
    onAttendanceChange,
    courtOrder,
    gamesPerDay,
    isDayLocked,
}) => {

    return (
        <div className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 mb-6 space-y-8">
            <h3 className="text-2xl font-bold text-center text-yellow-400">Manage Attendance: Day {currentDay}</h3>
            {isDayLocked && <p className="text-center text-blue-300 text-sm -mt-4">This day is locked. Attendance cannot be changed.</p>}
            {courtOrder.map(court => {
                // Get all unique players from the first matchup on that court
                const playersMap = new Map<number, Player>();
                if(matchupsForDay[court]?.[0]) {
                    [...matchupsForDay[court][0].teamA, ...matchupsForDay[court][0].teamB].forEach(p => {
                        if(!playersMap.has(p.id)) {
                            playersMap.set(p.id, p);
                        }
                    });
                }
                const courtPlayers = Array.from(playersMap.values());

                if (courtPlayers.length === 0) return null;

                return (
                    <div key={court}>
                        <h4 className="text-xl font-semibold mb-4 text-center text-white">{court}</h4>
                        <div className="space-y-2 max-w-4xl mx-auto">
                            {courtPlayers
                                .sort((a,b) => a.name.localeCompare(b.name))
                                .map(player => (
                                <PlayerAttendanceRow
                                    key={player.id}
                                    player={player}
                                    attendance={attendanceForDay?.[player.id]}
                                    onAttendanceChange={(gameIndex, isPresent) => onAttendanceChange(player.id, gameIndex, isPresent)}
                                    gamesPerDay={gamesPerDay}
                                    isDayLocked={isDayLocked}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AttendanceManager;