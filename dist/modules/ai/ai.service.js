"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("axios");
const typeorm_2 = require("typeorm");
const api_usage_entity_1 = require("./entities/api-usage.entity");
let AiService = class AiService {
    constructor(apiUsageRepository, configService) {
        this.apiUsageRepository = apiUsageRepository;
        this.configService = configService;
        const sarvamUrl = this.configService.get('SARVAM_API_URL', 'https://api.sarvam.ai/v1');
        const sarvamKey = this.configService.get('SARVAM_API_KEY');
        this.sarvamClient = axios_1.default.create({
            baseURL: sarvamUrl,
            headers: {
                'Authorization': `Bearer ${sarvamKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        const ai4bharatUrl = this.configService.get('AI4BHARAT_API_URL', 'https://api.ai4bharat.org');
        const ai4bharatKey = this.configService.get('AI4BHARAT_API_KEY');
        this.ai4bharatClient = axios_1.default.create({
            baseURL: ai4bharatUrl,
            headers: {
                'Authorization': `Bearer ${ai4bharatKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
        const openaiKey = this.configService.get('OPENAI_API_KEY');
        this.openaiClient = axios_1.default.create({
            baseURL: 'https://api.openai.com/v1',
            headers: {
                'Authorization': openaiKey ? `Bearer ${openaiKey}` : '',
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });
    }
    async generateExercises(params) {
        try {
            const response = await this.sarvamClient.post('/generate', {
                prompt: this.buildExercisePrompt(params),
                max_tokens: 2000,
                temperature: 0.7
            });
            await this.recordUsage('sarvam', '/generate', 1, params, 200);
            const exercises = this.parseExerciseResponse(response.data);
            return exercises;
        }
        catch (error) {
            await this.recordUsage('sarvam', '/generate', 1, params, error.response?.status || 500, error.message);
            return this.fallbackGenerateExercises(params);
        }
    }
    async generateTTS(params) {
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
        }
        catch (error) {
            await this.recordUsage('sarvam', '/tts', 1, params, error.response?.status || 500, error.message);
            return this.fallbackGenerateTTS(params);
        }
    }
    async speechToText(params) {
        try {
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
        }
        catch (error) {
            await this.recordUsage('sarvam', '/stt', 1, { language: params.language }, error.response?.status || 500, error.message);
            return this.fallbackSpeechToText(params);
        }
    }
    buildExercisePrompt(params) {
        return `Generate ${params.count} ${params.difficulty} level ${params.exerciseType} exercises for learning ${params.targetLanguage} from ${params.sourceLanguage}.
    
Each exercise should have:
- original_question: Text in ${params.sourceLanguage} only
- answer_options: Array of 4 unique options
- correct_answer: One of the answer_options
- hint: Helpful hint
- explanation: Why the answer is correct

Return only a JSON array, no additional text.`;
    }
    parseExerciseResponse(data) {
        if (Array.isArray(data)) {
            return data;
        }
        if (data.exercises && Array.isArray(data.exercises)) {
            return data.exercises;
        }
        if (data.content) {
            try {
                return JSON.parse(data.content);
            }
            catch {
                return [];
            }
        }
        return [];
    }
    getVoiceForLanguage(language) {
        const voices = {
            hi: 'bulbul_female_hi',
            te: 'bulbul_female_te',
            ta: 'bulbul_female_ta',
            kn: 'bulbul_female_kn',
            ml: 'bulbul_female_ml'
        };
        return voices[language] || 'meera';
    }
    async fallbackGenerateExercises(params) {
        try {
            const openaiKey = this.configService.get('OPENAI_API_KEY');
            if (!openaiKey) {
                console.warn('OpenAI API key not configured, using local seed data');
                return this.getLocalSeedExercises(params);
            }
            const prompt = this.buildExercisePrompt(params);
            const model = this.configService.get('OPENAI_MODEL', 'gpt-4o-mini');
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
            const content = response.data.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No content in OpenAI response');
            }
            let parsedContent;
            try {
                parsedContent = JSON.parse(content);
            }
            catch {
                const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    parsedContent = JSON.parse(jsonMatch[1]);
                }
                else {
                    throw new Error('Invalid JSON in OpenAI response');
                }
            }
            let exercises = [];
            if (Array.isArray(parsedContent)) {
                exercises = parsedContent;
            }
            else if (parsedContent.exercises && Array.isArray(parsedContent.exercises)) {
                exercises = parsedContent.exercises;
            }
            else if (parsedContent.exercise && Array.isArray(parsedContent.exercise)) {
                exercises = parsedContent.exercise;
            }
            else {
                exercises = [parsedContent];
            }
            return exercises.map(ex => this.normalizeExercise(ex)).filter(ex => ex !== null);
        }
        catch (error) {
            console.error('OpenAI fallback error:', error);
            await this.recordUsage('openai', '/chat/completions', 1, params, error.response?.status || 500, error.message);
            return this.getLocalSeedExercises(params);
        }
    }
    normalizeExercise(ex) {
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
    getLocalSeedExercises(params) {
        const languageNames = {
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
    async fallbackGenerateTTS(params) {
        try {
            const openaiKey = this.configService.get('OPENAI_API_KEY');
            if (!openaiKey) {
                console.warn('OpenAI API key not configured, using placeholder');
                return {
                    audio_url: 'https://example.com/audio.mp3',
                    duration_ms: Math.ceil(params.text.length * 50),
                    codec: 'mp3'
                };
            }
            const voiceMap = {
                hi: 'alloy',
                te: 'echo',
                ta: 'fable',
                kn: 'onyx',
                ml: 'nova',
                gu: 'shimmer',
                bn: 'alloy',
                mr: 'echo',
                pa: 'fable',
                or: 'onyx',
                as: 'nova',
                ur: 'shimmer'
            };
            const voice = voiceMap[params.language] || 'alloy';
            const model = this.configService.get('OPENAI_TTS_MODEL', 'tts-1');
            const response = await axios_1.default.post('https://api.openai.com/v1/audio/speech', {
                model,
                input: params.text,
                voice,
                response_format: 'mp3'
            }, {
                headers: {
                    'Authorization': `Bearer ${openaiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 60000
            });
            await this.recordUsage('openai', '/audio/speech', 1, { text: params.text, language: params.language }, 200);
            const estimatedDuration = Math.ceil((params.text.length / 5) * (60 / 150) * 1000);
            return {
                audio_url: `https://storage.example.com/audio/${Date.now()}.mp3`,
                duration_ms: estimatedDuration,
                codec: 'mp3',
                provider: 'openai',
                note: 'Audio needs to be saved to storage - URL is placeholder'
            };
        }
        catch (error) {
            console.error('OpenAI TTS fallback error:', error);
            await this.recordUsage('openai', '/audio/speech', 1, { text: params.text, language: params.language }, error.response?.status || 500, error.message);
            return {
                audio_url: 'https://example.com/audio.mp3',
                duration_ms: Math.ceil(params.text.length * 50),
                codec: 'mp3'
            };
        }
    }
    async fallbackSpeechToText(params) {
        try {
            const openaiKey = this.configService.get('OPENAI_API_KEY');
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
            const response = await axios_1.default.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${openaiKey}`
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 60000
            });
            const processingTime = Date.now() - startTime;
            await this.recordUsage('openai', '/audio/transcriptions', 1, { language: params.language }, 200);
            return {
                text: response.data.text || '',
                confidence: 0.95,
                processing_time_ms: processingTime,
                provider: 'openai'
            };
        }
        catch (error) {
            console.error('OpenAI STT fallback error:', error);
            await this.recordUsage('openai', '/audio/transcriptions', 1, { language: params.language }, error.response?.status || 500, error.message);
            return {
                text: 'Sample transcription',
                confidence: 0.8,
                processing_time_ms: 1000
            };
        }
    }
    mapLanguageToOpenAI(language) {
        const supportedLanguages = ['hi', 'te', 'ta', 'kn', 'ml', 'gu', 'bn', 'mr', 'pa', 'or', 'as', 'ur'];
        if (supportedLanguages.includes(language)) {
            return language;
        }
        return 'hi';
    }
    async recordUsage(provider, endpoint, creditsUsed, requestPayload, responseStatus, errorMessage, userId) {
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
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_usage_entity_1.ApiUsage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map