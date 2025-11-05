import { GoogleGenAI, Type } from "@google/genai";
import { AppUsage, GeminiInsights, LiveUsageEvent, GeminiLiveAnalysis, DigitalPersona, WeeklyReport, AppRecommendation, AISuggestedGoal } from '../types';

const getApiKey = () => {
    const key = process.env.API_KEY;
    if (!key) {
        // Fix: Removed alert per Gemini API guidelines. API key should not involve UI elements.
        throw new Error("API_KEY not found");
    }
    return key;
};

// Simplified error handler for brevity
const handleApiError = (error: any, context: string, fallback: any) => {
    console.error(`Error in ${context}:`, error);
    return fallback;
}

export const getUsageInsights = async (usageData: AppUsage[]): Promise<GeminiInsights> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const usageSummary = usageData.map(app => `${app.name} (${app.category}): ${app.usage} minutes`).join(', ');

        const prompt = `Analyze the following daily screen time usage data: ${usageSummary}. The user wants to improve their digital wellbeing. Provide three actionable, personalized tips and suggest one specific, realistic goal. Format the entire response as a single, valid JSON object.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                        suggestedGoal: { type: Type.STRING },
                    }, required: ["tips", "suggestedGoal"],
                },
            },
        });
        return JSON.parse(response.text.trim()) as GeminiInsights;
    } catch (error) {
        return handleApiError(error, "getUsageInsights", {
            tips: ["Could not fetch AI insights.", "Mind your time on social media.", "Set a timer before opening entertainment apps."],
            suggestedGoal: "Reduce top social media app usage by 15 minutes.",
        });
    }
};

export const getLiveSessionInsights = async (sessionLog: LiveUsageEvent[]): Promise<GeminiLiveAnalysis> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const logSummary = sessionLog.filter(e => e.endTime).map(e => {
            const duration = Math.round(((e.endTime || 0) - e.startTime) / 1000);
            return `${e.app.name} (${e.app.category}) for ${duration}s`;
        }).join(', ');

        const prompt = `As a productivity coach, analyze this app usage log: ${logSummary}. Analyze multitasking, identify distractions (switching from Productivity to Social/Entertainment), summarize the user's focus, and provide a Focus Score from 0 (very distracted) to 100 (fully focused). Offer two specific suggestions to improve focus. Respond in valid JSON.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        analysisSummary: { type: Type.STRING },
                        focusScore: { type: Type.NUMBER },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    }, required: ["analysisSummary", "focusScore", "suggestions"],
                },
            },
        });
        return JSON.parse(response.text.trim()) as GeminiLiveAnalysis;
    } catch (error) {
        return handleApiError(error, "getLiveSessionInsights", {
            analysisSummary: "Could not analyze your session.",
            focusScore: 50,
            suggestions: ["Set a clear goal before starting.", "Minimize distractions."],
        });
    }
};

export const getDigitalPersona = async (usageData: AppUsage[]): Promise<DigitalPersona> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const usageSummary = usageData.map(app => `${app.name} (${app.category}): ${app.usage} minutes`).join(', ');
        const prompt = `Based on this screen time data: ${usageSummary}, create a "Digital Persona" for the user. Give the persona a creative name (e.g., 'The Focused Creator', 'The Night Owl Entertainer'), a short description of their digital habits, and one key piece of advice tailored to that persona. Respond in valid JSON.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        advice: { type: Type.STRING },
                    }, required: ["name", "description", "advice"],
                },
            },
        });
        return JSON.parse(response.text.trim()) as DigitalPersona;
    } catch (error) {
        return handleApiError(error, "getDigitalPersona", {
            name: "Error",
            description: "Could not determine your digital persona.",
            advice: "Try to balance your screen time across different categories."
        });
    }
};

export const generateWeeklyReport = async (usageData: AppUsage[]): Promise<WeeklyReport> => {
    // This is a simplified version. A real app would use historical data.
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const usageSummary = usageData.map(app => `${app.name} (${app.category}): ${app.usage} minutes`).join(', ');
        const prompt = `Analyze this daily usage data which represents a week: ${usageSummary}. Write a brief, encouraging summary of the user's weekly digital habits. Identify up to 2 key trends (e.g., increase in Productivity, decrease in Social) and express them as percentage changes. Respond in valid JSON.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        summary: { type: Type.STRING },
                        trends: {
                            type: Type.ARRAY, items: {
                                type: Type.OBJECT, properties: {
                                    category: { type: Type.STRING },
                                    changePercentage: { type: Type.NUMBER },
                                }, required: ["category", "changePercentage"]
                            }
                        },
                    }, required: ["summary", "trends"],
                },
            },
        });
        return JSON.parse(response.text.trim()) as WeeklyReport;
    } catch (error) {
        return handleApiError(error, "generateWeeklyReport", {
            summary: "Could not generate weekly report. Keep up the good work!",
            trends: []
        });
    }
};

