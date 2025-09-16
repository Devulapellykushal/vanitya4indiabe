// AI4Bharat API client wrapper for backend

import axios from 'axios';

export class AI4BharatClient {
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl: string, apiKey?: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  async translateText(text: string, sourceLang: string, targetLang: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(
        `${this.apiUrl}/translate`,
        {
          input: text,
          source_language: sourceLang,
          target_language: targetLang,
        },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('AI4Bharat translation error:', error);
      throw error;
    }
  }

  async detectLanguage(text: string) {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(
        `${this.apiUrl}/detect-language`,
        { text },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('AI4Bharat language detection error:', error);
      throw error;
    }
  }
}

export default AI4BharatClient;