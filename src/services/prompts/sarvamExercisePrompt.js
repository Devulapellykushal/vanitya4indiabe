/**
 * Sarvam-M exercise prompt template builder
 * Creates strict prompts for generating language learning exercises
 */

/**
 * Build exercise generation prompt for Sarvam-M
 * @param {Object} params
 * @param {string} params.source_language - Source language for exercises
 * @param {string} params.target_language - Target language for exercises  
 * @param {string} params.difficulty - Difficulty level (Beginner|Intermediate|Advanced)
 * @param {number} params.count - Number of exercises to generate
 * @param {string} params.exercise_type - Type of exercise
 * @param {string} [params.unit_id] - Optional unit identifier
 * @returns {Object} - Prompt payload with system and user messages
 */
function buildExercisePrompt({
  source_language,
  target_language,
  difficulty,
  count,
  exercise_type,
  unit_id
}) {
  const systemMessage = `You are a language learning exercise generator that outputs only strict JSON. Do not include any text outside JSON. No explanations. No comments. No markdown.`;

  const userMessage = `Generate exactly ${count} language learning exercises with the following requirements:

LANGUAGES:
- Source Language: ${source_language}
- Target Language: ${target_language}

EXERCISE PARAMETERS:
- Difficulty Level: ${difficulty}
- Exercise Type: ${exercise_type}
${unit_id ? `- Unit ID: ${unit_id}` : ''}

STRICT OUTPUT REQUIREMENTS:
1. Output ONLY a JSON array - no text before or after
2. No markdown code fences (no \`\`\`json or \`\`\`)
3. No explanations or comments
4. Each exercise must be a complete valid JSON object

EXACT JSON STRUCTURE FOR EACH EXERCISE:
{
  "id": "<generate a unique UUID>",
  "unit_id": "${unit_id || 'default'}",
  "source_language": "${source_language}",
  "target_language": "${target_language}",
  "difficulty": "${difficulty}",
  "exercise_type": "${exercise_type}",
  "original_question": "<short sentence in source language>",
  "answer_options": ["option1", "option2", "option3", "option4"],
  "correct_answer": "<must be one of the answer_options>",
  "audio_enabled": ${exercise_type.startsWith('listen_') ? 'true' : 'false'}
}

CRITICAL CONSTRAINTS:
- original_question MUST be in ${source_language} language
- answer_options MUST contain exactly 4 unique options
- correct_answer MUST be identical to one of the answer_options
- For listen_select and listen_speak types: audio_enabled = true
- For other types: audio_enabled = false
- NO translations or transliterations in any field
- All text must be appropriate for ${difficulty} level learners

Generate the JSON array now:`;

  return {
    system: systemMessage,
    user: userMessage,
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    rawPrompt: `${systemMessage}\n\n${userMessage}`
  };
}

/**
 * Build a simple prompt for non-chat mode
 * @param {Object} params - Same as buildExercisePrompt
 * @returns {string} - Raw prompt string
 */
function buildSimplePrompt(params) {
  const prompt = buildExercisePrompt(params);
  return prompt.rawPrompt;
}

/**
 * Get exercise type constraints
 * @returns {Array<string>} - Valid exercise types
 */
function getValidExerciseTypes() {
  return [
    'multiple_choice',
    'word_rearrangement',
    'fill_in_blank',
    'listen_select',
    'listen_speak'
  ];
}

/**
 * Get difficulty levels
 * @returns {Array<string>} - Valid difficulty levels
 */
function getValidDifficultyLevels() {
  return ['Beginner', 'Intermediate', 'Advanced'];
}

module.exports = {
  buildExercisePrompt,
  buildSimplePrompt,
  getValidExerciseTypes,
  getValidDifficultyLevels
};