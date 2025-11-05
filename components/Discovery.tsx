import React, { useState } from 'react';
import { LightBulbIcon, SparklesIcon } from './icons';
import { AppCategory, AppRecommendation } from '../types';
import { getAppRecommendations } from '../services/geminiService';

const Discovery: React.FC = () => {
    const [category, setCategory] = useState<AppCategory>(AppCategory.SOCIAL);
    const [interest, setInterest] = useState('');
    const [recommendations, setRecommendations] = useState<AppRecommendation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!interest) return;
        setIsLoading(true);
        setHasSearched(true);
        const results = await getAppRecommendations(category, interest);
        setRecommendations(results);
        setIsLoading(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <LightBulbIcon className="w-16 h-16 mx-auto text-primary-400"/>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Discover Productive Alternatives</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                        Spend less time on distracting apps and more time on apps that help you grow. Tell our AI what you're interested in.
                    </p>
                </div>

                <form onSubmit={handleSearch} className="mt-8 p-6 glass-card rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-4">
                    <div className="w-full">
                        <label htmlFor="category" className="block text-sm font-medium text-slate-600 dark:text-slate-300">I want to replace apps in</label>
                        <select 
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as AppCategory)}
                            className="w-full mt-1 p-2 border border-black/10 dark:border-white/20 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                        >
                            {Object.values(AppCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div className="w-full">
                        <label htmlFor="interest" className="block text-sm font-medium text-slate-600 dark:text-slate-300">and I'm interested in...</label>
                        <input 
                            type="text"
                            id="interest"
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                            placeholder="e.g., learning Spanish, coding, mindfulness"
                            className="w-full mt-1 p-2 border border-black/10 dark:border-white/20 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full md:w-auto mt-2 md:mt-6 bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary-700 transition disabled:opacity-50">
                        {isLoading ? 'Thinking...' : 'Discover'}
                    </button>
                </form>

                <div className="mt-8">
                    {isLoading && (
                        <div className="text-center p-8"><SparklesIcon className="w-12 h-12 mx-auto text-primary-400 animate-pulse" /></div>
                    )}
                    {!isLoading && hasSearched && recommendations.length === 0 && (
                        <p className="text-center p-8 text-slate-500 dark:text-slate-400">No recommendations found. Try a different interest!</p>
                    )}
                    {!isLoading && recommendations.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">AI Recommendations</h3>
                            {recommendations.map((app, i) => (
                                <div key={i} className="p-6 glass-card rounded-2xl shadow-lg">
                                    <h4 className="text-xl font-semibold text-primary-600 dark:text-primary-400">{app.appName}</h4>
                                    <span className="text-sm font-medium bg-primary-500/20 text-primary-600 dark:text-primary-300 px-2 py-1 rounded-full">{app.category}</span>
                                    <p className="text-slate-600 dark:text-slate-300 mt-2">{app.description}</p>
                                    <div className="mt-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                                        <p className="text-sm text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-200">Why it's a good fit:</strong> {app.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Discovery;