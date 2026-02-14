
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult } from "../types";

const MODEL_TEXT = 'gemini-3-pro-preview';
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const identifyPlant = async (base64Image: string): Promise<PlantCareInfo & { isBotanical: boolean }> => {
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
          text: "Critical Task: Analyze this specimen. First, determine if it is a plant or botanical sample. If it is NOT a plant (e.g. a vehicle, person, furniture), set isBotanical to false and leave other fields empty. If it is a plant, set isBotanical to true and provide professional care instructions.",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isBotanical: { type: Type.BOOLEAN },
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
            }
          },
          commonIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['isBotanical']
      }
    },
  });

  return JSON.parse(response.text || '{}');
};

export const chatWithBotanist = async (message: string, history: any[]) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: [
      { role: 'user', parts: [{ text: `Veridion AI Interface. Context: ${JSON.stringify(history.slice(-4))}. Request: ${message}` }] }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "You are the Veridion Botanical Master Intelligence. Provide high-level technical advice on species care, climate resilience, and landscape cinematography. Always use Search for recent botanical breakthroughs.",
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
  
  const model = resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;

  let operation = await ai.models.generateVideos({
    model: model,
    prompt: `Professional 4K nature documentary: ${prompt}. Arri Alexa cinematography, 24fps, cinematic lighting.`,
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

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  
  return {
    url: URL.createObjectURL(blob),
    rawVideo: operation.response?.generatedVideos?.[0]?.video,
    aspectRatio: '16:9',
    resolution: resolution
  };
};
