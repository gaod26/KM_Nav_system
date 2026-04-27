#!/bin/bash
# Quick Start Script for Kirby-Manchester Navigation System
# This script helps you start both backend and frontend servers

echo "=================================================="
echo "  Kirby-Manchester Indoor Navigation System"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found:${NC} $(node --version)"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if ports are already in use
echo "Checking ports..."
if check_port 8000; then
    echo -e "${YELLOW}⚠ Port 8000 is already in use (Backend)${NC}"
    echo "  - Backend may already be running"
    echo "  - Or another process is using port 8000"
fi

if check_port 3000; then
    echo -e "${YELLOW}⚠ Port 3000 is already in use (Frontend)${NC}"
    echo "  - Frontend may already be running"
    echo "  - Or another process is using port 3000"
fi
echo ""

# Menu
echo "What would you like to do?"
echo "1) Start Backend only (port 8000)"
echo "2) Start Frontend only (port 3000)"
echo "3) Start Both (recommended for testing)"
echo "4) Install Dependencies"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Starting Backend Server...${NC}"
        echo "Location: http://localhost:8000"
        echo "Press Ctrl+C to stop"
        echo ""
        node src/server.js
        ;;
    2)
        echo ""
        echo -e "${GREEN}Starting Frontend Server...${NC}"
        echo "Location: http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        cd gabi_code && npm run dev
        ;;
    3)
        echo ""
        echo -e "${GREEN}Starting Both Servers...${NC}"
        echo ""
        echo "Backend: http://localhost:8000"
        echo "Frontend: http://localhost:3000"
        echo ""
        echo "Opening frontend in browser in 3 seconds..."
        echo "Press Ctrl+C to stop both servers"
        echo ""
        
        # Start backend in background
        node src/server.js &
        BACKEND_PID=$!
        
        # Wait a moment for backend to start
        sleep 2
        
        # Start frontend in background
        cd gabi_code && npm run dev &
        FRONTEND_PID=$!
        
        # Wait a moment for frontend to start
        sleep 3
        
        # Open browser (macOS)
        if command -v open &> /dev/null; then
            open http://localhost:3000
        fi
        
        # Wait for user interrupt
        echo ""
        echo -e "${GREEN}✓ Both servers are running${NC}"
        echo "Press Ctrl+C to stop both servers"
        
        # Trap Ctrl+C to kill both processes
        trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
        
        # Wait indefinitely
        wait
        ;;
    4)
        echo ""
        echo -e "${GREEN}Installing Dependencies...${NC}"
        echo ""
        echo "Installing backend dependencies..."
        npm install
        echo ""
        echo "Installing frontend dependencies..."
        cd gabi_code && npm install
        echo ""
        echo -e "${GREEN}✓ Dependencies installed${NC}"
        echo "Run this script again to start the servers"
        ;;
    5)
        echo "Goodbye!"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac
