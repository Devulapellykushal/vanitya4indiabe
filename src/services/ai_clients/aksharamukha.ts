// Aksharamukha transliteration API client wrapper for backend

import axios from 'axios';

export class AksharamukhaClient {
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async transliterate(
    text: string,
    sourceScript: string,
    targetScript: string,
    preOptions?: string[],
    postOptions?: string[]
  ) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/transliterate`,
        {
          source: sourceScript,
          target: targetScript,
          text,
          nativize: true,
          preOptions: preOptions || [],
          postOptions: postOptions || [],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Aksharamukha transliteration error:', error);
      throw error;
    }
  }

  async getAvailableScripts() {
    try {
      const response = await axios.get(`${this.apiUrl}/scripts`);
      return response.data;
    } catch (error) {
      console.error('Aksharamukha scripts fetch error:', error);
      throw error;
    }
  }
}

export default AksharamukhaClient;