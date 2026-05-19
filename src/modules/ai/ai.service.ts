import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosInstance } from 'axios';
import { Repository } from 'typeorm';
import { ApiUsage } from './entities/api-usage.entity';

export interface GenerateExercisesParams {
  sourceLanguage: string;
  targetLanguage: string;
  difficulty: string;
  exerciseType: string;
  unitId: string;
  count: number;
}

export interface GenerateTTSParams {
  text: string;
  language: string;
}

export interface SpeechToTextParams {
  audioFile: Express.Multer.File;
  language: string;
}

@Injectable()
export class AiService {
  private sarvamClient: AxiosInstance;
  private ai4bharatClient: AxiosInstance;
  private openaiClient: AxiosInstance;

  constructor(
    @InjectRepository(ApiUsage)
    private apiUsageRepository: Repository<ApiUsage>,
    private configService: ConfigService
  ) {
    // Initialize Sarvam client
    const sarvamUrl = this.configService.get<string>('SARVAM_API_URL', 'https://api.sarvam.ai/v1');
    const sarvamKey = this.configService.get<string>('SARVAM_API_KEY');
    
    this.sarvamClient = axios.create({
      baseURL: sarvamUrl,
      headers: {
        'Authorization': `Bearer ${sarvamKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Initialize AI4Bharat client (for future use)
    const ai4bharatUrl = this.configService.get<string>('AI4BHARAT_API_URL', 'https://api.ai4bharat.org');
    const ai4bharatKey = this.configService.get<string>('AI4BHARAT_API_KEY');
    
    this.ai4bharatClient = axios.create({
      baseURL: ai4bharatUrl,
      headers: {
        'Authorization': `Bearer ${ai4bharatKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Initialize OpenAI client (fallback provider)
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openaiClient = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': openaiKey ? `Bearer ${openaiKey}` : '',
        'Content-Type': 'application/json'
      },
      timeout: 60000 // OpenAI can take longer
    });
  }

  async generateExercises(params: GenerateExercisesParams): Promise<any[]> {
    try {
      // Try Sarvam first
      const response = await this.sarvamClient.post('/generate', {
        prompt: this.buildExercisePrompt(params),
        max_tokens: 2000,
        temperature: 0.7
      });

      await this.recordUsage('sarvam', '/generate', 1, params, 200);

      // Parse and validate response
      const exercises = this.parseExerciseResponse(response.data);
      return exercises;
    } catch (error) {
      await this.recordUsage('sarvam', '/generate', 1, params, error.response?.status || 500, error.message);
      
      // Fallback to AI4Bharat or local seed
      return this.fallbackGenerateExercises(params);
    }
  }

  async generateTTS(params: GenerateTTSParams): Promise<any> {
    try {
      const response = await this.sarvamClient.post('/tts', {
        text: params.text,
        language: params.language,
        voice: this.getVoiceForLanguage(params.language)
      });

      await this.recordUsage('sarvam', '/tts', 1, params, 200);

      return {
        audio_url: response.data.audio_url,
        duration_ms: response.data.duration_ms,
        codec: response.data.codec || 'mp3'
      };
    } catch (error) {
      await this.recordUsage('sarvam', '/tts', 1, params, error.response?.status || 500, error.message);
      
      // Fallback
      return this.fallbackGenerateTTS(params);
    }
  }

  async speechToText(params: SpeechToTextParams): Promise<any> {
    try {
      // For multipart form data, we'll use FormData if available
      // Otherwise, send as base64 or use a different approach
      const formData = new (require('form-data'))();
      formData.append('audio', params.audioFile.buffer, {
        filename: params.audioFile.originalname,
        contentType: params.audioFile.mimetype
      });
      formData.append('language', params.language);

      const response = await this.sarvamClient.post('/stt', formData, {
        headers: formData.getHeaders()
      });

      await this.recordUsage('sarvam', '/stt', 1, { language: params.language }, 200);

      return {
        text: response.data.text,
        confidence: response.data.confidence,
        processing_time_ms: response.data.processing_time_ms
      };
    } catch (error) {
      await this.recordUsage('sarvam', '/stt', 1, { language: params.language }, error.response?.status || 500, error.message);
      
      // Fallback
      return this.fallbackSpeechToText(params);
    }
  }

  private buildExercisePrompt(params: GenerateExercisesParams): string {
    return `Generate ${params.count} ${params.difficulty} level ${params.exerciseType} exercises for learning ${params.targetLanguage} from ${params.sourceLanguage}.
    
Each exercise should have:
- original_question: Text in ${params.sourceLanguage} only
- answer_options: Array of 4 unique options
- correct_answer: One of the answer_options
- hint: Helpful hint
- explanation: Why the answer is correct

Return only a JSON array, no additional text.`;
  }

  private parseExerciseResponse(data: any): any[] {
    // Parse the response - adjust based on actual API response format
    if (Array.isArray(data)) {
      return data;
    }
    if (data.exercises && Array.isArray(data.exercises)) {
      return data.exercises;
    }
    if (data.content) {
      try {
        return JSON.parse(data.content);
      } catch {
        return [];
      }
    }
    return [];
  }

  private getVoiceForLanguage(language: string): string {
    const voices: Record<string, string> = {
      hi: 'bulbul_female_hi',
      te: 'bulbul_female_te',
      ta: 'bulbul_female_ta',
      kn: 'bulbul_female_kn',
      ml: 'bulbul_female_ml'
    };
    return voices[language] || 'meera';
  }

  private async fallbackGenerateExercises(params: GenerateExercisesParams): Promise<any[]> {
    // Fallback to OpenAI API
    try {
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!openaiKey) {
        console.warn('OpenAI API key not configured, using local seed data');
        return this.getLocalSeedExercises(params);
      }

      const prompt = this.buildExercisePrompt(params);
      const model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini');

      const response = await this.openaiClient.post('/chat/completions', {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert language learning exercise generator for Indic languages. Generate exercises in valid JSON format only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      await this.recordUsage('openai', '/chat/completions', 1, params, 200);

      // Parse OpenAI response
      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Invalid JSON in OpenAI response');
        }
      }

      // Handle different response formats
      let exercises: any[] = [];
      if (Array.isArray(parsedContent)) {
        exercises = parsedContent;
      } else if (parsedContent.exercises && Array.isArray(parsedContent.exercises)) {
        exercises = parsedContent.exercises;
      } else if (parsedContent.exercise && Array.isArray(parsedContent.exercise)) {
        exercises = parsedContent.exercise;
      } else {
        // Single exercise object
        exercises = [parsedContent];
      }

      // Validate and normalize exercises
      return exercises.map(ex => this.normalizeExercise(ex)).filter(ex => ex !== null);
    } catch (error) {
      console.error('OpenAI fallback error:', error);
      await this.recordUsage('openai', '/chat/completions', 1, params, error.response?.status || 500, error.message);
      
      // Final fallback to local seed data
      return this.getLocalSeedExercises(params);
    }
  }

