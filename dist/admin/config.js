"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRoutes = exports.configManager = exports.ConfigManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const js_yaml_1 = require("js-yaml");
const dotenv_1 = require("dotenv");
dotenv_1.default.config();
const CONFIG_PATH = path_1.default.resolve(process.cwd(), 'config', 'vanitya-config.yml');
class ConfigManager {
    constructor() {
        this.config = null;
        this.loadConfig();
    }
    loadConfig() {
        try {
            const fileContents = fs_1.default.readFileSync(CONFIG_PATH, 'utf8');
            this.config = js_yaml_1.default.load(fileContents);
            if (process.env.SARVAM_API_KEY) {
                this.config.SARVAM_API_KEY = process.env.SARVAM_API_KEY;
            }
        }
        catch (error) {
            console.error('Error loading config:', error);
            this.config = this.getDefaultConfig();
        }
    }
    getDefaultConfig() {
        return {
            SARVAM_API_URL: 'https://api.sarvam.ai/v1',
            SARVAM_API_KEY: '__REPLACE__',
            SARVAM_FREE_CREDITS: 900,
            AI4BHARAT_API_URL: 'https://api.ai4bharat.org',
            AKSHARAMUKHA_URL: 'https://aksharamukha.example',
            DEFAULT_SOURCE_LANG: 'hi',
            DEFAULT_TARGET_LANG: 'te',
            QUESTIONS_JSON_PATH: 'data/sample_questions.json',
            STORAGE_BACKEND: 'local',
        };
    }
    getConfig() {
        if (!this.config) {
            this.loadConfig();
        }
        return this.config;
    }
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
    }
    saveConfig() {
        try {
            const yamlStr = js_yaml_1.default.dump(this.config);
            fs_1.default.writeFileSync(CONFIG_PATH, yamlStr, 'utf8');
        }
        catch (error) {
            console.error('Error saving config:', error);
            throw error;
        }
    }
    reloadConfig() {
        this.loadConfig();
    }
}
exports.ConfigManager = ConfigManager;
exports.configManager = new ConfigManager();
exports.configRoutes = {
    getConfig: async (req, res) => {
        const config = exports.configManager.getConfig();
        res.json(config);
    },
    updateConfig: async (req, res) => {
        try {
            exports.configManager.updateConfig(req.body);
            res.json({ success: true, message: 'Config updated successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: 'Failed to update config' });
        }
    },
    reloadConfig: async (req, res) => {
        exports.configManager.reloadConfig();
        res.json({ success: true, message: 'Config reloaded successfully' });
    },
};
//# sourceMappingURL=config.js.map