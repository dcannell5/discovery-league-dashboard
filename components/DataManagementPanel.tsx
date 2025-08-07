

import React, { useRef } from 'react';
import type { AppData } from '../types';
import { presetData } from '../data/presetSchedule';
import { IconUpload, IconDownload, IconClipboardList, IconRefresh } from './Icon';

interface DataManagementPanelProps {
  appData: AppData | null;
  setAppData: React.Dispatch<React.SetStateAction<AppData | null>>;
  onSelectLeague: (leagueId: string) => void;
  onResetAllData: () => void;
}

const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ appData, setAppData, onSelectLeague, onResetAllData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!appData) return;
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `discovery-league-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("Invalid file content");
        const importedData = JSON.parse(text);
        
        // Basic validation
        if (importedData && importedData.leagues && typeof importedData.leagues === 'object') {
          if (window.confirm("Are you sure you want to overwrite all current data with the imported file? This action cannot be undone.")) {
            setAppData(importedData);
            alert("Data imported successfully!");
          }
        } else {
          throw new Error("Invalid data format in imported file.");
        }
      } catch (error: any) {
        alert(`Error importing data: ${error.message}`);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file can be re-uploaded
    event.target.value = '';
  };

  const handleLoadPreset = () => {
    if (window.confirm("Are you sure you want to load the preset 'Summer League' data? This will add it as a new event to your existing leagues.")) {
      const newLeagueId = `preset-${Date.now()}`;
      const { config, matchups } = presetData;
      
      setAppData(prev => {
          const newAppData: AppData = JSON.parse(JSON.stringify(prev || { leagues: {}, dailyResults: {}, allDailyMatchups: {}, allDailyAttendance: {}, allPlayerProfiles: {}, allRefereeNotes: {}, allAdminFeedback: {}, allPlayerFeedback: {}, allPlayerPINs: {} }));
          
          newAppData.leagues[newLeagueId] = config;
          newAppData.allDailyMatchups[newLeagueId] = matchups;
          // Initialize other data slices for the new league
          newAppData.dailyResults[newLeagueId] = {};
          newAppData.allDailyAttendance[newLeagueId] = {};
          newAppData.allPlayerProfiles[newLeagueId] = {};
          newAppData.allRefereeNotes[newLeagueId] = {};
          newAppData.allAdminFeedback![newLeagueId] = [];
          newAppData.allPlayerFeedback![newLeagueId] = [];
          newAppData.allPlayerPINs![newLeagueId] = {};

          return newAppData;
      });
      onSelectLeague(newLeagueId);
    }
  };

  return (
    <div className="my-8 p-6 bg-gray-800/50 rounded-2xl shadow-2xl border border-gray-700">
      <h2 className="text-xl font-bold text-yellow-400 mb-4 text-center">Data Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <button onClick={handleImportClick} className="bg-blue-600/50 hover:bg-blue-500 text-white font-semibold p-4 rounded-lg transition-colors flex flex-col items-center justify-center gap-2">
            <IconUpload className="w-8 h-8"/> Import Data
        </button>
        <button onClick={handleExport} className="bg-green-600/50 hover:bg-green-500 text-white font-semibold p-4 rounded-lg transition-colors flex flex-col items-center justify-center gap-2">
            <IconDownload className="w-8 h-8"/> Export Backup
        </button>
        <button onClick={handleLoadPreset} className="bg-purple-600/50 hover:bg-purple-500 text-white font-semibold p-4 rounded-lg transition-colors flex flex-col items-center justify-center gap-2">
            <IconClipboardList className="w-8 h-8"/> Load Preset League
        </button>
        <button onClick={onResetAllData} className="bg-red-600/50 hover:bg-red-500 text-white font-semibold p-4 rounded-lg transition-colors flex flex-col items-center justify-center gap-2">
            <IconRefresh className="w-8 h-8"/> Reset All Data
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
      </div>
       <p className="text-xs text-gray-500 mt-4 text-center">
        It's recommended to export a backup of your data periodically. Importing will overwrite all current data. Resetting will remove all leagues and restore the app to its default state.
      </p>
    </div>
  );
};

export default DataManagementPanel;
