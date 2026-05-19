export declare class AI4BharatClient {
    private apiUrl;
    private apiKey?;
    constructor(apiUrl: string, apiKey?: string);
    translateText(text: string, sourceLang: string, targetLang: string): Promise<any>;
    detectLanguage(text: string): Promise<any>;
}
export default AI4BharatClient;
