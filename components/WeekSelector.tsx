import React from 'react';
import { UserState } from '../types';

interface WeekSelectorProps {
  currentWeek: number;
  totalWeeks: number;
  onWeekChange: (week: number) => void;
  userRole: UserState['role'];
  realCurrentLeagueWeek: number;
}

const WeekSelector: React.FC<WeekSelectorProps> = ({ currentWeek, totalWeeks, onWeekChange, userRole, realCurrentLeagueWeek }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => {
        const isLockedForReferee = userRole === 'REFEREE' && week !== realCurrentLeagueWeek;
        const isPublicView = userRole === 'NONE' || userRole === 'PLAYER' || userRole === 'PARENT';
        
        return (
          <button
            key={week}
            onClick={() => onWeekChange(week)}
            disabled={isLockedForReferee}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900
              ${currentWeek === week 
                ? 'bg-yellow-500 text-gray-900 shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }
              ${isLockedForReferee ? 'opacity-75 cursor-not-allowed' : ''}
              ${isPublicView ? 'pointer-events-none' : ''} 
            `}
            aria-disabled={isLockedForReferee}
          >
            Week {week}
          </button>
        )
      })}
    </div>
  );
};

export default WeekSelector;
