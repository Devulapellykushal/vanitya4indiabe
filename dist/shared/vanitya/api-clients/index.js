"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AksharamukhaClient = exports.AI4BharatClient = exports.SarvamClient = void 0;
class SarvamClient {
    constructor(apiUrl, apiKey) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
    }
    async translate(text, sourceLang, targetLang) {
        return { translatedText: text };
    }
}
exports.SarvamClient = SarvamClient;
class AI4BharatClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    async processText(text) {
        return { processedText: text };
    }
}
exports.AI4BharatClient = AI4BharatClient;
class AksharamukhaClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    async transliterate(text, sourceScript, targetScript) {
        return { transliteratedText: text };
    }
}
exports.AksharamukhaClient = AksharamukhaClient;
//# sourceMappingURL=index.js.map