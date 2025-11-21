# SlideSmith AI - Complete Setup Guide

## Overview
SlideSmith AI is now a fully functional AI-powered presentation generator with:
- **Real AI Backend** powered by OpenAI/Anthropic
- **Web Search** using Tavily and Exa
- **Image Search** for slide media
- **Real-time Streaming** via WebSocket

## Quick Start

### 1. Backend Setup

```bash
cd examples/slidesmith-ai/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Edit .env and add your API keys:
# - OPENAI_API_KEY
# - TAVILY_API_KEY

# Run backend
python main.py
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd examples/slidesmith-ai

# Install dependencies (if not already done)
yarn install

# Run frontend
yarn dev
```

The frontend will run on `http://localhost:5173`

## Configuration

### Backend (.env)
```env
OPENAI_API_KEY=your_openai_key_here
TAVILY_API_KEY=your_tavily_key_here
USE_PROVIDER=openai
MODEL_NAME=gpt-4o
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_BACKEND_WS_URL=ws://localhost:8000/ws/generate
```

## Getting API Keys

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Tavily**: https://tavily.com/ (free tier available)
3. **Exa** (optional): https://exa.ai/

## Features

- ✅ Real AI-powered content generation
- ✅ Web search for facts and statistics
- ✅ Image search for slide media
- ✅ Real-time streaming updates
- ✅ Multiple themes (Corporate, Cyber, Editorial)
- ✅ Export to PPTX and PDF
- ✅ Editable slides

## Architecture

```
Frontend (React + Vite)
    ↓ WebSocket
Backend (FastAPI)
    ↓ Function Calling
OpenAI GPT-4
    ↓ Tools
Tavily Search + Image APIs
```

## Troubleshooting

**Frontend shows "Connecting to AI...":**
- Make sure backend is running on port 8000
- Check backend logs for errors

**Backend errors:**
- Verify API keys are set in backend/.env
- Check dependencies are installed: `pip list`

**No search results:**
- Verify TAVILY_API_KEY is valid
- Check backend logs for API errors

## Development

### Backend Development
```bash
cd backend
uvicorn main:app --reload --log-level debug
```

### Frontend Development
```bash
yarn dev
```

### Testing WebSocket
```python
import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8000/ws/generate"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"prompt": "Test presentation"}))
        
        while True:
            message = await websocket.recv()
            print(json.loads(message))

asyncio.run(test())
```

## Production Deployment

1. Set environment variables in production
2. Use a process manager (PM2, systemd) for backend
3. Build frontend: `yarn build`
4. Serve frontend with nginx or similar
5. Use wss:// for WebSocket in production
6. Consider rate limiting and authentication

## Next Steps

- Add Njira-AI governance for output validation
- Implement caching for search results
- Add user authentication
- Save presentations to database
- Add collaboration features
