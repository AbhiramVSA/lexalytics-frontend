import { SentimentApiResponse, SentimentHeatmapData } from '@/types/sentiment';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export class SentimentApiService {
  private static async fetchWithErrorHandling<T>(
    url: string, 
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Fetch sentiment analysis data from the backend
   * @param endpoint - The specific endpoint path (e.g., '/sentiment/analysis')
   * @returns Promise with sentiment data
   */
  static async getSentimentData(
    endpoint: string = '/api/sentiment/analysis'
  ): Promise<SentimentHeatmapData> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await this.fetchWithErrorHandling<SentimentApiResponse>(url);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response format from sentiment API');
      }
    } catch (error) {
      console.error('Failed to fetch sentiment data:', error);
      // Return empty data or throw error based on your preference
      throw error;
    }
  }

  /**
   * Fetch sentiment data for a specific agent or location
   * @param agentId - The agent ID to get sentiment data for
   * @returns Promise with sentiment data
   */
  static async getAgentSentimentData(
    agentId: string
  ): Promise<SentimentHeatmapData> {
    const endpoint = `/api/sentiment/agent/${agentId}`;
    return this.getSentimentData(endpoint);
  }

  /**
   * Fetch sentiment data for a specific time range
   * @param startDate - Start date in ISO format
   * @param endDate - End date in ISO format
   * @returns Promise with sentiment data
   */
  static async getSentimentDataByDateRange(
    startDate: string,
    endDate: string
  ): Promise<SentimentHeatmapData> {
    const endpoint = `/api/sentiment/analysis?start=${startDate}&end=${endDate}`;
    return this.getSentimentData(endpoint);
  }

  /**
   * Mock data for development/testing purposes
   * Remove this method when connecting to real backend
   */
  static getMockSentimentData(): SentimentHeatmapData {
    return {
      'Berlin': { positive: 45, negative: 12, neutral: 23 },
      'Tokyo': { positive: 32, negative: 8, neutral: 15 },
      'Cairo': { positive: 28, negative: 18, neutral: 19 },
      'Moscow': { positive: 15, negative: 35, neutral: 12 },
      'London': { positive: 38, negative: 14, neutral: 21 },
      'Paris': { positive: 41, negative: 9, neutral: 17 },
      'Sydney': { positive: 33, negative: 11, neutral: 16 },
      'New York': { positive: 29, negative: 22, neutral: 18 },
      'Mumbai': { positive: 37, negative: 13, neutral: 20 },
      'São Paulo': { positive: 26, negative: 19, neutral: 24 },
      'Dubai': { positive: 42, negative: 7, neutral: 18 },
      'Singapore': { positive: 39, negative: 10, neutral: 14 },
    };
  }
}
