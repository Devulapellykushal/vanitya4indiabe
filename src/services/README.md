# Sarvam Client Services

Enhanced Sarvam AI client implementation with intelligent failover, strict JSON validation, and comprehensive credit management for the Vanitya language learning platform.

## Overview

The Sarvam client provides a robust interface to Sarvam AI's language services with automatic failover to alternative providers (AI4Bharat, local seed data) when the primary provider is unavailable or credits are exhausted.

### Key Features

- **Question Generation**: Generate language learning exercises using Sarvam-M LLM with strict JSON output
- **Text-to-Speech (TTS)**: Convert text to audio with language-specific voice selection
- **Speech-to-Text (STT)**: Transcribe audio to text with punctuation support
- **Credit Management**: Track and manage API credits with automatic failover
- **Provider Failover**: Seamlessly switch to alternative providers when needed
- **Strict JSON Validation**: Ensure LLM outputs conform to exact schema requirements

## API Functions

### `generateQuestions(params)`

Generate language learning exercises with strict JSON structure.

**Parameters:**
```javascript
{
  source_language: 'hi',        // Source language code (required)
  target_language: 'te',        // Target language code (required)
  difficulty: 'Beginner',       // 'Beginner' | 'Intermediate' | 'Advanced'
  count: 5,                     // Number of exercises (1-50)
  exercise_type: 'multiple_choice', // Exercise type (see below)
  unit_id: 'unit_1'            // Optional unit identifier
}
```

**Exercise Types:**
- `multiple_choice`
- `word_rearrangement`
- `fill_in_blank`
- `listen_select`
- `listen_speak`

**Returns:**
```javascript
[
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    unit_id: "unit_1",
    source_language: "hi",
    target_language: "te",
    difficulty: "Beginner",
    exercise_type: "multiple_choice",
    original_question: "नमस्ते",  // In source language only!
    answer_options: ["Hello", "Goodbye", "Thank you", "Please"],
    correct_answer: "Hello",       // Must be one of answer_options
    audio_enabled: false           // true for listen_* types
  }
]
```

### `tts(text, lang, voice?, options?)`

Convert text to speech audio.

**Parameters:**
```javascript
await sarvamClient.tts(
  "नमस्ते",                    // Text to convert
  "hi",                        // Language code
  "bulbul_female_hi",          // Optional voice ID
  {
    speed: 1.0,                // Speech speed (0.5-2.0)
    pitch: 0,                  // Pitch adjustment (-10 to 10)
    format: "mp3",             // Audio format
    sample_rate: 22050         // Sample rate in Hz
  }
);
```

**Returns:** `Buffer` - Audio data buffer

### `stt(audioBuffer, lang, options?)`

Convert speech to text.

**Parameters:**
```javascript
await sarvamClient.stt(
  audioBuffer,                 // Audio Buffer
  "hi",                       // Language code
  {
    punctuation: true         // Enable punctuation
  }
);
```

**Returns:** `string` - Transcribed text

### `getCreditsRemaining()`

Get remaining API credits.

**Returns:** `number` - Credits remaining

## Exercise JSON Schema

**CRITICAL**: The LLM must output ONLY a JSON array with no additional text, markdown, or explanations.

### Constraints

1. **No Translations**: The `original_question` must be in the source language only. No translations or transliterations should appear anywhere in the JSON.

2. **Exact Structure**: Each exercise must contain exactly these fields:
   - `id`: UUID string
   - `unit_id`: Unit identifier string
   - `source_language`: Source language code
   - `target_language`: Target language code
   - `difficulty`: "Beginner" | "Intermediate" | "Advanced"
   - `exercise_type`: Valid exercise type
   - `original_question`: Text in source language
   - `answer_options`: Array of exactly 4 unique strings
   - `correct_answer`: Must be one of the answer_options
   - `audio_enabled`: boolean (true for listen_* types)

3. **JSON Only**: Output must be a valid JSON array starting with `[` and ending with `]`. No code fences, no explanations.

## Configuration

Configuration is loaded from `config/vanitya-config.yml` with environment variable overrides.

### YAML Configuration Example

```yaml
providers:
  sarvam:
    base_url: "https://api.sarvam.ai/v1"
    api_key: "your-api-key-here"
    endpoints:
      llm: "/generate"
      tts: "/tts"
      stt: "/stt"
      credits: "/usage/credits"
    timeouts:
      request_ms: 15000
      connect_ms: 5000
    credit_costs:
      generate_questions: 1
      tts: 1
      stt: 1
    voices:
      default: "meera"
      overrides:
        hi: "bulbul_female_hi"
        te: "bulbul_female_te"
    stt_payload_style: "multipart"  # or "base64"
    chat_mode: true

credits_threshold: 10
fallback_order: ["ai4bharat", "local_seed"]
```

