/**
 * Enhanced Sarvam Client with failover support and strict JSON handling
 * Provides generateQuestions, TTS, STT, and credit management
 */

const config = require('./config');
const httpClient = require('./http/httpClient');
const usageService = require('./usageService');
const { parseJsonArrayStrict } = require('./utils/jsonStrictParser');
const { validateExerciseParams, validateExerciseItems } = require('./utils/validation');
const { buildExercisePrompt } = require('./prompts/sarvamExercisePrompt');
const { ProviderError, CreditsError } = require('./utils/errors');
const { APIUsage } = require('../models');
const FormData = require('form-data');

class SarvamClient {
  constructor() {
    this.provider = 'sarvam';
    this.sarvamConfig = config.get('providers.sarvam');
    this.creditsThreshold = config.get('credits_threshold') || 10;
    this.fallbackOrder = config.get('fallback_order') || ['ai4bharat', 'local_seed'];
    
    // Legacy support
    this.apiUrl = this.sarvamConfig?.base_url || config.get('SARVAM_API_URL');
    this.apiKey = this.sarvamConfig?.api_key || config.get('SARVAM_API_KEY');
    this.freeCredits = config.get('SARVAM_FREE_CREDITS') || 900;
    this.usedCredits = 0;

    // Initialize HTTP client
    this.client = httpClient.getSarvamClient();
    
    // Initialize usage service
    this._initializeCredits();
  }

  async _initializeCredits() {
    await usageService.initializeCredits(this.provider, this.freeCredits);
  }

  // =====================
  // PUBLIC API
  // =====================

  /**
   * Generate language learning exercises using Sarvam-M
   * @param {Object} params - Generation parameters
   * @returns {Promise<Array>} - Array of exercise objects
   */
  async generateQuestions(params) {
    try {
      // Validate parameters
      validateExerciseParams(params);

      // Check credits before attempting
      const creditsNeeded = this.sarvamConfig?.credit_costs?.generate_questions || 1;
      await this._ensureCredits('generate_questions', creditsNeeded);

      // Build prompt
      const prompt = buildExercisePrompt(params);
      
      // Call LLM
      const exercises = await this._callLLM(prompt, params);
      
      // Validate output
      const validatedExercises = validateExerciseItems(exercises);
      
      // Decrement credits on success
      await this._decrementCredits('generate_questions', creditsNeeded);
      
      console.log(`[Sarvam] Successfully generated ${validatedExercises.length} exercises`);
      return validatedExercises;
    } catch (error) {
      console.warn('[Sarvam] generateQuestions failed, attempting failover:', error.message);
      return this._withFailover('generateQuestions', params);
    }
  }

  /**
   * Text-to-Speech conversion
   * @param {string} text - Text to convert
   * @param {string} lang - Language code
   * @param {string} [voice] - Voice identifier
   * @param {Object} [options] - Additional options
   * @returns {Promise<Buffer>} - Audio buffer
   */
  async tts(text, lang, voice, options = {}) {
    try {
      const creditsNeeded = this.sarvamConfig?.credit_costs?.tts || 1;
      await this._ensureCredits('tts', creditsNeeded);
      
      const audioBuffer = await this._callTTS(text, lang, voice, options);
      
      await this._decrementCredits('tts', creditsNeeded);
      
      console.log('[Sarvam] TTS successful');
      return audioBuffer;
    } catch (error) {
      console.warn('[Sarvam] TTS failed, attempting failover:', error.message);
      return this._withFailover('tts', { text, lang, voice, options });
    }
  }

  /**
   * Speech-to-Text conversion
   * @param {Buffer} audioBuffer - Audio buffer to transcribe
   * @param {string} lang - Language code
   * @param {Object} [options] - Additional options
   * @returns {Promise<string>} - Transcript text
   */
  async stt(audioBuffer, lang, options = {}) {
    try {
      const creditsNeeded = this.sarvamConfig?.credit_costs?.stt || 1;
      await this._ensureCredits('stt', creditsNeeded);
      
      const transcript = await this._callSTT(audioBuffer, lang, options);
      
      await this._decrementCredits('stt', creditsNeeded);
      
      console.log('[Sarvam] STT successful');
      return transcript;
    } catch (error) {
      console.warn('[Sarvam] STT failed, attempting failover:', error.message);
      return this._withFailover('stt', { audioBuffer, lang, options });
    }
  }

