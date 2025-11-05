import React, { useState, useEffect } from 'react';
import { challenges } from '../services/mockData';
import { DetoxChallenge } from '../types';
import { getDetoxCoachMessage } from '../services/geminiService';
import { getActiveChallenges, saveActiveChallenges } from '../services/backendService';
import { ShieldCheckIcon, FireIcon, SparklesIcon } from './icons';
import Modal from './Modal';

export interface ActiveChallenge {
    id: string;
    startDate: number; // timestamp
}

const Challenges: React.FC = () => {
    const [activeChallenges, setActiveChallenges] = useState<ActiveChallenge[]>([]);
    const [isCoachModalOpen, setCoachModalOpen] = useState(false);
    const [coachMessage, setCoachMessage] = useState('');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [selectedChallengeForCoach, setSelectedChallengeForCoach] = useState<DetoxChallenge | null>(null);

    useEffect(() => {
        setActiveChallenges(getActiveChallenges());
    }, []);

    const startChallenge = (challengeId: string) => {
        if (!activeChallenges.some(c => c.id === challengeId)) {
            const newActiveChallenges = [...activeChallenges, { id: challengeId, startDate: Date.now() }];
            setActiveChallenges(newActiveChallenges);
            saveActiveChallenges(newActiveChallenges);
        }
    };

    const getDayOfChallenge = (startDate: number) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.floor((Date.now() - startDate) / oneDay) + 1;
    };

    const handleGetCoachMessage = async (challenge: DetoxChallenge, day: number) => {
        setSelectedChallengeForCoach(challenge);
        setCoachModalOpen(true);
        setIsLoadingMessage(true);
        const message = await getDetoxCoachMessage(challenge.title, day);
        setCoachMessage(message);
        setIsLoadingMessage(false);
    };
    
    const activeChallengeDetails = activeChallenges.map(ac => {
        const details = challenges.find(c => c.id === ac.id);
        return details ? { ...details, startDate: ac.startDate } : null;
    }).filter((c): c is DetoxChallenge & { startDate: number } => c !== null);

    const availableChallenges = challenges.filter(c => !activeChallenges.some(ac => ac.id === c.id));

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div className="text-center">
                <ShieldCheckIcon className="w-16 h-16 mx-auto text-primary-400"/>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white mt-4">Digital Detox Challenges</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                    Take a break and reset your digital habits. Join a challenge to improve your focus and wellbeing.
                </p>
            </div>

            {activeChallengeDetails.length > 0 && (
                 <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Your Active Challenges</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeChallengeDetails.map(challenge => {
                            const day = getDayOfChallenge(challenge.startDate);
                            const progress = (day / challenge.durationDays) * 100;

                            return (
                                <div key={challenge.id} className="glass-card p-6 rounded-2xl shadow-lg border-primary-500/50">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <FireIcon className="w-8 h-8 text-orange-500 dark:text-orange-400" />
                                        <div>
                                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{challenge.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{challenge.description}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-baseline text-sm text-slate-600 dark:text-slate-300">
                                            <span>Day {day} of {challenge.durationDays}</span>
                                            <span className="font-semibold">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 mt-2">
                                            <div 
                                                className="bg-orange-500 h-2 rounded-full"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <button 
                                            onClick={() => handleGetCoachMessage(challenge, day)}
                                            className="w-full mt-4 flex items-center justify-center space-x-2 bg-primary-600/80 dark:bg-primary-600/50 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-600 dark:hover:bg-primary-600/80 transition"
                                        >
                                            <SparklesIcon className="w-5 h-5"/>
                                            <span>Daily Motivation</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Available Challenges</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableChallenges.map(challenge => (
                        <div key={challenge.id} className="glass-card p-6 rounded-2xl shadow-lg flex flex-col justify-between">
                             <div>
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{challenge.title}</h4>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 mb-4">{challenge.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{challenge.durationDays} Days</span>
                                <button
                                    onClick={() => startChallenge(challenge.id)}
                                    className="bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition"
                                >
                                    Start Challenge
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
             <Modal isOpen={isCoachModalOpen} onClose={() => setCoachModalOpen(false)} title={`Coach for "${selectedChallengeForCoach?.title}"`}>
                {isLoadingMessage ? (
                    <div className="text-center p-8"><SparklesIcon className="w-12 h-12 mx-auto text-primary-400 animate-pulse" /></div>
                ) : (
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{coachMessage}</p>
                )}
            </Modal>
        </div>
    );
};

export default Challenges;