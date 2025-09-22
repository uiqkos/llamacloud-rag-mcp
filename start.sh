#!/bin/bash

# LlamaCloud RAG MCP Server Startup Script

# Set environment variables
export LLAMA_CLOUD_API_KEY="llx-XuXSRz49Xjady0dnctS9MvyNp2roceeOm3hOUmiYLkQ4t8s5"

# Build and start the server
echo "🚀 Building and starting LlamaCloud RAG MCP Server..."
npm run build && npm run start
