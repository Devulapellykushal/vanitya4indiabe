export declare class AksharamukhaClient {
    private apiUrl;
    constructor(apiUrl: string);
    transliterate(text: string, sourceScript: string, targetScript: string, preOptions?: string[], postOptions?: string[]): Promise<any>;
    getAvailableScripts(): Promise<any>;
}
export default AksharamukhaClient;
