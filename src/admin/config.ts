// Admin configuration management module
// IMPORTANT: Add proper authentication and authorization before production use

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CONFIG_PATH = path.resolve(process.cwd(), 'config', 'vanitya-config.yml');

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

export class ConfigManager {
  private config: VanityaConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const fileContents = fs.readFileSync(CONFIG_PATH, 'utf8');
      this.config = yaml.load(fileContents) as VanityaConfig;
      
      // Override with environment variables if present
      if (process.env.SARVAM_API_KEY) {
        this.config.SARVAM_API_KEY = process.env.SARVAM_API_KEY;
      }
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): VanityaConfig {
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

  getConfig(): VanityaConfig {
    if (!this.config) {
      this.loadConfig();
    }
    return this.config!;
  }

  updateConfig(updates: Partial<VanityaConfig>): void {
    // TODO: Add authentication check here
    this.config = { ...this.config!, ...updates };
    this.saveConfig();
  }

  private saveConfig(): void {
    try {
      const yamlStr = yaml.dump(this.config);
      fs.writeFileSync(CONFIG_PATH, yamlStr, 'utf8');
    } catch (error) {
      console.error('Error saving config:', error);
      throw error;
    }
  }

  // Hot reload configuration without restarting
  reloadConfig(): void {
    this.loadConfig();
  }
}

// Singleton instance
export const configManager = new ConfigManager();

// Express route handlers (example)
export const configRoutes = {
  getConfig: async (req: any, res: any) => {
    // TODO: Check admin authentication
    const config = configManager.getConfig();
    res.json(config);
  },

  updateConfig: async (req: any, res: any) => {
    // TODO: Check admin authentication
    try {
      configManager.updateConfig(req.body);
      res.json({ success: true, message: 'Config updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update config' });
    }
  },

  reloadConfig: async (req: any, res: any) => {
    // TODO: Check admin authentication
    configManager.reloadConfig();
    res.json({ success: true, message: 'Config reloaded successfully' });
  },
};