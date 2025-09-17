'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create sample exercises for Hindi→Telugu Beginner level
      const exercises = [
        // Unit 1: Basic Greetings and Phrases (5 exercises)
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit1',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'नमस्ते',
          original_options: JSON.stringify(['నమస్తే', 'శుభోదయం', 'రాత్రి', 'విదాయ']),
          correct_answer: 'నమస్తే',
          audio_enabled: true,
          hint: 'This is a common greeting in both languages',
          explanation: 'नमस्ते (namaste) in Hindi translates to నమస్తే (namaste) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'greetings',
            subcategory: 'basic'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit1',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'आप कैसे हैं?',
          original_options: JSON.stringify(['మీరు ఎలా ఉన్నారు?', 'మీ పేరు ఏమిటి?', 'ఎక్కడికి వెళ్తున్నారు?', 'ఏమి చేస్తున్నారు?']),
          correct_answer: 'మీరు ఎలా ఉన్నారు?',
          audio_enabled: false,
          hint: 'This is asking about someone\'s well-being',
          explanation: 'आप कैसे हैं? (aap kaise hain?) means "How are you?" in Hindi, which translates to మీరు ఎలా ఉన్నారు? in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'greetings',
            subcategory: 'polite_inquiry'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit1',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'धन्यवाद',
          original_options: JSON.stringify(['ధన్యవాదాలు', 'క్షమించండి', 'నమస్తే', 'శుభరాత్రి']),
          correct_answer: 'ధన్యవాదాలు',
          audio_enabled: true,
          hint: 'Express gratitude',
          explanation: 'धन्यवाद (dhanyavaad) means "Thank you" and translates to ధన్యవాదాలు in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'greetings',
            subcategory: 'courtesy'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit1',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'मेरा नाम राज है',
          original_options: JSON.stringify(['నా పేరు రాజ్', 'నేను రాజ్ని', 'రాజ్ ఎక్కడ?', 'రాజ్ వస్తాడు']),
          correct_answer: 'నా పేరు రాజ్',
          audio_enabled: false,
          hint: 'Introduction statement',
          explanation: 'मेरा नाम राज है (mera naam raj hai) means "My name is Raj" and translates to నా పేరు రాజ్ in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'introduction',
            subcategory: 'name'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit1',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'अलविदा',
          original_options: JSON.stringify(['వీడ్కోలు', 'స్వాగతం', 'నమస్కారం', 'శుభోదయం']),
          correct_answer: 'వీడ్కోలు',
          audio_enabled: false,
          hint: 'Parting phrase',
          explanation: 'अलविदा (alvida) means "Goodbye" and translates to వీడ్కోలు in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'greetings',
            subcategory: 'farewell'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        
        // Unit 2: Numbers and Basic Words (5 exercises)
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit2',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'एक',
          original_options: JSON.stringify(['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు']),
          correct_answer: 'ఒకటి',
          audio_enabled: false,
          hint: 'The first number',
          explanation: 'एक (ek) means "one" and translates to ఒకటి (okati) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'numbers',
            subcategory: 'basic'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit2',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'पानी',
          original_options: JSON.stringify(['నీరు', 'పాలు', 'తేనె', 'కాఫీ']),
          correct_answer: 'నీరు',
          audio_enabled: false,
          hint: 'Essential liquid for life',
          explanation: 'पानी (paani) means "water" and translates to నీరు (neeru) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'common_nouns',
            subcategory: 'beverages'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit2',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'घर',
          original_options: JSON.stringify(['ఇల్లు', 'పాఠశాల', 'దుకాణం', 'కార్యాలయం']),
          correct_answer: 'ఇల్లు',
          audio_enabled: false,
          hint: 'Place where you live',
          explanation: 'घर (ghar) means "house/home" and translates to ఇల్లు (illu) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'common_nouns',
            subcategory: 'places'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit2',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'खाना',
          original_options: JSON.stringify(['భోజనం', 'నీరు', 'పండు', 'పాలు']),
          correct_answer: 'భోజనం',
          audio_enabled: false,
          hint: 'What you eat',
          explanation: 'खाना (khana) means "food" and translates to భోజనం (bhojanam) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'common_nouns',
            subcategory: 'food'
          }),
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          unit_id: 'hi-te-beginner-unit2',
          source_language: 'hi',
          target_language: 'te',
          difficulty: 'beginner',
          exercise_type: 'translation',
          original_question: 'अच्छा',
          original_options: JSON.stringify(['మంచి', 'చెడు', 'పెద్ద', 'చిన్న']),
          correct_answer: 'మంచి',
          audio_enabled: false,
          hint: 'Positive quality',
          explanation: 'अच्छा (achha) means "good" and translates to మంచి (manchi) in Telugu',
          status: 'processed',
          metadata: JSON.stringify({
            category: 'adjectives',
            subcategory: 'quality'
          }),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      // Insert exercises
      await queryInterface.bulkInsert('exercises', exercises, { transaction });
      console.log(`✅ Inserted ${exercises.length} Hindi→Telugu beginner exercises`);
      
      // Create a sample user for testing
      const userId = uuidv4();
      const users = [{
        id: userId,
        email: 'test@vanitya.com',
        name: 'Test User',
        password_hash: '$2b$10$YourHashedPasswordHere', // This should be properly hashed in production
        provider: 'local',
        preferences: JSON.stringify({
          ui_language: 'en',
          learning_speed: 'normal',
          daily_goal: 10
        }),
        current_language: 'hi',
        target_language: 'te',
        level: 'beginner',
        hearts: 5,
        streak: 0,
        created_at: new Date(),
        updated_at: new Date()
      }];
      
      // Check if user already exists
      const existingUser = await queryInterface.sequelize.query(
        'SELECT id FROM users WHERE email = :email',
        {
          replacements: { email: 'test@vanitya.com' },
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );
      
      if (existingUser.length === 0) {
        await queryInterface.bulkInsert('users', users, { transaction });
        console.log('✅ Created test user');
      } else {
        console.log('ℹ️ Test user already exists');
      }
      
      await transaction.commit();
      console.log('✅ Seeding completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Seeding failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Delete seeded exercises
      await queryInterface.bulkDelete(
        'exercises',
        {
          unit_id: {
            [Sequelize.Op.in]: ['hi-te-beginner-unit1', 'hi-te-beginner-unit2']
          }
        },
        { transaction }
      );
      console.log('✅ Deleted seeded exercises');
      
      // Delete test user
      await queryInterface.bulkDelete(
        'users',
        {
          email: 'test@vanitya.com'
        },
        { transaction }
      );
      console.log('✅ Deleted test user');
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};