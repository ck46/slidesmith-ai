# SlideSmith AI Backend

Backend service for AI-powered presentation generation with real-time streaming.

## Features

- 🤖 AI-powered slide generation using GPT-5.1 or Claude 4.5
- 🔍 Web search integration (Tavily/Exa)
- 🖼️ Automatic image search and retrieval (Pexels/Picsum)
- ⚡ Real-time WebSocket streaming
- 🎨 Support for multiple slide types

## API Keys Setup

### Required
- **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
  - Used for GPT-5.1 slide generation

### Recommended
- **Tavily API Key**: Get from [Tavily](https://tavily.com)
  - Free tier: 1000 requests/month
  - Used for web research
  
- **Pexels API Key**: Get from [Pexels API](https://www.pexels.com/api/)
  - **Completely FREE** with unlimited requests
  - Provides high-quality presentation images
  - Without API key: Falls back to Picsum placeholder images

### Optional
- **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
  - For Claude 4.5 Sonnet
- **Exa API Key**: Get from [Exa.ai](https://exa.ai)
  - Alternative search engine

## Getting a Pexels API Key (FREE)

1. Go to https://www.pexels.com/api/
2. Click "Get Started"
3. Sign up for a free account
4. Your API key will be displayed immediately
5. Add it to your `.env` file as `PEXELS_API_KEY`

**Note**: Even without Pexels, images will work using Picsum fallback!

## Installation

1. **Install dependencies with uv**:
```bash
cd backend
uv pip install -r requirements.txt
```

2. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

3. **Run the server**:
```bash
source .venv/bin/activate  # if using virtual env
python main.py
```

The backend will run on `http://localhost:8001`

## API Endpoints

- `GET /` - Health check
- `GET /health` - Detailed health status
- `WebSocket /ws/generate` - Stream slide generation

## WebSocket Usage

Connect to `ws://localhost:8001/ws/generate` and send:

```json
{
  "prompt": "Create a presentation about AI in healthcare"
}
```

Server will stream responses:
```json
{"type": "thinking", "step": "Analyzing request..."}
{"type": "thinking", "step": "Searching: AI healthcare..."}
{"type": "thinking", "step": "Finding images: medical technology..."}
{"type": "slides", "slides": [...]}
{"type": "complete"}
```

## Environment Variables

```env
# Required
OPENAI_API_KEY=sk-...

# Recommended
TAVILY_API_KEY=tvly-...
PEXELS_API_KEY=...

# Optional
ANTHROPIC_API_KEY=sk-ant-...
EXA_API_KEY=...

# Configuration
USE_PROVIDER=openai
MODEL_NAME=gpt-5.1
FRONTEND_URL=http://localhost:5173
```

## Image Search

The backend supports three tiers of image search:

1. **Pexels API** (if API key provided) - Best quality, curated photos
2. **Picsum** (automatic fallback) - Good quality placeholder images
3. **Via Placeholder** (last resort) - Simple colored placeholders

Images are automatically searched for:
- Title slide backgrounds
- Split slide media content
- Any visual elements needed

## Troubleshooting

**Images not showing up?**
- Check that backend is running on port 8001
- Verify WebSocket connection in browser console
- Images work without Pexels API key (uses fallback)

**Search not working?**
- Add Tavily API key for better research results
- Web search is optional but recommended

**Backend not connecting?**
- Check port 8001 is not in use
- Verify `.env` file has OPENAI_API_KEY
- Check CORS settings if frontend on different port
