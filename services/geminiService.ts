
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

// Standardizing model names as per guidelines
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-pro-preview';

// Helper to get a fresh instance of Gemini client to ensure up-to-date API key
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getProfileModifiers = (profile: string) => {
  switch(profile) {
    case 'log-c': return "Arri Alexa Log-C profile, flat cinematic grade, neutral shadows, 14 stops dynamic range.";
    case 'raw': return "Red Digital Cinema RAW, 8K sensor fidelity, organic film grain, ultra-sharp optics.";
    case 'hdr': return "HDR10 vibrant peaks, deep contrast, cinematic bloom, high detail botanical master.";
    default: return "Rec.709 standard, natural daylight, realistic botanical motion.";
  }
};

/**
 * Enhanced Video Generation from Image + Prompt using gemini-2.5-flash-image/veo
 */
export const generateVideoFromImage = async (
  base64Image: string,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Video Ingestion...");

  let operation = await ai.models.generateVideos({
    model: MODEL_VIDEO_FAST,
    prompt: `Transform this botanical specimen into a cinematic video: ${prompt}. High quality, smooth motion, realistic lighting.`,
    image: {
      imageBytes: base64Image,
      mimeType: 'image/jpeg'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    onProgress("Rendering Neural Frames...");
    await new Promise(resolve => setTimeout(resolve, 8000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  // Use API key when fetching from download link as per guidelines
  const videoBlob = await fetch(`${downloadLink}&key=${process.env.API_KEY}`).then(r => r.blob());

  return {
    id: Math.random().toString(36).substr(2, 9),
    url: URL.createObjectURL(videoBlob),
    rawVideo: operation.response?.generatedVideos?.[0]?.video,
    aspectRatio: '16:9',
    resolution: '720p',
    prompt: prompt,
    timestamp: Date.now()
  };
};

/**
 * Generate a video based on gardening production settings using Veo models
 */
export const generateGardeningVideo = async (
  prompt: string, 
  settings: ProductionSettings,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Booting Cinema Cluster...");
  
  const model = settings.resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;
  const profileMod = getProfileModifiers(settings.profile);
  const fullPrompt = `CINEMATIC MASTER: ${prompt}. ${profileMod} Render at ${settings.framerate}fps. High fidelity.`;

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
    onProgress("Mastering Output Sequence...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  // Appending API key for media fetch
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

/**
 * Extend an existing video by adding duration at the end
 * Fix: Added missing export extendExistingVideo
 */
export const extendExistingVideo = async (
  previousVideo: VideoGenerationResult,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Extending Cinematic Timeline...");

  // Extension requires 'veo-3.1-generate-preview' and 720p as per guidelines
  let operation = await ai.models.generateVideos({
    model: MODEL_VIDEO,
    prompt: prompt,
    video: previousVideo.rawVideo,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: previousVideo.aspectRatio,
    }
  });

  while (!operation.done) {
    onProgress("Synthesizing Continuous Motion...");
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
    aspectRatio: previousVideo.aspectRatio,
    resolution: '720p',
    prompt: prompt,
    timestamp: Date.now()
  };
};

/**
 * Stylize a botanical photo using generative image editing (gemini-2.5-flash-image)
 */
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
        { text: `PROFESSIONAL EDIT: ${editPrompt}. Maintain specimen identity while applying realistic high-fidelity stylization. Return the modified image.` }
      ]
    }
  });

  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      // Find the image part in the response as per guidelines
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return imageUrl;
};

/**
 * Analyze an image to identify a plant using Gemini 3 Flash
 */
export const identifyPlant = async (base64Image: string): Promise<any> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_IDENTIFY,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Detailed botanical analysis. If it is a plant, return care info JSON. If not, set isBotanical false." }
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
        }
      }
    },
  });
  // Use response.text property directly as per guidelines
  return JSON.parse(response.text || '{}');
};

/**
 * Chat with a virtual botanical expert using Gemini 3 Pro
 */
export const chatWithBotanist = async (message: string, history: any[]): Promise<string> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: [...history.slice(-10), { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are Sage, Lead Botanical Director at Veridion Studio. Expert in plant physiology and botanical cinematography. Provide technical, expert-grade advice.",
    }
  });
  // Use response.text property directly as per guidelines
  return response.text || "Handshake failed.";
};
