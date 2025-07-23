
import { Player, AllDailyMatchups, LeagueConfig } from '../types';

// Player list (42 players)
const players: Player[] = [
  { id: 1, name: 'Amy S' },
  { id: 2, name: 'Arravela E' },
  { id: 3, name: 'Ashlyn H' },
  { id: 4, name: 'Athena M' },
  { id: 5, name: 'Aurora P' },
  { id: 6, name: 'Bailey G' },
  { id: 7, name: 'Bayli L' },
  { id: 8, name: 'Bree E' },
  { id: 9, name: 'Breanna P' },
  { id: 10, name: 'Brie B' },
  { id: 11, name: 'Char B' },
  { id: 12, name: 'Cia S' },
  { id: 13, name: 'Cindel S' },
  { id: 14, name: 'Dana J' },
  { id: 15, name: 'Elise E' },
  { id: 16, name: 'Emily Sh' },
  { id: 17, name: 'Emily Sm' },
  { id: 18, name: 'Emma W' },
  { id: 19, name: 'Eumi D' },
  { id: 20, name: 'Ghazal A' },
  { id: 21, name: 'Grace B' },
  { id: 22, name: 'Imari L' },
  { id: 23, name: 'Isadora L' },
  { id: 24, name: 'Kalayah P' },
  { id: 25, name: 'Khaliun K' },
  { id: 26, name: 'Luca T' },
  { id: 27, name: 'Lucie K' },
  { id: 28, name: 'Lula B' },
  { id: 29, name: 'Michelle O' },
  { id: 30, name: 'Mikayla W' },
  { id: 31, name: 'Nash T' },
  { id: 32, name: 'Noa K' },
  { id: 33, name: 'Nour M' },
  { id: 34, name: 'Prabhleen K' },
  { id: 35, name: 'Quinn T' },
  { id: 36, name: 'Roseberrie Z' },
  { id: 37, name: 'Samantha M' },
  { id: 38, name: 'Sophia T' },
  { id: 39, name: 'Sophie Y' },
  { id: 40, name: 'Teagan S' },
  { id: 41, name: 'Tianna D' },
  { id: 42, name: 'Zara O' },
];

const p = (name: string): Player => {
  const player = players.find(pl => pl.name === name);
  if (!player) throw new Error(`DEV ERROR: Player not found in preset list: ${name}`);
  return { id: player.id, name: player.name };
};

