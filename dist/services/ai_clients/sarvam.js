"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SarvamAPIClient = void 0;
const axios_1 = require("axios");
class SarvamAPIClient {
    constructor(apiUrl, apiKey, freeCredits = 900) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.freeCredits = freeCredits;
    }
    async translate(text, sourceLang, targetLang) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/translate`, {
                text,
                source_language: sourceLang,
                target_language: targetLang,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Sarvam translation error:', error);
            throw error;
        }
    }
    async textToSpeech(text, language) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/tts`, {
                text,
                language,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Sarvam TTS error:', error);
            throw error;
        }
    }
    getRemainingCredits() {
        return this.freeCredits;
    }
}
exports.SarvamAPIClient = SarvamAPIClient;
exports.default = SarvamAPIClient;
//# sourceMappingURL=sarvam.js.map