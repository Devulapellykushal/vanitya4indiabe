const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config');
const { APIUsage } = require('../models');

class MLService {
  constructor() {
    this.baseURL = config.get('ML_SERVICE_URL');
    this.timeout = config.get('ML_SERVICE_TIMEOUT');
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`ML Service Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('ML Service Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging and error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`ML Service Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('ML Service Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Record API usage for tracking
  async recordUsage(endpoint, creditsUsed, requestPayload, responseStatus, errorMessage = null, userId = null) {
    try {
      await APIUsage.recordUsage({
        provider: 'ml-service',
        endpoint,
        creditsUsed,
        requestPayload,
        responseStatus,
        errorMessage,
        userId
      });
    } catch (error) {
      console.warn('Failed to record API usage:', error);
    }
  }

  // Generate exercises using ML service
  async generateExercises(params) {
    const endpoint = '/ml/generate';
    let responseStatus = null;
    let errorMessage = null;

    try {
      const response = await this.client.post(endpoint, {
        source_language: params.sourceLanguage,
        target_language: params.targetLanguage,
        difficulty: params.difficulty,
        exercise_type: params.exerciseType,
        unit_id: params.unitId,
        count: params.count || 1
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, params.count || 1, params, responseStatus, null, params.userId);

      // Validate response structure
      if (!response.data || !response.data.exercises) {
        throw new Error('Invalid response format from ML service');
      }

      return response.data;
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, params, responseStatus, errorMessage, params.userId);
      
      if (error.response?.status === 503) {
        throw new Error('ML service is temporarily unavailable');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid parameters for exercise generation');
      } else {
        throw new Error(`Failed to generate exercises: ${error.message}`);
      }
    }
  }

  // Translate text using ML service
  async translateText(params) {
    const endpoint = '/ml/translate';
    let responseStatus = null;
    let errorMessage = null;

    try {
      const response = await this.client.post(endpoint, {
        text: params.text,
        source_language: params.sourceLanguage,
        target_language: params.targetLanguage
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 1, params, responseStatus, null, params.userId);

      return {
        translatedText: response.data.translated_text,
        confidence: response.data.confidence,
        sourceLanguage: params.sourceLanguage,
        targetLanguage: params.targetLanguage
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, params, responseStatus, errorMessage, params.userId);
      
      if (error.response?.status === 503) {
        throw new Error('Translation service is temporarily unavailable');
      } else {
        throw new Error(`Failed to translate text: ${error.message}`);
      }
    }
  }

  // Transliterate text using ML service
  async transliterateText(params) {
    const endpoint = '/ml/transliterate';
    let responseStatus = null;
    let errorMessage = null;

    try {
      const response = await this.client.post(endpoint, {
        text: params.text,
        source_script: params.sourceScript,
        target_script: params.targetScript
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 1, params, responseStatus, null, params.userId);

      return {
        transliteratedText: response.data.transliterated_text,
        confidence: response.data.confidence,
        sourceScript: params.sourceScript,
        targetScript: params.targetScript
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, params, responseStatus, errorMessage, params.userId);
      
      if (error.response?.status === 503) {
        throw new Error('Transliteration service is temporarily unavailable');
      } else {
        throw new Error(`Failed to transliterate text: ${error.message}`);
      }
    }
  }

  // Generate TTS audio using ML service
  async generateTTS(params) {
    const endpoint = '/ml/tts';
    let responseStatus = null;
    let errorMessage = null;

    try {
      const response = await this.client.post(endpoint, {
        text: params.text,
        language: params.language,
        voice: params.voice || 'default'
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 1, params, responseStatus, null, params.userId);

      return {
        audio_url: response.data.audio_url,
        duration_ms: response.data.duration_ms,
        codec: response.data.codec || 'mp3'
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, params, responseStatus, errorMessage, params.userId);
      
      if (error.response?.status === 503) {
        throw new Error('TTS service is temporarily unavailable');
      } else {
        throw new Error(`Failed to generate TTS: ${error.message}`);
      }
    }
  }

  // Speech-to-text using ML service
  async speechToText(params) {
    const endpoint = '/ml/stt';
    let responseStatus = null;
    let errorMessage = null;

    try {
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(params.audioFile.path));
      formData.append('language', params.language);

      const response = await this.client.post(endpoint, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      responseStatus = response.status;
      await this.recordUsage(endpoint, 1, { language: params.language }, responseStatus, null, params.userId);

      return {
        text: response.data.text,
        confidence: response.data.confidence,
        processing_time_ms: response.data.processing_time_ms
      };
    } catch (error) {
      responseStatus = error.response?.status || 500;
      errorMessage = error.message;
      
      await this.recordUsage(endpoint, 0, { language: params.language }, responseStatus, errorMessage, params.userId);
      
      if (error.response?.status === 503) {
        throw new Error('STT service is temporarily unavailable');
      } else {
        throw new Error(`Failed to process speech: ${error.message}`);
      }
    }
  }

  // Health check for ML service
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        response: response.data
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = new MLService();