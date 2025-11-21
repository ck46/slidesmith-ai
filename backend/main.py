import os
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from agent import generate_slides_stream

# Load environment variables
load_dotenv()

app = FastAPI(title="SlideSmith AI Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "SlideSmith AI Backend is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.websocket("/ws/generate")
async def websocket_generate(websocket: WebSocket):
    """
    WebSocket endpoint for streaming slide generation.
    
    Client sends: {"prompt": "Create a presentation about..."}
    Server streams: {"type": "thinking", "step": "..."} | {"type": "slides", "slides": [...]}
    """
    await websocket.accept()
    
    try:
        while True:
            # Receive prompt from client
            data = await websocket.receive_text()
            request = json.loads(data)
            
            prompt = request.get("prompt")
            if not prompt:
                await websocket.send_json({
                    "type": "error",
                    "message": "No prompt provided"
                })
                continue
            
            # Get configuration
            use_provider = os.getenv("USE_PROVIDER", "openai")
            model = os.getenv("MODEL_NAME")
            
            # Stream generation
            async for update in generate_slides_stream(prompt, use_provider, model):
                await websocket.send_json(update)
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )
