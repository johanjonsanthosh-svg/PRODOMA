import React, { useState } from 'react';
import { Goal, AppUsage, AISuggestedGoal } from '../types';
import { TargetIcon, SparklesIcon } from './icons';
import { generateAIGoals } from '../services/geminiService';
import Modal from './Modal';

interface GoalTrackerProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  usageData: AppUsage[];
}

const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, setGoals, usageData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedGoals, setSuggestedGoals] = useState<AISuggestedGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateGoals = async () => {
    setIsModalOpen(true);
    setIsLoading(true);
    const suggestions = await generateAIGoals(usageData);
    setSuggestedGoals(suggestions);
    setIsLoading(false);
  };

  const addSuggestedGoal = (suggestion: AISuggestedGoal) => {
    const app = usageData.find(a => a.name === suggestion.appName);
    if (app && !goals.some(g => g.appId === app.id)) {
        const newGoal: Goal = {
            id: `g-${Date.now()}`,
            appId: app.id,
            limit: suggestion.suggestedLimit,
        };
        setGoals(prev => [...prev, newGoal]);
    }
    // Remove from suggestions list
    setSuggestedGoals(prev => prev.filter(g => g.appName !== suggestion.appName));
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Your Goals</h2>
        <button 
            onClick={handleGenerateGoals}
            className="flex items-center space-x-2 bg-primary-600/80 dark:bg-primary-600/50 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-600 dark:hover:bg-primary-600/80 border border-primary-500 transition"
        >
            <SparklesIcon className="w-5 h-5"/>
            <span>Generate AI Goals</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center glass-card p-12 rounded-2xl shadow-lg">
          <TargetIcon className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-500" />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mt-4">No Goals Set</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Use the "Generate AI Goals" button to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const app = usageData.find(a => a.id === goal.appId);
            if (!app) return null;

            const percentage = (app.usage / goal.limit) * 100;
            const isExceeded = percentage > 100;
            const progressColor = isExceeded ? 'bg-red-500' : 'bg-green-500';

            return (
              <div key={goal.id} className="glass-card p-6 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-black/5 dark:bg-white/10 rounded-lg">{app.icon}</div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{app.name}</h4>
                </div>
                <div>
                  <div className="flex justify-between items-baseline text-sm text-slate-600 dark:text-slate-300">
                    <span>{formatTime(app.usage)} used</span>
                    <span>Goal: {formatTime(goal.limit)}</span>
                  </div>
                  <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-3 mt-2 overflow-hidden">
                    <div 
                      className={`${progressColor} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  {isExceeded && (
                    <p className="text-red-500 dark:text-red-400 text-sm mt-2 font-medium">
                      Limit exceeded by {formatTime(app.usage - goal.limit)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AI Goal Suggestions">
        {isLoading ? (
            <div className="text-center p-8"><SparklesIcon className="w-12 h-12 mx-auto text-primary-400 animate-pulse" /></div>
        ) : suggestedGoals.length > 0 ? (
            <div className="space-y-4">
                {suggestedGoals.map((sg, i) => (
                    <div key={i} className="p-4 bg-black/5 dark:bg-white/10 rounded-lg">
                        <h4 className="font-bold text-slate-800 dark:text-white">Goal for {sg.appName}</h4>
                        <p className="text-slate-600 dark:text-slate-300 my-1">{sg.reasoning}</p>
                        <div className="flex justify-between items-center mt-2">
                           <span className="font-semibold text-primary-600 dark:text-primary-400">Set limit to {formatTime(sg.suggestedLimit)}/day</span>
                           <button onClick={() => addSuggestedGoal(sg)} className="bg-primary-600/80 text-white text-sm font-semibold py-1 px-3 rounded-md hover:bg-primary-600">Add Goal</button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-center text-slate-500 dark:text-slate-300 py-4">No new goal suggestions at the moment. Great job!</p>
        )}
      </Modal>
    </div>
  );
};

export default GoalTracker;