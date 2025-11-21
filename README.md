# SlideSmith AI

An AI-powered presentation generator that creates professional slides with real-time research, image search, and streaming generation.

## Features

- 🤖 **AI-Powered Content Generation** - Uses OpenAI GPT-4 or Anthropic Claude
- 🔍 **Real-Time Web Research** - Integrates with Tavily and Exa for up-to-date information
- 🖼️ **Image Search** - Automatically finds relevant images via Pexels API
- ⚡ **Real-Time Streaming** - WebSocket-based streaming for live updates
- 🎨 **Multiple Slide Types** - Title, bullet points, split layouts, big data, and quotes
- 📊 **Export Options** - Export to PPTX and PDF formats
- ✏️ **Editable Slides** - Full editing capabilities in the Studio view

## Architecture

```
Frontend (React + Vite)
    ↓ WebSocket
Backend (FastAPI)
    ↓ Function Calling
LLM Provider (OpenAI/Anthropic)
    ↓ Tools
Tavily/Exa Search + Pexels Image API
```

## Quick Start with Docker (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- API keys for at least one LLM provider (OpenAI or Anthropic)
- (Optional) API keys for search services (Tavily, Exa, Pexels)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd slidesmith-ai
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: At least one LLM provider
OPENAI_API_KEY=sk-your-key-here
# OR
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional: Search services
TAVILY_API_KEY=tvly-your-key-here
EXA_API_KEY=your-exa-key-here
PEXELS_API_KEY=your-pexels-key-here

# LLM Configuration
USE_PROVIDER=openai
MODEL_NAME=gpt-4o

# Frontend Configuration
FRONTEND_URL=http://localhost:80
VITE_BACKEND_WS_URL=ws://localhost:8001/ws/generate
```

### 3. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8001
- **Health Check**: http://localhost:8001/health

### 4. Stop the Services

```bash
docker-compose down
```

## Development Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your API keys

# Run backend
python main.py
```

The backend will run on `http://localhost:8001`

### Frontend Setup

```bash
# Install dependencies
yarn install

# Create .env file (optional, defaults to localhost:8001)
echo "VITE_BACKEND_WS_URL=ws://localhost:8001/ws/generate" > .env

# Run development server
yarn dev
```

The frontend will run on `http://localhost:5173`

## Getting API Keys

### Required (at least one)

1. **OpenAI**: https://platform.openai.com/api-keys
   - Recommended models: `gpt-4o`, `gpt-4-turbo`
2. **Anthropic**: https://console.anthropic.com/
   - Recommended models: `claude-3-5-sonnet-latest`

### Optional (for enhanced features)

3. **Tavily** (Web Search): https://tavily.com/
   - Free tier available
4. **Exa** (Web Search): https://exa.ai/
   - Alternative to Tavily
5. **Pexels** (Image Search): https://www.pexels.com/api/
   - Free API key available
   - Falls back to Lorem Picsum if not configured

## Docker Commands

### Build individual services

```bash
# Build backend only
docker-compose build backend

# Build frontend only
docker-compose build frontend
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove images as well
docker-compose down --rmi all
```

## Environment Variables

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Yes* | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes* | - |
| `TAVILY_API_KEY` | Tavily search API key | No | - |
| `EXA_API_KEY` | Exa search API key | No | - |
| `PEXELS_API_KEY` | Pexels image API key | No | - |
| `USE_PROVIDER` | LLM provider (`openai` or `anthropic`) | No | `openai` |
| `MODEL_NAME` | Model name to use | No | `gpt-4o` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `http://localhost:5173` |

*At least one LLM provider key is required

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_BACKEND_WS_URL` | WebSocket URL for backend | No | `ws://localhost:8001/ws/generate` |

## Production Deployment

### Docker Compose Production

1. Update `.env` with production values
2. Set `FRONTEND_URL` to your production domain
3. Update `VITE_BACKEND_WS_URL` to use `wss://` for secure WebSocket
4. Use a reverse proxy (nginx/traefik) for SSL termination

### Example Production `.env`

```env
OPENAI_API_KEY=sk-prod-key-here
USE_PROVIDER=openai
MODEL_NAME=gpt-4o
FRONTEND_URL=https://yourdomain.com
VITE_BACKEND_WS_URL=wss://yourdomain.com/ws/generate
```

### Security Considerations

- Never commit `.env` files to version control
- Use secrets management in production (Docker secrets, AWS Secrets Manager, etc.)
- Enable HTTPS/WSS in production
- Consider adding authentication/rate limiting
- Use environment-specific API keys

## Troubleshooting

### Backend Issues

**Backend won't start:**
- Check that API keys are set in `.env`
- Verify Python dependencies: `pip list`
- Check logs: `docker-compose logs backend`

**WebSocket connection fails:**
- Ensure backend is running on port 8001
- Check CORS settings match frontend URL
- Verify firewall/network settings

### Frontend Issues

**Frontend can't connect to backend:**
- Verify `VITE_BACKEND_WS_URL` is correct
- Check backend health: `curl http://localhost:8001/health`
- Ensure backend is accessible from frontend container

**Build fails:**
- Clear node_modules: `rm -rf node_modules && yarn install`
- Check Node.js version (requires Node 18+)

### Docker Issues

**Port already in use:**
- Change ports in `docker-compose.yml`
- Or stop conflicting services

**Build cache issues:**
- Rebuild without cache: `docker-compose build --no-cache`

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

### Testing WebSocket Connection

```python
import asyncio
import websockets
import json

async def test():
    uri = "ws://localhost:8001/ws/generate"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({"prompt": "Test presentation"}))
        
        while True:
            message = await websocket.recv()
            print(json.loads(message))

asyncio.run(test())
```

## Project Structure

```
slidesmith-ai/
├── backend/
│   ├── agent.py          # LLM agent logic
│   ├── tools.py          # Search and image tools
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── Dockerfile        # Backend container
├── src/
│   ├── components/       # React components
│   │   ├── Lab/         # Chat interface
│   │   ├── Slides/      # Slide components
│   │   └── Studio/      # Slide editor
│   ├── hooks/           # React hooks
│   └── services/        # Export services
├── docker-compose.yml    # Docker orchestration
├── Dockerfile           # Frontend container
├── nginx.conf           # Nginx configuration
└── .env.example         # Environment template
```

## License

[Add your license here]

## Contributing

[Add contributing guidelines here]

## Support

For issues and questions, please open an issue on GitHub.
