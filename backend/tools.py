import os
from typing import List, Dict, Any, Optional
import json
from tavily import TavilyClient
from exa_py import Exa
import httpx

# Initialize clients
tavily_client = None
exa_client = None

if os.getenv("TAVILY_API_KEY"):
    tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

if os.getenv("EXA_API_KEY"):
    exa_client = Exa(api_key=os.getenv("EXA_API_KEY"))


async def search_web(query: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search the web using Tavily or Exa.
    Returns a list of search results with title, url, and content.
    """
    results = []
    
    # Try Tavily first
    if tavily_client:
        try:
            response = tavily_client.search(
                query=query,
                max_results=max_results,
                search_depth="advanced"
            )
            
            for result in response.get("results", []):
                results.append({
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result.get("content", ""),
                    "score": result.get("score", 0)
                })
            
            return results
        except Exception as e:
            print(f"Tavily search error: {e}")
    
    # Fallback to Exa if Tavily unavailable
    if exa_client and not results:
        try:
            response = exa_client.search_and_contents(
                query,
                num_results=max_results,
                text=True
            )
            
            for result in response.results:
                results.append({
                    "title": result.title,
                    "url": result.url,
                    "content": result.text[:500] if result.text else "",
                    "score": result.score if hasattr(result, 'score') else 0
                })
            
            return results
        except Exception as e:
            print(f"Exa search error: {e}")
    
    return results


async def search_images(query: str, max_results: int = 3) -> List[str]:
    """
    Search for images using Pexels API or Picsum as fallback.
    Returns a list of image URLs suitable for presentations.
    """
    pexels_api_key = os.getenv("PEXELS_API_KEY")
    
    # Try Pexels API if available
    if pexels_api_key:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.pexels.com/v1/search",
                    headers={"Authorization": pexels_api_key},
                    params={
                        "query": query,
                        "per_page": max_results,
                        "orientation": "landscape"  # Better for presentations
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    photos = data.get("photos", [])
                    if photos:
                        return [
                            photo["src"]["large"]  # High quality landscape image
                            for photo in photos[:max_results]
                        ]
        except Exception as e:
            print(f"Pexels API error: {e}")
    
    # Fallback: Use Picsum (Lorem Picsum) for random high-quality placeholders
    # This doesn't require an API key and provides good quality images
    try:
        # Generate seed based on query for consistency
        seed = abs(hash(query)) % 1000
        images = []
        for i in range(max_results):
            # 1200x800 is good for presentations (16:9-ish aspect ratio)
            img_url = f"https://picsum.photos/seed/{seed + i}/1200/800"
            images.append(img_url)
        return images
    except Exception as e:
        print(f"Fallback image generation error: {e}")
    
    # Last resort: return a simple placeholder
    return [f"https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text={query.replace(' ', '+')}"]


def format_search_results(results: List[Dict[str, Any]]) -> str:
    """
    Format search results for LLM consumption.
    """
    if not results:
        return "No search results found."
    
    formatted = []
    for i, result in enumerate(results, 1):
        formatted.append(
            f"{i}. {result['title']}\n"
            f"   URL: {result['url']}\n"
            f"   Content: {result['content'][:300]}...\n"
        )
    
    return "\n".join(formatted)


# Tool definitions for function calling
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_web",
            "description": "Search the web for information about a topic. Use this to find facts, statistics, and current information.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default 5)",
                        "default": 5
                    }
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_images",
            "description": "Search for relevant images for a slide. Returns image URLs.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Description of the image needed"
                    },
                    "max_results": {
                        "type": "integer",
                        "description": "Number of images to return (default 3)",
                        "default": 3
                    }
                },
                "required": ["query"]
            }
        }
    }
]
