#!/bin/bash
# Start the Kirby-Manchester Navigation Frontend

cd "$(dirname "$0")/frontend"

echo "Starting frontend development server on port 3000..."
npm run dev
