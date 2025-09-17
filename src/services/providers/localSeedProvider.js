/**
 * Local Seed Provider
 * Pure in-memory provider for dev/test fallback
 * Generates deterministic exercises without external API calls
 */

const crypto = require('crypto');

/**
 * Generate deterministic UUID based on seed
 * @param {string} seed - Seed string
 * @returns {string} - UUID v4 format string
 */
function generateSeededUUID(seed) {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(12, 15),
    ((parseInt(hash.substring(15, 16), 16) & 0x3) | 0x8).toString(16) + hash.substring(16, 19),
    hash.substring(19, 31)
  ].join('-');
}

/**
 * Generate questions for language learning exercises
 * @param {Object} params
 * @returns {Promise<Array>} - Array of exercise objects
 */
async function generateQuestions(params) {
  const {
    source_language,
    target_language,
    difficulty,
    count,
    exercise_type,
    unit_id
  } = params;

  console.log('[LocalSeed] Generating mock exercises:', params);

  const exercises = [];
  
  // Sample data for different languages
  const sampleData = {
    hi: {
      Beginner: [
        { question: "नमस्ते", options: ["Hello", "Goodbye", "Thank you", "Please"] },
        { question: "धन्यवाद", options: ["Thank you", "Welcome", "Sorry", "Excuse me"] },
        { question: "मेरा नाम है", options: ["My name is", "Your name is", "His name is", "Her name is"] },
        { question: "आप कैसे हैं?", options: ["How are you?", "Where are you?", "Who are you?", "What are you?"] },
        { question: "पानी", options: ["Water", "Food", "Fire", "Air"] }
      ],
      Intermediate: [
        { question: "मुझे हिंदी सीखना पसंद है", options: ["I like learning Hindi", "I hate learning Hindi", "I teach Hindi", "I speak Hindi"] },
        { question: "कृपया यहाँ आइए", options: ["Please come here", "Please go there", "Please sit down", "Please stand up"] },
        { question: "आज मौसम अच्छा है", options: ["Today weather is good", "Tomorrow weather is good", "Yesterday weather was good", "Weather is always good"] }
      ],
      Advanced: [
        { question: "संस्कृति विविधता का प्रतीक है", options: ["Culture is symbol of diversity", "Culture is symbol of unity", "Culture is symbol of peace", "Culture is symbol of strength"] },
        { question: "शिक्षा जीवन का आधार है", options: ["Education is foundation of life", "Education is goal of life", "Education is end of life", "Education is start of life"] }
      ]
    },
    te: {
      Beginner: [
        { question: "నమస్తే", options: ["Hello", "Goodbye", "Thank you", "Please"] },
        { question: "ధన్యవాదాలు", options: ["Thank you", "Welcome", "Sorry", "Excuse me"] },
        { question: "నా పేరు", options: ["My name", "Your name", "His name", "Her name"] },
        { question: "మీరు ఎలా ఉన్నారు?", options: ["How are you?", "Where are you?", "Who are you?", "What are you?"] },
        { question: "నీరు", options: ["Water", "Food", "Fire", "Air"] }
      ],
      Intermediate: [
        { question: "నేను తెలుగు నేర్చుకుంటున్నాను", options: ["I am learning Telugu", "I am teaching Telugu", "I speak Telugu", "I write Telugu"] },
        { question: "దయచేసి ఇక్కడికి రండి", options: ["Please come here", "Please go there", "Please sit down", "Please stand up"] }
      ],
      Advanced: [
        { question: "భాష సంస్కృతి యొక్క అద్దం", options: ["Language is mirror of culture", "Language is door of culture", "Language is key of culture", "Language is base of culture"] }
      ]
    },
    default: {
      Beginner: [
        { question: "Sample text 1", options: ["Option A", "Option B", "Option C", "Option D"] },
        { question: "Sample text 2", options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"] },
        { question: "Sample text 3", options: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"] }
      ],
      Intermediate: [
        { question: "Intermediate sample 1", options: ["Option A", "Option B", "Option C", "Option D"] },
        { question: "Intermediate sample 2", options: ["Choice 1", "Choice 2", "Choice 3", "Choice 4"] }
      ],
      Advanced: [
        { question: "Advanced sample 1", options: ["Option A", "Option B", "Option C", "Option D"] }
      ]
    }
  };

  // Get appropriate sample data
  const langData = sampleData[source_language] || sampleData.default;
  const difficultyData = langData[difficulty] || langData.Beginner;

  for (let i = 0; i < count; i++) {
    const sampleIndex = i % difficultyData.length;
    const sample = difficultyData[sampleIndex];
    
    // Generate deterministic UUID based on parameters
    const seedString = `${source_language}-${target_language}-${difficulty}-${exercise_type}-${i}-${Date.now()}`;
    const exerciseId = generateSeededUUID(seedString);

    const exercise = {
      id: exerciseId,
      unit_id: unit_id || 'default',
      source_language,
      target_language,
      difficulty,
      exercise_type,
      original_question: sample.question,
      answer_options: sample.options,
      correct_answer: sample.options[0], // First option is always correct in mock data
      audio_enabled: exercise_type.startsWith('listen_')
    };

    exercises.push(exercise);
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return exercises;
}

/**
 * Text-to-Speech mock implementation
 * @param {string} text - Text to convert
 * @param {string} lang - Language code
 * @param {string} voice - Voice identifier
 * @param {Object} options - Additional options
 * @returns {Promise<Buffer>} - Mock audio buffer
 */
async function tts(text, lang, voice, options = {}) {
  console.log('[LocalSeed] Generating mock TTS:', { text: text.substring(0, 50), lang, voice });

  // Create a fake audio buffer
  // In real implementation, this could read from a small audio file
  const fakeAudioData = Buffer.from('FAKEAUDIO_' + text.substring(0, 20));

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  return fakeAudioData;
}

/**
 * Speech-to-Text mock implementation
 * @param {Buffer} audioBuffer - Audio buffer to transcribe
 * @param {string} lang - Language code
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Mock transcript
 */
async function stt(audioBuffer, lang, options = {}) {
  console.log('[LocalSeed] Generating mock STT:', { bufferSize: audioBuffer?.length, lang });

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50));

  // Return canned transcription
  const transcriptions = {
    hi: "यह एक परीक्षण वाक्य है",
    te: "ఇది ఒక పరీక్ష వాక్యం",
    default: "This is a test transcription"
  };

  return transcriptions[lang] || transcriptions.default;
}

/**
 * Get remaining credits - always returns Infinity for local provider
 * @returns {Promise<number>} - Credits remaining (Infinity)
 */
async function getCreditsRemaining() {
  return Infinity;
}

/**
 * Initialize the provider (no-op for local)
 * @returns {Promise<void>}
 */
async function initialize() {
  console.log('[LocalSeed] Local seed provider initialized');
}

/**
 * Check if provider is healthy
 * @returns {Promise<Object>} - Health status
 */
async function healthCheck() {
  return {
    status: 'healthy',
    provider: 'local_seed',
    message: 'Local seed provider is always healthy'
  };
}

module.exports = {
  generateQuestions,
  tts,
  stt,
  getCreditsRemaining,
  initialize,
  healthCheck,
  name: 'local_seed'
};