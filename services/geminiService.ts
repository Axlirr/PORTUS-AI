import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { mockVessels, mockPorts, mockWeather, mockRoutes } from '../data/mockData';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        plan: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The step-by-step reasoning plan the AI followed." },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, description: "A concrete, actionable recommendation." },
                    impact_estimate: { type: Type.STRING, description: "The estimated impact of the action (e.g., time, cost)." },
                    confidence: { type: Type.NUMBER, description: "The AI's confidence in this recommendation, from 0.0 to 1.0." },
                },
                required: ['action', 'impact_estimate', 'confidence']
            },
            description: "A list of recommended actions."
        },
        sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of data sources used, in 'dataset:id' format (e.g., 'vessels:V101')." },
        explain: { type: Type.STRING, description: "A final, plain-English summary of the situation and recommendations." },
    },
    required: ['plan', 'recommendations', 'sources', 'explain']
};

export const getTradeAnalysis = async (prompt: string): Promise<AnalysisResult> => {
    console.log("Connecting to Gemini API...");

    const systemInstruction = `You are PORTUS AI, a conversational trade intelligence agent for the Port of Singapore Authority (PSA). 
Your purpose is to help logistics managers make real-time, data-driven decisions during global trade disruptions.
You must analyze the user's query against the provided structured data (vessels, ports, weather, routes).
Your response MUST be a valid JSON object that adheres to the provided schema.
Your analysis should be concise, actionable, and grounded in the data.
Identify relevant entities, simulate impacts, and recommend concrete actions.
For sources, use the format 'dataset:id' or 'dataset:name' (e.g., 'vessels:V102', 'weather:Sandstorm').
Always provide a step-by-step plan of how you reached your conclusion.`;

    const dataContext = `
    AVAILABLE DATA:
    ---
    Vessels: ${JSON.stringify(mockVessels, null, 2)}
    ---
    Ports: ${JSON.stringify(mockPorts, null, 2)}
    ---
    Weather Disruption Events: ${JSON.stringify(mockWeather, null, 2)}
    ---
    Trade Routes: ${JSON.stringify(mockRoutes, null, 2)}
    ---
  `;

    const fullPrompt = `${dataContext}\nUSER QUERY: "${prompt}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                temperature: 0.1, 
            },
        });

        const jsonText = response.text.trim();
        console.log("Received response from Gemini API:", jsonText);

        const analysisResult: AnalysisResult = JSON.parse(jsonText);
        return analysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return {
            plan: ["Error communicating with the AI service."],
            recommendations: [{ action: "API Error", impact_estimate: "Could not retrieve analysis.", confidence: 0.0 }],
            sources: [],
            explain: "There was an error processing your request with the AI. Please check the console for details and ensure your API key is configured correctly."
        };
    }
};
