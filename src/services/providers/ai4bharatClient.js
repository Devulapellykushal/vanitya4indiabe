/**
 * AI4Bharat Provider Client
 * Interfaces with AI4Bharat APIs for language services
 */

const httpClient = require('../http/httpClient');
const config = require('../config');

/**
 * Generate questions using AI4Bharat (stub implementation)
 * @param {Object} params
 * @returns {Promise<Array>} - Array of exercise objects
 */
async function generateQuestions(params) {
  console.log('[AI4Bharat] Generating questions:', params);
  
  // For now, this is a stub that throws an error
  // In production, this would call actual AI4Bharat APIs
  throw new Error('AI4Bharat generateQuestions not yet implemented');
}

/**
 * Text-to-Speech using AI4Bharat
 * @param {string} text - Text to convert
 * @param {string} lang - Language code
 * @param {string} voice - Voice identifier
 * @param {Object} options - Additional options
 * @returns {Promise<Buffer>} - Audio buffer
 */
async function tts(text, lang, voice, options = {}) {
  console.log('[AI4Bharat] TTS request:', { text: text.substring(0, 50), lang });
  
  const ai4bharatConfig = config.get('providers.ai4bharat');
  
  if (!ai4bharatConfig?.api_key) {
    throw new Error('AI4Bharat API key not configured');
  }

  try {
    const client = httpClient.getAI4BharatClient();
    const endpoint = ai4bharatConfig.endpoints?.tts || '/v1/tts';
    
    const response = await client.post(endpoint, {
      text,
      language: lang,
      voice: voice || 'default'
    });

    // Assuming the API returns base64 audio
    if (response.data?.audio) {
      return Buffer.from(response.data.audio, 'base64');
    }

    throw new Error('Invalid TTS response from AI4Bharat');
  } catch (error) {
    console.error('[AI4Bharat] TTS error:', error.message);
    throw error;
  }
}

/**
 * Speech-to-Text using AI4Bharat
 * @param {Buffer} audioBuffer - Audio buffer to transcribe
 * @param {string} lang - Language code
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Transcript
 */
async function stt(audioBuffer, lang, options = {}) {
  console.log('[AI4Bharat] STT request:', { bufferSize: audioBuffer?.length, lang });
  
  const ai4bharatConfig = config.get('providers.ai4bharat');
  
  if (!ai4bharatConfig?.api_key) {
    throw new Error('AI4Bharat API key not configured');
  }

  try {
    const client = httpClient.getAI4BharatClient();
    const endpoint = ai4bharatConfig.endpoints?.stt || '/v1/stt';
    
    // Convert audio buffer to base64 for transmission
    const audioBase64 = audioBuffer.toString('base64');
    
    const response = await client.post(endpoint, {
      audio: audioBase64,
      language: lang,
      format: options.format || 'wav'
    });

    if (response.data?.transcript) {
      return response.data.transcript;
    }

    throw new Error('Invalid STT response from AI4Bharat');
  } catch (error) {
    console.error('[AI4Bharat] STT error:', error.message);
    throw error;
  }
}

/**
 * Get remaining credits for AI4Bharat
 * @returns {Promise<number>} - Credits remaining (returns high number for now)
 */
async function getCreditsRemaining() {
  // AI4Bharat might not have a credit system
  // Return a high number to indicate availability
  return 10000;
}

/**
 * Initialize the AI4Bharat provider
 * @returns {Promise<void>}
 */
async function initialize() {
  const ai4bharatConfig = config.get('providers.ai4bharat');
  
  if (!ai4bharatConfig?.api_key) {
    console.warn('[AI4Bharat] No API key configured');
    return;
  }

  console.log('[AI4Bharat] Provider initialized');
}

/**
 * Check if AI4Bharat service is healthy
 * @returns {Promise<Object>} - Health status
 */
async function healthCheck() {
  const ai4bharatConfig = config.get('providers.ai4bharat');
  
  if (!ai4bharatConfig?.api_key) {
    return {
      status: 'unavailable',
      provider: 'ai4bharat',
      message: 'API key not configured'
    };
  }

  try {
    const client = httpClient.getAI4BharatClient();
    // Try a simple health endpoint if available
    await client.get('/health').catch(() => null);
    
    return {
      status: 'healthy',
      provider: 'ai4bharat',
      message: 'AI4Bharat service is available'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      provider: 'ai4bharat',
      message: error.message
    };
  }
}

module.exports = {
  generateQuestions,
  tts,
  stt,
  getCreditsRemaining,
  initialize,
  healthCheck,
  name: 'ai4bharat'
};