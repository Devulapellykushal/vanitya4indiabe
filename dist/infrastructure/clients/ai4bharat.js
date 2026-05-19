"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI4BharatClient = void 0;
const axios_1 = require("axios");
class AI4BharatClient {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }
    async translateText(text, sourceLang, targetLang) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }
            const response = await axios_1.default.post(`${this.apiUrl}/translate`, {
                input: text,
                source_language: sourceLang,
                target_language: targetLang,
            }, { headers });
            return response.data;
        }
        catch (error) {
            console.error('AI4Bharat translation error:', error);
            throw error;
        }
    }
    async detectLanguage(text) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }
            const response = await axios_1.default.post(`${this.apiUrl}/detect-language`, { text }, { headers });
            return response.data;
        }
        catch (error) {
            console.error('AI4Bharat language detection error:', error);
            throw error;
        }
    }
}
exports.AI4BharatClient = AI4BharatClient;
exports.default = AI4BharatClient;
//# sourceMappingURL=ai4bharat.js.map