  /**
   * Get remaining credits
   * @returns {Promise<number>} - Credits remaining
   */
  async getCreditsRemaining() {
    try {
      // Check if credits endpoint is configured
      const creditsEndpoint = this.sarvamConfig?.endpoints?.credits;
      if (creditsEndpoint) {
        const response = await this.client.get(creditsEndpoint);
        const credits = response.data?.credits || response.data?.remaining || 0;
        await usageService.setCachedCredits(this.provider, credits, true);
        return credits;
      }
    } catch (error) {
      console.log('[Sarvam] Failed to fetch credits from API:', error.message);
    }

    // Fallback to cached credits
    const cached = await usageService.getCachedCredits(this.provider);
    return cached !== null ? cached : this.freeCredits;
  }

  // =====================
  // LEGACY API (for backward compatibility)
  // =====================

  async checkCredits() {
    const remaining = await this.getCreditsRemaining();
    return {
      remaining,
      used: this.freeCredits - remaining,
      total: this.freeCredits,
      available: remaining > 0
    };
  }

  async translate(text, sourceLang, targetLang, userId = null) {
    // Legacy translate method - redirect to generateQuestions for now
    console.warn('[Sarvam] translate() is deprecated, consider using generateQuestions()');
    
    const endpoint = '/translate';
    const requestPayload = { text, sourceLang, targetLang };
    
    try {
      const response = await this.client.post(endpoint, {
        text,
        source_language: sourceLang,
        target_language: targetLang,
      });

      await this.recordUsage(endpoint, 1, requestPayload, response.status, null, userId);

      return {
        translatedText: response.data.translated_text,
        confidence: response.data.confidence || 0.9,
        usage: {
          creditsUsed: 1,
          creditsRemaining: await this.getCreditsRemaining()
        }
      };
    } catch (error) {
      await this.recordUsage(endpoint, 0, requestPayload, error.response?.status || 500, error.message, userId);
      throw error;
    }
  }

  async textToSpeech(text, language, userId = null) {
    // Legacy TTS method - redirect to new tts()
    const result = await this.tts(text, language);
    return {
      audioUrl: null, // Buffer returned instead
      audioBuffer: result,
      durationMs: null,
      codec: 'mp3',
      usage: {
        creditsUsed: 1,
        creditsRemaining: await this.getCreditsRemaining()
      }
    };
  }

  async speechToText(audioBuffer, language, userId = null) {
    // Legacy STT method - redirect to new stt()
    const transcript = await this.stt(audioBuffer, language);
    return {
      text: transcript,
      confidence: 0.9,
      usage: {
        creditsUsed: 1,
        creditsRemaining: await this.getCreditsRemaining()
      }
    };
  }

  async recordUsage(endpoint, creditsUsed, requestPayload, responseStatus, errorMessage = null, userId = null) {
    await usageService.recordUsage({
      provider: this.provider,
      endpoint,
      creditsUsed,
      creditsRemaining: await this.getCreditsRemaining(),
      requestPayload,
      responseStatus,
      errorMessage,
      userId
    });
  }

