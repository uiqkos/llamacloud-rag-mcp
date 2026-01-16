#!/bin/bash

# LlamaCloud RAG MCP Server Installation Script
# This script helps set up the MCP server for any user

set -e

echo "🚀 LlamaCloud RAG MCP Server Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first:"
    echo "   https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔧 Building TypeScript..."
npm run build

# Get API key from user
read -p "🔑 Enter your LlamaCloud API key (get it from https://cloud.llamaindex.ai/): " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ API key is required!"
    exit 1
fi

# Get organization ID from user
read -p "🏢 Enter your LlamaCloud Organization ID: " ORG_ID

if [ -z "$ORG_ID" ]; then
    echo "❌ Organization ID is required!"
    exit 1
fi

# Get pipeline ID from user
read -p "🧩 Enter your LlamaCloud Pipeline ID: " PIPELINE_ID

if [ -z "$PIPELINE_ID" ]; then
    echo "❌ Pipeline ID is required!"
    exit 1
fi

# Get Cursor configuration path
echo ""
echo "📂 Cursor MCP Configuration"
echo "Choose where to save the configuration:"
echo "1) Project-specific (.cursor/mcp.json in current directory)"
echo "2) Global (~/.cursor/mcp.json for all projects)"
read -p "Enter your choice (1 or 2): " CONFIG_CHOICE

case $CONFIG_CHOICE in
    1)
        CONFIG_PATH="$(pwd)/.cursor/mcp.json"
        mkdir -p "$(pwd)/.cursor"
        ;;
    2)
        CONFIG_PATH="$HOME/.cursor/mcp.json"
        mkdir -p "$HOME/.cursor"
        ;;
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

# Create MCP configuration
echo "📝 Creating MCP configuration..."

cat > "$CONFIG_PATH" << EOF
{
  "mcpServers": {
    "llamacloud-rag": {
      "command": "node",
      "args": ["$(pwd)/dist/index.js"],
      "env": {
        "LLAMA_CLOUD_API_KEY": "$API_KEY",
        "LLAMA_CLOUD_ORGANIZATION_ID": "$ORG_ID",
        "LLAMA_CLOUD_PIPELINE_ID": "$PIPELINE_ID"
      }
    }
  }
}
EOF

echo "✅ Configuration saved to: $CONFIG_PATH"

# Test the server
echo "🧪 Testing the server..."
if LLAMA_CLOUD_API_KEY="$API_KEY" LLAMA_CLOUD_ORGANIZATION_ID="$ORG_ID" LLAMA_CLOUD_PIPELINE_ID="$PIPELINE_ID" timeout 10 node dist/index.js <<< '{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}' > /dev/null 2>&1; then
    echo "✅ Server test successful!"
else
    echo "⚠️  Server test failed, but installation completed. Please check your API key."
fi

echo ""
echo "🎉 Installation completed successfully!"
echo ""
echo "Next steps:"
echo "1. Restart Cursor IDE completely"
echo "2. Open the MCP panel in Cursor"
echo "3. You should see 'llamacloud-rag' server with 3 tools"
echo ""
echo "Available tools:"
echo "- query_rag: Ask questions about your documents"
echo "- search_documents: Search for relevant content"
echo "- get_index_info: Get index information"
echo ""
echo "Need help? Check the README.md file or visit:"
echo "https://github.com/uiqkos/llamacloud-rag-mcp"
