const axios = require('axios');
const config = require('../config');

/**
 * HTTP Client factory for API providers
 * Creates axios instances with proper configurations
 */
class HttpClientFactory {
  constructor() {
    this.clients = {};
  }

  /**
   * Create or get axios instance for Sarvam provider
   * @returns {import('axios').AxiosInstance}
   */
  getSarvamClient() {
    if (!this.clients.sarvam) {
      const sarvamConfig = config.get('providers.sarvam');
      
      this.clients.sarvam = axios.create({
        baseURL: sarvamConfig.base_url,
        timeout: sarvamConfig.timeouts?.request_ms || 15000,
        headers: {
          'Authorization': `Bearer ${sarvamConfig.api_key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Add request interceptor for logging
      this.clients.sarvam.interceptors.request.use(
        (config) => {
          console.log(`[Sarvam] ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('[Sarvam] Request error:', error.message);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for logging
      this.clients.sarvam.interceptors.response.use(
        (response) => {
          console.log(`[Sarvam] Response ${response.status} from ${response.config.url}`);
          return response;
        },
        (error) => {
          const status = error.response?.status || 'N/A';
          const message = error.response?.data?.error || error.message;
          console.error(`[Sarvam] Error ${status}: ${message}`);
          return Promise.reject(error);
        }
      );
    }

    return this.clients.sarvam;
  }

  /**
   * Create or get axios instance for AI4Bharat provider
   * @returns {import('axios').AxiosInstance}
   */
  getAI4BharatClient() {
    if (!this.clients.ai4bharat) {
      const ai4bharatConfig = config.get('providers.ai4bharat');
      
      this.clients.ai4bharat = axios.create({
        baseURL: ai4bharatConfig.base_url,
        timeout: 15000,
        headers: {
          'Authorization': ai4bharatConfig.api_key ? `Bearer ${ai4bharatConfig.api_key}` : undefined,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Add interceptors similar to Sarvam
      this.clients.ai4bharat.interceptors.request.use(
        (config) => {
          console.log(`[AI4Bharat] ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('[AI4Bharat] Request error:', error.message);
          return Promise.reject(error);
        }
      );

      this.clients.ai4bharat.interceptors.response.use(
        (response) => {
          console.log(`[AI4Bharat] Response ${response.status}`);
          return response;
        },
        (error) => {
          const status = error.response?.status || 'N/A';
          console.error(`[AI4Bharat] Error ${status}: ${error.message}`);
          return Promise.reject(error);
        }
      );
    }

    return this.clients.ai4bharat;
  }

  /**
   * Create axios instance for TTS with array buffer response
   * @param {string} provider - Provider name
   * @returns {import('axios').AxiosInstance}
   */
  getTTSClient(provider = 'sarvam') {
    const key = `${provider}_tts`;
    
    if (!this.clients[key]) {
      const baseClient = provider === 'sarvam' ? this.getSarvamClient() : this.getAI4BharatClient();
      
      // Create a new instance based on the base client config
      this.clients[key] = axios.create({
        ...baseClient.defaults,
        responseType: 'arraybuffer'
      });

      // Copy interceptors
      this.clients[key].interceptors = baseClient.interceptors;
    }

    return this.clients[key];
  }

  /**
   * Create FormData for multipart requests
   * @param {Object} data
   * @returns {FormData}
   */
  createFormData(data) {
    const FormData = require('form-data');
    const formData = new FormData();
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }
    
    return formData;
  }

  /**
   * Get generic axios instance
   * @param {Object} options
   * @returns {import('axios').AxiosInstance}
   */
  createCustomClient(options) {
    return axios.create(options);
  }
}

module.exports = new HttpClientFactory();