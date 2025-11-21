import os
import json
from typing import List, Dict, Any, AsyncGenerator
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from tools import search_web, search_images, format_search_results, TOOLS

# Initialize clients
openai_client = None
anthropic_client = None

if os.getenv("OPENAI_API_KEY"):
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

if os.getenv("ANTHROPIC_API_KEY"):
    anthropic_client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


SYSTEM_PROMPT = """You are SlideSmith AI, an expert presentation designer and researcher.

Your task is to create professional, visually appealing presentation slides based on user requests.

Process:
1. Analyze the user's request to understand the topic and scope
2. Use search_web to research key facts, statistics, and information
3. **IMPORTANT**: Use search_images to find relevant, high-quality images for slides
   - Search for background images for the title slide
   - Search for visual content for split slides
   - Use descriptive queries like "modern technology abstract" or "business team collaboration"
4. Design 4-6 slides with the following structure:
   - Title slide (with backgroundImage URL from search_images)
   - 2-3 content slides (bullet points, split layout with imageUrl, or big data)
   - Closing slide (quote or summary)

For each slide, provide:
- type: 'title' | 'bullet' | 'split' | 'bigdata' | 'quote'
- title: Main heading
- Additional fields based on type:
  * title: subtitle, backgroundImage (URL from search_images - ALWAYS search for this!)
  * bullet: items (array of strings)
  * split: text, imageUrl (URL from search_images - ALWAYS search for this!)
  * bigdata: number, caption
  * quote: quote, author

**CRITICAL**: Always call search_images for title slides and split slides to get real image URLs. 
Don't leave imageUrl or backgroundImage empty - search for appropriate images!

Return your response as a JSON object with a "slides" array. Be concise but informative. Use researched facts and data."""


async def generate_slides_stream(
    prompt: str,
    use_provider: str = "openai",
    model: str = None
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Generate slides using LLM with tool calling.
    Streams thinking steps and final slides.
    """
    if use_provider == "openai" and openai_client:
        async for update in generate_with_openai(prompt, model):
            yield update
    elif use_provider == "anthropic" and anthropic_client:
        async for update in generate_with_anthropic(prompt, model):
            yield update
    else:
        yield {"type": "error", "message": "No LLM provider configured"}


async def generate_with_openai(prompt: str, model: str = None) -> AsyncGenerator[Dict[str, Any], None]:
    """Generate slides using OpenAI with function calling."""
    if not model:
        model = os.getenv("MODEL_NAME", "gpt-5.1")
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ]
    
    # Yield initial thinking state
    yield {"type": "thinking", "step": "Analyzing request..."}
    
    try:
        # First completion - let model decide to use tools
        response = await openai_client.chat.completions.create(
            model=model,
            messages=messages,
            tools=TOOLS,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        
        # Handle tool calls
        if message.tool_calls:
            messages.append(message)
            
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if function_name == "search_web":
                    yield {"type": "thinking", "step": f"Searching: {function_args['query']}..."}
                    results = await search_web(**function_args)
                    formatted_results = format_search_results(results)
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": formatted_results
                    })
                    
                    yield {"type": "thinking", "step": "Synthesizing information..."}
                
                elif function_name == "search_images":
                    yield {"type": "thinking", "step": f"Finding images: {function_args['query']}..."}
                    image_urls = await search_images(**function_args)
                    
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(image_urls)
                    })
            
            # Second completion with tool results
            yield {"type": "thinking", "step": "Designing slides..."}
            
            response = await openai_client.chat.completions.create(
                model=model,
                messages=messages,
                response_format={"type": "json_object"}
            )
            
            content = response.choices[0].message.content
        else:
            content = message.content
        
        # Parse and yield slides
        try:
            result = json.loads(content)
            slides = result.get("slides", [])
            
            yield {"type": "slides", "slides": slides}
            yield {"type": "complete"}
            
        except json.JSONDecodeError:
            yield {"type": "error", "message": "Failed to parse LLM response"}
    
    except Exception as e:
        yield {"type": "error", "message": str(e)}


async def generate_with_anthropic(prompt: str, model: str = None) -> AsyncGenerator[Dict[str, Any], None]:
    """Generate slides using Anthropic Claude."""
    if not model:
        model = os.getenv("MODEL_NAME", "claude-4.5-sonnet")
    
    # Similar implementation for Claude
    # For now, yield a placeholder
    yield {"type": "error", "message": "Anthrop Claude integration coming soon"}