  private normalizeExercise(ex: any): any | null {
    // Ensure exercise has all required fields
    if (!ex.original_question && !ex.question) {
      return null;
    }

    return {
      original_question: ex.original_question || ex.question || '',
      answer_options: ex.answer_options || ex.options || ex.answer_options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: ex.correct_answer || ex.correctAnswer || ex.answer_options?.[0] || 'Option 1',
      hint: ex.hint || 'Think carefully about the translation',
      explanation: ex.explanation || 'This is a generated exercise'
    };
  }

  private getLocalSeedExercises(params: GenerateExercisesParams): any[] {
    // Local seed data fallback
    const languageNames: Record<string, string> = {
      hi: 'Hindi',
      te: 'Telugu',
      ta: 'Tamil',
      kn: 'Kannada',
      ml: 'Malayalam',
      gu: 'Gujarati',
      bn: 'Bengali',
      mr: 'Marathi',
      pa: 'Punjabi',
      or: 'Odia',
      as: 'Assamese',
      ur: 'Urdu'
    };

    const sourceLangName = languageNames[params.sourceLanguage] || params.sourceLanguage;
    const targetLangName = languageNames[params.targetLanguage] || params.targetLanguage;

    return [{
      original_question: `Translate "Hello" from ${sourceLangName} to ${targetLangName}`,
      answer_options: [
        `Hello in ${targetLangName}`,
        `Greeting in ${targetLangName}`,
        `Welcome in ${targetLangName}`,
        `Hi in ${targetLangName}`
      ],
      correct_answer: `Hello in ${targetLangName}`,
      hint: `Think about common greetings in ${targetLangName}`,
      explanation: `This is a basic translation exercise from ${sourceLangName} to ${targetLangName}`
    }];
  }