  async getUsageStats() {
    return usageService.getUsageStats(this.provider, '24h');
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health').catch(() => null);
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  // =====================
  // INTERNAL HELPERS
  // =====================

  /**
   * Call Sarvam LLM for question generation
   * @private
   */
  async _callLLM(prompt, originalParams) {
    const endpoint = this.sarvamConfig?.endpoints?.llm || '/generate';
    
    let payload;
    if (this.sarvamConfig?.chat_mode) {
      payload = {
        messages: prompt.messages,
        response_format: 'json',
        max_tokens: 2000,
        temperature: 0.7
      };
    } else {
      payload = {
        prompt: prompt.rawPrompt,
        max_tokens: 2000,
        temperature: 0.7
      };
    }

    const response = await this.client.post(endpoint, payload);
    
    // Extract generated text
    let generatedText = '';
    if (typeof response.data === 'string') {
      generatedText = response.data;
    } else if (response.data?.text) {
      generatedText = response.data.text;
    } else if (response.data?.choices?.[0]?.message?.content) {
      generatedText = response.data.choices[0].message.content;
    } else if (response.data?.choices?.[0]?.text) {
      generatedText = response.data.choices[0].text;
    } else {
      throw new Error('Unexpected LLM response format');
    }

    // Parse strict JSON
    const exercises = parseJsonArrayStrict(generatedText);
    return exercises;
  }

  /**
   * Call Sarvam TTS
   * @private
   */
  async _callTTS(text, lang, voice, options) {
    const endpoint = this.sarvamConfig?.endpoints?.tts || '/tts';
    
    // Resolve voice
    const resolvedVoice = voice || 
      this.sarvamConfig?.voices?.overrides?.[lang] || 
      this.sarvamConfig?.voices?.default || 
      'meera';

    const payload = {
      text,
      language: lang,
      model: 'bulbul-v1',
      speaker: resolvedVoice,
      speed: options.speed ?? 1.0,
      pitch: options.pitch ?? 0,
      format: options.format ?? 'mp3',
      sample_rate: options.sample_rate ?? 22050
    };

    const ttsClient = httpClient.getTTSClient('sarvam');
    const response = await ttsClient.post(endpoint, payload);
    
    return Buffer.from(response.data);
  }

  /**
   * Call Sarvam STT
   * @private
   */
  async _callSTT(audioBuffer, lang, options) {
    const endpoint = this.sarvamConfig?.endpoints?.stt || '/stt';
    const payloadStyle = this.sarvamConfig?.stt_payload_style || 'multipart';
    
    let response;
    if (payloadStyle === 'multipart') {
      const formData = new FormData();
      formData.append('file', audioBuffer, { filename: 'audio.wav' });
      formData.append('language', lang);
      formData.append('enable_punctuation', options?.punctuation ?? true);
      
      response = await this.client.post(endpoint, formData, {
        headers: formData.getHeaders()
      });
    } else {
      // Base64 payload style
      const audioBase64 = audioBuffer.toString('base64');
      response = await this.client.post(endpoint, {
        audio: audioBase64,
        language: lang,
        enable_punctuation: options?.punctuation ?? true
      });
    }

    // Extract transcript
    if (response.data?.transcript) {
      return response.data.transcript;
    } else if (typeof response.data === 'string') {
      return response.data;
    }
    
    throw new Error('Invalid STT response format');
  }

  /**
   * Ensure sufficient credits for operation
   * @private
   */
  async _ensureCredits(operation, requiredCredits) {
    const available = await this.getCreditsRemaining();
    
    if (available <= this.creditsThreshold) {
      throw new CreditsError(this.provider, operation, available, requiredCredits);
    }
    
    if (available < requiredCredits) {
      throw new CreditsError(this.provider, operation, available, requiredCredits);
    }
  }

  /**
   * Decrement credits after successful operation
   * @private
   */
  async _decrementCredits(operation, units = 1) {
    const cost = this.sarvamConfig?.credit_costs?.[operation] || units;
    await usageService.decrementCredits(this.provider, cost);
  }

  /**
   * Execute with failover to alternative providers
   * @private
   */
  async _withFailover(operationName, params) {
    const errors = [];
    
    // Try each provider in fallback order
    for (const providerName of this.fallbackOrder) {
      try {
        console.log(`[Failover] Attempting ${providerName} for ${operationName}`);
        
        const provider = require(`./providers/${providerName}Client`);
        
        // Call the operation on the fallback provider
        if (operationName === 'generateQuestions') {
          return await provider.generateQuestions(params);
        } else if (operationName === 'tts') {
          return await provider.tts(params.text, params.lang, params.voice, params.options);
        } else if (operationName === 'stt') {
          return await provider.stt(params.audioBuffer, params.lang, params.options);
        }
        
        throw new Error(`Unknown operation: ${operationName}`);
      } catch (error) {
        console.error(`[Failover] ${providerName} failed:`, error.message);
        errors.push({ provider: providerName, error: error.message });
        
        // Special handling for local_seed which should always work
        if (providerName === 'local_seed') {
          // Force local seed provider
          const localProvider = require('./providers/localSeedProvider');
          
          if (operationName === 'generateQuestions') {
            return await localProvider.generateQuestions(params);
          } else if (operationName === 'tts') {
            return await localProvider.tts(params.text, params.lang, params.voice, params.options);
          } else if (operationName === 'stt') {
            return await localProvider.stt(params.audioBuffer, params.lang, params.options);
          }
        }
      }
    }
    
    // All providers failed
    throw new Error(`All providers failed for ${operationName}: ${JSON.stringify(errors)}`);
  }
}

module.exports = new SarvamClient();