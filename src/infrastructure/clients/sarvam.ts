// Sarvam AI API client wrapper for backend

import axios from 'axios';

export class SarvamAPIClient {
  private apiUrl: string;
  private apiKey: string;
  private freeCredits: number;

  constructor(apiUrl: string, apiKey: string, freeCredits: number = 900) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.freeCredits = freeCredits;
  }

  async translate(text: string, sourceLang: string, targetLang: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/translate`,
        {
          text,
          source_language: sourceLang,
          target_language: targetLang,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Sarvam translation error:', error);
      throw error;
    }
  }

  async textToSpeech(text: string, language: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/tts`,
        {
          text,
          language,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Sarvam TTS error:', error);
      throw error;
    }
  }

  getRemainingCredits(): number {
    return this.freeCredits;
  }
}

export default SarvamAPIClient;