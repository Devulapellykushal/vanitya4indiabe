"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AksharamukhaClient = void 0;
const axios_1 = require("axios");
class AksharamukhaClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    async transliterate(text, sourceScript, targetScript, preOptions, postOptions) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/transliterate`, {
                source: sourceScript,
                target: targetScript,
                text,
                nativize: true,
                preOptions: preOptions || [],
                postOptions: postOptions || [],
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Aksharamukha transliteration error:', error);
            throw error;
        }
    }
    async getAvailableScripts() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/scripts`);
            return response.data;
        }
        catch (error) {
            console.error('Aksharamukha scripts fetch error:', error);
            throw error;
        }
    }
}
exports.AksharamukhaClient = AksharamukhaClient;
exports.default = AksharamukhaClient;
//# sourceMappingURL=aksharamukha.js.map