# AI Service Test Cases

This document describes the comprehensive test suite for the AI Service module.

## Test Coverage

### 1. `generateExercises` Method

#### Success Scenarios ✅
- **Array Response**: Tests successful generation when API returns array directly
- **Nested Exercises Response**: Tests parsing when exercises are nested in response object
- **Content String Response**: Tests JSON parsing from content string
- **Multiple Exercises**: Tests generation of multiple exercises (count > 1)
- **Exercise Types**: Tests all exercise types (translation, transliteration, listening, speaking)
- **Difficulty Levels**: Tests all difficulty levels (beginner, intermediate, advanced)
- **Language Pairs**: Tests various Indic language pairs (Hindi-Telugu, Tamil-Kannada, etc.)

#### Error and Fallback Scenarios 🔄
- **404 Not Found**: Tests fallback when API returns 404
- **500 Internal Server Error**: Tests fallback when API returns 500
- **401 Unauthorized**: Tests fallback when API key is invalid
- **429 Rate Limit**: Tests fallback when rate limit is exceeded
- **Timeout**: Tests fallback when API request times out
- **Network Error**: Tests fallback when network connection fails
- **Invalid JSON**: Tests fallback when API returns invalid JSON
- **Empty Array**: Tests fallback when API returns empty array
- **Usage Recording**: Tests that usage is recorded even on failure

#### Edge Cases 🎯
- **Count = 0**: Tests handling of zero count
- **Large Count**: Tests handling of very large count values (100+)
- **Special Characters**: Tests handling of special characters in unitId

### 2. `generateTTS` Method

#### Success Scenarios ✅
- **Standard TTS**: Tests successful TTS generation
- **Default Codec**: Tests default codec assignment when not provided
- **Voice Mapping**: Tests correct voice selection for different languages
  - Hindi → `bulbul_female_hi`
  - Telugu → `bulbul_female_te`
  - Tamil → `bulbul_female_ta`
  - Kannada → `bulbul_female_kn`
  - Malayalam → `bulbul_female_ml`
  - Unknown → `meera` (default)
- **Long Text**: Tests handling of long text input
- **Special Characters**: Tests handling of special characters in text

#### Error and Fallback Scenarios 🔄
- **404 Not Found**: Tests fallback when TTS API returns 404
- **Timeout**: Tests fallback when TTS API times out
- **500 Internal Server Error**: Tests fallback when TTS API returns 500

#### Edge Cases 🎯
- **Empty Text**: Tests handling of empty text input
- **Very Long Text**: Tests handling of extremely long text (1000+ words)

### 3. `speechToText` Method

#### Success Scenarios ✅
- **Standard STT**: Tests successful speech-to-text transcription
- **Audio Formats**: Tests different audio formats (WAV, MP3, OGG)
- **Languages**: Tests transcription for different Indic languages
- **Low Confidence**: Tests handling of low confidence transcriptions (0.3)
- **High Confidence**: Tests handling of high confidence transcriptions (0.99)

#### Error and Fallback Scenarios 🔄
- **404 Not Found**: Tests fallback when STT API returns 404
- **Timeout**: Tests fallback when STT API times out
- **500 Internal Server Error**: Tests fallback when STT API returns 500
- **Invalid Audio**: Tests fallback when audio file format is invalid

#### Edge Cases 🎯
- **Large Audio Files**: Tests handling of very large audio files (10MB+)
- **Empty Audio File**: Tests handling of empty audio files

### 4. `recordUsage` Method

#### Test Cases 📊
- **Successful Usage**: Tests recording of successful API calls
- **Failed Usage**: Tests recording of failed API calls with error messages
- **Usage Metadata**: Tests that all usage metadata is correctly recorded

## Response Formats

### Exercise Generation Response
```typescript
[
  {
    original_question: string,      // Question in source language
    answer_options: string[],        // Array of 4 unique options
    correct_answer: string,          // One of the answer_options
    hint: string,                    // Helpful hint
    explanation: string              // Why the answer is correct
  }
]
```

### TTS Generation Response
```typescript
{
  audio_url: string,                 // URL to generated audio file
  duration_ms: number,               // Duration in milliseconds
  codec: string                      // Audio codec (default: 'mp3')
}
```

### Speech-to-Text Response
```typescript
{
  text: string,                      // Transcribed text
  confidence: number,                // Confidence score (0-1)
  processing_time_ms: number         // Processing time in milliseconds
}
```

### API Usage Record
```typescript
{
  provider: string,                  // 'sarvam' | 'ai4bharat'
  endpoint: string,                  // API endpoint path
  creditsUsed: number,              // Credits consumed
  requestPayload: object,            // Request payload
  responseStatus: number,            // HTTP status code
  errorMessage?: string,             // Error message if failed
  userId?: string                   // Optional user ID
}
```

## Running Tests

```bash
# Run all tests
bun test

# Run only AI service tests
bun test src/modules/ai/ai.service.spec.ts

# Run with coverage
bun test --coverage

# Run in watch mode
bun test --watch
```

## Test Data

### Valid Test Parameters

#### Exercise Generation
```typescript
{
  sourceLanguage: 'hi',              // Hindi
  targetLanguage: 'te',              // Telugu
  difficulty: 'beginner',            // beginner | intermediate | advanced
  exerciseType: 'translation',       // translation | transliteration | listening | speaking
  unitId: 'unit_1',
  count: 1
}
```

#### TTS Generation
```typescript
{
  text: 'नमस्ते',                    // Text to convert to speech
  language: 'hi'                     // Language code
}
```

#### Speech-to-Text
```typescript
{
  audioFile: Express.Multer.File,    // Audio file buffer
  language: 'hi'                     // Language code
}
```

## Mock Data Examples

### Successful Exercise Response
```json
[
  {
    "original_question": "नमस्ते का अंग्रेजी में अनुवाद क्या है?",
    "answer_options": ["Hello", "Goodbye", "Thank you", "Please"],
    "correct_answer": "Hello",
    "hint": "यह एक सामान्य अभिवादन है",
    "explanation": "नमस्ते का अंग्रेजी में अनुवाद Hello है"
  }
]
```

### Successful TTS Response
```json
{
  "audio_url": "https://api.sarvam.ai/audio/123.mp3",
  "duration_ms": 1500,
  "codec": "mp3"
}
```

### Successful STT Response
```json
{
  "text": "नमस्ते",
  "confidence": 0.95,
  "processing_time_ms": 500
}
```

## Error Scenarios

### HTTP Error Codes Tested
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (invalid API key)
- **404**: Not Found (endpoint doesn't exist)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error (server error)

### Network Errors Tested
- **ECONNABORTED**: Request timeout
- **ENOTFOUND**: DNS resolution failure
- **Network unreachable**: Connection failure

## Fallback Behavior

All methods implement a fallback mechanism:
1. **Primary**: Try Sarvam AI API
2. **Fallback**: Use local seed data or template responses
3. **Usage Tracking**: Always record API usage attempts (success or failure)

## Notes

- All tests use mocked axios instances to avoid actual API calls
- FormData is mocked for STT tests
- Repository methods are mocked to avoid database operations
- ConfigService is mocked with default test values
- Tests verify both success and failure paths
- Edge cases are thoroughly covered