export const getAppRecommendations = async (categoryToReplace: string, interest: string): Promise<AppRecommendation[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const prompt = `The user wants to replace apps in the '${categoryToReplace}' category. They are interested in '${interest}'. Suggest 3 alternative, productive apps. For each app, provide its name, a suitable category, a brief description, and a reason why it fits the user's interest. Respond in valid JSON as an array of objects.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            appName: { type: Type.STRING },
                            category: { type: Type.STRING },
                            description: { type: Type.STRING },
                            reason: { type: Type.STRING },
                        }, required: ["appName", "category", "description", "reason"]
                    }
                },
            },
        });
        return JSON.parse(response.text.trim()) as AppRecommendation[];
    } catch (error) {
        return handleApiError(error, "getAppRecommendations", []);
    }
};

export const getDetoxCoachMessage = async (challengeTitle: string, day: number): Promise<string> => {
     try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const prompt = `I am on day ${day} of a "${challengeTitle}" digital detox challenge. Write a short, encouraging, and motivational message for me.`;
        
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        return response.text.trim();
    } catch (error) {
        return handleApiError(error, "getDetoxCoachMessage", "You're doing great! Keep it up.");
    }
}

export const generateAIGoals = async (usageData: AppUsage[]): Promise<AISuggestedGoal[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const usageSummary = usageData.map(app => `${app.name} (${app.category}): ${app.usage} minutes`).join(', ');
        const prompt = `Based on this usage data: ${usageSummary}, identify the top 2-3 apps where the user could realistically reduce their screen time. For each, suggest a new daily time limit (in minutes) and provide a brief reasoning. Respond in valid JSON as an array of objects.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY, items: {
                        type: Type.OBJECT, properties: {
                            appName: { type: Type.STRING },
                            suggestedLimit: { type: Type.NUMBER },
                            reasoning: { type: Type.STRING },
                        }, required: ["appName", "suggestedLimit", "reasoning"]
                    }
                },
            },
        });
        return JSON.parse(response.text.trim()) as AISuggestedGoal[];
    } catch (error) {
        return handleApiError(error, "generateAIGoals", []);
    }
}

export const analyzeImportedData = async (importedData: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: getApiKey() });
        const prompt = `You are a digital wellbeing expert. Analyze the following screen time data, which is provided as unstructured text. Identify app names, usage durations, and categories. Provide a comprehensive analysis covering: 
1.  A summary of total screen time and key usage patterns.
2.  A breakdown by app category (Social, Productivity, Entertainment, etc.).
3.  Insights into potential overuse, distraction loops, or positive habits.
4.  Three actionable, personalized recommendations for improvement.
Structure your response in clear, easy-to-read markdown.

Here is the user's data:
---
${importedData}
---
`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
        return response.text.trim();
    } catch (error) {
        return handleApiError(error, "analyzeImportedData", "Sorry, I couldn't analyze the data. Please check the format and try again. Ensure your data includes app names and usage times.");
    }
}