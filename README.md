# ANUS Unified - Autonomous Networked Utility System

<p align="center">
  <img src="public/anus_logo.png" alt="ANUS Logo" width="200"/>
</p>

ANUS (Autonomous Networked Utility System) is a powerful, flexible AI agent framework that combines a Python backend with a Next.js web interface.

## Features

- **Hybrid Agent System**: Use single-agent mode for simpler tasks and multi-agent mode for complex problems
- **Web Interface**: Modern, responsive UI built with Next.js and Tailwind CSS
- **Code Execution**: Sandbox for executing and testing code
- **Task Management**: Break down complex tasks into subtasks
- **Extensibility**: Easy to extend with custom tools and capabilities

## Project Structure

The project consists of two main components:

1. **Frontend**: Next.js web application with TypeScript and Tailwind CSS
2. **Backend**: Python-based API server using FastAPI

## Getting Started

### Using Docker (Recommended)

The easiest way to run ANUS Unified is with Docker:

```bash
# Build and start the application
docker-compose up --build

# The web interface will be available at http://localhost:3000
# The API server will be available at http://localhost:8000
```

### Manual Setup

#### Backend

```bash
cd backend
pip install -r requirements.txt
python server.py
```

#### Frontend

```bash
npm install
npm run dev
```

## Configuration

- Backend configuration can be modified in `backend/config.yaml`
- Frontend environment variables can be set in `.env.local`

## Development

This project uses:

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS for styling

## License

MIT
