const mlService = require('./mlService');
const sarvamClient = require('./sarvamClient');
const { Translation, Transliteration } = require('../models');

class TranslationPipeline {
  constructor() {
    this.preferredProvider = 'ml-service'; // Primary provider
    this.fallbackProvider = 'sarvam'; // Fallback provider
  }

  // Translate text with fallback support
  async translateText(params) {
    const { text, sourceLanguage, targetLanguage, exerciseId, userId } = params;

    // Try primary provider first (ML service)
    try {
      console.log(`Attempting translation with ${this.preferredProvider}`);
      const result = await mlService.translateText({
        text,
        sourceLanguage,
        targetLanguage,
        userId
      });

      // Save translation to database
      if (exerciseId) {
        await Translation.create({
          exerciseId,
          sourceLanguage,
          targetLanguage,
          originalText: text,
          translatedText: result.translatedText,
          confidence: result.confidence,
          provider: this.preferredProvider
        });
      }

      return {
        ...result,
        provider: this.preferredProvider,
        fallbackUsed: false
      };
    } catch (primaryError) {
      console.warn(`Primary translation provider failed: ${primaryError.message}`);
      
      // Try fallback provider (Sarvam)
      try {
        console.log(`Attempting translation with ${this.fallbackProvider}`);
        const result = await sarvamClient.translate(text, sourceLanguage, targetLanguage, userId);

        // Save translation to database
        if (exerciseId) {
          await Translation.create({
            exerciseId,
            sourceLanguage,
            targetLanguage,
            originalText: text,
            translatedText: result.translatedText,
            confidence: result.confidence,
            provider: this.fallbackProvider,
            metadata: {
              fallbackReason: primaryError.message,
              originalProvider: this.preferredProvider
            }
          });
        }

        return {
          translatedText: result.translatedText,
          confidence: result.confidence,
          sourceLanguage,
          targetLanguage,
          provider: this.fallbackProvider,
          fallbackUsed: true,
          fallbackReason: primaryError.message
        };
      } catch (fallbackError) {
        console.error(`Fallback translation provider also failed: ${fallbackError.message}`);
        throw new Error(`Translation failed on both providers. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      }
    }
  }

  // Transliterate text (primarily ML service, no direct Sarvam equivalent)
  async transliterateText(params) {
    const { text, sourceScript, targetScript, exerciseId, userId } = params;

    try {
      const result = await mlService.transliterateText({
        text,
        sourceScript,
        targetScript,
        userId
      });

      // Save transliteration to database
      if (exerciseId) {
        await Transliteration.create({
          exerciseId,
          sourceScript,
          targetScript,
          originalText: text,
          transliteratedText: result.transliteratedText,
          confidence: result.confidence,
          provider: 'ml-service'
        });
      }

      return {
        ...result,
        provider: 'ml-service',
        fallbackUsed: false
      };
    } catch (error) {
      console.error(`Transliteration failed: ${error.message}`);
      throw new Error(`Transliteration failed: ${error.message}`);
    }
  }

  // Batch translate multiple texts
  async batchTranslate(texts, sourceLanguage, targetLanguage, userId = null) {
    const results = [];
    const errors = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const result = await this.translateText({
          text: texts[i],
          sourceLanguage,
          targetLanguage,
          userId
        });
        results.push({
          index: i,
          originalText: texts[i],
          ...result
        });
      } catch (error) {
        errors.push({
          index: i,
          originalText: texts[i],
          error: error.message
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      totalProcessed: texts.length,
      successRate: ((results.length / texts.length) * 100).toFixed(2)
    };
  }

  // Get translation for exercise with caching
  async getExerciseTranslation(exerciseId, sourceLanguage, targetLanguage) {
    // First check if translation already exists
    const existingTranslation = await Translation.findOne({
      where: {
        exerciseId,
        sourceLanguage,
        targetLanguage
      },
      order: [['createdAt', 'DESC']] // Get most recent
    });

    if (existingTranslation) {
      return {
        translatedText: existingTranslation.translatedText,
        confidence: existingTranslation.confidence,
        sourceLanguage: existingTranslation.sourceLanguage,
        targetLanguage: existingTranslation.targetLanguage,
        provider: existingTranslation.provider,
        cached: true,
        createdAt: existingTranslation.createdAt
      };
    }

    return null; // No cached translation found
  }

  // Get transliteration for exercise with caching
  async getExerciseTransliteration(exerciseId, sourceScript, targetScript) {
    // First check if transliteration already exists
    const existingTransliteration = await Transliteration.findOne({
      where: {
        exerciseId,
        sourceScript,
        targetScript
      },
      order: [['createdAt', 'DESC']] // Get most recent
    });

    if (existingTransliteration) {
      return {
        transliteratedText: existingTransliteration.transliteratedText,
        confidence: existingTransliteration.confidence,
        sourceScript: existingTransliteration.sourceScript,
        targetScript: existingTransliteration.targetScript,
        provider: existingTransliteration.provider,
        cached: true,
        createdAt: existingTransliteration.createdAt
      };
    }

    return null; // No cached transliteration found
  }

  // Get pipeline statistics
  async getStatistics(timeframe = '24h') {
    const timeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    };

    const hours = timeMap[timeframe] || 24;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [translationStats, transliterationStats] = await Promise.all([
      Translation.findAll({
        attributes: [
          'provider',
          [Translation.sequelize.fn('COUNT', Translation.sequelize.col('id')), 'count'],
          [Translation.sequelize.fn('AVG', Translation.sequelize.col('confidence')), 'avgConfidence']
        ],
        where: {
          createdAt: {
            [Translation.sequelize.Op.gte]: since
          }
        },
        group: ['provider'],
        raw: true
      }),
      Transliteration.findAll({
        attributes: [
          'provider',
          [Transliteration.sequelize.fn('COUNT', Transliteration.sequelize.col('id')), 'count'],
          [Transliteration.sequelize.fn('AVG', Transliteration.sequelize.col('confidence')), 'avgConfidence']
        ],
        where: {
          createdAt: {
            [Transliteration.sequelize.Op.gte]: since
          }
        },
        group: ['provider'],
        raw: true
      })
    ]);

    return {
      timeframe,
      translations: translationStats,
      transliterations: transliterationStats
    };
  }

  // Health check for all providers
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
}

module.exports = new TranslationPipeline();