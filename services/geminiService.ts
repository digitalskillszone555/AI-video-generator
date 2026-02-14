
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getProfileModifiers = (profile: string) => {
  switch(profile) {
    case 'log-c': return "Shot on Arri Alexa, Log-C flat color profile, high dynamic range, neutral shadows, professional grading potential.";
    case 'raw': return "Red Digital Cinema RAW style, 8K sensor feel, deep color depth, cinematic grain, ultra-sharp optics.";
    case 'hdr': return "HDR10 metadata, vibrant peaks, deep blacks, high contrast, vivid nature colors.";
    default: return "Rec.709 standard broadcast color, clean, natural lighting.";
  }
};

export const generateGardeningVideo = async (
  prompt: string, 
  settings: ProductionSettings,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Production Node...");
  
  const model = settings.resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;
  const profileMod = getProfileModifiers(settings.profile);
  const fullPrompt = `${prompt}. ${profileMod} ${settings.framerate}fps, Master quality.`;

  let operation = await ai.models.generateVideos({
    model: model,
    prompt: fullPrompt,
    config: {
      numberOfVideos: 1,
      resolution: settings.resolution,
      aspectRatio: settings.aspectRatio
    }
  });

  while (!operation.done) {
    onProgress("Neural Rendering: Frame Synthesis...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    url: URL.createObjectURL(blob),
    rawVideo: operation.response?.generatedVideos?.[0]?.video,
    aspectRatio: settings.aspectRatio,
    resolution: settings.resolution,
    prompt: prompt,
    timestamp: Date.now()
  };
};

export const extendExistingVideo = async (
  previousResult: VideoGenerationResult,
  newPrompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Analyzing Master Frames for Extension...");

  let operation = await ai.models.generateVideos({
    model: MODEL_VIDEO,
    prompt: `Continuing the scene: ${newPrompt}. Maintain consistent lighting, color, and subject from the previous clip.`,
    video: previousResult.rawVideo,
    config: {
      numberOfVideos: 1,
      resolution: '720p', // Extensions are currently optimized at 720p
      aspectRatio: previousResult.aspectRatio,
    }
  });

  while (!operation.done) {
    onProgress("Synthesizing Additional 7s Motion...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await res.blob();
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    url: URL.createObjectURL(blob),
    rawVideo: operation.response?.generatedVideos?.[0]?.video,
    aspectRatio: previousResult.aspectRatio,
    resolution: '720p',
    prompt: newPrompt,
    timestamp: Date.now()
  };
};

export const identifyPlant = async (base64Image: string): Promise<PlantCareInfo & { isBotanical: boolean }> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_IDENTIFY,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze botanical specimen. If NOT a plant, set isBotanical to false. Otherwise provide care instructions." }
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
          }
        },
        required: ['isBotanical']
      }
    },
  });
  return JSON.parse(response.text || '{}');
};

// Fixed: Added chatWithBotanist to handle professional horticultural Q&A
export const chatWithBotanist = async (message: string, history: any[]): Promise<string> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are Sage, the Lead Botanical Intelligence at Veridion Studio. You are a world-class expert in horticulture, plant pathology, and landscape design. Provide detailed, professional, and actionable advice with a sophisticated, helpful tone.",
    }
  });
  return response.text || "I apologize, but I'm having trouble processing your request at the moment. Please try again.";
};
