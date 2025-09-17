const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Enhanced configuration loader for services
 * Loads YAML config and merges with environment variables
 */
class ServiceConfig {
  constructor() {
    this.config = {};
    this.loadConfig();
    Object.freeze(this.config); // Make config immutable
  }

  loadConfig() {
    // Load environment variables
    require('dotenv').config();

    // Load base config from YAML
    const configPath = path.join(__dirname, '../../config/vanitya-config.yml');
    let yamlConfig = {};
    
    if (fs.existsSync(configPath)) {
      const yamlContent = fs.readFileSync(configPath, 'utf8');
      yamlConfig = yaml.parse(yamlContent);
    }

    // Deep merge with environment variable overrides
    this.config = this.mergeWithEnv(yamlConfig);
    
    // Apply validation and defaults
    this.validateAndSetDefaults();
  }

  mergeWithEnv(yamlConfig) {
    const config = { ...yamlConfig };

    // Provider-specific environment overrides
    if (!config.providers) config.providers = {};
    
    // Sarvam provider overrides
    if (!config.providers.sarvam) config.providers.sarvam = {};
    config.providers.sarvam = {
      ...config.providers.sarvam,
      base_url: process.env.SARVAM_BASE_URL || config.providers.sarvam.base_url || 'https://api.sarvam.ai/v1',
      api_key: process.env.SARVAM_API_KEY || config.providers.sarvam.api_key || config.SARVAM_API_KEY,
    };

    // Endpoint overrides
    if (!config.providers.sarvam.endpoints) config.providers.sarvam.endpoints = {};
    config.providers.sarvam.endpoints = {
      ...config.providers.sarvam.endpoints,
      llm: process.env.SARVAM_LLM_PATH || config.providers.sarvam.endpoints.llm || '/generate',
      tts: process.env.SARVAM_TTS_PATH || config.providers.sarvam.endpoints.tts || '/tts',
      stt: process.env.SARVAM_STT_PATH || config.providers.sarvam.endpoints.stt || '/stt',
      credits: process.env.SARVAM_CREDITS_PATH || config.providers.sarvam.endpoints.credits,
    };

    // AI4Bharat provider overrides
    if (!config.providers.ai4bharat) config.providers.ai4bharat = {};
    config.providers.ai4bharat = {
      ...config.providers.ai4bharat,
      base_url: process.env.AI4BHARAT_BASE_URL || config.providers.ai4bharat.base_url || 'https://api.ai4bharat.org',
      api_key: process.env.AI4BHARAT_API_KEY || config.providers.ai4bharat.api_key,
    };

    // Credits configuration
    config.credits_threshold = parseInt(process.env.CREDITS_THRESHOLD) || config.credits_threshold || 10;
    
    // Fallback order
    if (process.env.FALLBACK_ORDER) {
      config.fallback_order = process.env.FALLBACK_ORDER.split(',').map(s => s.trim());
    } else if (!config.fallback_order) {
      config.fallback_order = ['ai4bharat', 'local_seed'];
    }

    // Default languages
    config.default_source_lang = process.env.DEFAULT_SOURCE_LANG || config.DEFAULT_SOURCE_LANG || 'hi';
    config.default_target_lang = process.env.DEFAULT_TARGET_LANG || config.DEFAULT_TARGET_LANG || 'te';

    return config;
  }

  validateAndSetDefaults() {
    // Sarvam defaults
    const sarvam = this.config.providers.sarvam;
    
    // Timeouts
    if (!sarvam.timeouts) sarvam.timeouts = {};
    sarvam.timeouts.request_ms = sarvam.timeouts.request_ms || 15000;
    sarvam.timeouts.connect_ms = sarvam.timeouts.connect_ms || 5000;
    
    // Credit costs
    if (!sarvam.credit_costs) sarvam.credit_costs = {};
    sarvam.credit_costs.generate_questions = sarvam.credit_costs.generate_questions || 1;
    sarvam.credit_costs.tts = sarvam.credit_costs.tts || 1;
    sarvam.credit_costs.stt = sarvam.credit_costs.stt || 1;
    
    // Voices
    if (!sarvam.voices) sarvam.voices = {};
    sarvam.voices.default = sarvam.voices.default || 'meera';
    if (!sarvam.voices.overrides) sarvam.voices.overrides = {};
    
    // STT payload style
    sarvam.stt_payload_style = sarvam.stt_payload_style || 'multipart';
    
    // Chat mode
    sarvam.chat_mode = sarvam.chat_mode !== undefined ? sarvam.chat_mode : true;

    // AI4Bharat defaults
    const ai4bharat = this.config.providers.ai4bharat;
    if (!ai4bharat.endpoints) ai4bharat.endpoints = {};
    ai4bharat.endpoints.llm = ai4bharat.endpoints.llm || '/v1/translate';
    ai4bharat.endpoints.tts = ai4bharat.endpoints.tts || '/v1/tts';
    ai4bharat.endpoints.stt = ai4bharat.endpoints.stt || '/v1/stt';

    // Local seed defaults
    if (!this.config.providers.local_seed) this.config.providers.local_seed = {};
    this.config.providers.local_seed.enabled = 
      this.config.providers.local_seed.enabled !== undefined ? 
      this.config.providers.local_seed.enabled : true;
  }

  get(path) {
    const keys = path.split('.');
    let value = this.config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return undefined;
    }
    
    return value;
  }

  getAll() {
    return { ...this.config };
  }
}

module.exports = new ServiceConfig();