
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

// Standardizing model names as per guidelines
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-pro-preview';

/**
 * System Instruction for the Video Production Engine
 */
const SYSTEM_INSTRUCTION = `You are an advanced, professional AI Video Production Engine. 
Your goal is to generate high-quality, professional-grade video output.
- IF Input is TEXT: Act as a creative director. Apply cinematic lighting, camera angles, and professional motion.
- IF Input is IMAGE: Act as a motion graphics artist. Animate the subject with 3D camera movements (parallax, zoom, pan).
- IF Input is VIDEO: Act as a professional video editor. Enhance resolution, color grade, and apply styles like "3D Animated".
Always default to High Definition aesthetics. Prevent generation failures by using professional artistic logic to fill gaps.`;

// Helper to get a fresh instance of Gemini client to ensure latest API key
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getProfileModifiers = (profile: string) => {
  switch(profile) {
    case 'log-c': return "Arri Alexa Log-C profile, flat cinematic grade, neutral shadows, high dynamic range.";
    case 'raw': return "Red Digital Cinema RAW, organic film grain, ultra-sharp optics, professional sensor fidelity.";
    case 'hdr': return "HDR10 vibrant peaks, deep contrast, cinematic bloom, high-definition botanical master.";
    case 'standard': return "Clean studio lighting, realistic botanical movement, 35mm film aesthetic, professional grade.";
    default: return "Rec.709 standard, natural daylight, realistic botanical motion.";
  }
};

/**
 * Enhanced Video Generation from Image + Prompt using Veo models.
 * Routes Image + Video style requests to the correct production pipeline.
 */
export const generateVideoFromImage = async (
  base64Image: string,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Production Cluster...");

  // Boost the prompt with professional production keywords
  let enhancedPrompt = `${prompt}. Professional ${prompt.toLowerCase().includes('3d animated') ? '3D animated style, high-end CGI, smooth motion' : 'cinematic botanical motion'}, 4K high-fidelity, polished lighting, realistic camera work.`;

  try {
    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO_FAST,
      prompt: enhancedPrompt,
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
      onProgress("Neural Processing: Frame Synthesis...");
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Output Master failed to provide a valid stream.");
    
    onProgress("Finalizing Master Render...");
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!res.ok) throw new Error(`Media Cluster Error: ${res.status}`);
    const blob = await res.blob();

    return {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video,
      aspectRatio: '16:9',
      resolution: '720p',
      prompt: prompt,
      timestamp: Date.now()
    };
  } catch (error: any) {
    console.error("Video Gen Failure:", error);
    if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

/**
 * Studio Hub: Full Video Synthesis from Text or Settings.
 */
export const generateGardeningVideo = async (
  prompt: string, 
  settings: ProductionSettings,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Booting Cinema Compute...");
  
  const model = settings.resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST;
  const profileMod = getProfileModifiers(settings.profile);
  const fullPrompt = `STRICT STYLE: ${prompt}. ${profileMod} ${prompt.toLowerCase().includes('animated') ? '3D animation quality' : ''}. Professional cinematography, high-fidelity render.`;

  try {
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
      onProgress("Mastering Output: " + (Math.random() > 0.5 ? "Enhancing Optics..." : "Sequencing Neural Layers..."));
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Production cluster timed out.");

    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!res.ok) throw new Error(`Fetch protocol failed: ${res.status}`);
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
  } catch (error: any) {
    if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

export const extendExistingVideo = async (
  previousVideo: VideoGenerationResult,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Synthesizing Temporal Continuity...");

  try {
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
      onProgress("Analyzing Motion Vectors...");
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
  } catch (error: any) {
    if (error.message?.includes("entity was not found")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

export const editBotanicalPhoto = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  const ai = getGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `PROFESSIONAL EDIT: ${editPrompt}. Maintenance of specimen identity. Apply cinematic lighting and high-end botanical textures.` }
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
  } catch (error: any) {
    if (error.message?.includes("entity was not found")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

export const identifyPlant = async (base64Image: string): Promise<any> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_IDENTIFY,
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Botanical Analysis: Care instructions JSON. isBotanical: true/false." }
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
    contents: [...history.slice(-10), { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    }
  });
  return response.text || "Handshake failed.";
};
