import { ReactNode, ReactElement } from 'react';

export enum AppCategory {
  SOCIAL = 'Social',
  PRODUCTIVITY = 'Productivity',
  // Fix: Corrected typo from ENTERTAINTAINMENT to ENTERTAINMENT
  ENTERTAINMENT = 'Entertainment',
  UTILITIES = 'Utilities',
  CREATIVITY = 'Creativity',
  LEARNING = 'Learning',
  OTHER = 'Other',
}

export interface AppUsage {
  id: string;
  name: string;
  category: AppCategory;
  usage: number; // in minutes
  // Fix: Changed icon type to ReactElement for compatibility with React.cloneElement
  // FIX: Specifically type icon to accept a className prop for React.cloneElement.
  icon: ReactElement<{ className?: string }>;
}

export interface Goal {
  id:string;
  appId: string;
  limit: number; // in minutes
}

export interface GeminiInsights {
  tips: string[];
  suggestedGoal: string;
}

export interface LiveUsageEvent {
  app: AppUsage;
  startTime: number; // timestamp
  endTime: number | null; // timestamp, null if ongoing
}

export interface GeminiLiveAnalysis {
  analysisSummary: string;
  focusScore: number; // A score from 0 to 100
  suggestions: string[];
}

export interface DigitalPersona {
    name: string;
    description: string;
    advice: string;
}

export interface WeeklyReport {
    summary: string;
    trends: {
        category: AppCategory;
        changePercentage: number;
    }[];
}

export interface DetoxChallenge {
    id: string;
    title: string;
    description: string;
    durationDays: number;
}

export interface AppRecommendation {
    appName: string;
    category: AppCategory;
    description: string;
    reason: string;
}

export interface AISuggestedGoal {
    appName: string;
    suggestedLimit: number; // in minutes
    reasoning: string;
}