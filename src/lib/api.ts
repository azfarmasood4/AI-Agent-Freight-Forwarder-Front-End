import { ChatResponse, RateResponse, SessionHistoryResponse, SearchFilters } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://freight-forward-backend-production.up.railway.app';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithErrorHandling(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async chat(userInput: string, sessionId: string): Promise<ChatResponse> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        user_input: userInput,
        session_id: sessionId,
      }),
    });
  }

  async getRates(filters: SearchFilters): Promise<RateResponse> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/rates`, {
      method: 'POST',
      body: JSON.stringify(filters),
    });
  }

  async getSessionHistory(sessionId: string, limit: number = 10): Promise<SessionHistoryResponse> {
    return this.fetchWithErrorHandling(
      `${this.baseUrl}/session/${sessionId}/history?limit=${limit}`
    );
  }

  async checkHealth(): Promise<{ status: string; message: string; version: string }> {
    return this.fetchWithErrorHandling(`${this.baseUrl}/health`);
  }
}

export const api = new ApiClient(API_BASE_URL);
