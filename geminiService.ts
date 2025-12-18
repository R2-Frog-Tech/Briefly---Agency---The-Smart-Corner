
import { GoogleGenAI } from "@google/genai";
import { BriefingData, Language } from "../types";

export const generateProjectSummary = async (data: BriefingData, lang: Language): Promise<string> => {
  // La API Key se obtiene exclusivamente de process.env.API_KEY configurada en Vercel
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const langMap: Record<Language, string> = {
    en: 'English',
    es: 'Spanish',
    pl: 'Polish'
  };

  const prompt = `
    As an expert design and web development consultant, analyze the following client briefing and generate a professional structured summary in ${langMap[lang]}.
    
    Project Data:
    - Services: ${data.services.join(', ')}
    - Name: ${data.details.projectName}
    - Description: ${data.details.description}
    - Audience: ${data.details.targetAudience}
    - Timeline: ${data.timeline.deadline}
    - Client Budget: ${data.timeline.budgetRange}
    
    The summary must include:
    1. Executive summary of the need.
    2. Key technical points to consider.
    3. Initial professional recommendation.
    
    Maintain a professional and direct tone. Output only the summary in ${langMap[lang]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return "Error processing the AI summary.";
  }
};
