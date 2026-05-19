export declare class SarvamClient {
    private apiUrl;
    private apiKey;
    constructor(apiUrl: string, apiKey: string);
    translate(text: string, sourceLang: string, targetLang: string): Promise<{
        translatedText: string;
    }>;
}
export declare class AI4BharatClient {
    private apiUrl;
    constructor(apiUrl: string);
    processText(text: string): Promise<{
        processedText: string;
    }>;
}
export declare class AksharamukhaClient {
    private apiUrl;
    constructor(apiUrl: string);
    transliterate(text: string, sourceScript: string, targetScript: string): Promise<{
        transliteratedText: string;
    }>;
}
