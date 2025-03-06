#!/bin/bash

# Start the server in the background
echo "Starting server..."
npx tsx -r dotenv/config src/index.ts &
SERVER_PID=$!

# Wait for server to be ready (adjust sleep time as needed)
echo "Waiting for server to start..."
sleep 3

# Open documentation in browser
echo "Opening documentation in browser..."
open http://localhost:3009/documentation

# Ask user to press any key to stop the server
echo ""
echo "Server is running. Press any key to stop the server..."
read -n 1 -s

# Kill the server process
echo "Stopping server..."
kill $SERVER_PID
echo "Server stopped."
