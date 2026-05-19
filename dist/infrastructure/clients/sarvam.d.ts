export declare class SarvamAPIClient {
    private apiUrl;
    private apiKey;
    private freeCredits;
    constructor(apiUrl: string, apiKey: string, freeCredits?: number);
    translate(text: string, sourceLang: string, targetLang: string): Promise<any>;
    textToSpeech(text: string, language: string): Promise<any>;
    getRemainingCredits(): number;
}
export default SarvamAPIClient;
