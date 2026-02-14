
export interface PlantCareInfo {
  name: string;
  scientificName: string;
  description: string;
  care: {
    watering: string;
    sunlight: string;
    temperature: string;
    soil: string;
    difficulty: 'Easy' | 'Moderate' | 'Challenging';
  };
  commonIssues: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  id: string;
}

export interface VideoGenerationResult {
  id: string;
  url: string;
  rawVideo: any;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
  prompt: string;
  timestamp: number;
}

export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  previewEmoji: string;
}

export type CinematicProfile = 'standard' | 'log-c' | 'raw' | 'hdr';

export interface ProductionSettings {
  profile: CinematicProfile;
  framerate: 24 | 30 | 60;
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
}

export interface GardenTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

// Added WeatherData interface to support the Climate Intelligence section
export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  uvIndex: number;
  location: string;
  advice: string;
}
