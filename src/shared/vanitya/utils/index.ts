// Vanitya shared utility functions for frontend
// Example: text formatting, validation helpers, etc.

export const formatText = (text: string): string => {
  return text.trim();
};

export const validateLanguageCode = (code: string): boolean => {
  const validCodes = ['hi', 'te', 'ta', 'kn', 'ml', 'gu', 'mr', 'pa', 'bn', 'or', 'as', 'ur'];
  return validCodes.includes(code);
};