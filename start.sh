#!/bin/bash

# Start ANUS Unified
echo "Starting ANUS Unified..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Docker is not running. Please start Docker and try again."
  exit 1
fi

# Start the services
echo "Building and starting services..."
docker-compose up --build

# Exit message
echo "ANUS Unified has been stopped." 