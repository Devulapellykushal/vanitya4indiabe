"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("axios");
const ai_service_1 = require("./ai.service");
const api_usage_entity_1 = require("./entities/api-usage.entity");
jest.mock('axios');
const mockedAxios = axios_1.default;
jest.mock('form-data', () => {
    return jest.fn().mockImplementation(() => ({
        append: jest.fn(),
        getHeaders: jest.fn(() => ({ 'content-type': 'multipart/form-data' }))
    }));
});
describe('AiService', () => {
    let service;
    let apiUsageRepository;
    let configService;
    let sarvamClient;
    let ai4bharatClient;
    const mockApiUsageRepository = {
        create: jest.fn(),
        save: jest.fn()
    };
    const mockConfigService = {
        get: jest.fn((key, defaultValue) => {
            const config = {
                SARVAM_API_URL: 'https://api.sarvam.ai/v1',
                SARVAM_API_KEY: 'test-sarvam-key',
                AI4BHARAT_API_URL: 'https://api.ai4bharat.org',
                AI4BHARAT_API_KEY: 'test-ai4bharat-key'
            };
            return config[key] || defaultValue;
        })
    };
    beforeEach(async () => {
        sarvamClient = {
            post: jest.fn(),
            get: jest.fn()
        };
        ai4bharatClient = {
            post: jest.fn(),
            get: jest.fn()
        };
        mockedAxios.create = jest.fn((config) => {
            if (config.baseURL?.includes('sarvam')) {
                return sarvamClient;
            }
            return ai4bharatClient;
        });
        const module = await testing_1.Test.createTestingModule({
            providers: [
                ai_service_1.AiService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(api_usage_entity_1.ApiUsage),
                    useValue: mockApiUsageRepository
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService
                }
            ]
        }).compile();
        service = module.get(ai_service_1.AiService);
        apiUsageRepository = module.get((0, typeorm_1.getRepositoryToken)(api_usage_entity_1.ApiUsage));
        configService = module.get(config_1.ConfigService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('generateExercises', () => {
        const validParams = {
            sourceLanguage: 'hi',
            targetLanguage: 'te',
            difficulty: 'beginner',
            exerciseType: 'translation',
            unitId: 'unit_1',
            count: 1
        };
        describe('Success Scenarios', () => {
            it('should generate exercises successfully with Sarvam API (array response)', async () => {
                const mockExercises = [
                    {
                        original_question: 'नमस्ते का अंग्रेजी में अनुवाद क्या है?',
                        answer_options: ['Hello', 'Goodbye', 'Thank you', 'Please'],
                        correct_answer: 'Hello',
                        hint: 'यह एक सामान्य अभिवादन है',
                        explanation: 'नमस्ते का अंग्रेजी में अनुवाद Hello है'
                    }
                ];
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockExercises
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toEqual(mockExercises);
                expect(sarvamClient.post).toHaveBeenCalledWith('/generate', expect.objectContaining({
                    prompt: expect.stringContaining('Generate 1 beginner level translation exercises'),
                    max_tokens: 2000,
                    temperature: 0.7
                }));
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should generate exercises successfully with Sarvam API (nested exercises response)', async () => {
                const mockResponse = {
                    exercises: [
                        {
                            original_question: 'कैसे हो?',
                            answer_options: ['How are you?', 'What is your name?', 'Where are you?', 'When are you?'],
                            correct_answer: 'How are you?',
                            hint: 'यह एक पूछताछ है',
                            explanation: 'कैसे हो का अंग्रेजी में अनुवाद How are you? है'
                        }
                    ]
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toEqual(mockResponse.exercises);
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should generate exercises successfully with Sarvam API (content string response)', async () => {
                const mockExercises = [
                    {
                        original_question: 'धन्यवाद',
                        answer_options: ['Thank you', 'Please', 'Sorry', 'Welcome'],
                        correct_answer: 'Thank you',
                        hint: 'यह एक आभार व्यक्त करने का शब्द है',
                        explanation: 'धन्यवाद का अंग्रेजी में अनुवाद Thank you है'
                    }
                ];
                sarvamClient.post.mockResolvedValueOnce({
                    data: {
                        content: JSON.stringify(mockExercises)
                    }
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toEqual(mockExercises);
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should generate multiple exercises when count > 1', async () => {
                const mockExercises = [
                    {
                        original_question: 'Question 1',
                        answer_options: ['A', 'B', 'C', 'D'],
                        correct_answer: 'A',
                        hint: 'Hint 1',
                        explanation: 'Explanation 1'
                    },
                    {
                        original_question: 'Question 2',
                        answer_options: ['A', 'B', 'C', 'D'],
                        correct_answer: 'B',
                        hint: 'Hint 2',
                        explanation: 'Explanation 2'
                    }
                ];
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockExercises
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises({ ...validParams, count: 2 });
                expect(result).toHaveLength(2);
                expect(sarvamClient.post).toHaveBeenCalledWith('/generate', expect.objectContaining({
                    prompt: expect.stringContaining('Generate 2 beginner level translation exercises')
                }));
            });
            it('should handle different exercise types (translation, transliteration, listening, speaking)', async () => {
                const exerciseTypes = ['translation', 'transliteration', 'listening', 'speaking'];
                for (const exerciseType of exerciseTypes) {
                    sarvamClient.post.mockResolvedValueOnce({
                        data: [{
                                original_question: `Sample ${exerciseType} question`,
                                answer_options: ['A', 'B', 'C', 'D'],
                                correct_answer: 'A',
                                hint: 'Hint',
                                explanation: 'Explanation'
                            }]
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    const result = await service.generateExercises({ ...validParams, exerciseType });
                    expect(result).toBeDefined();
                    expect(result.length).toBeGreaterThan(0);
                }
            });
            it('should handle different difficulty levels (beginner, intermediate, advanced)', async () => {
                const difficulties = ['beginner', 'intermediate', 'advanced'];
                for (const difficulty of difficulties) {
                    sarvamClient.post.mockResolvedValueOnce({
                        data: [{
                                original_question: `Sample ${difficulty} question`,
                                answer_options: ['A', 'B', 'C', 'D'],
                                correct_answer: 'A',
                                hint: 'Hint',
                                explanation: 'Explanation'
                            }]
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    const result = await service.generateExercises({ ...validParams, difficulty });
                    expect(result).toBeDefined();
                    expect(sarvamClient.post).toHaveBeenCalledWith('/generate', expect.objectContaining({
                        prompt: expect.stringContaining(`${difficulty} level`)
                    }));
                }
            });
            it('should handle different language pairs (Hindi-Telugu, Tamil-Kannada, etc.)', async () => {
                const languagePairs = [
                    { source: 'hi', target: 'te' },
                    { source: 'ta', target: 'kn' },
                    { source: 'ml', target: 'hi' },
                    { source: 'gu', target: 'bn' }
                ];
                for (const pair of languagePairs) {
                    sarvamClient.post.mockResolvedValueOnce({
                        data: [{
                                original_question: 'Sample question',
                                answer_options: ['A', 'B', 'C', 'D'],
                                correct_answer: 'A',
                                hint: 'Hint',
                                explanation: 'Explanation'
                            }]
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    const result = await service.generateExercises({
                        ...validParams,
                        sourceLanguage: pair.source,
                        targetLanguage: pair.target
                    });
                    expect(result).toBeDefined();
                }
            });
        });
        describe('Error and Fallback Scenarios', () => {
            it('should fallback to local seed when Sarvam API returns 404', async () => {
                const error = {
                    response: { status: 404 },
                    message: 'Not Found'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(result.length).toBeGreaterThan(0);
                expect(result[0]).toHaveProperty('original_question');
                expect(result[0]).toHaveProperty('answer_options');
                expect(result[0]).toHaveProperty('correct_answer');
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    provider: 'sarvam',
                    endpoint: '/generate',
                    responseStatus: 404,
                    errorMessage: 'Not Found'
                }));
            });
            it('should fallback to local seed when Sarvam API returns 500', async () => {
                const error = {
                    response: { status: 500 },
                    message: 'Internal Server Error'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(result.length).toBeGreaterThan(0);
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    responseStatus: 500
                }));
            });
            it('should fallback to local seed when Sarvam API returns 401 (Unauthorized)', async () => {
                const error = {
                    response: { status: 401 },
                    message: 'Unauthorized'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    responseStatus: 401
                }));
            });
            it('should fallback to local seed when Sarvam API returns 429 (Rate Limit)', async () => {
                const error = {
                    response: { status: 429 },
                    message: 'Too Many Requests'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    responseStatus: 429
                }));
            });
            it('should fallback to local seed when Sarvam API times out', async () => {
                const error = {
                    code: 'ECONNABORTED',
                    message: 'timeout of 30000ms exceeded'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    responseStatus: 500,
                    errorMessage: 'timeout of 30000ms exceeded'
                }));
            });
            it('should fallback to local seed when Sarvam API returns network error', async () => {
                const error = {
                    code: 'ENOTFOUND',
                    message: 'getaddrinfo ENOTFOUND api.sarvam.ai'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should fallback to local seed when Sarvam API returns invalid JSON', async () => {
                sarvamClient.post.mockResolvedValueOnce({
                    data: { content: 'invalid json string' }
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
            });
            it('should handle when Sarvam API returns empty array', async () => {
                sarvamClient.post.mockResolvedValueOnce({
                    data: []
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises(validParams);
                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
            });
            it('should record usage even when API fails', async () => {
                const error = {
                    response: { status: 500 },
                    message: 'Internal Server Error'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                await service.generateExercises(validParams);
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    provider: 'sarvam',
                    endpoint: '/generate',
                    creditsUsed: 1,
                    requestPayload: validParams,
                    responseStatus: 500,
                    errorMessage: 'Internal Server Error'
                }));
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
        });
        describe('Edge Cases', () => {
            it('should handle count = 0 gracefully', async () => {
                sarvamClient.post.mockResolvedValueOnce({
                    data: []
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises({ ...validParams, count: 0 });
                expect(result).toBeDefined();
                expect(sarvamClient.post).toHaveBeenCalledWith('/generate', expect.objectContaining({
                    prompt: expect.stringContaining('Generate 0 beginner level')
                }));
            });
            it('should handle very large count values', async () => {
                sarvamClient.post.mockResolvedValueOnce({
                    data: Array(100).fill({
                        original_question: 'Question',
                        answer_options: ['A', 'B', 'C', 'D'],
                        correct_answer: 'A',
                        hint: 'Hint',
                        explanation: 'Explanation'
                    })
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises({ ...validParams, count: 100 });
                expect(result).toHaveLength(100);
            });
            it('should handle special characters in unitId', async () => {
                sarvamClient.post.mockResolvedValueOnce({
                    data: [{
                            original_question: 'Question',
                            answer_options: ['A', 'B', 'C', 'D'],
                            correct_answer: 'A',
                            hint: 'Hint',
                            explanation: 'Explanation'
                        }]
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateExercises({
                    ...validParams,
                    unitId: 'unit_1-special@chars#123'
                });
                expect(result).toBeDefined();
            });
        });
    });
    describe('generateTTS', () => {
        const validParams = {
            text: 'नमस्ते',
            language: 'hi'
        };
        describe('Success Scenarios', () => {
            it('should generate TTS successfully with Sarvam API', async () => {
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 1500,
                    codec: 'mp3'
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS(validParams);
                expect(result).toEqual({
                    audio_url: mockResponse.audio_url,
                    duration_ms: mockResponse.duration_ms,
                    codec: mockResponse.codec
                });
                expect(sarvamClient.post).toHaveBeenCalledWith('/tts', expect.objectContaining({
                    text: validParams.text,
                    language: validParams.language,
                    voice: expect.any(String)
                }));
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should use default codec when not provided', async () => {
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 1500
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS(validParams);
                expect(result.codec).toBe('mp3');
            });
            it('should handle different languages with correct voice mapping', async () => {
                const languageVoiceMap = [
                    { language: 'hi', expectedVoice: 'bulbul_female_hi' },
                    { language: 'te', expectedVoice: 'bulbul_female_te' },
                    { language: 'ta', expectedVoice: 'bulbul_female_ta' },
                    { language: 'kn', expectedVoice: 'bulbul_female_kn' },
                    { language: 'ml', expectedVoice: 'bulbul_female_ml' },
                    { language: 'unknown', expectedVoice: 'meera' }
                ];
                for (const { language, expectedVoice } of languageVoiceMap) {
                    sarvamClient.post.mockResolvedValueOnce({
                        data: {
                            audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                            duration_ms: 1500,
                            codec: 'mp3'
                        }
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    await service.generateTTS({ text: 'Test', language });
                    expect(sarvamClient.post).toHaveBeenCalledWith('/tts', expect.objectContaining({
                        voice: expectedVoice
                    }));
                }
            });
            it('should handle long text input', async () => {
                const longText = 'नमस्ते '.repeat(100);
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 5000,
                    codec: 'mp3'
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS({ text: longText, language: 'hi' });
                expect(result).toBeDefined();
                expect(result.duration_ms).toBeGreaterThan(0);
            });
            it('should handle special characters in text', async () => {
                const specialText = 'नमस्ते! कैसे हो? "Hello" - 123';
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 2000,
                    codec: 'mp3'
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS({ text: specialText, language: 'hi' });
                expect(result).toBeDefined();
                expect(sarvamClient.post).toHaveBeenCalledWith('/tts', expect.objectContaining({
                    text: specialText
                }));
            });
        });
        describe('Error and Fallback Scenarios', () => {
            it('should fallback when Sarvam TTS API returns 404', async () => {
                const error = {
                    response: { status: 404 },
                    message: 'Not Found'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS(validParams);
                expect(result).toBeDefined();
                expect(result).toHaveProperty('audio_url');
                expect(result).toHaveProperty('duration_ms');
                expect(result).toHaveProperty('codec');
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    provider: 'sarvam',
                    endpoint: '/tts',
                    responseStatus: 404
                }));
            });
            it('should fallback when Sarvam TTS API times out', async () => {
                const error = {
                    code: 'ECONNABORTED',
                    message: 'timeout of 30000ms exceeded'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS(validParams);
                expect(result).toBeDefined();
                expect(result.audio_url).toBeDefined();
            });
            it('should fallback when Sarvam TTS API returns 500', async () => {
                const error = {
                    response: { status: 500 },
                    message: 'Internal Server Error'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS(validParams);
                expect(result).toBeDefined();
            });
        });
        describe('Edge Cases', () => {
            it('should handle empty text', async () => {
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 0,
                    codec: 'mp3'
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS({ text: '', language: 'hi' });
                expect(result).toBeDefined();
                expect(result.duration_ms).toBe(0);
            });
            it('should handle very long text', async () => {
                const veryLongText = 'नमस्ते '.repeat(1000);
                const mockResponse = {
                    audio_url: 'https://api.sarvam.ai/audio/123.mp3',
                    duration_ms: 50000,
                    codec: 'mp3'
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.generateTTS({ text: veryLongText, language: 'hi' });
                expect(result).toBeDefined();
                expect(result.duration_ms).toBeGreaterThan(0);
            });
        });
    });
    describe('speechToText', () => {
        const mockAudioFile = {
            buffer: Buffer.from('fake audio data'),
            originalname: 'test.wav',
            mimetype: 'audio/wav',
            size: 1024
        };
        const validParams = {
            audioFile: mockAudioFile,
            language: 'hi'
        };
        describe('Success Scenarios', () => {
            it('should transcribe speech successfully with Sarvam API', async () => {
                const mockResponse = {
                    text: 'नमस्ते',
                    confidence: 0.95,
                    processing_time_ms: 500
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result).toEqual({
                    text: mockResponse.text,
                    confidence: mockResponse.confidence,
                    processing_time_ms: mockResponse.processing_time_ms
                });
                expect(sarvamClient.post).toHaveBeenCalled();
                expect(mockApiUsageRepository.save).toHaveBeenCalled();
            });
            it('should handle different audio formats (wav, mp3, ogg)', async () => {
                const formats = [
                    { mimetype: 'audio/wav', originalname: 'test.wav' },
                    { mimetype: 'audio/mpeg', originalname: 'test.mp3' },
                    { mimetype: 'audio/ogg', originalname: 'test.ogg' }
                ];
                for (const format of formats) {
                    const mockResponse = {
                        text: 'Transcribed text',
                        confidence: 0.9,
                        processing_time_ms: 500
                    };
                    sarvamClient.post.mockResolvedValueOnce({
                        data: mockResponse
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    const result = await service.speechToText({
                        audioFile: { ...mockAudioFile, ...format },
                        language: 'hi'
                    });
                    expect(result).toBeDefined();
                    expect(result.text).toBeDefined();
                }
            });
            it('should handle different languages', async () => {
                const languages = ['hi', 'te', 'ta', 'kn', 'ml'];
                for (const language of languages) {
                    const mockResponse = {
                        text: 'Transcribed text',
                        confidence: 0.9,
                        processing_time_ms: 500
                    };
                    sarvamClient.post.mockResolvedValueOnce({
                        data: mockResponse
                    });
                    mockApiUsageRepository.create.mockReturnValueOnce({});
                    mockApiUsageRepository.save.mockResolvedValueOnce({});
                    const result = await service.speechToText({
                        audioFile: mockAudioFile,
                        language
                    });
                    expect(result).toBeDefined();
                }
            });
            it('should handle low confidence transcriptions', async () => {
                const mockResponse = {
                    text: 'नमस्ते',
                    confidence: 0.3,
                    processing_time_ms: 500
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result.confidence).toBe(0.3);
                expect(result.text).toBeDefined();
            });
            it('should handle high confidence transcriptions', async () => {
                const mockResponse = {
                    text: 'नमस्ते',
                    confidence: 0.99,
                    processing_time_ms: 500
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result.confidence).toBe(0.99);
            });
        });
        describe('Error and Fallback Scenarios', () => {
            it('should fallback when Sarvam STT API returns 404', async () => {
                const error = {
                    response: { status: 404 },
                    message: 'Not Found'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result).toBeDefined();
                expect(result).toHaveProperty('text');
                expect(result).toHaveProperty('confidence');
                expect(result).toHaveProperty('processing_time_ms');
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    provider: 'sarvam',
                    endpoint: '/stt',
                    responseStatus: 404
                }));
            });
            it('should fallback when Sarvam STT API times out', async () => {
                const error = {
                    code: 'ECONNABORTED',
                    message: 'timeout of 30000ms exceeded'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result).toBeDefined();
                expect(result.text).toBeDefined();
            });
            it('should fallback when Sarvam STT API returns 500', async () => {
                const error = {
                    response: { status: 500 },
                    message: 'Internal Server Error'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result).toBeDefined();
            });
            it('should fallback when audio file is invalid', async () => {
                const error = {
                    response: { status: 400 },
                    message: 'Invalid audio format'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText(validParams);
                expect(result).toBeDefined();
                expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                    responseStatus: 400
                }));
            });
        });
        describe('Edge Cases', () => {
            it('should handle very large audio files', async () => {
                const largeAudioFile = {
                    ...mockAudioFile,
                    buffer: Buffer.alloc(10 * 1024 * 1024),
                    size: 10 * 1024 * 1024
                };
                const mockResponse = {
                    text: 'Transcribed text',
                    confidence: 0.9,
                    processing_time_ms: 2000
                };
                sarvamClient.post.mockResolvedValueOnce({
                    data: mockResponse
                });
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText({
                    audioFile: largeAudioFile,
                    language: 'hi'
                });
                expect(result).toBeDefined();
            });
            it('should handle empty audio file', async () => {
                const emptyAudioFile = {
                    ...mockAudioFile,
                    buffer: Buffer.alloc(0),
                    size: 0
                };
                const error = {
                    response: { status: 400 },
                    message: 'Empty audio file'
                };
                sarvamClient.post.mockRejectedValueOnce(error);
                mockApiUsageRepository.create.mockReturnValueOnce({});
                mockApiUsageRepository.save.mockResolvedValueOnce({});
                const result = await service.speechToText({
                    audioFile: emptyAudioFile,
                    language: 'hi'
                });
                expect(result).toBeDefined();
            });
        });
    });
    describe('recordUsage', () => {
        it('should record successful API usage', async () => {
            const mockUsage = {
                id: '123',
                provider: 'sarvam',
                endpoint: '/generate',
                creditsUsed: 1
            };
            mockApiUsageRepository.create.mockReturnValueOnce(mockUsage);
            mockApiUsageRepository.save.mockResolvedValueOnce(mockUsage);
            sarvamClient.post.mockResolvedValueOnce({
                data: [{ original_question: 'Test' }]
            });
            await service.generateExercises({
                sourceLanguage: 'hi',
                targetLanguage: 'te',
                difficulty: 'beginner',
                exerciseType: 'translation',
                unitId: 'unit_1',
                count: 1
            });
            expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                provider: 'sarvam',
                endpoint: '/generate',
                creditsUsed: 1,
                responseStatus: 200
            }));
            expect(mockApiUsageRepository.save).toHaveBeenCalled();
        });
        it('should record failed API usage with error message', async () => {
            const error = {
                response: { status: 500 },
                message: 'Internal Server Error'
            };
            sarvamClient.post.mockRejectedValueOnce(error);
            mockApiUsageRepository.create.mockReturnValueOnce({});
            mockApiUsageRepository.save.mockResolvedValueOnce({});
            await service.generateExercises({
                sourceLanguage: 'hi',
                targetLanguage: 'te',
                difficulty: 'beginner',
                exerciseType: 'translation',
                unitId: 'unit_1',
                count: 1
            });
            expect(mockApiUsageRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                provider: 'sarvam',
                endpoint: '/generate',
                responseStatus: 500,
                errorMessage: 'Internal Server Error'
            }));
        });
    });
});
//# sourceMappingURL=ai.service.spec.js.map