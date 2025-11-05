import React, { useState, useEffect } from 'react';
import { FocusIcon, InformationCircleIcon } from './icons';
import { AppUsage } from '../types';
import Modal from './Modal';

interface FocusModeProps {
  onEnd: () => void;
  allApps: AppUsage[];
}

type SessionType = 'single' | 'pomodoro';
type SessionPhase = 'idle' | 'focus' | 'break';

const POMODORO_CONFIG = {
    focus: 25, // minutes
    break: 5, // minutes
};

const FocusMode: React.FC<FocusModeProps> = ({ onEnd, allApps }) => {
  const [duration, setDuration] = useState(25);
  const [allowedAppIds, setAllowedAppIds] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('single');
  const [currentPhase, setCurrentPhase] = useState<SessionPhase>('idle');
  const [pomodoroCycle, setPomodoroCycle] = useState(0);
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [blockNotifications, setBlockNotifications] = useState(true);

  const allowedApps = allApps.filter(app => allowedAppIds.has(app.id));

  const endSession = async () => {
    setCurrentPhase('idle');
    setTimeLeft(0);
    setPomodoroCycle(0);
    if (document.fullscreenElement) {
        await document.exitFullscreen();
    }
  };

  useEffect(() => {
    let interval: number | null = null;
    if (currentPhase !== 'idle' && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentPhase !== 'idle') {
      // Time's up, transition phase
      if (sessionType === 'pomodoro') {
        if (currentPhase === 'focus') {
            // Focus ended, start break
            setCurrentPhase('break');
            setTimeLeft(POMODORO_CONFIG.break * 60);
            new Notification("Break Time!", { body: "Time to relax for 5 minutes." });
        } else {
            // Break ended, start next focus
            setCurrentPhase('focus');
            setPomodoroCycle(c => c + 1);
            setTimeLeft(POMODORO_CONFIG.focus * 60);
            new Notification("Focus Time!", { body: "Let's start the next session." });
        }
      } else {
        // Single session ended
        new Notification("Session Complete!", { body: "Great work! You've completed your focus session." });
        endSession();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPhase, timeLeft, sessionType]);

  const startTimer = async () => {
    const startSessionLogic = () => {
      if (sessionType === 'pomodoro') {
          setCurrentPhase('focus');
          setTimeLeft(POMODORO_CONFIG.focus * 60);
          setPomodoroCycle(1);
      } else {
          setCurrentPhase('focus');
          setTimeLeft(duration * 60);
      }
    };
    
    if (blockNotifications) {
      try {
        await document.documentElement.requestFullscreen();
        if (Notification.permission !== 'granted') {
            await Notification.requestPermission();
        }
      } catch (err) {
        console.error("Could not enter full-screen or request notifications.", err);
      } finally {
        // BUG FIX: Use a timeout to ensure the browser has finished its async fullscreen transition
        // and is ready to process React state updates. This prevents a race condition.
        setTimeout(startSessionLogic, 100);
      }
    } else {
      startSessionLogic();
    }
  };
  
  const toggleApp = (appId: string) => {
    setAllowedAppIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(appId)) {
            newSet.delete(appId);
        } else {
            newSet.add(appId);
        }
        return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (allowedAppIds.size === allApps.length) {
        setAllowedAppIds(new Set());
    } else {
        setAllowedAppIds(new Set(allApps.map(app => app.id)));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentPhase === 'idle') {
    return (
      <>
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="glass-card p-8 sm:p-10 rounded-2xl shadow-lg text-center max-w-2xl w-full">
            <FocusIcon className="w-20 h-20 mx-auto text-primary-400" />
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Enter Focus Mode</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Create a distraction-free environment for your tasks.</p>
            
            <div className="my-8 text-left">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">1. Choose your technique</label>
              <div className="flex bg-slate-200/60 dark:bg-white/10 rounded-lg p-1">
                <button onClick={() => setSessionType('single')} className={`w-full py-2 rounded-md font-semibold transition ${sessionType === 'single' ? 'bg-white dark:bg-slate-700/50 shadow text-primary-600 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>Single Session</button>
                <button onClick={() => setSessionType('pomodoro')} className={`w-full py-2 rounded-md font-semibold transition ${sessionType === 'pomodoro' ? 'bg-white dark:bg-slate-700/50 shadow text-primary-600 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    <div className="flex items-center justify-center">
                        <span>Pomodoro</span>
                        <InformationCircleIcon onClick={(e) => { e.stopPropagation(); setInfoModalOpen(true); }} className="w-5 h-5 ml-2 cursor-pointer text-slate-400 hover:text-primary-500" />
                    </div>
                </button>
              </div>
            </div>

            {sessionType === 'single' && (
              <div className="my-8 text-left">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">2. Session Duration (minutes)</label>
                <div className="flex justify-center space-x-2">
                  {[15, 25, 45, 60].map(d => (
                    <button key={d} onClick={() => setDuration(d)} className={`px-4 py-2 rounded-lg font-semibold transition w-full ${duration === d ? 'bg-primary-600 text-white' : 'bg-slate-200/60 text-slate-800 hover:bg-slate-300/60 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="my-8 text-left">
              <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">Whitelist Apps (Optional)</label>
                  <button onClick={toggleSelectAll} className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    {allowedAppIds.size === allApps.length ? 'Deselect All' : 'Select All'}
                  </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-40 overflow-y-auto p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                  {allApps.map(app => (
                      <div key={app.id} className="flex items-center space-x-2">
                          <input type="checkbox" id={`app-${app.id}`} checked={allowedAppIds.has(app.id)} onChange={() => toggleApp(app.id)} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                           <label htmlFor={`app-${app.id}`} className="flex items-center space-x-2 cursor-pointer text-slate-700 dark:text-slate-200">
                             {app.icon}
                             <span>{app.name}</span>
                          </label>
                      </div>
                  ))}
              </div>
            </div>
            
             <div className="my-8 text-left">
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/5 dark:bg-white/5">
                    <label htmlFor="notif-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Block Notifications <span className="text-xs">(via Full Screen)</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" id="notif-toggle" checked={blockNotifications} onChange={() => setBlockNotifications(!blockNotifications)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300/80 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300/50 dark:peer-focus:ring-primary-800/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                </div>
            </div>

            <button onClick={startTimer} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition-transform transform hover:scale-105">
              Start Focusing
            </button>
             <button onClick={onEnd} className="mt-4 w-full text-slate-500 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition">
              Back to Dashboard
            </button>
          </div>
        </div>
        <Modal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} title="About the Pomodoro Technique">
            <div className="text-slate-600 dark:text-slate-300 space-y-3">
                <p>The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s.</p>
                <p>It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks. Each interval is known as a pomodoro, from the Italian word for 'tomato'.</p>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Why it works:</p>
                <ul className="list-disc list-inside space-y-2">
                    <li><strong className="font-semibold">Improves Focus:</strong> The short, timed sessions create a sense of urgency and make it easier to stay on task.</li>
                    <li><strong className="font-semibold">Reduces Burnout:</strong> Regular breaks allow your mind to rest and recharge, preventing mental fatigue.</li>
                    <li><strong className="font-semibold">Increases Awareness:</strong> It helps you understand how much time tasks actually take, improving future planning.</li>
                </ul>
            </div>
        </Modal>
      </>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-4">
        <h2 className={`text-4xl font-bold text-white mb-4 transition-colors ${currentPhase === 'break' ? 'text-green-400' : 'text-primary-400'}`}>
            {currentPhase === 'focus' ? "Focus Time" : "Break Time"}
            {sessionType === 'pomodoro' && <span className="text-2xl ml-2"> (Cycle {pomodoroCycle})</span>}
        </h2>
        <p className="text-9xl font-mono font-bold text-white my-12 tracking-tighter">
            {formatTime(timeLeft)}
        </p>
        {allowedApps.length > 0 && (
             <div className="text-center mb-12">
                <p className="text-slate-400 text-lg mb-4">Your allowed apps for this session:</p>
                <div className="flex justify-center items-center gap-4">
                    {allowedApps.map(app => (
                         <div key={app.id} className="p-3 bg-white/10 rounded-full">
                           {React.cloneElement(app.icon, { className: "w-8 h-8 text-white" })}
                         </div>
                    ))}
                </div>
            </div>
        )}
        <button 
            onClick={endSession}
            className="bg-red-500/80 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-red-500 transition-transform transform hover:scale-105"
        >
            End Session
        </button>
    </div>
  );
};

export default FocusMode;