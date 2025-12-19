
import { GoogleGenAI, Type } from "@google/genai";
import { ExpandedQuery } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async expandQuery(userQuery: string): Promise<ExpandedQuery> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as an expert software engineer. Expand the following natural language query into a format suitable for semantic code search.
        Query: "${userQuery}"
        
        Provide:
        1. A more technical version of the query.
        2. A list of key variable/function names or technical keywords.
        3. A hypothetical code snippet that might represent the answer.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              expanded: { type: Type.STRING },
              keywords: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              hypotheticalCode: { type: Type.STRING }
            },
            required: ["expanded", "keywords", "hypotheticalCode"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      return {
        original: userQuery,
        expanded: data.expanded || userQuery,
        keywords: data.keywords || [],
        hypotheticalCode: data.hypotheticalCode || ""
      };
    } catch (error) {
      console.error("Gemini Expansion Error:", error);
      return {
        original: userQuery,
        expanded: userQuery,
        keywords: [],
        hypotheticalCode: ""
      };
    }
  }
}

export const geminiService = new GeminiService();
