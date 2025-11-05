import React from 'react';
import { AppUsage } from '../types';

interface AppUsageListProps {
  usageData: AppUsage[];
}

const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

const AppUsageList: React.FC<AppUsageListProps> = ({ usageData }) => {
  const totalUsage = usageData.reduce((sum, app) => sum + app.usage, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="glass-card p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">App Usage Details</h3>
        <div className="space-y-4">
          {usageData.sort((a,b) => b.usage - a.usage).map(app => {
            const percentage = totalUsage > 0 ? (app.usage / totalUsage) * 100 : 0;
            return (
              <div key={app.id} className="flex items-center space-x-4">
                <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">
                  {app.icon}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{app.name}</span>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{formatTime(app.usage)}</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppUsageList;