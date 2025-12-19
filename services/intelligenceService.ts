
import { GoogleGenAI, Type } from "@google/genai";
import { ExpandedQuery, ModelConfig } from "../types";

export class IntelligenceService {
  private ai: GoogleGenAI;
  private config: ModelConfig = {
    provider: 'GEMINI',
    localEndpoint: 'http://localhost:11434/v1',
    localModel: 'llama3'
  };

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  updateConfig(config: ModelConfig) {
    this.config = config;
  }

  async expandQuery(userQuery: string): Promise<ExpandedQuery> {
    if (this.config.provider === 'LOCAL') {
      return this.expandQueryLocal(userQuery);
    }
    return this.expandQueryGemini(userQuery);
  }

  private async expandQueryGemini(userQuery: string): Promise<ExpandedQuery> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a specialized RAG engine optimizer for a multimodal codebase system (Code, PDFs, Markdown). 
        Convert the following user request into an optimized semantic search payload.
        
        Request: "${userQuery}"
        
        Requirements:
        1. Expanded Query: A dense description of implementation logic OR technical concepts found in documentation.
        2. Keywords: Technical identifiers, library names, or compliance terms.
        3. Intent: 'definition', 'usage', 'configuration', 'compliance', or 'logic flow'.
        4. Hypothetical Code: A snippet of target code OR a hypothetical documentation section header.`,
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
      console.error("Gemini Expansion Error:", error);
      return this.getFallback(userQuery);
    }
  }

  private async expandQueryLocal(userQuery: string): Promise<ExpandedQuery> {
    try {
      const prompt = `Act as a RAG optimizer for a multimodal system (Code + Docs). Convert the request to JSON.
        
      Request: "${userQuery}"
      
      Output JSON:
      - expanded: Technical description.
      - keywords: Technical terms.
      - intent: 'logic', 'documentation', or 'compliance'.
      - hypotheticalCode: Relevant snippet.`;

      const response = await fetch(`${this.config.localEndpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.localModel,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) throw new Error(`Local API error: ${response.statusText}`);
      
      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;
      const data = JSON.parse(content || '{}');

      return {
        original: userQuery,
        expanded: data.expanded || userQuery,
        keywords: data.keywords || [],
        intent: data.intent || "unknown",
        hypotheticalCode: data.hypotheticalCode || ""
      };
    } catch (error) {
      console.error("Local Model Expansion Error:", error);
      return this.getFallback(userQuery);
    }
  }

  private getFallback(userQuery: string): ExpandedQuery {
    return {
      original: userQuery,
      expanded: userQuery,
      keywords: [],
      intent: "general",
      hypotheticalCode: ""
    };
  }
}

export const intelligenceService = new IntelligenceService();
