import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getProfileModifiers = (profile: string) => {
  switch(profile) {
    case 'log-c': return "Arri Alexa style, Log-C flat color, high dynamic range, neutral shadows.";
    case 'raw': return "Red Digital Cinema RAW, 8K sensor feel, cinematic grain, ultra-sharp.";
    case 'hdr': return "HDR10 metadata, vibrant peaks, deep blacks, high contrast.";
    default: return "Rec.709 broadcast standard, clean natural lighting.";
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
  const fullPrompt = `Cinematic Master: ${prompt}. ${profileMod} ${settings.framerate}fps. High fidelity botanical motion.`;

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
    onProgress("Neural Rendering: Synthesizing Frames...");
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

export const editBotanicalPhoto = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_IMAGE_EDIT,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `PROFESSIONAL EDITING INSTRUCTION: ${editPrompt}. Modify the image as requested while maintaining extreme high fidelity and realistic lighting. Output the edited image.` }
      ]
    }
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
};

export const extendExistingVideo = async (
  previousResult: VideoGenerationResult,
  newPrompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Analyzing Master Sequence for Revision...");

  let operation = await ai.models.generateVideos({
    model: MODEL_VIDEO,
    prompt: `REVISION INSTRUCTION: ${newPrompt}. Apply these changes to the previous clip while maintaining character and environmental consistency.`,
    video: previousResult.rawVideo,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: previousResult.aspectRatio,
    }
  });

  while (!operation.done) {
    onProgress("Synthesizing Refined Master...");
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
        { text: "Analyze this image. If it is NOT a botanical specimen (plant, leaf, flower, organic growth), set isBotanical to false. If it IS a plant, provide high-detail care instructions." }
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

export const chatWithBotanist = async (message: string, history: any[]): Promise<string> => {
  const ai = getGeminiClient();
  // Ensure we don't send too many messages to prevent context overflow or timeout
  const recentHistory = history.slice(-10); 
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...recentHistory, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are Sage, the Lead Botanical Intelligence at Veridion Studio. You are an expert in horticulture, landscape design, and botanical cinematography. Provide concise, professional, and actionable advice.",
    }
  });
  return response.text || "Neural handshake failed. Please re-initiate the session.";
};