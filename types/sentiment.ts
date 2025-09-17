export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
}

export interface SentimentHeatmapData {
  [key: string]: SentimentData;
}

export interface SentimentApiResponse {
  success: boolean;
  data: SentimentHeatmapData;
  timestamp?: string;
}

export interface HeatmapCell {
  id: string;
  label: string;
  sentiment: SentimentData;
  intensity: number; // 0-1 scale for color intensity
}