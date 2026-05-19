"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLanguageCode = exports.formatText = void 0;
const formatText = (text) => {
    return text.trim();
};
exports.formatText = formatText;
const validateLanguageCode = (code) => {
    const validCodes = ['hi', 'te', 'ta', 'kn', 'ml', 'gu', 'mr', 'pa', 'bn', 'or', 'as', 'ur'];
    return validCodes.includes(code);
};
exports.validateLanguageCode = validateLanguageCode;
//# sourceMappingURL=index.js.map