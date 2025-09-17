/**
 * Strict JSON parser for extracting valid JSON arrays from LLM responses
 * Handles cases where LLM might include extra text around JSON
 */

/**
 * Parse a JSON array from a string, with fallback extraction
 * @param {string} str - The string containing JSON array
 * @returns {Array} - Parsed JSON array
 * @throws {Error} - If no valid JSON array found or result is not an array
 */
function parseJsonArrayStrict(str) {
  if (!str || typeof str !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // First, try direct parsing
  try {
    const parsed = JSON.parse(str.trim());
    if (!Array.isArray(parsed)) {
      throw new Error('Parsed JSON is not an array');
    }
    validateArrayOfObjects(parsed);
    return parsed;
  } catch (directError) {
    console.log('Direct JSON parsing failed, attempting extraction...');
  }

  // Try to extract JSON array using regex
  // Look for content between [ and ] brackets
  const arrayMatch = str.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error('No JSON array found in the response');
  }

  // Find the first valid JSON array
  let startIndex = str.indexOf('[');
  while (startIndex !== -1) {
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    let endIndex = -1;

    for (let i = startIndex; i < str.length; i++) {
      const char = str[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '[') {
          depth++;
        } else if (char === ']') {
          depth--;
          if (depth === 0) {
            endIndex = i;
            break;
          }
        }
      }
    }

    if (endIndex !== -1) {
      const candidate = str.substring(startIndex, endIndex + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed)) {
          validateArrayOfObjects(parsed);
          console.log('Successfully extracted JSON array');
          return parsed;
        }
      } catch (e) {
        // Try next bracket
      }
    }

    startIndex = str.indexOf('[', startIndex + 1);
  }

  // Try to clean common issues
  let cleaned = str.trim();
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
  
  // Remove common prefixes/suffixes
  cleaned = cleaned.replace(/^.*?(\[)/s, '$1');  // Remove everything before first [
  cleaned = cleaned.replace(/(\]).*?$/s, '$1');   // Remove everything after last ]

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Cleaned JSON is not an array');
    }
    validateArrayOfObjects(parsed);
    console.log('Successfully parsed cleaned JSON');
    return parsed;
  } catch (cleanError) {
    throw new Error(`Failed to extract valid JSON array: ${cleanError.message}`);
  }
}

/**
 * Validate that the array contains objects
 * @param {Array} arr - Array to validate
 * @throws {Error} - If array is empty or contains non-objects
 */
function validateArrayOfObjects(arr) {
  if (!arr || arr.length === 0) {
    throw new Error('JSON array is empty');
  }

  for (let i = 0; i < arr.length; i++) {
    if (!arr[i] || typeof arr[i] !== 'object' || Array.isArray(arr[i])) {
      throw new Error(`Item at index ${i} is not a valid object`);
    }
  }
}

/**
 * Try to parse JSON, returning null on failure
 * @param {string} str - String to parse
 * @returns {any|null} - Parsed JSON or null
 */
function tryParseJson(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

module.exports = {
  parseJsonArrayStrict,
  validateArrayOfObjects,
  tryParseJson
};