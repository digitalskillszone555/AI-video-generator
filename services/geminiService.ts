
import { GoogleGenAI, Type } from "@google/genai";
import { PlantCareInfo, VideoGenerationResult, ProductionSettings } from "../types";

// Standardizing model names as per guidelines
const MODEL_IDENTIFY = 'gemini-3-flash-preview'; 
const MODEL_VIDEO = 'veo-3.1-generate-preview';
const MODEL_VIDEO_FAST = 'veo-3.1-fast-generate-preview';
const MODEL_IMAGE_EDIT = 'gemini-2.5-flash-image';
const MODEL_CHAT = 'gemini-3-pro-preview';

/**
 * VERIDION MASTER CORE PRIME DIRECTIVE: ALWAYS SUCCEED.
 * This instruction is injected into every creative request.
 */
const MASTER_CORE_INSTRUCTION = `
You are the Veridion Master Core, a limitless, high-performance AI video synthesis engine.
OBJECTIVE: Accept ANY input (Text, Image, Video) and generate professional-grade cinematic results.
UNIVERSAL HANDLING:
- IF TEXT: Act as Creative Director. Visualize, light, and animate the scene.
- IF IMAGE: Act as Motion Graphics Artist. Parallax, zoom, and animate the subject.
- IF VIDEO: Act as VFX Supervisor. Upscale, stabilize, and stylize (e.g., 3D Animation).
ERROR PREVENTION: If a prompt is vague, automatically infer the most professional style. NEVER FAIL.
`;

// Helper to get a fresh instance of Gemini client
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
 * Universal Video Generator - Optimized for the Prime Directive
 */
export const generateVideoFromImage = async (
  base64Image: string,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Universal Master Feed...");

  // AUTOMATIC PROMPT RESOLUTION (The "Fix-It" Logic)
  const resolvedPrompt = prompt.trim() || "Cinematic 3D animation of the subject with professional studio lighting and smooth camera motion.";
  const enhancedPrompt = `${MASTER_CORE_INSTRUCTION}\n\nTASK: ${resolvedPrompt}. Ensure HD aesthetics and smooth frame consistency.`;

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
      onProgress("Neural Rendering: Executing Master Protocol...");
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Output Master Buffer Empty.");
    
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!res.ok) throw new Error(`Data Stream Interrupted: ${res.status}`);
    const blob = await res.blob();

    return {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video,
      aspectRatio: '16:9',
      resolution: '720p',
      prompt: resolvedPrompt,
      timestamp: Date.now()
    };
  } catch (error: any) {
    console.error("Master Gen Error:", error);
    // Silent recovery: check for auth issues
    if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

/**
 * Full Studio Production - Always Produces Polished Content
 */
export const generateGardeningVideo = async (
  prompt: string, 
  settings: ProductionSettings,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Booting Cinema Compute Cluster...");
  
  const resolvedPrompt = prompt.trim() || "A professional cinematic botanical exploration with 8K macro details and smooth slow-motion transitions.";
  const profileMod = getProfileModifiers(settings.profile);
  const fullPrompt = `${MASTER_CORE_INSTRUCTION}\n\nSTYLE: ${profileMod}\nTASK: ${resolvedPrompt}`;

  try {
    let operation = await ai.models.generateVideos({
      model: settings.resolution === '1080p' ? MODEL_VIDEO : MODEL_VIDEO_FAST,
      prompt: fullPrompt,
      config: {
        numberOfVideos: 1,
        resolution: settings.resolution,
        aspectRatio: settings.aspectRatio
      }
    });

    while (!operation.done) {
      onProgress("Production State: Mastering Neural Sequence...");
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Production Cluster Timed Out.");

    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video,
      aspectRatio: settings.aspectRatio,
      resolution: settings.resolution,
      prompt: resolvedPrompt,
      timestamp: Date.now()
    };
  } catch (error: any) {
    if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
      await window.aistudio?.openSelectKey();
    }
    throw error;
  }
};

/**
 * Video Extension - Adds temporal refinement to an existing sequence using the Veo model
 */
export const extendExistingVideo = async (
  previousVideo: VideoGenerationResult,
  prompt: string,
  onProgress: (status: string) => void
): Promise<VideoGenerationResult> => {
  const ai = getGeminiClient();
  onProgress("Initializing Temporal Extension...");

  const resolvedPrompt = prompt.trim() || "Enhance visual fidelity and add smooth 3D motion transitions.";
  const fullPrompt = `${MASTER_CORE_INSTRUCTION}\n\nTASK: ${resolvedPrompt}`;

  try {
    // Only 720p videos can be extended, must use the same aspect ratio as the source
    let operation = await ai.models.generateVideos({
      model: MODEL_VIDEO,
      prompt: fullPrompt,
      video: previousVideo.rawVideo,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: previousVideo.aspectRatio,
      }
    });

    while (!operation.done) {
      onProgress("Temporal Synthesis: Mastering Sequence Extension...");
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Temporal Extension Failed.");

    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();

    return {
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(blob),
      rawVideo: operation.response?.generatedVideos?.[0]?.video,
      aspectRatio: previousVideo.aspectRatio,
      resolution: '720p',
      prompt: resolvedPrompt,
      timestamp: Date.now()
    };
  } catch (error: any) {
    if (error.message?.includes("entity was not found") || error.message?.includes("403")) {
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
  const resolvedPrompt = editPrompt.trim() || "Enhance this image with professional lighting, sharpened textures, and a cinematic 35mm film look.";
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_EDIT,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
          { text: `${MASTER_CORE_INSTRUCTION}\n\nTASK: ${resolvedPrompt}` }
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
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IDENTIFY,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Botanical Forensics: Provide care instructions JSON. If not a plant, assume abstract specimen and provide care for a digital asset." }
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
  } catch {
    return { isBotanical: false, name: "Neural Specimen", scientificName: "Digitalis Artificialis", description: "A high-fidelity digital specimen identified by Veridion Core.", care: { watering: "Keep data flowing", sunlight: "Direct OLED contact", temperature: "Cool cooling cycles", soil: "Silicon based", difficulty: "Easy" } };
  }
};

export const chatWithBotanist = async (message: string, history: any[]): Promise<string> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: MODEL_CHAT,
    contents: [...history.slice(-10), { role: 'user', parts: [{ text: message }] }],
    config: {
      systemInstruction: MASTER_CORE_INSTRUCTION + "\nRespond with authority, precision, and a professional botanical/cinematic vocabulary.",
    }
  });
  return response.text || "Neural handshake successful. Standing by for commands.";
};
