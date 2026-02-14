
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-pro-preview';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getProfileModifiers = (profile: string) => {
  switch(profile) {
    case 'log-c': return "Arri Alexa Log-C profile, professional flat grade, maximum dynamic range, high fidelity shadows.";
    case 'raw': return "Red Digital Cinema RAW, 8K sensor fidelity, organic film grain, ultra-sharp optics.";
    case 'hdr': return "HDR10 color space, vibrant nature peaks, deep contrast, cinematic bloom, high detail.";
    default: return "Rec.709 industry standard, clean realistic daylight, natural motion.";
  }
};

export const generateGardeningVideo = async (
  prompt: string, 
  settings: ProductionSettings,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Production Cluster...");
  
  const model = settings.resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;
  const profileMod = getProfileModifiers(settings.profile);
  const fullPrompt = `PRO CINEMATOGRAPHY: ${prompt}. ${profileMod} Render at ${settings.framerate}fps. Ensure high fidelity botanical movement and realistic lighting.`;

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
    onProgress("Neural Rendering: Synthesizing High-Fidelity Frames...");
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
        { text: `MASTER REFINEMENT INSTRUCTION: ${editPrompt}. Re-render the image with extreme high fidelity, consistent lighting, and the requested stylistic changes. You MUST return the edited image as an inlineData part.` }
      ]
    }
  });

  let imageUrl = "";
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
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
  onProgress("Analyzing Master Temporal Sequence...");

  let operation = await ai.models.generateVideos({
    model: MODEL_VIDEO,
    prompt: `REVISION: ${newPrompt}. Modify the existing scene while maintaining pixel-perfect environmental consistency and realistic physics.`,
    video: previousResult.rawVideo,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: previousResult.aspectRatio,
    }
  });

  while (!operation.done) {
    onProgress("Rendering Revision Sequence...");
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

export const identifyPlant = async (base64Image: string): Promise<any> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_IDENTIFY,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this image. If it is a plant, return detailed JSON care info. If not, set isBotanical to false." }
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
  return JSON.parse(response.text || '{}');
};

export const chatWithBotanist = async (message: string, history: any[]): Promise<string> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: "You are Sage, the Lead Intelligence at Veridion Studio. You are a world-class expert in horticulture, landscape design, and botanical cinematography. Provide high-density, professional advice. Be authoritative and precise.",
    }
  });
  return response.text || "Neural handshake failure.";
};
