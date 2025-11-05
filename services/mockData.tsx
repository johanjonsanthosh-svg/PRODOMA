import React from 'react';
import { AppUsage, AppCategory, DetoxChallenge } from '../types';
import { CodeBracketIcon, PaintBrushIcon, FilmIcon, UsersIcon, CogIcon, BookOpenIcon } from '../components/icons';

export const dailyUsageData: AppUsage[] = [
  { id: '1', name: 'Instagram', category: AppCategory.SOCIAL, usage: 95, icon: <UsersIcon className="w-6 h-6 text-purple-400" /> },
  { id: '2', name: 'YouTube', category: AppCategory.ENTERTAINMENT, usage: 125, icon: <FilmIcon className="w-6 h-6 text-red-500" /> },
  { id: '3', name: 'VS Code', category: AppCategory.PRODUCTIVITY, usage: 150, icon: <CodeBracketIcon className="w-6 h-6 text-blue-500" /> },
  { id: '4', name: 'TikTok', category: AppCategory.SOCIAL, usage: 80, icon: <UsersIcon className="w-6 h-6 text-sky-400" /> },
  { id: '5', name: 'Netflix', category: AppCategory.ENTERTAINMENT, usage: 60, icon: <FilmIcon className="w-6 h-6 text-red-600" /> },
  { id: '6', name: 'Slack', category: AppCategory.PRODUCTIVITY, usage: 45, icon: <CodeBracketIcon className="w-6 h-6 text-green-500" /> },
  { id: '7', name: 'Spotify', category: AppCategory.ENTERTAINMENT, usage: 70, icon: <FilmIcon className="w-6 h-6 text-green-400" /> },
  { id: '8', name: 'Duolingo', category: AppCategory.LEARNING, usage: 35, icon: <BookOpenIcon className="w-6 h-6 text-teal-500" /> },
];

export const weeklyUsageData = [
    { name: 'Mon', time: 320, Productivity: 100, Social: 150, Entertainment: 70 },
    { name: 'Tue', time: 410, Productivity: 120, Social: 180, Entertainment: 110 },
    { name: 'Wed', time: 350, Productivity: 150, Social: 120, Entertainment: 80 },
    { name: 'Thu', time: 480, Productivity: 130, Social: 220, Entertainment: 130 },
    { name: 'Fri', time: 510, Productivity: 100, Social: 250, Entertainment: 160 },
    { name: 'Sat', time: 550, Productivity: 60, Social: 280, Entertainment: 210 },
    { name: 'Sun', time: 450, Productivity: 70, Social: 230, Entertainment: 150 },
];

export const challenges: DetoxChallenge[] = [
    {
        id: 'c1',
        title: 'The Weekend Unplug',
        description: 'Disconnect from social media for the entire weekend (Saturday & Sunday). Reconnect with the world around you.',
        durationDays: 2,
    },
    {
        id: 'c2',
        title: 'Mindful Mornings',
        description: 'Avoid using your phone for the first hour after waking up for 5 consecutive days. Start your day with intention.',
        durationDays: 5,
    },
    {
        id: 'c3',
        title: 'Social Media Sabbatical',
        description: 'Take a 3-day break from all social media applications to reset your digital habits.',
        durationDays: 3,
    }
];