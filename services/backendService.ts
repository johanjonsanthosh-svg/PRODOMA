import { Goal } from '../types';
import { ActiveChallenge } from '../components/Challenges';

const GOALS_KEY = 'prodoma_goals';
const CHALLENGES_KEY = 'prodoma_active_challenges';

// Default goals if nothing in storage, matching previous initial state
const initialGoals: Goal[] = [
  { id: 'g1', appId: '1', limit: 90 },
  { id: 'g2', appId: '3', limit: 60 },
];

export const getGoals = (): Goal[] => {
  try {
    const storedGoals = localStorage.getItem(GOALS_KEY);
    if (storedGoals) {
      return JSON.parse(storedGoals);
    }
    // If no goals are stored, set the initial ones as a default
    localStorage.setItem(GOALS_KEY, JSON.stringify(initialGoals));
    return initialGoals;
  } catch (error) {
    console.error("Failed to parse goals from localStorage", error);
    return initialGoals; // Return default goals on error
  }
};

export const saveGoals = (goals: Goal[]): void => {
  try {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error("Failed to save goals to localStorage", error);
  }
};

export const getActiveChallenges = (): ActiveChallenge[] => {
  try {
    const storedChallenges = localStorage.getItem(CHALLENGES_KEY);
    return storedChallenges ? JSON.parse(storedChallenges) : [];
  } catch (error) {
    console.error("Failed to parse active challenges from localStorage", error);
    return [];
  }
};

export const saveActiveChallenges = (challenges: ActiveChallenge[]): void => {
  try {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  } catch (error) {
    console.error("Failed to save active challenges to localStorage", error);
  }
};
