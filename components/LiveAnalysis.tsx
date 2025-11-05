import React, { useState, useEffect, useMemo } from 'react';
import { RssIcon, SparklesIcon } from './icons';
import { AppUsage, LiveUsageEvent, GeminiLiveAnalysis, AppCategory } from '../types';
import { getLiveSessionInsights } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LiveAnalysisProps {
  allApps: AppUsage[];
}

type SessionState = 'IDLE' | 'ACTIVE' | 'ANALYZING' | 'RESULT';

const CATEGORY_COLORS: { [key in AppCategory]: string } = {
  [AppCategory.SOCIAL]: '#3b82f6',
  [AppCategory.PRODUCTIVITY]: '#22c55e',
  // Fix: Corrected typo from ENTERTAINTAINMENT to ENTERTAINMENT
  [AppCategory.ENTERTAINMENT]: '#ef4444',
  [AppCategory.CREATIVITY]: '#f97316',
  [AppCategory.UTILITIES]: '#6b7280',
  [AppCategory.LEARNING]: '#14b8a6',
  [AppCategory.OTHER]: '#a855f7',
};

const LiveAnalysis: React.FC<LiveAnalysisProps> = ({ allApps }) => {
  const [sessionState, setSessionState] = useState<SessionState>('IDLE');
  const [sessionLog, setSessionLog] = useState<LiveUsageEvent[]>([]);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<GeminiLiveAnalysis | null>(null);

  useEffect(() => {
    // Fix: Use window.setInterval to avoid type conflicts and refactor to correctly handle timer lifecycle.
    if (sessionState === 'ACTIVE') {
      const timer = window.setInterval(() => {
        setElapsedTime(Date.now() - (sessionStartTime || Date.now()));
        
        if (Math.random() > 0.85) {
            const now = Date.now();
            setSessionLog(prevLog => {
                const lastEvent = prevLog[prevLog.length - 1];
                if (lastEvent) { lastEvent.endTime = now; }
                const newApp = allApps[Math.floor(Math.random() * allApps.length)];
                return [...prevLog, { app: newApp, startTime: now, endTime: null }];
            });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionState, sessionStartTime, allApps]);

  const startSession = () => {
    const now = Date.now();
    setSessionStartTime(now);
    setElapsedTime(0);
    setAnalysisResult(null);
    const firstApp = allApps[Math.floor(Math.random() * allApps.length)];
    setSessionLog([{ app: firstApp, startTime: now, endTime: null }]);
    setSessionState('ACTIVE');
  };

  const stopSession = async () => {
    setSessionState('ANALYZING');
    const now = Date.now();
    const finalLog = sessionLog.map((event, index) => 
        (index === sessionLog.length - 1) ? { ...event, endTime: now } : event
    );
    setSessionLog(finalLog);
    const result = await getLiveSessionInsights(finalLog);
    setAnalysisResult(result);
    setSessionState('RESULT');
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentApp = sessionLog.length > 0 ? sessionLog[sessionLog.length - 1].app : null;

  const sessionCategoryData = useMemo(() => {
    const categoryMap = new Map<AppCategory, number>();
    const now = Date.now();
    sessionLog.forEach(event => {
        const duration = (event.endTime || now) - event.startTime;
        categoryMap.set(event.app.category, (categoryMap.get(event.app.category) || 0) + duration);
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value: Math.round(value / 1000) }));
  }, [sessionLog, elapsedTime]);

  if (sessionState === 'IDLE') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="glass-card p-8 sm:p-12 rounded-2xl shadow-lg text-center max-w-lg w-full">
          <RssIcon className="w-20 h-20 mx-auto text-primary-400" />
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Live Usage Analysis</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3">This is a <strong className="text-slate-600 dark:text-slate-300">simulation</strong> to demonstrate real-time analysis.</p>
          <button onClick={startSession} className="mt-8 w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105">Start Live Session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 glass-card p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Live Session Stats</h3>
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Duration</div>
                        <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Active App</div>
                        {currentApp && (
                            <div className="flex items-center space-x-2 mt-1">
                                <div className="p-1 bg-black/5 dark:bg-white/10 rounded-md">{currentApp.icon}</div>
                                <div className="text-lg font-semibold">{currentApp.name}</div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="w-full h-48 mt-4">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={sessionCategoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                          {sessionCategoryData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name as AppCategory]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--recharts-tooltip-bg)', border: '1px solid var(--recharts-tooltip-border)', color: 'var(--recharts-text-color)', borderRadius: '1rem' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Session Log</h3>
                <div className="space-y-2 h-72 overflow-y-auto pr-2">
                    {sessionLog.slice().reverse().map(event => (
                        <div key={event.startTime} className="flex items-center space-x-3 text-sm p-2 bg-black/5 dark:bg-white/5 rounded-md">
                           {event.app.icon}
                           <span className="font-medium text-slate-700 dark:text-slate-200">Switched to <span className="font-bold">{event.app.name}</span></span>
                           <span className="flex-grow text-right text-slate-500 dark:text-slate-400">{new Date(event.startTime).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {sessionState !== 'ACTIVE' && (
            <div className="glass-card p-6 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><SparklesIcon className="w-6 h-6 mr-2 text-primary-400"/>Session Analysis</h3>
                    {sessionState === 'ANALYZING' && <p>Analyzing your session...</p>}
                    {sessionState === 'RESULT' && analysisResult && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white">Summary</h4>
                                <p className="text-slate-600 dark:text-slate-300">{analysisResult.analysisSummary}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800 dark:text-white">Suggestions</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">{analysisResult.suggestions.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 text-center">
                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Focus Score</h4>
                    <div className={`text-6xl font-bold ${analysisResult && analysisResult.focusScore > 70 ? 'text-green-400' : analysisResult && analysisResult.focusScore > 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {sessionState === 'ANALYZING' ? '...' : analysisResult?.focusScore}
                    </div>
                </div>
            </div>
        )}
        
        <div className="flex justify-center mt-6">
            {sessionState === 'ACTIVE' && <button onClick={stopSession} className="bg-red-500/80 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-red-500 transition">Stop & Analyze</button>}
            {sessionState === 'RESULT' && <button onClick={startSession} className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-primary-700 transition">Start New Session</button>}
        </div>
    </div>
  );
};

export default LiveAnalysis;