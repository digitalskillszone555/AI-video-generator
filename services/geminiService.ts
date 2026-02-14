
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult } from "../types";

const MODEL_TEXT = 'gemini-3-pro-preview';
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

// Automatic Prompt Enhancement for "Auto-Editing"
const enhancePromptForCinematics = (userPrompt: string): string => {
  return `Professional cinematic gardening footage: ${userPrompt}. 
  Style: 4K resolution, hyper-realistic textures, volumetric lighting, Arri Alexa color grade, 
  smooth dolly movements, macro depth of field. No manual editing required, 
  output must look like a high-end commercial.`;
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
          text: "Identify this plant and provide detailed care instructions. Return JSON: { name, scientificName, description, care: { watering, sunlight, temperature, soil, difficulty }, commonIssues: [] }",
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || '{}') as PlantCareInfo;
};

export const chatWithBotanist = async (message: string, history: any[]) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_TEXT,
    contents: [
      { role: 'user', parts: [{ text: `You are Sage, a pro botanist. History: ${JSON.stringify(history.slice(-4))}. Message: ${message}` }] }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: "Expert botanist advice. Use Google Search for real-time pest/weather info.",
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
  onProgress("Initializing AI Production Suite...");
  
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
    onProgress("AI is editing frames & lighting...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const videoObj = operation.response?.generatedVideos?.[0]?.video;
  const downloadLink = videoObj?.uri;
  if (!downloadLink) throw new Error("Production failed");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  
  return {
    url: URL.createObjectURL(blob),
    rawVideo: videoObj,
    aspectRatio: '16:9',
    resolution: resolution
  };
};