### Environment Variables

Override YAML configuration with environment variables:

```bash
# Sarvam Configuration
SARVAM_BASE_URL=https://api.sarvam.ai/v1
SARVAM_API_KEY=your-api-key
SARVAM_LLM_PATH=/generate
SARVAM_TTS_PATH=/tts
SARVAM_STT_PATH=/stt
SARVAM_CREDITS_PATH=/usage/credits

# Credits Configuration
CREDITS_THRESHOLD=10
FALLBACK_ORDER=ai4bharat,local_seed

# Default Languages
DEFAULT_SOURCE_LANG=hi
DEFAULT_TARGET_LANG=te
```

## Credit Management

### How It Works

1. **Credit Check**: Before each operation, the system checks available credits
2. **Threshold**: If credits fall below `credits_threshold`, failover is triggered
3. **Decrement**: Credits are decremented after successful operations
4. **Caching**: Credits are cached for 5 minutes to reduce API calls
5. **Persistence**: Credit usage is stored in the database via APIUsage model

### Credit Costs

Default costs per operation (configurable):
- `generateQuestions`: 1 credit
- `tts`: 1 credit
- `stt`: 1 credit

## Failover Behavior

When Sarvam fails or credits are exhausted, the system automatically falls back to:

1. **AI4Bharat**: Alternative Indian language AI provider (if configured)
2. **Local Seed**: Local mock data for development/testing (always available)

Failover triggers on:
- HTTP errors (429, 500, etc.)
- Credits below threshold
- Network timeouts
- Invalid responses

## Usage Examples

### Generate Questions

```javascript
const sarvamClient = require('./services/sarvamClient');

// Generate multiple choice questions
const exercises = await sarvamClient.generateQuestions({
  source_language: 'hi',
  target_language: 'te',
  difficulty: 'Beginner',
  count: 5,
  exercise_type: 'multiple_choice',
  unit_id: 'greetings'
});

console.log(exercises);
```

### Text-to-Speech

```javascript
// Convert Hindi text to speech
const audioBuffer = await sarvamClient.tts(
  "नमस्ते, आप कैसे हैं?",
  "hi"
);

// Save to file
const fs = require('fs');
fs.writeFileSync('output.mp3', audioBuffer);
```

### Speech-to-Text

```javascript
const fs = require('fs');

// Read audio file
const audioBuffer = fs.readFileSync('speech.wav');

// Transcribe
const transcript = await sarvamClient.stt(audioBuffer, 'hi');
console.log('Transcript:', transcript);
```

### Check Credits

```javascript
const remaining = await sarvamClient.getCreditsRemaining();
console.log(`Credits remaining: ${remaining}`);
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- sarvamClient.generateQuestions

# Run with coverage
npm run test:coverage
```

## Development Notes

### Local Development

For local development without API credentials:
1. Set `FALLBACK_ORDER=local_seed` in your `.env`
2. The local seed provider will generate mock data
3. No external API calls will be made

### Testing Failover

To test failover behavior:
1. Set `CREDITS_THRESHOLD=1000` (higher than your actual credits)
2. The system will skip Sarvam and use fallback providers
3. Check logs for failover messages

### No Docker/K8s Changes Required

This implementation focuses on the service layer only. No modifications to Docker, Kubernetes, or infrastructure configurations are needed.

## Error Handling

The client includes standardized error types:

- `ProviderError`: API provider errors
- `CreditsError`: Insufficient credits
- `ValidationError`: Invalid parameters or responses

Example error handling:

```javascript
try {
  const exercises = await sarvamClient.generateQuestions(params);
} catch (error) {
  if (error.name === 'CreditsError') {
    console.log('Out of credits, using fallback');
  } else if (error.name === 'ValidationError') {
    console.log('Invalid parameters:', error.details);
  }
}
```

## Legacy API Support

For backward compatibility, the following legacy methods are still available:
- `translate(text, sourceLang, targetLang, userId)`
- `textToSpeech(text, language, userId)`
- `speechToText(audioBuffer, language, userId)`
- `checkCredits()`

These methods redirect to the new API internally.

## Contributing

When adding new features:
1. Maintain backward compatibility
2. Add comprehensive tests
3. Update this README
4. Follow the existing error handling patterns
5. Ensure failover support for new operations