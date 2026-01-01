
import { GoogleGenAI, Type } from "@google/genai";
import { AIChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!API_KEY) {
      console.error("API_KEY not found in environment.");
    }
    this.ai = new GoogleGenAI({ apiKey: API_KEY || '' });
  }

  public async chat(history: AIChatMessage[], currentMessage: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history.map(m => ({
            role: m.role === 'model' ? 'model' as const : 'user' as const,
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: currentMessage }] }
        ],
        config: {
          systemInstruction: "You are Project Chimera AI, an expert system for DevCore AI Toolkit. You help users manage 1000+ features and services. Be technical, precise, and professional.",
          temperature: 0.7,
        }
      });
      return response.text || "No response from AI.";
    } catch (err) {
      console.error("Gemini Chat Error:", err);
      return "Critical connectivity issue with Chimera Subspace. Please try again.";
    }
  }

  public async generateFeatureSuggestions(context: string): Promise<any[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Based on this data: ${context}, suggest 3 innovative modules for Project Chimera.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                rationale: { type: Type.STRING },
                impact: { type: Type.STRING }
              },
              required: ["name", "description", "category", "rationale", "impact"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (err) {
      console.error("Gemini Suggestions Error:", err);
      return [];
    }
  }

  public async generateCode(prompt: string): Promise<{ code: string; explanation: string }> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Write clean, production-ready TypeScript code for: ${prompt}. Return as valid JSON with 'code' and 'explanation' fields.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["code", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || '{"code": "", "explanation": ""}');
    } catch (err) {
      console.error("Gemini CodeGen Error:", err);
      return { code: "// Error", explanation: "Failed to generate code." };
    }
  }
}

export const aiService = new GeminiService();
