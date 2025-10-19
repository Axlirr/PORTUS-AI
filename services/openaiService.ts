import OpenAI from 'openai';
import type { AnalysisResult } from '../types';
import { mockVessels, mockPorts, mockWeather, mockRoutes } from '../data/mockData';
import { retrieveDocs } from '../data/ragDocs';

// Azure OpenAI configuration from environment (mapped via Vite define)
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT as string | undefined;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT as string | undefined;
const AZURE_OPENAI_API_VERSION = (process.env.AZURE_OPENAI_API_VERSION as string | undefined) || '2024-08-01-preview';
const AZURE_OPENAI_PRIMARY_KEY = process.env.AZURE_OPENAI_PRIMARY_KEY as string | undefined;
const AZURE_OPENAI_SECONDARY_KEY = process.env.AZURE_OPENAI_SECONDARY_KEY as string | undefined;

// Prefer primary key; fall back to secondary key if primary is missing
const resolvedAzureKey = AZURE_OPENAI_PRIMARY_KEY || AZURE_OPENAI_SECONDARY_KEY || '';

export const getTradeAnalysis = async (prompt: string): Promise<AnalysisResult> => {
  console.log("Connecting to OpenAI API...");

  const systemInstruction = `You are PORTUS AI, a conversational trade intelligence agent for the Port of Singapore Authority (PSA). 
Your purpose is to help logistics managers make real-time, data-driven decisions during global trade disruptions.
You must analyze the user's query against the provided structured data (vessels, ports, weather, routes).
Your response MUST be a valid JSON object that adheres to the provided schema.
Your analysis should be concise, actionable, and grounded in the data.
Identify relevant entities, simulate impacts, and recommend concrete actions.
For sources, use the format 'dataset:id' or 'dataset:name' (e.g., 'vessels:V102', 'weather:Sandstorm').
Always provide a step-by-step plan of how you reached your conclusion.

You must respond with a valid JSON object containing the following structure:
{
  "plan": ["step1", "step2", "step3"],
  "recommendations": [
    {
      "action": "concrete action",
      "impact_estimate": "estimated impact",
      "confidence": 0.85
    }
  ],
  "sources": ["vessels:V101", "weather:Sandstorm"],
  "explain": "plain English summary"
}`;

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

  const retrieved = retrieveDocs(prompt, 3);
  const ragBlock = retrieved.length
    ? `\nRAG CONTEXT (Top ${retrieved.length}):\n` +
    retrieved
      .map((d, i) => `#${i + 1} ${d.title} (DocID: ${d.id})\n${d.text}`)
      .join('\n---\n')
    : '';

  const fullPrompt = `${dataContext}\n${ragBlock}\nUSER QUERY: "${prompt}"`;

  try {
    // Call our dev-time proxy to avoid exposing keys and CORS in the browser
    const proxyResponse = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemInstruction + "\nYou must produce a JSON object with fields: plan, recommendations, sources, explain, and optional trace. 'trace' is an array of steps, each step has: type one of ['thinking','action','observation','final'], and depending on type: thinking: {message}; action: {actionName, arguments, requires_approval}; observation: {observation}. End with a 'final' step summarizing the result." },
          { role: 'user', content: fullPrompt }
        ],
        temperature: 0.1
      })
    });

    if (!proxyResponse.ok) {
      const errorText = await proxyResponse.text();
      throw new Error(`Proxy error (${proxyResponse.status}): ${errorText}`);
    }

    const response = await proxyResponse.json();

    const jsonText = response.choices?.[0]?.message?.content?.trim();
    console.log("Received response from OpenAI API:", jsonText);

    if (!jsonText) {
      throw new Error("No response content received from OpenAI");
    }

    const analysisResult: AnalysisResult = JSON.parse(jsonText);
    return analysisResult;

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return {
      plan: ["Error communicating with the AI service."],
      recommendations: [{ action: "API Error", impact_estimate: "Could not retrieve analysis.", confidence: 0.0 }],
      sources: [],
      explain: "There was an error processing your request with the AI. Please check the console for details and ensure your API key is configured correctly."
    };
  }
};
