
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult } from "../types";

const MODEL_TEXT = 'gemini-3-pro-preview';
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';

// Always initialize with the exact environment variable
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Automatic Prompt Enhancement for "Auto-Editing"
const enhancePromptForCinematics = (userPrompt: string): string => {
  return `Professional cinematic nature footage for Veridion Studio: ${userPrompt}. 
  Atmosphere: 4K resolution, hyper-realistic plant textures, cinematic lighting (Golden Hour/Volumetric), 
  Arri Alexa color profiles, professional camera motion (Dolly/Crane), 
  macro-focused depth of field. Output must be studio-grade botanical documentary style.`;
};

export const identifyPlant = async (base64Image: string): Promise<PlantCareInfo> => {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: MODEL_IDENTIFY,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: "Identify this plant and provide detailed care instructions for Veridion's premium catalog.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      // Define explicit response schema for reliable JSON generation
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          description: { type: Type.STRING },
          care: {
            type: Type.OBJECT,
            properties: {
              watering: { type: Type.STRING },
              sunlight: { type: Type.STRING },
              temperature: { type: Type.STRING },
              soil: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['watering', 'sunlight', 'temperature', 'soil', 'difficulty']
          },
          commonIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['name', 'scientificName', 'description', 'care', 'commonIssues']
      }
    },
  });

  return JSON.parse(response.text || '{}') as PlantCareInfo;
};

export const chatWithBotanist = async (message: string, history: any[]) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: [
      { role: 'user', parts: [{ text: `You are the Veridion Botanical Intelligence. History: ${JSON.stringify(history.slice(-4))}. Creative Query: ${message}` }] }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are the advanced Veridion AI. Provide highly technical yet accessible botanical advice. Use Google Search for the most current data on pests, climate conditions, and rare species.",
    }
  });
  return response.text;
};

export const generateGardeningVideo = async (
  prompt: string, 
  resolution: '720p' | '1080p',
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Veridion Neural Engine Initializing...");
  
  const enhancedPrompt = enhancePromptForCinematics(prompt);
  const model = resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;

  let operation = await ai.models.generateVideos({
    model: model,
    prompt: enhancedPrompt,
    config: {
      numberOfVideos: 1,
      resolution: resolution,
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    onProgress("Synthesizing 4K Cinematic Frames...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoObj = operation.response?.generatedVideos?.[0]?.video;
  const downloadLink = videoObj?.uri;
  if (!downloadLink) throw new Error("Production engine failed to release master");

  // Appending API key for secure media fetch
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  
  return {
    url: URL.createObjectURL(blob),
    rawVideo: videoObj,
    aspectRatio: '16:9',
    resolution: resolution
  };
};
