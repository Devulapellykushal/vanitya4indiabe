const axios = require('axios');
const config = require('../config');
const { APIUsage } = require('../models');

class SarvamClient {
  constructor() {
    this.apiUrl = config.get('SARVAM_API_URL');
    this.apiKey = config.get('SARVAM_API_KEY');
    this.freeCredits = config.get('SARVAM_FREE_CREDITS') || 900;
    this.usedCredits = 0;

    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add request/response interceptors for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Sarvam API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`Sarvam API Response: ${response.status}`);
        return response;
      },
      (error) => {
        console.error('Sarvam API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Check if we have available credits
  async checkCredits() {
    const remainingCredits = this.freeCredits - this.usedCredits;
    return {
      remaining: remainingCredits,
      used: this.usedCredits,
      total: this.freeCredits,
      available: remainingCredits > 0
    };
  }

  // Record API usage
  async recordUsage(endpoint, creditsUsed, requestPayload, responseStatus, errorMessage = null, userId = null) {
    try {
      this.usedCredits += creditsUsed;
      const remaining = this.freeCredits - this.usedCredits;

      await APIUsage.recordUsage({
        provider: 'sarvam',
        endpoint,
        creditsUsed,
        creditsRemaining: remaining,
        requestPayload,
        responseStatus,
        errorMessage,
        userId
      });
    } catch (error) {
      console.warn('Failed to record Sarvam API usage:', error);
    }
  }

  // Translate text
  async translate(text, sourceLang, targetLang, userId = null) {
    const endpoint = '/translate';
    const credits = await this.checkCredits();
    
    if (!credits.available) {
      throw new Error('Sarvam API credits exhausted');
    }

    let responseStatus = null;
    let errorMessage = null;
    const requestPayload = { text, sourceLang, targetLang };

    try {
      const response = await this.client.post(endpoint, {
        text,
        source_language: sourceLang,
        target_language: targetLang,
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 1, requestPayload, responseStatus, null, userId);

      return {
        translatedText: response.data.translated_text,
        confidence: response.data.confidence || 0.9,
        usage: {
          creditsUsed: 1,
          creditsRemaining: credits.remaining - 1
        }
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, requestPayload, responseStatus, errorMessage, userId);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Sarvam API key');
      } else if (error.response?.status === 429) {
        throw new Error('Sarvam API rate limit exceeded');
      } else {
        throw new Error(`Sarvam translation failed: ${error.message}`);
      }
    }
  }

  // Text-to-Speech
  async textToSpeech(text, language, userId = null) {
    const endpoint = '/tts';
    const credits = await this.checkCredits();
    
    if (!credits.available) {
      throw new Error('Sarvam API credits exhausted');
    }

    let responseStatus = null;
    let errorMessage = null;
    const requestPayload = { text, language };

    try {
      const response = await this.client.post(endpoint, {
        text,
        language,
        model: 'bulbul-v1',
        speaker: 'meera'
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 2, requestPayload, responseStatus, null, userId); // TTS costs more

      return {
        audioUrl: response.data.audio_url,
        durationMs: response.data.duration_ms,
        codec: 'mp3',
        usage: {
          creditsUsed: 2,
          creditsRemaining: credits.remaining - 2
        }
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, requestPayload, responseStatus, errorMessage, userId);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Sarvam API key');
      } else if (error.response?.status === 429) {
        throw new Error('Sarvam API rate limit exceeded');
      } else {
        throw new Error(`Sarvam TTS failed: ${error.message}`);
      }
    }
  }

  // Speech-to-Text
  async speechToText(audioBuffer, language, userId = null) {
    const endpoint = '/stt';
    const credits = await this.checkCredits();
    
    if (!credits.available) {
      throw new Error('Sarvam API credits exhausted');
    }

    let responseStatus = null;
    let errorMessage = null;
    const requestPayload = { language };

    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, { filename: 'audio.wav' });
      formData.append('language', language);

      const response = await this.client.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 2, requestPayload, responseStatus, null, userId); // STT costs more

      return {
        text: response.data.transcript,
        confidence: response.data.confidence || 0.9,
        usage: {
          creditsUsed: 2,
          creditsRemaining: credits.remaining - 2
        }
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, requestPayload, responseStatus, errorMessage, userId);
      
      if (error.response?.status === 401) {
        throw new Error('Invalid Sarvam API key');
      } else if (error.response?.status === 429) {
        throw new Error('Sarvam API rate limit exceeded');
      } else {
        throw new Error(`Sarvam STT failed: ${error.message}`);
      }
    }
  }

  // Get usage statistics
  async getUsageStats() {
    return {
      totalCredits: this.freeCredits,
      usedCredits: this.usedCredits,
      remainingCredits: this.freeCredits - this.usedCredits,
      usagePercentage: ((this.usedCredits / this.freeCredits) * 100).toFixed(2)
    };
  }

  // Health check
  async healthCheck() {
    try {
      // Use a minimal translate request for health check
      await this.client.post('/translate', {
        text: 'test',
        source_language: 'en',
        target_language: 'hi'
      });
      return { status: 'healthy' };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new SarvamClient();