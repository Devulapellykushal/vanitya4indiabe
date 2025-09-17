/**
 * Usage Service - Manages API credits and usage tracking
 * Interfaces with APIUsage model for persistent storage
 */

const { APIUsage } = require('../models');
const { sequelize } = require('../models');

// In-memory cache for credits to reduce DB queries
const creditsCache = new Map();

/**
 * Get cached credits for a provider
 * @param {string} provider - Provider name (e.g., 'sarvam')
 * @returns {Promise<number|null>} - Credits remaining or null if not cached
 */
async function getCachedCredits(provider) {
  try {
    // Check in-memory cache first
    if (creditsCache.has(provider)) {
      const cached = creditsCache.get(provider);
      // Cache expires after 5 minutes
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.credits;
      }
    }

    // Query database for most recent credit entry
    const latestUsage = await APIUsage.findOne({
      where: { provider },
      order: [['created_at', 'DESC']],
      attributes: ['creditsRemaining']
    });

    if (latestUsage && latestUsage.creditsRemaining !== null) {
      // Update cache
      creditsCache.set(provider, {
        credits: latestUsage.creditsRemaining,
        timestamp: Date.now()
      });
      return latestUsage.creditsRemaining;
    }

    return null;
  } catch (error) {
    console.error(`Failed to get cached credits for ${provider}:`, error);
    return null;
  }
}

/**
 * Set cached credits for a provider
 * @param {string} provider - Provider name
 * @param {number} credits - Credits to cache
 * @param {boolean} updateDb - Whether to update database
 * @returns {Promise<void>}
 */
async function setCachedCredits(provider, credits, updateDb = false) {
  // Update in-memory cache
  creditsCache.set(provider, {
    credits,
    timestamp: Date.now()
  });

  if (updateDb) {
    try {
      // Record in database as a sync event
      await APIUsage.create({
        provider,
        endpoint: 'credits_sync',
        creditsUsed: 0,
        creditsRemaining: credits,
        requestPayload: { action: 'sync' },
        responseStatus: 200
      });
    } catch (error) {
      console.error(`Failed to update credits in database for ${provider}:`, error);
    }
  }
}

/**
 * Decrement credits for a provider
 * @param {string} provider - Provider name
 * @param {number} cost - Number of credits to decrement
 * @param {Object} [txnOptions] - Sequelize transaction options
 * @returns {Promise<number>} - New credit balance
 */
async function decrementCredits(provider, cost, txnOptions = {}) {
  const transaction = txnOptions.transaction || await sequelize.transaction();
  
  try {
    // Get current credits
    let currentCredits = await getCachedCredits(provider);
    
    // If no credits found, initialize with a high value (for free tier)
    if (currentCredits === null) {
      currentCredits = 900; // Default free credits
      await setCachedCredits(provider, currentCredits);
    }

    // Calculate new balance
    const newCredits = Math.max(0, currentCredits - cost);

    // Update cache immediately
    await setCachedCredits(provider, newCredits);

    // Record the usage in database
    await APIUsage.create({
      provider,
      endpoint: 'credit_decrement',
      creditsUsed: cost,
      creditsRemaining: newCredits,
      requestPayload: { cost },
      responseStatus: 200
    }, { transaction });

    if (!txnOptions.transaction) {
      await transaction.commit();
    }

    console.log(`[${provider}] Credits decremented: ${currentCredits} -> ${newCredits} (cost: ${cost})`);
    return newCredits;
  } catch (error) {
    if (!txnOptions.transaction) {
      await transaction.rollback();
    }
    console.error(`Failed to decrement credits for ${provider}:`, error);
    throw error;
  }
}

/**
 * Initialize credits for a provider if not exists
 * @param {string} provider - Provider name
 * @param {number} initialCredits - Initial credit amount
 * @returns {Promise<void>}
 */
async function initializeCredits(provider, initialCredits = 900) {
  try {
    const existingUsage = await APIUsage.findOne({
      where: { provider },
      order: [['created_at', 'DESC']]
    });

    if (!existingUsage) {
      await APIUsage.create({
        provider,
        endpoint: 'credit_init',
        creditsUsed: 0,
        creditsRemaining: initialCredits,
        requestPayload: { action: 'initialize' },
        responseStatus: 200
      });

      await setCachedCredits(provider, initialCredits);
      console.log(`[${provider}] Credits initialized: ${initialCredits}`);
    }
  } catch (error) {
    console.error(`Failed to initialize credits for ${provider}:`, error);
  }
}

/**
 * Get usage statistics for a provider
 * @param {string} provider - Provider name
 * @param {string} timeframe - Timeframe for stats ('1h', '24h', '7d', '30d')
 * @returns {Promise<Object>} - Usage statistics
 */
async function getUsageStats(provider, timeframe = '24h') {
  try {
    return await APIUsage.getUsageStats(provider, timeframe);
  } catch (error) {
    console.error(`Failed to get usage stats for ${provider}:`, error);
    return {
      totalRequests: 0,
      totalCredits: 0,
      errorCount: 0,
      avgCreditsPerRequest: 0
    };
  }
}

/**
 * Record API usage with details
 * @param {Object} data - Usage data
 * @returns {Promise<void>}
 */
async function recordUsage(data) {
  try {
    await APIUsage.recordUsage(data);
  } catch (error) {
    console.error('Failed to record API usage:', error);
  }
}

/**
 * Clear credits cache for a provider
 * @param {string} provider - Provider name
 */
function clearCache(provider) {
  if (provider) {
    creditsCache.delete(provider);
  } else {
    creditsCache.clear();
  }
}

module.exports = {
  getCachedCredits,
  setCachedCredits,
  decrementCredits,
  initializeCredits,
  getUsageStats,
  recordUsage,
  clearCache
};