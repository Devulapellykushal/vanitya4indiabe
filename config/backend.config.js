// Backend Configuration
module.exports = {
  api: {
    sarvam: {
      url: process.env.SARVAM_API_URL || 'https://api.sarvam.ai/v1',
      key: process.env.SARVAM_API_KEY,
      credits: 900
    },
    ai4bharat: {
      url: process.env.AI4BHARAT_API_URL || 'https://api.ai4bharat.org',
      key: process.env.AI4BHARAT_API_KEY
    },
    aksharamukha: {
      url: process.env.AKSHARAMUKHA_URL || 'https://aksharamukha.appspot.com',
      key: process.env.AKSHARAMUKHA_API_KEY
    }
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/vanitya'
  },
  languages: {
    supported: ['hi', 'te', 'kn', 'ta', 'ml', 'en'],
    default_source: 'hi',
    default_target: 'te'
  },
  game: {
    hearts_initial: 5,
    hearts_deduct_wrong: 1,
    retry_max_attempts: 3
  }
};