import { GoogleGenAI, Type } from "@google/genai";
import { ItemType, EnergyLevel, Urgency, UserPersona, RamItem, MentalLoop, IdeaCluster, Language } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLanguageInstruction = (lang: Language) => {
  switch(lang) {
    case 'es': return "IMPORTANT: Respond ONLY in Spanish (Español).";
    case 'pt': return "IMPORTANT: Respond ONLY in Portuguese (Português).";
    case 'ru': return "IMPORTANT: Respond ONLY in Russian (Русский).";
    default: return "IMPORTANT: Respond in English.";
  }
};

export const processBrainDump = async (text: string, lang: Language = 'en'): Promise<{
  processedText: string;
  type: ItemType;
  energy: EnergyLevel;
  urgency: Urgency;
  tags: string[];
  temporalCue?: string;
  estimatedDate?: string;
}> => {
  const now = new Date();
  const dateContext = `Current Reference Date: ${now.toDateString()} (ISO: ${now.toISOString()})`;
  const langInstruction = getLanguageInstruction(lang);

  // System instruction for the processing model
  const PROCESSOR_SYSTEM_INSTRUCTION = `
You are an empathetic, efficient executive function assistant for an ADHD brain.
Your job is to categorize raw "brain dumps" into structured data.
Be extremely non-judgmental.
${langInstruction}

Categories:
- TASK: Something actionable that needs to be done.
- IDEA: A creative spark, project concept, or invention.
- THOUGHT: An emotion, a worry, a memory, or a reflection.
- NOISE: Gibberish, accidental typing, or something clearly not needing saving.

Assign Energy Level based on cognitive load:
- LOW: Quick, mindless (e.g., "water plants", "text mom").
- MEDIUM: Standard effort (e.g., "write email", "buy groceries").
- HIGH: Deep focus or emotional weight (e.g., "do taxes", "plan vacation").

Temporal Detection:
- Detect any temporal cues (e.g., "tomorrow", "next Friday", "in 2 days") in the input language.
- Calculate the estimated ISO Date (YYYY-MM-DD) based on the "Current Reference Date" provided in the prompt.
- If no time is mentioned, leave temporal fields null.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Input: "${text}"\n${dateContext}`,
      config: {
        systemInstruction: PROCESSOR_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            processedText: { type: Type.STRING, description: `A clean, concise summary of the input in the requested language.` },
            type: { type: Type.STRING, enum: [ItemType.TASK, ItemType.IDEA, ItemType.THOUGHT, ItemType.NOISE] },
            energy: { type: Type.STRING, enum: [EnergyLevel.LOW, EnergyLevel.MEDIUM, EnergyLevel.HIGH] },
            urgency: { type: Type.STRING, enum: [Urgency.LOW, Urgency.MEDIUM, Urgency.HIGH] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            temporalCue: { type: Type.STRING, description: "The exact temporal phrase found. Null if none.", nullable: true },
            estimatedDate: { type: Type.STRING, description: "ISO 8601 Date string (YYYY-MM-DD). Null if none.", nullable: true }
          },
          required: ["processedText", "type", "energy", "urgency", "tags"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Gemini processing error:", error);
    // Fallback if AI fails
    return {
      processedText: text,
      type: ItemType.THOUGHT,
      energy: EnergyLevel.MEDIUM,
      urgency: Urgency.LOW,
      tags: ['uncategorized']
    };
  }
};

export const generatePersona = async (answers: string[], lang: Language = 'en'): Promise<UserPersona> => {
  const langInstruction = getLanguageInstruction(lang);
  const prompt = `
    Based on these quiz answers about an ADHD brain, generate a fun, validating "Persona Archetype".
    Answers: ${answers.join(', ')}
    
    ${langInstruction}
    Examples: "The Hyperfocus Astronaut", "The Dopamine Hunter", "The Chaos Wizard", "The Idea Factory".
    Keep descriptions short, funny, and empowering.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            description: { type: Type.STRING },
            powerTrait: { type: Type.STRING },
            kryptonite: { type: Type.STRING }
          },
          required: ["type", "description", "powerTrait", "kryptonite"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("No persona generated");
  } catch (error) {
    return {
      type: "The Mystery Brain",
      description: "You defy classification, and that is your power.",
      powerTrait: "Enigma",
      kryptonite: "Forms"
    };
  }
};

export const getMentalReplayInsight = async (thoughts: string[], lang: Language = 'en'): Promise<string> => {
    if (thoughts.length === 0) return "No thoughts recorded yet.";
    
    const langInstruction = getLanguageInstruction(lang);
    const prompt = `
      Here are the user's recent "Thoughts" and "Ideas". 
      Identify a pattern or a recurring theme. 
      Write a short, validating insight (max 2 sentences).
      ${langInstruction}
      
      Thoughts:
      ${thoughts.join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "You have a lot of brilliant ideas brewing.";
    } catch (e) {
        return "Your brain is processing a lot right now.";
    }
}

export const analyzeMentalLoops = async (items: RamItem[], lang: Language = 'en'): Promise<MentalLoop | null> => {
  // Only analyze active thoughts and ideas
  const candidates = items.filter(
    i => (i.type === ItemType.THOUGHT || i.type === ItemType.IDEA) && !i.isDiscarded && !i.completedAt
  );

  if (candidates.length < 3) return null;
  
  const langInstruction = getLanguageInstruction(lang);

  // Prepare input for AI
  // We limit to last 30 to save context, formatted as ID: Text
  const inputData = candidates.slice(0, 30).map(c => `ID_${c.id}: ${c.processedText}`).join('\n');

  const prompt = `
    Analyze these brain dump items for recurring semantic themes or thought loops.
    Ignore trivial overlaps. Find the single most significant repeating thought pattern.
    
    If a loop is found (at least 3 related items), return JSON.
    If no significant loop is found, return null.

    ${langInstruction}

    Data:
    ${inputData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             found: { type: Type.BOOLEAN },
             theme: { type: Type.STRING, description: "Short title of the recurring thought loop" },
             itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
             insight: { type: Type.STRING, description: "Validating observation like 'Your brain often returns to...'" },
             timeSpan: { type: Type.STRING, description: "Human readable timespan e.g. 'Over the last 2 days'" }
          },
          required: ["found"]
        }
      }
    });

    if (response.text) {
       const result = JSON.parse(response.text);
       if (result.found && result.itemIds?.length >= 2) {
         // Map back the ID format if necessary, here we used ID_{uuid}
         const cleanIds = result.itemIds.map((id: string) => id.replace('ID_', ''));
         
         return {
           id: crypto.randomUUID(),
           theme: result.theme,
           itemIds: cleanIds,
           insight: result.insight,
           frequency: cleanIds.length,
           timeSpan: result.timeSpan
         };
       }
    }
    return null;
  } catch (error) {
    console.error("Loop analysis failed", error);
    return null;
  }
}

export const clusterIdeas = async (ideas: RamItem[], lang: Language = 'en'): Promise<IdeaCluster[]> => {
  if (ideas.length < 4) return [];
  const langInstruction = getLanguageInstruction(lang);

  const inputData = ideas.map(i => `ID_${i.id}: ${i.processedText} [Tags: ${i.tags.join(', ')}]`).join('\n');

  const prompt = `
    You are an Idea Gardener.
    Group these ideas into semantic "Clusters" or "Groves".
    Look for common themes, projects, or topics.
    Each cluster must have at least 2 ideas.
    
    Ideas that don't fit well can be ignored (they will be treated as wildflowers).
    
    ${langInstruction}

    Data:
    ${inputData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clusters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Creative name for this cluster" },
                  description: { type: Type.STRING, description: "Short description of the theme" },
                  itemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["name", "description", "itemIds", "tags"]
              }
            }
          },
          required: ["clusters"]
        }
      }
    });

    if (response.text) {
       const result = JSON.parse(response.text);
       return result.clusters.map((c: any) => ({
         id: crypto.randomUUID(),
         name: c.name,
         description: c.description,
         itemIds: c.itemIds.map((id: string) => id.replace('ID_', '')),
         tags: c.tags
       }));
    }
    return [];
  } catch (error) {
    console.error("Idea clustering failed", error);
    return [];
  }
};