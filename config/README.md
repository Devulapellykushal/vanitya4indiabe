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

## Backend configuration bootstrap (vanitya-be)

### Where to put API keys
Place secrets in your environment (preferred) or in a local .env file at the project root for development. A sample file is provided at config/env.sample; copy values from there into your .env or environment. Do not commit real secrets.

- SARVAM_API_KEY goes in .env or CI secrets.
- FIREBASE_API_KEY, FIREBASE_PROJECT_ID, GOOGLE_WEB_CLIENT_ID go in .env or CI secrets.
- JWT_SECRET should be a strong, random string and must not be committed.

### Sarvam credits threshold
SARVAM_CREDITS_THRESHOLD defines the minimum remaining credits at which the system will stop using Sarvam and fall back to the next provider in ai.fallback_order.

High-level behavior:
1) Determine the current provider by consulting ai.fallback_order.
2) If provider is sarvam and remaining credits are less than or equal to SARVAM_CREDITS_THRESHOLD, skip sarvam and try the next provider in the list.
3) Continue through the list until a provider is usable. If none are available, use the local provider if present or return a graceful error.

The threshold value is provided via the environment and referenced in config as ai.sarvam.credits_threshold: ${SARVAM_CREDITS_THRESHOLD}. The default sample value is 50.

### AI fallback order
Configured via ai.fallback_order in config/vanitya-config.yml. The default order is:
- sarvam
- ai4bharat
- local

You can reorder to prioritize different providers.

### Storage backend toggle
Set STORAGE_BACKEND to local or s3 in your environment or .env. The config reads this value and selects the appropriate storage backend. When using s3, ensure the usual AWS credentials and bucket configuration are available in the environment.

### Generation policy
Tunable content generation options located under generation_policy in config/vanitya-config.yml:
- max_exercises_per_lang_level: 1
- questions_per_exercise: 10
- audio_probability: 0.2

These defaults can be adjusted to tailor content density and audio usage.

### Windows/WSL notes
All paths in this configuration are relative where applicable. Avoid hardcoding OS-specific absolute paths. The provided defaults work for Windows, WSL, and Linux environments when using environment variables and relative paths.
