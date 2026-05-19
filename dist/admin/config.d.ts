interface VanityaConfig {
    SARVAM_API_URL: string;
    SARVAM_API_KEY: string;
    SARVAM_FREE_CREDITS: number;
    AI4BHARAT_API_URL: string;
    AKSHARAMUKHA_URL: string;
    DEFAULT_SOURCE_LANG: string;
    DEFAULT_TARGET_LANG: string;
    QUESTIONS_JSON_PATH: string;
    STORAGE_BACKEND: 'local' | 's3';
}
export declare class ConfigManager {
    private config;
    constructor();
    private loadConfig;
    private getDefaultConfig;
    getConfig(): VanityaConfig;
    updateConfig(updates: Partial<VanityaConfig>): void;
    private saveConfig;
    reloadConfig(): void;
}
export declare const configManager: ConfigManager;
export declare const configRoutes: {
    getConfig: (req: any, res: any) => Promise<void>;
    updateConfig: (req: any, res: any) => Promise<void>;
    reloadConfig: (req: any, res: any) => Promise<void>;
};
export {};
