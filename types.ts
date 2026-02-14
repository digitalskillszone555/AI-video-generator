
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
  url: string;
  rawVideo: any;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface VideoTemplate {
  id: string;
  title: string;
  description: string;
  prompt: string;
  previewEmoji: string;
}

export interface GardenTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export type TransitionType = 'none' | 'fade' | 'blur';

export interface VideoClip {
  id: string;
  url: string;
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  transition: TransitionType;
}

export interface BackgroundAudio {
  id: string;
  url: string;
  name: string;
  category: string;
}

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'Windy' | 'Stormy';
  humidity: number;
  uvIndex: number;
  location: string;
  advice: string;
}