  private async fallbackGenerateTTS(params: GenerateTTSParams): Promise<any> {
    // Fallback to OpenAI TTS API
    try {
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!openaiKey) {
        console.warn('OpenAI API key not configured, using placeholder');
        return {
          audio_url: 'https://example.com/audio.mp3',
          duration_ms: Math.ceil(params.text.length * 50), // Rough estimate: 50ms per character
          codec: 'mp3'
        };
      }

      // Map Indic language codes to OpenAI TTS voices
      const voiceMap: Record<string, string> = {
        hi: 'alloy', // Hindi - using available OpenAI voice
        te: 'echo',  // Telugu
        ta: 'fable', // Tamil
        kn: 'onyx',  // Kannada
        ml: 'nova',  // Malayalam
        gu: 'shimmer', // Gujarati
        bn: 'alloy', // Bengali
        mr: 'echo',  // Marathi
        pa: 'fable', // Punjabi
        or: 'onyx',  // Odia
        as: 'nova',  // Assamese
        ur: 'shimmer' // Urdu
      };

      const voice = voiceMap[params.language] || 'alloy';
      const model = this.configService.get<string>('OPENAI_TTS_MODEL', 'tts-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/speech',
        {
          model,
          input: params.text,
          voice,
          response_format: 'mp3'
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          responseType: 'arraybuffer', // For binary audio data
          timeout: 60000
        }
      );

      await this.recordUsage('openai', '/audio/speech', 1, { text: params.text, language: params.language }, 200);

      // In a real implementation, you would:
      // 1. Save the audio buffer to storage (S3, local filesystem, etc.)
      // 2. Return the URL to the saved audio file
      // For now, we'll return a placeholder URL
      // TODO: Implement audio storage

      // Estimate duration (rough: ~150 words per minute, ~5 chars per word)
      const estimatedDuration = Math.ceil((params.text.length / 5) * (60 / 150) * 1000);

      return {
        audio_url: `https://storage.example.com/audio/${Date.now()}.mp3`, // Placeholder
        duration_ms: estimatedDuration,
        codec: 'mp3',
        provider: 'openai',
        note: 'Audio needs to be saved to storage - URL is placeholder'
      };
    } catch (error) {
      console.error('OpenAI TTS fallback error:', error);
      await this.recordUsage('openai', '/audio/speech', 1, { text: params.text, language: params.language }, error.response?.status || 500, error.message);
      
      // Final fallback
      return {
        audio_url: 'https://example.com/audio.mp3',
        duration_ms: Math.ceil(params.text.length * 50),
        codec: 'mp3'
      };
    }
  }

  private async fallbackSpeechToText(params: SpeechToTextParams): Promise<any> {
    // Fallback to OpenAI Whisper API
    try {
      const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!openaiKey) {
        console.warn('OpenAI API key not configured, using placeholder');
        return {
          text: 'Sample transcription',
          confidence: 0.8,
          processing_time_ms: 1000
        };
      }

      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', params.audioFile.buffer, {
        filename: params.audioFile.originalname,
        contentType: params.audioFile.mimetype
      });
      formData.append('model', 'whisper-1');
      formData.append('language', this.mapLanguageToOpenAI(params.language));
      formData.append('response_format', 'json');

      const startTime = Date.now();
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${openaiKey}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000
        }
      );

      const processingTime = Date.now() - startTime;

      await this.recordUsage('openai', '/audio/transcriptions', 1, { language: params.language }, 200);

      return {
        text: response.data.text || '',
        confidence: 0.95, // OpenAI Whisper doesn't provide confidence, using high default
        processing_time_ms: processingTime,
        provider: 'openai'
      };
    } catch (error) {
      console.error('OpenAI STT fallback error:', error);
      await this.recordUsage('openai', '/audio/transcriptions', 1, { language: params.language }, error.response?.status || 500, error.message);
      
      // Final fallback
      return {
        text: 'Sample transcription',
        confidence: 0.8,
        processing_time_ms: 1000
      };
    }
  }

  private mapLanguageToOpenAI(language: string): string {
    // Map Indic language codes to OpenAI Whisper supported languages
    // OpenAI Whisper supports: hi, te, ta, kn, ml, gu, bn, mr, pa, or, as, ur
    const supportedLanguages = ['hi', 'te', 'ta', 'kn', 'ml', 'gu', 'bn', 'mr', 'pa', 'or', 'as', 'ur'];
    
    if (supportedLanguages.includes(language)) {
      return language;
    }
    
    // Default to Hindi if language not directly supported
    return 'hi';
  }

  private async recordUsage(
    provider: string,
    endpoint: string,
    creditsUsed: number,
    requestPayload: any,
    responseStatus: number,
    errorMessage?: string,
    userId?: string
  ) {
    const usage = this.apiUsageRepository.create({
      provider,
      endpoint,
      creditsUsed,
      requestPayload,
      responseStatus,
      errorMessage,
      userId
    });
    await this.apiUsageRepository.save(usage);
  }
}
