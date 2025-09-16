const mlService = require('./mlService');
const sarvamClient = require('./sarvamClient');
const { TTSEntry } = require('../models');

class TTSService {
  constructor() {
    this.preferredProvider = 'ml-service'; // Primary provider
    this.fallbackProvider = 'sarvam'; // Fallback provider
  }

  // Generate TTS with fallback support
  async generateTTS(params) {
    const { text, language, exerciseId, userId, voice = 'default' } = params;

    // Check if TTS already exists for this exercise
    if (exerciseId) {
      const existingTTS = await this.getExerciseTTS(exerciseId, language);
      if (existingTTS) {
        return {
          ...existingTTS,
          cached: true
        };
      }
    }

    // Try primary provider first (ML service)
    try {
      console.log(`Attempting TTS generation with ${this.preferredProvider}`);
      const result = await mlService.generateTTS({
        text,
        language,
        voice,
        userId
      });

      // Save TTS entry to database
      if (exerciseId) {
        await TTSEntry.create({
          exerciseId,
          text,
          language,
          audioUrl: result.audio_url,
          durationMs: result.duration_ms,
          codec: result.codec || 'mp3',
          provider: this.preferredProvider,
          status: 'completed'
        });
      }

      return {
        audioUrl: result.audio_url,
        durationMs: result.duration_ms,
        codec: result.codec || 'mp3',
        provider: this.preferredProvider,
        fallbackUsed: false,
        cached: false
      };
    } catch (primaryError) {
      console.warn(`Primary TTS provider failed: ${primaryError.message}`);
      
      // Try fallback provider (Sarvam)
      try {
        console.log(`Attempting TTS generation with ${this.fallbackProvider}`);
        const result = await sarvamClient.textToSpeech(text, language, userId);

        // Save TTS entry to database
        if (exerciseId) {
          await TTSEntry.create({
            exerciseId,
            text,
            language,
            audioUrl: result.audioUrl,
            durationMs: result.durationMs,
            codec: result.codec || 'mp3',
            provider: this.fallbackProvider,
            status: 'completed',
            metadata: {
              fallbackReason: primaryError.message,
              originalProvider: this.preferredProvider
            }
          });
        }

        return {
          audioUrl: result.audioUrl,
          durationMs: result.durationMs,
          codec: result.codec || 'mp3',
          provider: this.fallbackProvider,
          fallbackUsed: true,
          fallbackReason: primaryError.message,
          cached: false
        };
      } catch (fallbackError) {
        console.error(`Fallback TTS provider also failed: ${fallbackError.message}`);
        
        // Create error entry in database
        if (exerciseId) {
          await TTSEntry.create({
            exerciseId,
            text,
            language,
            audioUrl: '',
            provider: this.preferredProvider,
            status: 'error',
            metadata: {
              primaryError: primaryError.message,
              fallbackError: fallbackError.message
            }
          });
        }

        throw new Error(`TTS generation failed on both providers. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      }
    }
  }

  // Get TTS for exercise with caching
  async getExerciseTTS(exerciseId, language) {
    const existingTTS = await TTSEntry.findOne({
      where: {
        exerciseId,
        language,
        status: 'completed'
      },
      order: [['createdAt', 'DESC']] // Get most recent
    });

    if (existingTTS) {
      return {
        audioUrl: existingTTS.audioUrl,
        durationMs: existingTTS.durationMs,
        codec: existingTTS.codec,
        provider: existingTTS.provider,
        createdAt: existingTTS.createdAt
      };
    }

    return null; // No cached TTS found
  }

  // Batch generate TTS for multiple texts
  async batchGenerateTTS(requests, userId = null) {
    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      try {
        const result = await this.generateTTS({
          text: request.text,
          language: request.language,
          exerciseId: request.exerciseId,
          voice: request.voice,
          userId
        });
        
        results.push({
          index: i,
          text: request.text,
          language: request.language,
          ...result
        });
      } catch (error) {
        errors.push({
          index: i,
          text: request.text,
          language: request.language,
          error: error.message
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      totalProcessed: requests.length,
      successRate: ((results.length / requests.length) * 100).toFixed(2)
    };
  }

  // Get TTS queue status
  async getQueueStatus() {
    const pendingTTS = await TTSEntry.findAndCountAll({
      where: {
        status: 'pending'
      },
      attributes: ['id', 'exerciseId', 'text', 'language', 'createdAt']
    });

    const errorTTS = await TTSEntry.findAndCountAll({
      where: {
        status: 'error'
      },
      attributes: ['id', 'exerciseId', 'text', 'language', 'metadata', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return {
      pending: {
        count: pendingTTS.count,
        items: pendingTTS.rows
      },
      errors: {
        count: errorTTS.count,
        recentItems: errorTTS.rows
      }
    };
  }

  // Retry failed TTS entries
  async retryFailedTTS(exerciseId, userId = null) {
    const failedTTS = await TTSEntry.findOne({
      where: {
        exerciseId,
        status: 'error'
      },
      order: [['createdAt', 'DESC']]
    });

    if (!failedTTS) {
      throw new Error('No failed TTS entry found for this exercise');
    }

    // Retry TTS generation
    try {
      const result = await this.generateTTS({
        text: failedTTS.text,
        language: failedTTS.language,
        exerciseId: failedTTS.exerciseId,
        userId
      });

      // Update the failed entry status
      await failedTTS.update({
        status: 'completed',
        audioUrl: result.audioUrl,
        durationMs: result.durationMs,
        codec: result.codec,
        metadata: {
          ...failedTTS.metadata,
          retrySuccessful: true,
          retryTimestamp: new Date().toISOString()
        }
      });

      return result;
    } catch (error) {
      // Update metadata with retry failure
      await failedTTS.update({
        metadata: {
          ...failedTTS.metadata,
          retryFailed: true,
          retryError: error.message,
          retryTimestamp: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  // Get TTS statistics
  async getStatistics(timeframe = '24h') {
    const timeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };

    const hours = timeMap[timeframe] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const stats = await TTSEntry.findAll({
      attributes: [
        'provider',
        'status',
        [TTSEntry.sequelize.fn('COUNT', TTSEntry.sequelize.col('id')), 'count'],
        [TTSEntry.sequelize.fn('AVG', TTSEntry.sequelize.col('duration_ms')), 'avgDuration']
      ],
      where: {
        createdAt: {
          [TTSEntry.sequelize.Op.gte]: since
        }
      },
      group: ['provider', 'status'],
      raw: true
    });

    return {
      timeframe,
      statistics: stats
    };
  }

  // Health check for all TTS providers
  async healthCheck() {
    const [mlHealth, sarvamHealth] = await Promise.all([
      mlService.healthCheck(),
      sarvamClient.healthCheck()
    ]);

    return {
      mlService: mlHealth,
      sarvam: sarvamHealth,
      overall: mlHealth.status === 'healthy' || sarvamHealth.status === 'healthy' ? 'healthy' : 'unhealthy'
    };
  }

  // Get supported languages for TTS
  getSupportedLanguages() {
    return [
      { code: 'hi', name: 'Hindi' },
      { code: 'te', name: 'Telugu' },
      { code: 'ta', name: 'Tamil' },
      { code: 'bn', name: 'Bengali' },
      { code: 'gu', name: 'Gujarati' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'mr', name: 'Marathi' },
      { code: 'or', name: 'Odia' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'ur', name: 'Urdu' },
      { code: 'en', name: 'English' }
    ];
  }
}

module.exports = new TTSService();