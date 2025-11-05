import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AppUsage, AppCategory, Goal } from '../types';
import { dailyUsageData, weeklyUsageData } from '../services/mockData';
import { ClockIcon, SparklesIcon, FireIcon, TargetIcon, ArrowTrendingUpIcon } from './icons';

interface DashboardProps {
  setActiveView: (view: any) => void;
  goals: Goal[];
}

const CATEGORY_COLORS: { [key in AppCategory]: string } = {
  [AppCategory.SOCIAL]: '#3b82f6', // blue-500
  [AppCategory.PRODUCTIVITY]: '#22c55e', // green-500
  // Fix: Corrected typo from ENTERTAINTAINMENT to ENTERTAINMENT
  [AppCategory.ENTERTAINMENT]: '#ef4444', // red-500
  [AppCategory.CREATIVITY]: '#f97316', // orange-500
  [AppCategory.UTILITIES]: '#6b7280', // gray-500
  [AppCategory.LEARNING]: '#14b8a6', // teal-500
  [AppCategory.OTHER]: '#a855f7', // purple-500
};

const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

const aggregateByCategory = (data: AppUsage[]) => {
  const categoryMap = new Map<AppCategory, number>();
  data.forEach(app => {
    categoryMap.set(app.category, (categoryMap.get(app.category) || 0) + app.usage);
  });
  return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
};


const Dashboard: React.FC<DashboardProps> = ({ setActiveView, goals }) => {
    const totalUsage = dailyUsageData.reduce((sum, app) => sum + app.usage, 0);
    const categoryData = aggregateByCategory(dailyUsageData);
    const unplugStreak = 5; // Mock data

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Main Metric Card */}
        <div className="glass-card p-6 rounded-2xl shadow-lg flex flex-col justify-center">
            <div className="flex items-center text-slate-500 dark:text-slate-400">
                <ClockIcon className="w-6 h-6 mr-2"/>
                <span className="text-lg">Today's Screen Time</span>
            </div>
            <p className="text-5xl font-bold text-slate-900 dark:text-white mt-2">{formatTime(totalUsage)}</p>
        </div>
        
        {/* Unplug Streak */}
        <div className="glass-card p-6 rounded-2xl shadow-lg flex flex-col justify-center items-center text-center">
             <div className="flex items-center text-slate-500 dark:text-slate-400">
                <FireIcon className="w-6 h-6 mr-2 text-orange-500 dark:text-orange-400"/>
                <span className="text-lg">Unplug Streak</span>
            </div>
            <p className="text-5xl font-bold text-orange-500 dark:text-orange-400 mt-2">{unplugStreak} <span className="text-3xl">days</span></p>
        </div>

        {/* Active Goals */}
        <div className="glass-card p-6 rounded-2xl shadow-lg flex flex-col justify-center">
             <div className="flex items-center text-slate-500 dark:text-slate-400">
                <TargetIcon className="w-6 h-6 mr-2"/>
                <span className="text-lg">Active Goals</span>
            </div>
            <p className="text-5xl font-bold text-slate-900 dark:text-white mt-2">{goals.length}</p>
        </div>

         {/* AI Reports Card */}
        <div className="glass-card bg-primary-500/10 dark:bg-primary-500/20 p-6 rounded-2xl shadow-lg text-primary-900 dark:text-white flex flex-col justify-between">
            <div>
                <div className="flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2" stroke="currentColor"/>
                    <h3 className="text-lg font-semibold">AI Weekly Report</h3>
                </div>
                <p className="mt-2 text-primary-700 dark:text-primary-200">Get your personalized weekly summary and digital persona.</p>
            </div>
            <button 
                onClick={() => setActiveView('REPORTS')}
                className="mt-4 w-full bg-primary-500 text-white dark:bg-white/20 dark:text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-600 dark:hover:bg-white/30 transition-transform transform hover:scale-105"
            >
                View Report
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Breakdown Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Category Breakdown</h3>
          <div className="w-full h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="45%" 
                  outerRadius={80} 
                  labelLine={false} 
                  label={false}
                >
                  {categoryData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name as AppCategory]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--recharts-tooltip-bg)', border: '1px solid var(--recharts-tooltip-border)', color: 'var(--recharts-text-color)', borderRadius: '1rem' }} />
                <Legend 
                  verticalAlign="bottom"
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Weekly Usage Chart */}
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl shadow-lg">
           <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
            <ArrowTrendingUpIcon className="w-6 h-6 mr-2" /> Weekly Trend
           </h3>
           <div className="w-full h-64">
             <ResponsiveContainer>
                <BarChart data={weeklyUsageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                    <YAxis tickFormatter={(value) => formatTime(value as number)} tick={{ fill: 'currentColor' }} className="text-slate-500 dark:text-slate-400" />
                    <Tooltip 
                        formatter={(value) => [formatTime(value as number), 'Time']}
                        cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
                        contentStyle={{ backgroundColor: 'var(--recharts-tooltip-bg)', border: '1px solid var(--recharts-tooltip-border)', color: 'var(--recharts-text-color)', borderRadius: '1rem' }}
                    />
                    <Legend />
                    <Bar dataKey="Social" stackId="a" fill={CATEGORY_COLORS.Social} />
                    <Bar dataKey="Productivity" stackId="a" fill={CATEGORY_COLORS.Productivity} />
                    <Bar dataKey="Entertainment" stackId="a" fill={CATEGORY_COLORS.Entertainment} radius={[4, 4, 0, 0]}/>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;