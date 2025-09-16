# Vanitya Configuration Guide

## Overview
Vanitya uses a dual configuration approach:
- `vanitya-config.yml` - Main configuration file (human-editable)
- `.env` - Secret keys and sensitive data

## Setup Instructions

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your actual API keys.

2. **Edit Configuration**
   Open `config/vanitya-config.yml` and modify settings as needed.

## Configuration Options

### API Settings
- `SARVAM_API_URL` - Sarvam AI API endpoint
- `SARVAM_API_KEY` - Your Sarvam API key (store in .env)
- `SARVAM_FREE_CREDITS` - Available free credits (default: 900)
- `AI4BHARAT_API_URL` - AI4Bharat API endpoint
- `AKSHARAMUKHA_URL` - Aksharamukha transliteration service URL

### Language Settings
- `DEFAULT_SOURCE_LANG` - Default source language code (e.g., 'hi' for Hindi)
- `DEFAULT_TARGET_LANG` - Default target language code (e.g., 'te' for Telugu)

### Storage Settings
- `QUESTIONS_JSON_PATH` - Path to questions database
- `STORAGE_BACKEND` - Storage type ('local' or 's3')

## Hot Reload Configuration

The backend supports hot-reloading configuration without restart:

1. **Via Admin API** (when implemented)
   ```
   POST /admin/config/reload
   ```

2. **Programmatically**
   ```typescript
   import { configManager } from './src/admin/config';
   configManager.reloadConfig();
   ```

## Security Notes
- Never commit `.env` file to version control
- Add proper authentication to admin config endpoints before production
- Use environment variables for all sensitive data