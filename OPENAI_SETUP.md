# 🤖 OpenAI API Integration Guide

## Overview

OpenAI API is now integrated as the **fallback provider** for the Vanitya AI service. When Sarvam AI fails, the system automatically falls back to OpenAI for:

1. **Exercise Generation** - Using GPT-4o-mini (configurable)
2. **Text-to-Speech (TTS)** - Using OpenAI TTS API
3. **Speech-to-Text (STT)** - Using OpenAI Whisper API

---

## 🔑 Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-...`)

### 2. Configure Environment Variables

Add your OpenAI API key to your environment file:

**Development** (`config/environments/development.env`):
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
```

**Production** (`config/environments/production.env`):
```env
OPENAI_API_KEY=sk-your-production-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
```

### 3. Optional: Use `.env` file

You can also add it to your root `.env` file:
```env
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=tts-1
```

---

## 📋 Configuration Options

### Model Selection

**For Exercise Generation:**
- `gpt-4o-mini` (default) - Fast, cost-effective
- `gpt-4o` - More capable, higher cost
- `gpt-3.5-turbo` - Legacy, cheaper option

**For TTS:**
- `tts-1` (default) - Standard quality, faster
- `tts-1-hd` - Higher quality, slower

**For STT:**
- `whisper-1` (fixed) - OpenAI's speech recognition model

---

## 🔄 How It Works

### Fallback Chain

```
1. Try Sarvam AI (Primary)
   ↓ (if fails)
2. Try OpenAI API (Fallback)
   ↓ (if fails)
3. Use Local Seed Data (Final Fallback)
```

### Exercise Generation Flow

```typescript
// 1. Sarvam AI fails
try {
  await sarvamClient.post('/generate', ...);
} catch (error) {
  // 2. Fallback to OpenAI
  await openaiClient.post('/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [{
      role: 'system',
      content: 'You are an expert language learning exercise generator...'
    }, {
      role: 'user',
      content: prompt
    }]
  });
}
```

### TTS Generation Flow

```typescript
// 1. Sarvam TTS fails
try {
  await sarvamClient.post('/tts', ...);
} catch (error) {
  // 2. Fallback to OpenAI TTS
  await openaiClient.post('/audio/speech', {
    model: 'tts-1',
    input: text,
    voice: 'alloy', // or echo, fable, onyx, nova, shimmer
    response_format: 'mp3'
  });
}
```

### STT Flow

```typescript
// 1. Sarvam STT fails
try {
  await sarvamClient.post('/stt', ...);
} catch (error) {
  // 2. Fallback to OpenAI Whisper
  await openaiClient.post('/audio/transcriptions', {
    file: audioFile,
    model: 'whisper-1',
    language: 'hi' // or te, ta, kn, ml, etc.
  });
}
```

---

## 💰 Cost Considerations

### OpenAI Pricing (as of 2024)

**GPT-4o-mini:**
- Input: $0.15 / 1M tokens
- Output: $0.60 / 1M tokens

**TTS:**
- tts-1: $15.00 / 1M characters
- tts-1-hd: $30.00 / 1M characters

**Whisper (STT):**
- $0.006 / minute of audio

### Cost Optimization Tips

1. **Use GPT-4o-mini** instead of GPT-4o for exercise generation
2. **Use tts-1** instead of tts-1-hd for TTS (unless quality is critical)
3. **Cache results** to avoid regenerating same exercises
4. **Set usage limits** to prevent unexpected costs
5. **Monitor usage** via OpenAI dashboard

---

## 🧪 Testing

### Test Exercise Generation with OpenAI

```bash
# Set your API key
export OPENAI_API_KEY=sk-your-key-here

# Test via API
curl -X POST http://localhost:3000/api/v1/exercises/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceLanguage": "hi",
    "targetLanguage": "te",
    "difficulty": "beginner",
    "exerciseType": "translation",
    "unitId": "unit_1",
    "count": 1
  }'
```

### Verify Fallback is Working

1. **Disable Sarvam API** (set invalid key)
2. **Make a request** to generate exercises
3. **Check logs** - should see OpenAI API calls
4. **Check database** - `api_usage` table should show `provider: 'openai'`

---

## 📊 Monitoring Usage

### Check API Usage in Database

```sql
SELECT 
  provider,
  endpoint,
  COUNT(*) as request_count,
  SUM(credits_used) as total_credits,
  AVG(response_status) as avg_status
FROM api_usage
WHERE provider = 'openai'
GROUP BY provider, endpoint;
```

### OpenAI Dashboard

Monitor usage at: https://platform.openai.com/usage

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all keys
3. **Rotate keys regularly**
4. **Set usage limits** in OpenAI dashboard
5. **Monitor for unusual activity**

---

## 🐛 Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Add `OPENAI_API_KEY` to your environment file

### Issue: "Rate limit exceeded"
**Solution**: 
- Check OpenAI dashboard for rate limits
- Implement request queuing
- Add retry logic with exponential backoff

### Issue: "Invalid API key"
**Solution**:
- Verify key starts with `sk-`
- Check key hasn't been revoked
- Ensure no extra spaces in environment variable

### Issue: "Model not found"
**Solution**:
- Verify model name is correct
- Check if you have access to the model
- Use `gpt-4o-mini` as default (most accessible)

---

## 📝 Notes

- **OpenAI is fallback only** - Sarvam AI is still primary
- **Local seed data** is final fallback if OpenAI also fails
- **All usage is tracked** in `api_usage` table
- **Costs are per-request** - monitor usage carefully
- **AI4Bharat integration** can be added later as additional fallback

---

## 🚀 Next Steps

1. ✅ Add OpenAI API key to environment
2. ✅ Test exercise generation
3. ✅ Test TTS generation
4. ✅ Test STT transcription
5. ⏳ Set up audio storage for TTS (currently returns placeholder URL)
6. ⏳ Add AI4Bharat as additional fallback (when available)

---

**Status**: ✅ OpenAI integration complete and ready to use!

