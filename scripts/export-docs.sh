#!/bin/bash

# Start the server in the background
echo "Starting server temporarily to export documentation..."
npx tsx -r dotenv/config src/index.ts &
SERVER_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 3

echo "Exporting OpenAPI documentation as YAML..."
curl -s http://localhost:3009/documentation/yaml > openapi.yaml
echo "YAML documentation exported to openapi.yaml"

# Kill the server process
echo "Stopping temporary server..."
kill $SERVER_PID
echo "Server stopped."
echo "Documentation export complete!"
