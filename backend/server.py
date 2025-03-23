"""
ANUS API Server - FastAPI backend for Autonomous Networked Utility System
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Union
import uvicorn
import json
import os
import sys
import logging
import traceback
import yaml

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config file path
CONFIG_FILE = "config.yaml"

# Initialize app
app = FastAPI(
    title="ANUS API",
    description="Autonomous Networked Utility System API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load configuration
def load_config():
    try:
        with open(CONFIG_FILE, 'r') as file:
            return yaml.safe_load(file)
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        return {}

# Save configuration
def save_config(config):
    try:
        with open(CONFIG_FILE, 'w') as file:
            yaml.dump(config, file, default_flow_style=False)
        return True
    except Exception as e:
        logger.error(f"Error saving config: {e}")
        return False

# Fix the configuration for the ANUS orchestrator
def fix_config_for_orchestrator(config):
    """Make a copy of the config with the tools in the expected format for the orchestrator"""
    if not config:
        return {}
        
    fixed_config = config.copy()
    
    # Fix tools configuration
    if 'tools' in fixed_config:
        tools_config = fixed_config['tools']
        
        # If tools is a list, convert it to the expected dict format
        if isinstance(tools_config, list):
            fixed_config['tools'] = {
                "enabled": tools_config  # The orchestrator expects a dict with "enabled" key containing a list
            }
    
    return fixed_config

# Try to initialize the agent orchestrator, but handle missing modules gracefully
agent_available = False
orchestrator = None
simulation_mode = True  # Default to simulation mode

try:
    # Try to import the agent
    from anus.core.orchestrator import AgentOrchestrator
    
    # Load config and fix it for the orchestrator
    config = load_config()
    fixed_config = fix_config_for_orchestrator(config)
    
    # Write the fixed config to a temporary file
    temp_config_file = "temp_config.yaml"
    with open(temp_config_file, 'w') as file:
        yaml.dump(fixed_config, file, default_flow_style=False)
    
    # Initialize orchestrator with fixed config
    orchestrator = AgentOrchestrator(config_path=temp_config_file)
    
    # Clean up temp file
    try:
        os.remove(temp_config_file)
    except:
        pass
    
    # Check API keys to determine if real mode is possible
    api_keys_available = False
    if config and 'ai_providers' in config:
        for provider, provider_config in config['ai_providers'].items():
            if provider_config.get('api_key'):
                api_keys_available = True
                break
    
    if api_keys_available:
        agent_available = True
        simulation_mode = False
        logger.info("ANUS agent initialized successfully with API keys")
    else:
        logger.info("ANUS agent initialized but no API keys found - using simulation mode")
except ImportError as e:
    logger.warning(f"Could not import agent modules: {e}")
    logger.warning("Running in simulated mode")
except Exception as e:
    logger.error(f"Error initializing agent: {e}")
    logger.error(traceback.format_exc())
    logger.warning("Running in simulated mode")

# Request/Response models
class TaskRequest(BaseModel):
    prompt: str
    mode: str = "single"  # "single" or "multi"
    context: Optional[Dict[str, Any]] = None
    
class TaskResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[Union[Dict[str, Any], str, None]] = None
    
class StatusResponse(BaseModel):
    status: str
    result: Optional[Union[Dict[str, Any], str, None]] = None

class APIKeyRequest(BaseModel):
    provider: str
    api_key: str
    
class APIKeyResponse(BaseModel):
    provider: str
    status: str
    message: str

class ConfigResponse(BaseModel):
    config: Dict[str, Any]
    
# In-memory task storage (replace with a database in production)
tasks = {}

@app.get("/")
async def root():
    return {
        "message": "ANUS API is running", 
        "agent_available": agent_available,
        "simulation_mode": simulation_mode
    }

@app.get("/api/test")
async def test_endpoint():
    """Test endpoint to verify the API is working"""
    return {
        "status": "success",
        "message": "ANUS API test endpoint is working",
        "agent_status": "available" if agent_available and not simulation_mode else "simulated",
        "simulation_mode": simulation_mode
    }

@app.get("/api/config", response_model=ConfigResponse)
async def get_config():
    """Get the current configuration (with API keys masked)"""
    try:
        config = load_config()
        
        # Mask API keys for security
        if "ai_providers" in config:
            for provider in config["ai_providers"]:
                if "api_key" in config["ai_providers"][provider]:
                    api_key = config["ai_providers"][provider]["api_key"]
                    if api_key:
                        # Mask all but the last 4 characters
                        config["ai_providers"][provider]["api_key"] = "•" * (len(api_key) - 4) + api_key[-4:] if len(api_key) > 4 else "•" * len(api_key)
                    else:
                        config["ai_providers"][provider]["api_key"] = ""
        
        return {"config": config}
    except Exception as e:
        logger.error(f"Error getting config: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting configuration: {str(e)}")

@app.post("/api/config/apikey", response_model=APIKeyResponse)
async def set_api_key(request: APIKeyRequest):
    """Set an API key for a provider"""
    try:
        config = load_config()
        
        if "ai_providers" not in config:
            config["ai_providers"] = {}
            
        if request.provider not in config["ai_providers"]:
            config["ai_providers"][request.provider] = {}
            
        config["ai_providers"][request.provider]["api_key"] = request.api_key
        
        if save_config(config):
            # Reinitialize the agent if it's available
            global orchestrator, agent_available, simulation_mode
            try:
                # Prepare tools again
                tool_list = prepare_tools(config)
                
                # Check if we have a valid API key now
                api_key_valid = bool(request.api_key.strip())
                
                if api_key_valid:
                    # Try to reinitialize with the new API key
                    try:
                        orchestrator = AgentOrchestrator(config_path=CONFIG_FILE)
                        agent_available = True
                        simulation_mode = False
                        logger.info(f"Reinitialized agent with new API key for {request.provider}")
                    except Exception as e:
                        logger.error(f"Error reinitializing agent: {e}")
                        # If reinitialization fails, keep the old orchestrator
                        pass
                
                return {
                    "provider": request.provider,
                    "status": "success",
                    "message": f"API key for {request.provider} has been updated"
                }
            except Exception as e:
                logger.error(f"Error after saving API key: {e}")
                # Don't fail the request even if reinitialization fails
                return {
                    "provider": request.provider,
                    "status": "success",
                    "message": f"API key for {request.provider} has been updated, but agent reinitialization failed"
                }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to save configuration")
    except Exception as e:
        logger.error(f"Error setting API key: {e}")
        raise HTTPException(status_code=500, detail=f"Error setting API key: {str(e)}")

@app.post("/api/task", response_model=TaskResponse)
async def create_task(task_request: TaskRequest, background_tasks: BackgroundTasks):
    try:
        # Generate a simple task ID
        task_id = f"task_{len(tasks) + 1}"
        
        # Store task in memory
        tasks[task_id] = {
            "status": "pending",
            "result": None,
            "request": task_request.dict()
        }
        
        # If orchestrator is not available or we're in simulation mode, simulate task
        if not agent_available or simulation_mode:
            logger.info(f"Simulating task: {task_request.prompt}")
            
            # Store simulated task with slight delay for realism
            background_tasks.add_task(simulate_task_execution, task_id, task_request.prompt)
            
            return TaskResponse(
                task_id=task_id,
                status="pending",
                result=None
            )
        
        # Execute task in background if orchestrator is available
        background_tasks.add_task(
            execute_task, 
            task_id=task_id,
            prompt=task_request.prompt,
            mode=task_request.mode,
            context=task_request.context
        )
        
        return TaskResponse(
            task_id=task_id,
            status="pending",
            result=None
        )
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating task: {str(e)}")

@app.get("/api/task/{task_id}", response_model=StatusResponse)
async def get_task_status(task_id: str):
    try:
        if task_id not in tasks:
            raise HTTPException(status_code=404, detail="Task not found")
            
        return StatusResponse(
            status=tasks[task_id]["status"],
            result=tasks[task_id]["result"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error retrieving task status: {str(e)}")

async def simulate_task_execution(task_id: str, prompt: str):
    """Simulate task execution with a delay for realism"""
    import asyncio
    import random
    
    # Wait 1-3 seconds to simulate processing
    await asyncio.sleep(random.uniform(1, 3))
    
    # Create a simulated response
    tasks[task_id]["status"] = "completed"
    tasks[task_id]["result"] = (
        f"Simulated response for: {prompt}\n\n"
        f"This is running in simulation mode since no API keys are configured or "
        f"the agent encountered initialization issues.\n\n"
        f"Please configure your API keys in the settings to use real AI providers.\n\n"
        f"You can add your:\n"
        f"- OpenAI API key\n"
        f"- Google Gemini API key\n"
        f"- DeepSeek API key\n"
        f"\nIn the settings page."
    )

async def execute_task(task_id: str, prompt: str, mode: str, context: Optional[Dict[str, Any]] = None):
    try:
        if not orchestrator or simulation_mode:
            # Simulate task execution instead of real execution
            await simulate_task_execution(task_id, prompt)
            return
            
        # Execute the task using the orchestrator
        try:
            # Try with context parameter
            result = orchestrator.execute_task(prompt, mode=mode, context=context)
        except TypeError as e:
            # If context parameter is not supported, try without it
            logger.warning(f"Context parameter not supported: {e}. Trying without context.")
            result = orchestrator.execute_task(prompt, mode=mode)
        
        # Convert result to string if it's a complex object
        if not isinstance(result, (str, dict)):
            result = str(result)
            
        # Update task status
        tasks[task_id]["status"] = "completed"
        tasks[task_id]["result"] = result
    except Exception as e:
        logger.exception(f"Error executing task: {e}")
        # Handle errors
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["result"] = {"error": str(e)}

if __name__ == "__main__":
    port = 8003
    logger.info(f"Starting ANUS API server on port {port}")
    try:
        uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
    except Exception as e:
        logger.error(f"Error starting server: {e}")
        logger.error(traceback.format_exc()) 