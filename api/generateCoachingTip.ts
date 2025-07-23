import { GoogleGenAI, Type } from "@google/genai";

// This serverless function will be hosted by platforms like Vercel.
// It securely handles the API key, which is stored as an environment variable on the server.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const coachingTipSchema = {
    type: Type.OBJECT,
    properties: {
        volleyballTip: {
            type: Type.OBJECT,
            description: "A practical tip about volleyball teamwork, communication, or mindset.",
            properties: {
                title: { type: Type.STRING, description: "A catchy title for the volleyball tip." },
                content: { type: Type.STRING, description: "The main content of the tip. Focus on concepts like making teammates comfortable, calling the ball, including everyone, and having fun to make those around them better." }
            }
        },
        positiveQuote: {
            type: Type.OBJECT,
            description: "An inspiring quote for young athletes.",
            properties: {
                quote: { type: Type.STRING, description: "The text of the inspiring quote." },
                author: { type: Type.STRING, description: "The author of the quote. Use 'Anonymous' if unknown." }
            }
        },
        leaderShoutout: {
            type: Type.STRING,
            description: "A brief, encouraging shoutout for the league's current points leader."
        },
        leaguePhilosophy: {
            type: Type.STRING,
            description: "A comment reinforcing the league's unique 'discovery learning' design, mentioning playing with new people, being sorted into different level courts, and how it builds adaptable players. Can occasionally suggest looking at the Academy Photo Gallery to see pictures from past events."
        },
        academyPlug: {
            type: Type.STRING,
            description: "A subtle, encouraging mention of the Canadian Volleyball Elite Academy. This can be about skill sessions, upcoming registrations, or suggesting players check out the League News & Blog for more info."
        }
    }
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { leagueTitle, leaderName, leaderPoints } = req.body;

        if (!leagueTitle || !leaderName || leaderPoints === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const systemInstruction = `You are Discovery Coach, an expert and highly motivational youth volleyball coach for the '${leagueTitle}' for the Canadian Volleyball Elite Academy. Your goal is to provide encouraging, actionable, and varied tips that help players grow individually and as teammates. Your tone is always positive, supportive, and focused on development and fun. Generate a unique and fresh set of coaching insights each time. You can also suggest they check out the League News & Blog or the Academy Photo Gallery for more content.`;
        const userPrompt = `Generate a new playbook tip for the players. The current points leader is ${leaderName} with ${leaderPoints} points.`;
  
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.9,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: coachingTipSchema
            }
        });
        
        const jsonText = (response.text ?? '').trim();
        const tipObject = JSON.parse(jsonText);

        res.status(200).json(tipObject);

    } catch (error) {
        console.error("Error in generateCoachingTip serverless function:", error);
        res.status(500).json({ error: 'Failed to generate coaching tip' });
    }
}
