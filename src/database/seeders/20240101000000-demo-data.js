'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create demo user
    const demoUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    await queryInterface.bulkInsert('users', [{
      id: demoUserId,
      email: 'demo@vanitya.com',
      name: 'Demo User',
      provider: 'email',
      current_language: 'hi',
      target_language: 'te',
      level: 'beginner',
      hearts: 5,
      max_hearts: 5,
      streak: 0,
      is_admin: false,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create admin user
    const adminUserId = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    await queryInterface.bulkInsert('users', [{
      id: adminUserId,
      email: 'admin@vanitya.com',
      name: 'Admin User',
      provider: 'email',
      current_language: 'hi',
      target_language: 'te',
      level: 'advanced',
      hearts: 5,
      max_hearts: 5,
      streak: 10,
      is_admin: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create sample exercises
    const exercise1Id = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const exercise2Id = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    await queryInterface.bulkInsert('exercises', [
      {
        id: exercise1Id,
        unit_id: 'unit_01_greetings',
        source_language: 'hi',
        target_language: 'te',
        difficulty: 'beginner',
        exercise_type: 'translation',
        original_question: 'नमस्ते, आप कैसे हैं?',
        original_options: JSON.stringify([
          'నమస్కారం, మీరు ఎలా ఉన్నారు?',
          'హలో, మీరు ఎలా ఉన్నారు?',
          'హాయ్, మీ పేరు ఏమిటి?',
          'వెల్కమ్, మీరు ఎక్కడ నుండి వచ్చారు?'
        ]),
        correct_answer: 'నమస్కారం, మీరు ఎలా ఉన్నారు?',
        hint: 'This is a common greeting in both languages',
        explanation: 'नमस्ते (Namaste) translates to నమస్కారం (Namaskaram) in Telugu, both are respectful greetings.',
        status: 'processed',
        metadata: JSON.stringify({
          tags: ['greetings', 'basic', 'polite'],
          difficulty_score: 0.2
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: exercise2Id,
        unit_id: 'unit_01_greetings',
        source_language: 'hi',
        target_language: 'te',
        difficulty: 'beginner',
        exercise_type: 'transliteration',
        original_question: 'dhanyawaad',
        original_options: JSON.stringify([
          'धन्यवाद',
          'नमस्ते',
          'अलविदा',
          'कृपया'
        ]),
        correct_answer: 'धन्यवाद',
        hint: 'This word expresses gratitude',
        explanation: 'dhanyawaad in Roman script transliterates to धन्यवाद in Devanagari, meaning "thank you".',
        status: 'processed',
        metadata: JSON.stringify({
          tags: ['gratitude', 'basic', 'transliteration'],
          difficulty_score: 0.3
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Initialize RL state for demo user
    await queryInterface.bulkInsert('rl_states', [{
      id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      user_id: demoUserId,
      algorithm: 'epsilon-greedy',
      epsilon: 0.1,
      arm_weights: JSON.stringify({
        'translation_beginner': 0,
        'translation_intermediate': 0,
        'transliteration_beginner': 0,
        'listening_beginner': 0,
        'speaking_beginner': 0
      }),
      arm_counts: JSON.stringify({
        'translation_beginner': 0,
        'translation_intermediate': 0,
        'transliteration_beginner': 0,
        'listening_beginner': 0,
        'speaking_beginner': 0
      }),
      rewards: JSON.stringify({
        'translation_beginner': 0,
        'translation_intermediate': 0,
        'transliteration_beginner': 0,
        'listening_beginner': 0,
        'speaking_beginner': 0
      }),
      total_pulls: 0,
      exploration_rate: 0.5,
      metadata: JSON.stringify({}),
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Create sample translations
    await queryInterface.bulkInsert('translations', [
      {
        id: 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        exercise_id: exercise1Id,
        source_language: 'hi',
        target_language: 'te',
        original_text: 'नमस्ते, आप कैसे हैं?',
        translated_text: 'నమస్కారం, మీరు ఎలా ఉన్నారు?',
        confidence: 0.95,
        provider: 'ml-service',
        metadata: JSON.stringify({
          model_version: '1.0',
          processing_time_ms: 120
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Create sample transliterations
    await queryInterface.bulkInsert('transliterations', [
      {
        id: '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        exercise_id: exercise2Id,
        source_script: 'roman',
        target_script: 'devanagari',
        original_text: 'dhanyawaad',
        transliterated_text: 'धन्यवाद',
        confidence: 0.92,
        provider: 'ml-service',
        metadata: JSON.stringify({
          model_version: '1.0',
          processing_time_ms: 80
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('transliterations', null, {});
    await queryInterface.bulkDelete('translations', null, {});
    await queryInterface.bulkDelete('rl_states', null, {});
    await queryInterface.bulkDelete('exercises', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};