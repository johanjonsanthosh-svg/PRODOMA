import React, { useState } from 'react';
import { ArrowUpTrayIcon, SparklesIcon } from './icons';
import { analyzeImportedData } from '../services/geminiService';

const ImportAnalysis: React.FC = () => {
    const [screenTimeData, setScreenTimeData] = useState('');
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!screenTimeData.trim()) return;
        setIsLoading(true);
        setAnalysisResult('');
        const result = await analyzeImportedData(screenTimeData);
        setAnalysisResult(result);
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <ArrowUpTrayIcon className="w-16 h-16 mx-auto text-primary-400"/>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Import & Analyze Screen Time</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                        Paste your screen time data from any source (e.g., a text file or a spreadsheet) to get a personalized analysis from our AI coach.
                    </p>
                </div>

                <div className="mt-8 glass-card p-6 rounded-2xl shadow-lg">
                    <label htmlFor="screen-time-data" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Paste your data here:</label>
                    <textarea
                        id="screen-time-data"
                        rows={10}
                        className="w-full p-3 border border-black/10 dark:border-white/20 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Example:
Chirper, 2 hours 15 minutes, Social
CodePad, 1 hour 30 minutes, Productivity
Streamify, 45 minutes, Entertainment"
                        value={screenTimeData}
                        onChange={(e) => setScreenTimeData(e.target.value)}
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !screenTimeData.trim()}
                        className="mt-4 w-full flex items-center justify-center space-x-2 bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-primary-700 transition disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                                <span>Analyzing...</span>
                            </>
                        ) : (
                             <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Analyze with AI</span>
                            </>
                        )}
                    </button>
                </div>

                {analysisResult && (
                    <div className="mt-8 glass-card p-6 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Your AI Analysis</h3>
                        <div 
                            className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300"
                            dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br />') }} // Simple markdown-like rendering
                        >
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportAnalysis;