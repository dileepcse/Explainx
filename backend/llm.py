"""
LLM Integration for ExplainX
Provides explanation generation using free LLM APIs
"""

import os
import json
import httpx
from typing import Any, Dict, List

from explainx import explainX

# DeepSeek API configuration (free tier available)
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
# DEEPSEEK_API_KEY = "sk-6cf2acd1157f4269acca2967cc858337"

# OpenRouter API (alternative with free models)
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
# OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_API_KEY = "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"

@explainX()
def generate_explanation_prompt(trace: Dict[str, Any]) -> str:
    return f"""You are a senior software engineer. Analyze this function execution and provide a clear, concise explanation to your Junior Software Engineer.

**Function Name:** {trace['function']}
**File:** {trace['file']}
**Inputs:** {json.dumps(trace['inputs'], indent=2)}
**Output:** {json.dumps(trace['output']) if not isinstance(trace['output'], (int, float, str, bool)) else trace['output']}

**Source Code:**
```python
{trace['code']}
```

Provide a brief explanation (2-3 sentences) of:
1. What this function does
2. Why it returned this specific output given the inputs
3. Any important logic or edge cases handled

Keep the explanation simple and understandable for your Junior Software Engineer."""


async def call_deepseek(prompt: str) -> str:
    """Call DeepSeek API for explanation."""
    if not DEEPSEEK_API_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                DEEPSEEK_API_URL,
                headers={
                    "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                    "top_p": 0.9,
                    "frequency_penalty": 0.2,
                    "presence_penalty": 0.2
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"DeepSeek API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"DeepSeek API error: {e}")
    
    return None


async def call_openrouter(prompt: str) -> str:
    """Call OpenRouter API for explanation (supports free models)."""
    if not OPENROUTER_API_KEY:
        return None
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OPENROUTER_API_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "mistralai/mistral-7b-instruct:free",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 1000,
                    "top_p": 0.9,
                    "frequency_penalty": 0.2,
                    "presence_penalty": 0.2
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"OpenRouter API Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"OpenRouter API error: {e}")
    
    return None



def generate_fallback_explanation(trace: Dict[str, Any]) -> str:
    """Generate a simple fallback explanation without LLM."""
    func_name = trace['function']
    inputs = trace['inputs']
    output = trace['output']
    
    input_summary = ", ".join([f"{k}={v}" for k, v in inputs.items()])
    
    return (
        f"The function '{func_name}' was called with inputs: {input_summary}. "
        f"It processed these values and returned: {output}. "
        f"Execution took {trace.get('duration_ms', 0):.2f}ms."
    )



async def explain_single_trace(trace: Dict[str, Any]) -> Dict[str, Any]:
    """Generate explanation for a single trace."""
    prompt = generate_explanation_prompt(trace)
    
    # Try DeepSeek first
    explanation = await call_deepseek(prompt)
    
    # Try OpenRouter as fallback
    if not explanation:
        explanation = await call_openrouter(prompt)
    
    # Use fallback if no LLM available
    if not explanation:
        explanation = generate_fallback_explanation(trace)
    
    trace["explanation"] = explanation
    return trace

async def explain_traces(traces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generate explanations for all traces."""
    explained = []
    for trace in traces:
        explained_trace = await explain_single_trace(trace)
        explained.append(explained_trace)
    return explained


def explain_traces_sync(traces: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Synchronous version - uses fallback explanations only."""
    for trace in traces:
        trace["explanation"] = generate_fallback_explanation(trace)
    return traces


def build_explain_file(traces: List[Dict[str, Any]]) -> str:
    """Build the explainX.txt content from traces."""
    lines = []
    
    lines.append("=" * 60)
    lines.append("ExplainX - Function Execution Report")
    lines.append("=" * 60)
    lines.append("")
    
    for i, trace in enumerate(traces, 1):
        lines.append(f"[{i}] Function: {trace['function']}")
        lines.append(f"    File: {trace['file']}")
        lines.append(f"    Execution Time: {trace.get('duration_ms', 0):.2f}ms")
        lines.append("")
        lines.append("    📥 Inputs:")
        for key, value in trace['inputs'].items():
            lines.append(f"       • {key}: {value}")
        lines.append("")
        lines.append(f"    📤 Output: {trace['output']}")
        lines.append("")
        lines.append("    💡 Explanation:")
        # Wrap explanation text
        explanation = trace.get('explanation', 'No explanation available')
        for line in explanation.split('\n'):
            lines.append(f"       {line}")
        lines.append("")
        lines.append("-" * 60)
        lines.append("")
    
    lines.append("=" * 60)
    lines.append("End of ExplainX Report")
    lines.append("=" * 60)
    
    return "\n".join(lines)


async def chat_about_report(report_text: str, query: str) -> str:
    """Chat with the LLM about the generated report."""
    prompt = f"""You are a helpful AI assistant explaining a technical execution report to a developer.
    
    REPORT CONTEXT:
    {report_text}
    
    USER QUESTION:
    {query}
    
    Answer the user's question based strictly on the report context provided above.
    If the answer is not in the report, say so.
    Be concise and technical."""
    
    # Try DeepSeek first
    response = await call_openrouter(prompt)
    
    # # Try OpenRouter as fallback
    # if not response:
    #     response = await call_deepseek(prompt)
        
    return response or "Sorry, I couldn't process your request at this time."
