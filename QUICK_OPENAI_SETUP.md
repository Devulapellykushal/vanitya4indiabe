# 🚀 Quick OpenAI Setup

## 3-Step Setup

### Step 1: Get Your OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)

### Step 2: Add to Environment File

Edit `config/environments/development.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
```

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C)
# Start again
bun run start:dev
```

## ✅ That's It!

Now when Sarvam AI fails, the system will automatically use OpenAI as fallback.

## 🧪 Test It

```bash
# Generate an exercise (will use OpenAI if Sarvam fails)
curl -X POST http://localhost:3000/api/v1/exercises/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceLanguage": "hi",
    "targetLanguage": "te",
    "difficulty": "beginner",
    "exerciseType": "translation",
    "unitId": "test",
    "count": 1
  }'
```

## 📊 Check Usage

```sql
SELECT * FROM api_usage WHERE provider = 'openai' ORDER BY created_at DESC LIMIT 10;
```

---

**For detailed documentation, see `OPENAI_SETUP.md`**

