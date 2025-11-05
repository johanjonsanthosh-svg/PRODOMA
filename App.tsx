import React, { useState, useEffect } from 'react';
import { AppUsage, Goal } from './types';
import { dailyUsageData } from './services/mockData';
import { getGoals, saveGoals } from './services/backendService';
import { SunIcon, MoonIcon, ChartBarIcon, TargetIcon, FocusIcon, RssIcon, ShieldCheckIcon, DocumentTextIcon, LightBulbIcon, ArrowUpTrayIcon } from './components/icons';
import Dashboard from './components/Dashboard';
import AppUsageList from './components/AppUsageList';
import GoalTracker from './components/GoalTracker';
import FocusMode from './components/FocusMode';
import LiveAnalysis from './components/LiveAnalysis';
import Reports from './components/Reports';
import Challenges from './components/Challenges';
import Discovery from './components/Discovery';
import ImportAnalysis from './components/ImportAnalysis';

type View = 'DASHBOARD' | 'DETAILS' | 'GOALS' | 'FOCUS' | 'LIVE' | 'REPORTS' | 'CHALLENGES' | 'DISCOVERY' | 'IMPORT_ANALYSIS';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const [usageData] = useState<AppUsage[]>(dailyUsageData);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const updateGoals = (newGoals: React.SetStateAction<Goal[]>) => {
    const goalsToSave = typeof newGoals === 'function' ? newGoals(goals) : newGoals;
    setGoals(goalsToSave);
    saveGoals(goalsToSave);
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Fix: Correctly type the `icon` prop to allow `className` to be passed via `React.cloneElement`.
  const NavButton = ({ view, label, icon, isSidebar = false }: { view: View, label: string, icon: React.ReactElement<{ className?: string }>, isSidebar?: boolean }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`flex ${isSidebar ? 'justify-start w-full text-left' : 'flex-col items-center justify-center md:flex-row'} space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeView === view ? 'bg-primary-100 text-primary-700 dark:bg-white/10 dark:text-white' : 'text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200'}`}
    >
      {React.cloneElement(icon, { className: "w-6 h-6" })}
      <span className={isSidebar ? 'block' : 'text-xs md:text-base'}>{label}</span>
    </button>
  );
  
  const SidebarNav = () => (
    <aside className="w-64 glass-card p-4 flex-col space-y-2 hidden md:flex">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white px-4 mb-4">PRODOMA</h1>
        <NavButton view="DASHBOARD" label="Dashboard" icon={<ChartBarIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="REPORTS" label="AI Reports" icon={<DocumentTextIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="DETAILS" label="Usage Details" icon={<ChartBarIcon className="w-5 h-5 -scale-x-100"/>} isSidebar={true} />
        <NavButton view="GOALS" label="Goals" icon={<TargetIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="CHALLENGES" label="Challenges" icon={<ShieldCheckIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="DISCOVERY" label="Discovery" icon={<LightBulbIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="LIVE" label="Live Analysis" icon={<RssIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="IMPORT_ANALYSIS" label="Import & Analyze" icon={<ArrowUpTrayIcon className="w-5 h-5"/>} isSidebar={true} />
        <NavButton view="FOCUS" label="Focus Mode" icon={<FocusIcon className="w-5 h-5"/>} isSidebar={true} />
    </aside>
  );

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD': return <Dashboard setActiveView={setActiveView} goals={goals} />;
      case 'DETAILS': return <AppUsageList usageData={usageData} />;
      case 'GOALS': return <GoalTracker goals={goals} setGoals={updateGoals} usageData={usageData} />;
      case 'FOCUS': return <FocusMode onEnd={() => setActiveView('DASHBOARD')} allApps={usageData} />;
      case 'LIVE': return <LiveAnalysis allApps={usageData} />;
      case 'REPORTS': return <Reports usageData={usageData}/>;
      case 'CHALLENGES': return <Challenges />;
      case 'DISCOVERY': return <Discovery />;
      case 'IMPORT_ANALYSIS': return <ImportAnalysis />;
      default: return <Dashboard setActiveView={setActiveView} goals={goals} />;
    }
  };

  if (activeView === 'FOCUS') {
    return <FocusMode onEnd={() => setActiveView('DASHBOARD')} allApps={usageData} />;
  }

  return (
    <div className="min-h-screen text-slate-700 dark:text-slate-200">
       <div className="flex">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-40 bg-slate-900/10 backdrop-blur-lg md:hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">PRODOMA</h1>
                    <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10 transition">
                    {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
                    </button>
                </div>
                </div>
            </header>
            <main className="flex-1">
                {renderView()}
            </main>
        </div>
        <div className="hidden md:block fixed top-4 right-4 z-50">
           <button onClick={toggleTheme} className="p-2 rounded-full text-slate-500 dark:text-slate-300 glass-card hover:bg-black/5 dark:hover:bg-white/20 transition">
              {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
      
      {/* Mobile navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card p-1 flex justify-around">
        <NavButton view="DASHBOARD" label="Home" icon={<ChartBarIcon />} />
        <NavButton view="REPORTS" label="Reports" icon={<DocumentTextIcon />} />
        <NavButton view="GOALS" label="Goals" icon={<TargetIcon />} />
        <NavButton view="CHALLENGES" label="Challenges" icon={<ShieldCheckIcon />} />
        <NavButton view="FOCUS" label="Focus" icon={<FocusIcon />} />
      </nav>
    </div>
  );
};

export default App;
