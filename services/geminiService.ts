
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
        contents: `Act as a specialized RAG engine optimizer. Convert the following user request into an optimized semantic search payload.
        
        Request: "${userQuery}"
        
        Requirements:
        1. Expanded Query: A dense, technical description of the implementation logic.
        2. Keywords: High-precision identifiers (variable names, common function names, specific libraries).
        3. Intent: Determine if the user is looking for a 'definition', 'usage', 'configuration', or 'logic flow'.
        4. Hypothetical Code: A 5-10 line snippet of the likely target code.`,
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
              intent: { type: Type.STRING },
              hypotheticalCode: { type: Type.STRING }
            },
            required: ["expanded", "keywords", "intent", "hypotheticalCode"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      return {
        original: userQuery,
        expanded: data.expanded || userQuery,
        keywords: data.keywords || [],
        intent: data.intent || "unknown",
        hypotheticalCode: data.hypotheticalCode || ""
      };
    } catch (error) {
      console.error("Gemini Phase 3 Expansion Error:", error);
      return {
        original: userQuery,
        expanded: userQuery,
        keywords: [],
        intent: "general",
        hypotheticalCode: ""
      };
    }
  }
}

export const geminiService = new GeminiService();