const matchups: AllDailyMatchups = {
  1: { // Day 1
    "Royalty Court": [
      { teamA: [p('Bayli L'), p('Bree E'), p('Elise E'), p('Prabhleen K'), p('Sophia T'), p('Kalayah P'), p('Michelle O')], teamB: [p('Zara O'), p('Khaliun K'), p('Tianna D'), p('Nash T'), p('Emily Sh'), p('Char B'), p('Aurora P')] },
      { teamA: [p('Roseberrie Z'), p('Sophie Y'), p('Char B'), p('Nash T'), p('Prabhleen K'), p('Khaliun K'), p('Mikayla W')], teamB: [p('Breanna P'), p('Samantha M'), p('Emily Sh'), p('Teagan S'), p('Tianna D'), p('Aurora P'), p('Quinn T')] },
      { teamA: [p('Khaliun K'), p('Kalayah P'), p('Quinn T'), p('Nour M'), p('Michelle O'), p('Teagan S')], teamB: [p('Roseberrie Z'), p('Emily Sm'), p('Cia S'), p('Bayli L'), p('Noa K'), p('Bree E'), p('Isadora L')] },
      { teamA: [p('Imari L'), p('Char B'), p('Elise E'), p('Michelle O'), p('Arravela E'), p('Cindel S'), p('Bailey G')], teamB: [p('Nash T'), p('Zara O'), p('Emma W'), p('Ashlyn H'), p('Brie B'), p('Kalayah P'), p('Aurora P')] },
      { teamA: [p('Aurora P'), p('Noa K'), p('Quinn T'), p('Emma W'), p('Prabhleen K'), p('Mikayla W'), p('Elise E')], teamB: [p('Arravela E'), p('Emily Sh'), p('Imari L'), p('Emily Sm'), p('Bayli L'), p('Bailey G'), p('Nour M')] },
      { teamA: [p('Emily Sm'), p('Ashlyn H'), p('Mikayla W'), p('Samantha M'), p('Tianna D'), p('Emily Sh'), p('Aurora P')], teamB: [p('Amy S'), p('Breanna P'), p('Kalayah P'), p('Cia S'), p('Bailey G'), p('Khaliun K'), p('Brie B')] },
    ],
    "Challenger Court 1": [
      { teamA: [p('Lucie K'), p('Amy S'), p('Noa K'), p('Lula B'), p('Grace B'), p('Ghazal A'), p('Bailey G')], teamB: [p('Eumi D'), p('Roseberrie Z'), p('Nour M'), p('Cindel S'), p('Samantha M'), p('Quinn T'), p('Arravela E')] },
      { teamA: [p('Cia S'), p('Arravela E'), p('Lucie K'), p('Michelle O'), p('Brie B'), p('Ashlyn H'), p('Cindel S')], teamB: [p('Bree E'), p('Eumi D'), p('Dana J'), p('Lula B'), p('Noa K'), p('Isadora L'), p('Athena M')] },
      { teamA: [p('Samantha M'), p('Lucie K'), p('Prabhleen K'), p('Zara O'), p('Imari L'), p('Sophie Y'), p('Grace B')], teamB: [p('Elise E'), p('Bailey G'), p('Breanna P'), p('Emily Sh'), p('Sophia T'), p('Aurora P'), p('Char B')] },
      { teamA: [p('Emily Sm'), p('Lucie K'), p('Bree E'), p('Roseberrie Z'), p('Breanna P'), p('Nour M'), p('Tianna D')], teamB: [p('Khaliun K'), p('Samantha M'), p('Grace B'), p('Sophie Y'), p('Isadora L'), p('Bayli L'), p('Quinn T')] },
      { teamA: [p('Lula B'), p('Char B'), p('Dana J'), p('Sophie Y'), p('Samantha M'), p('Brie B')], teamB: [p('Isadora L'), p('Cindel S'), p('Zara O'), p('Bree E'), p('Nour M')] },
      { teamA: [p('Amy S'), p('Michelle O'), p('Cindel S'), p('Zara O'), p('Dana J'), p('Roseberrie Z'), p('Grace B')], teamB: [p('Breanna P'), p('Kalayah P'), p('Quinn T'), p('Teagan S'), p('Emma W'), p('Isadora L'), p('Nour M')] },
    ],
    "Foundation Court": [
      { teamA: [p('Isadora L'), p('Ashlyn H'), p('Breanna P'), p('Athena M'), p('Brie B'), p('Dana J'), p('Luca T')], teamB: [p('Imari L'), p('Emily Sm'), p('Sophie Y'), p('Cia S'), p('Emma W'), p('Mikayla W'), p('Teagan S')] },
      { teamA: [p('Elise E'), p('Amy S'), p('Nour M'), p('Zara O'), p('Imari L'), p('Sophia T'), p('Bailey G')], teamB: [p('Bayli L'), p('Kalayah P'), p('Ghazal A'), p('Grace B'), p('Emily Sm'), p('Luca T')] },
      { teamA: [p('Ghazal A'), p('Cindel S'), p('Mikayla W'), p('Lula B'), p('Ashlyn H'), p('Nash T'), p('Athena M')], teamB: [p('Eumi D'), p('Emma W'), p('Brie B'), p('Tianna D'), p('Amy S'), p('Arravela E'), p('Dana J')] },
      { teamA: [p('Noa K'), p('Eumi D'), p('Amy S'), p('Ghazal A'), p('Cia S'), p('Mikayla W'), p('Teagan S')], teamB: [p('Sophia T'), p('Athena M'), p('Dana J'), p('Emily Sh'), p('Luca T'), p('Lula B'), p('Prabhleen K')] },
      { teamA: [p('Cindel S'), p('Breanna P'), p('Tianna D'), p('Michelle O'), p('Roseberrie Z'), p('Ashlyn H')], teamB: [p('Athena M'), p('Dana J'), p('Kalayah P'), p('Amy S'), p('Teagan S')] },
      { teamA: [p('Ghazal A'), p('Teagan S'), p('Elise E'), p('Imari L'), p('Bree E'), p('Prabhleen K')], teamB: [p('Khaliun K'), p('Arravela E'), p('Sophie Y'), p('Noa K'), p('Eumi D'), p('Lula B'), p('Bayli L')] },
    ]
  },
  2: { // Day 2
    "Royalty Court": [
        { teamA: [p('Quinn T'), p('Ghazal A'), p('Kalayah P'), p('Breanna P'), p('Isadora L'), p('Grace B'), p('Nash T')], teamB: [p('Elise E'), p('Sophia T'), p('Bayli L'), p('Bree E'), p('Aurora P'), p('Teagan S'), p('Eumi D')] },
        { teamA: [p('Bree E'), p('Kalayah P'), p('Nash T'), p('Grace B'), p('Isadora L'), p('Breanna P'), p('Quinn T')], teamB: [p('Elise E'), p('Sophia T'), p('Bayli L'), p('Eumi D'), p('Teagan S'), p('Ghazal A'), p('Aurora P')] },
        { teamA: [p('Isadora L'), p('Aurora P'), p('Teagan S'), p('Elise E'), p('Breanna P'), p('Kalayah P'), p('Ghazal A')], teamB: [p('Grace B'), p('Quinn T'), p('Eumi D'), p('Sophia T'), p('Bayli L'), p('Bree E'), p('Nash T')] },
        { teamA: [p('Sophia T'), p('Bayli L'), p('Nash T'), p('Quinn T'), p('Grace B'), p('Ghazal A'), p('Elise E')], teamB: [p('Aurora P'), p('Teagan S'), p('Eumi D'), p('Breanna P'), p('Bree E'), p('Isadora L'), p('Kalayah P')] },
        { teamA: [p('Grace B'), p('Sophia T'), p('Ghazal A'), p('Elise E'), p('Bayli L'), p('Quinn T'), p('Breanna P')], teamB: [p('Bree E'), p('Teagan S'), p('Aurora P'), p('Nash T'), p('Kalayah P'), p('Isadora L'), p('Eumi D')] },
        { teamA: [p('Aurora P'), p('Sophia T'), p('Quinn T'), p('Ghazal A'), p('Breanna P'), p('Elise E'), p('Bayli L')], teamB: [p('Kalayah P'), p('Grace B'), p('Teagan S'), p('Eumi D'), p('Nash T'), p('Isadora L'), p('Bree E')] },
    ],
    "Challenger Court 1": [
        { teamA: [p('Emma W'), p('Khaliun K'), p('Lula B'), p('Brie B'), p('Michelle O'), p('Nour M'), p('Cindel S')], teamB: [p('Prabhleen K'), p('Mikayla W'), p('Cia S'), p('Tianna D'), p('Noa K'), p('Amy S'), p('Zara O')] },
        { teamA: [p('Khaliun K'), p('Brie B'), p('Tianna D'), p('Cia S'), p('Mikayla W'), p('Prabhleen K'), p('Amy S')], teamB: [p('Lula B'), p('Zara O'), p('Emma W'), p('Michelle O'), p('Noa K'), p('Nour M'), p('Cindel S')] },
        { teamA: [p('Mikayla W'), p('Emma W'), p('Tianna D'), p('Zara O'), p('Prabhleen K'), p('Cindel S'), p('Nour M')], teamB: [p('Cia S'), p('Michelle O'), p('Amy S'), p('Lula B'), p('Brie B'), p('Khaliun K'), p('Noa K')] },
        { teamA: [p('Brie B'), p('Emma W'), p('Tianna D'), p('Michelle O'), p('Cia S'), p('Nour M'), p('Zara O')], teamB: [p('Lula B'), p('Noa K'), p('Amy S'), p('Prabhleen K'), p('Khaliun K'), p('Mikayla W'), p('Cindel S')] },
        { teamA: [p('Cia S'), p('Emma W'), p('Nour M'), p('Zara O'), p('Khaliun K'), p('Michelle O'), p('Prabhleen K')], teamB: [p('Lula B'), p('Cindel S'), p('Mikayla W'), p('Tianna D'), p('Noa K'), p('Brie B'), p('Amy S')] },
        { teamA: [p('Emma W'), p('Khaliun K'), p('Michelle O'), p('Cindel S'), p('Nour M'), p('Prabhleen K'), p('Lula B')], teamB: [p('Cia S'), p('Noa K'), p('Amy S'), p('Zara O'), p('Mikayla W'), p('Brie B'), p('Tianna D')] },
    ],
    "Foundation Court": [
        { teamA: [p('Char B'), p('Roseberrie Z'), p('Dana J'), p('Athena M'), p('Emily Sm'), p('Lucie K'), p('Sophie Y')], teamB: [p('Arravela E'), p('Imari L'), p('Emily Sh'), p('Bailey G'), p('Samantha M'), p('Ashlyn H'), p('Luca T')] },
        { teamA: [p('Char B'), p('Bailey G'), p('Dana J'), p('Emily Sm'), p('Ashlyn H'), p('Samantha M'), p('Emily Sh')], teamB: [p('Imari L'), p('Roseberrie Z'), p('Athena M'), p('Lucie K'), p('Sophie Y'), p('Luca T'), p('Arravela E')] },
        { teamA: [p('Dana J'), p('Arravela E'), p('Char B'), p('Imari L'), p('Athena M'), p('Roseberrie Z'), p('Emily Sm')], teamB: [p('Samantha M'), p('Lucie K'), p('Bailey G'), p('Sophie Y'), p('Luca T'), p('Emily Sh'), p('Ashlyn H')] },
        { teamA: [p('Roseberrie Z'), p('Dana J'), p('Emily Sm'), p('Imari L'), p('Sophie Y'), p('Luca T'), p('Bailey G')], teamB: [p('Arravela E'), p('Char B'), p('Athena M'), p('Samantha M'), p('Lucie K'), p('Ashlyn H'), p('Emily Sh')] },
        { teamA: [p('Char B'), p('Roseberrie Z'), p('Emily Sh'), p('Athena M'), p('Lucie K'), p('Dana J'), p('Samantha M')], teamB: [p('Arravela E'), p('Imari L'), p('Emily Sm'), p('Sophie Y'), p('Bailey G'), p('Ashlyn H'), p('Luca T')] },
        { teamA: [p('Arravela E'), p('Cia S'), p('Char B'), p('Roseberrie Z'), p('Emily Sh'), p('Samantha M'), p('Lucie K')], teamB: [p('Bailey G'), p('Luca T'), p('Athena M'), p('Emily Sm'), p('Ashlyn H'), p('Dana J'), p('Sophie Y')] },
    ]
  },
  3: { // Day 3
    "Royalty Court": [
        { teamA: [p('Quinn T'), p('Breanna P'), p('Ghazal A'), p('Kalayah P'), p('Prabhleen K'), p('Nash T'), p('Sophia T')], teamB: [p('Tianna D'), p('Mikayla W'), p('Eumi D'), p('Cia S'), p('Emily Sm'), p('Bree E'), p('Bayli L')] },
        { teamA: [p('Cia S'), p('Ghazal A'), p('Sophia T'), p('Nash T'), p('Prabhleen K'), p('Kalayah P'), p('Quinn T')], teamB: [p('Tianna D'), p('Mikayla W'), p('Eumi D'), p('Bayli L'), p('Bree E'), p('Breanna P'), p('Emily Sm')] },
        { teamA: [p('Prabhleen K'), p('Emily Sm'), p('Bree E'), p('Tianna D'), p('Kalayah P'), p('Ghazal A'), p('Breanna P')], teamB: [p('Nash T'), p('Quinn T'), p('Bayli L'), p('Mikayla W'), p('Eumi D'), p('Cia S'), p('Sophia T')] },
        { teamA: [p('Mikayla W'), p('Eumi D'), p('Sophia T'), p('Quinn T'), p('Nash T'), p('Breanna P'), p('Ghazal A')], teamB: [p('Emily Sm'), p('Bree E'), p('Bayli L'), p('Kalayah P'), p('Cia S'), p('Prabhleen K'), p('Tianna D')] },
        { teamA: [p('Bree E'), p('Mikayla W'), p('Breanna P'), p('Tianna D'), p('Eumi D'), p('Quinn T'), p('Kalayah P')], teamB: [p('Cia S'), p('Nash T'), p('Emily Sm'), p('Sophia T'), p('Ghazal A'), p('Prabhleen K'), p('Bayli L')] },
        { teamA: [p('Emily Sm'), p('Mikayla W'), p('Nash T'), p('Breanna P'), p('Kalayah P'), p('Tianna D'), p('Prabhleen K')], teamB: [p('Ghazal A'), p('Quinn T'), p('Bree E'), p('Bayli L'), p('Cia S'), p('Sophia T'), p('Eumi D')] },
    ],
    "Challenger Court 1": [
        { teamA: [p('Cindel S'), p('Khaliun K'), p('Athena M'), p('Isadora L'), p('Teagan S'), p('Lula B'), p('Elise E')], teamB: [p('Zara O'), p('Nour M'), p('Dana J'), p('Roseberrie Z'), p('Grace B'), p('Brie B'), p('Luca T')] },
        { teamA: [p('Khaliun K'), p('Isadora L'), p('Roseberrie Z'), p('Dana J'), p('Nour M'), p('Zara O'), p('Elise E')], teamB: [p('Athena M'), p('Luca T'), p('Cindel S'), p('Teagan S'), p('Grace B'), p('Lula B'), p('Brie B')] },
        { teamA: [p('Nour M'), p('Cindel S'), p('Grace B'), p('Luca T'), p('Zara O'), p('Brie B'), p('Lula B')], teamB: [p('Dana J'), p('Teagan S'), p('Elise E'), p('Athena M'), p('Isadora L'), p('Khaliun K'), p('Roseberrie Z')] },
        { teamA: [p('Isadora L'), p('Cindel S'), p('Roseberrie Z'), p('Teagan S'), p('Elise E'), p('Lula B'), p('Brie B')], teamB: [p('Athena M'), p('Grace B'), p('Dana J'), p('Zara O'), p('Khaliun K'), p('Nour M'), p('Luca T')] },
        { teamA: [p('Grace B'), p('Cindel S'), p('Lula B'), p('Luca T'), p('Khaliun K'), p('Teagan S'), p('Zara O')], teamB: [p('Athena M'), p('Brie B'), p('Nour M'), p('Roseberrie Z'), p('Dana J'), p('Isadora L'), p('Elise E')] },
        { teamA: [p('Cindel S'), p('Khaliun K'), p('Dana J'), p('Lula B'), p('Zara O'), p('Luca T'), p('Elise E')], teamB: [p('Brie B'), p('Teagan S'), p('Grace B'), p('Nour M'), p('Athena M'), p('Roseberrie Z'), p('Isadora L')] },
    ],
    "Foundation Court": [
        { teamA: [p('Michelle O'), p('Aurora P'), p('Emma W'), p('Char B'), p('Arravela E'), p('Ashlyn H'), p('Noa K')], teamB: [p('Amy S'), p('Lucie K'), p('Sophie Y'), p('Imari L'), p('Emily Sh'), p('Bailey G'), p('Samantha M')] },
        { teamA: [p('Michelle O'), p('Imari L'), p('Emma W'), p('Arravela E'), p('Samantha M'), p('Emily Sh'), p('Bailey G')], teamB: [p('Lucie K'), p('Aurora P'), p('Char B'), p('Ashlyn H'), p('Noa K'), p('Sophie Y'), p('Amy S')] },
        { teamA: [p('Bailey G'), p('Amy S'), p('Michelle O'), p('Samantha M'), p('Emily Sh'), p('Imari L'), p('Sophie Y')], teamB: [p('Emma W'), p('Lucie K'), p('Char B'), p('Arravela E'), p('Ashlyn H'), p('Noa K'), p('Aurora P')] },
        { teamA: [p('Aurora P'), p('Emma W'), p('Arravela E'), p('Emily Sh'), p('Sophie Y'), p('Imari L')], teamB: [p('Amy S'), p('Samantha M'), p('Char B'), p('Lucie K'), p('Ashlyn H'), p('Bailey G'), p('Michelle O')] },
        { teamA: [p('Michelle O'), p('Amy S'), p('Sophie Y'), p('Char B'), p('Ashlyn H'), p('Lucie K'), p('Emily Sh')], teamB: [p('Aurora P'), p('Samantha M'), p('Arravela E'), p('Noa K'), p('Imari L'), p('Bailey G'), p('Emma W')] },
        { teamA: [p('Amy S'), p('Michelle O'), p('Aurora P'), p('Sophie Y'), p('Emily Sh'), p('Emma W'), p('Bailey G')], teamB: [p('Imari L'), p('Lucie K'), p('Arravela E'), p('Samantha M'), p('Ashlyn H'), p('Noa K'), p('Char B')] },
    ]
  },
};

const config: Omit<LeagueConfig, 'id'> = {
  title: 'Summer League (Imported)',
  totalDays: 3,
  players,
  announcements: 'Welcome! This league data has been imported from the pre-season schedule. You can now enter scores for each day.',
  daySchedules: {},
  leagueType: 'standard',
  numCourts: 3,
  playersPerTeam: 7,
  gamesPerDay: 6,
  courtNames: ['Royalty Court', 'Challenger Court 1', 'Foundation Court']
};

export const presetData = {
    config,
    matchups,
};
