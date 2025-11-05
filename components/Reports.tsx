import React, { useState, useEffect } from 'react';
import { AppUsage, DigitalPersona, WeeklyReport, AppCategory } from '../types';
import { getDigitalPersona, generateWeeklyReport } from '../services/geminiService';
import { SparklesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from './icons';

interface ReportsProps {
  usageData: AppUsage[];
}

const CATEGORY_COLORS: { [key in AppCategory]: string } = {
    [AppCategory.SOCIAL]: 'bg-blue-500',
    [AppCategory.PRODUCTIVITY]: 'bg-green-500',
    // Fix: Corrected typo from ENTERTAINTAINMENT to ENTERTAINMENT
    [AppCategory.ENTERTAINMENT]: 'bg-red-500',
    [AppCategory.CREATIVITY]: 'bg-orange-500',
    [AppCategory.UTILITIES]: 'bg-gray-500',
    [AppCategory.LEARNING]: 'bg-teal-500',
    [AppCategory.OTHER]: 'bg-purple-500',
};

const Reports: React.FC<ReportsProps> = ({ usageData }) => {
  const [persona, setPersona] = useState<DigitalPersona | null>(null);
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      const [personaResult, reportResult] = await Promise.all([
        getDigitalPersona(usageData),
        generateWeeklyReport(usageData),
      ]);
      setPersona(personaResult);
      setReport(reportResult);
      setIsLoading(false);
    };
    fetchReports();
  }, [usageData]);

  const TrendCard = ({ category, changePercentage }: { category: AppCategory, changePercentage: number }) => (
    <div className="flex items-center space-x-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category]}`}></div>
        <span className="font-semibold text-slate-700 dark:text-slate-200">{category}</span>
        <div className={`flex items-center font-bold ml-auto ${changePercentage > 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {changePercentage > 0 ? <ArrowTrendingUpIcon className="w-5 h-5"/> : <ArrowTrendingDownIcon className="w-5 h-5"/>}
            <span>{Math.abs(changePercentage)}%</span>
        </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-8">
        <div className="text-center">
            <SparklesIcon className="w-16 h-16 mx-auto text-primary-400 animate-pulse" />
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Generating your personalized reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Your AI-Powered Report</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Digital Persona */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Your Digital Persona</h3>
            {persona && (
                <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-primary-500/80 to-primary-600/80 dark:from-primary-500/50 dark:to-primary-600/50 inline-block rounded-full mb-4">
                        <SparklesIcon className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{persona.name}</h4>
                    <p className="text-slate-600 dark:text-slate-300 my-3">{persona.description}</p>
                    <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
                        <h5 className="font-semibold text-slate-700 dark:text-slate-200">Key Advice</h5>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{persona.advice}</p>
                    </div>
                </div>
            )}
        </div>

        {/* Weekly Report */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Weekly Summary</h3>
            {report && (
                <div className="space-y-6">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{report.summary}</p>
                    <div>
                        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Key Trends</h4>
                        <div className="space-y-3">
                            {report.trends.map(trend => (
                                <TrendCard key={trend.category} category={trend.category} changePercentage={trend.changePercentage} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Reports;