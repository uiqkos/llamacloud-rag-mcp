[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/uiqkos-llamacloud-rag-mcp-badge.png)](https://mseep.ai/app/uiqkos-llamacloud-rag-mcp)

# 🦙 LlamaCloud RAG MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

Professional Model Context Protocol (MCP) server for **Retrieval-Augmented Generation** using **LlamaCloud API**. Built with TypeScript following industry best practices from the [Cursor MCP Integration Guide 2025](https://www.aifreeapi.com/en/posts/cursor-mcp-integration-guide-2025).

> **Transform your Cursor IDE into an AI powerhouse!** Connect any LlamaCloud document index and get intelligent answers with sources directly in your development workflow.

## ✨ Features

- 🚀 **Professional TypeScript Implementation**: Type-safe, compiled, production-ready
- 🦙 **LlamaCloud Integration**: Direct API connection to cloud-hosted document indices  
- 🛠️ **Three Powerful Tools**: Query, search, and inspect your knowledge base
- 📋 **MCP Protocol Compliant**: Full compatibility with Cursor IDE
- ⚡ **Performance Optimized**: Efficient API calls and response handling
- 🔐 **Secure**: Environment-based API key management
- 📦 **Easy Installation**: Automated setup script included

## 🎯 Quick Start

### Option 1: Automated Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/uiqkos/llamacloud-rag-mcp.git
cd llamacloud-rag-mcp

# Run the interactive installer
chmod +x install.sh
./install.sh
```

The installer will:
- ✅ Check Node.js version
- 📦 Install dependencies
- 🔧 Build the project
- 🔑 Setup your API key
- 📂 Configure Cursor MCP
- 🧪 Test the connection

### Option 2: Manual Installation

```bash
# 1. Clone and setup
git clone https://github.com/uiqkos/llamacloud-rag-mcp.git
cd llamacloud-rag-mcp
npm install
npm run build

# 2. Get your LlamaCloud API key
# Visit: https://cloud.llamaindex.ai/

# 3. Configure Cursor
# Add to ~/.cursor/mcp.json or .cursor/mcp.json:
{
  "mcpServers": {
    "llamacloud-rag": {
      "command": "node",
      "args": ["/absolute/path/to/llamacloud-rag-mcp/dist/index.js"],
      "env": {
        "LLAMA_CLOUD_API_KEY": "your-api-key-here"
      }
    }
  }
}

# 4. Restart Cursor IDE
```

## 🔧 Prerequisites

- **Node.js 18.0+** and npm
- **LlamaCloud API Key** (get it [here](https://cloud.llamaindex.ai/))
- **Cursor IDE** with MCP support

## 📋 Available Tools

### 🔍 `query_rag`
Ask questions about your documents and get comprehensive answers with sources.

**Input:**
- `question` (string, 1-1000 chars): Your question about the documents

**Output:**
- 📝 Detailed answer based on retrieved content
- 📚 List of source documents with relevance scores  
- 👀 Preview text from each source

**Example:**
```
Question: "What is database normalization?"
Answer: Based on the found documents, database normalization is...
Sources: 
1. Database Design Principles (relevance: 0.95)
2. SQL Fundamentals (relevance: 0.87)
```

### 📄 `search_documents`
Search for relevant documents without generating an answer.

**Input:**
- `query` (string, 1-500 chars): Search query
- `top_k` (number, 1-10, default 5): Number of results

**Output:**
- 📄 List of matching documents
- 🔍 Content previews and metadata
- 📊 Relevance scores

### ℹ️ `get_index_info`
Get detailed information about your LlamaCloud index.

**Input:** None

**Output:**
- 📋 Index name, project, organization details
- ✅ Current status and configuration  
- 🔗 Pipeline URL and last update time

## 🧪 Testing Your Setup

```bash
# Test with npm scripts
npm run test

# Manual testing
npm run test:init  # Test initialization
npm run test:tools # Test tool listing

# Test with your API key
LLAMA_CLOUD_API_KEY="your-key" npm run test
```

## 📁 Project Structure

```
llamacloud-rag-mcp/
├── 📂 src/
│   └── 📄 index.ts           # Main MCP server implementation
├── 📂 dist/                  # Compiled JavaScript (auto-generated)  
├── 📄 package.json           # Node.js configuration
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 install.sh            # Automated installer
├── 📄 cursor-mcp-config.example.json  # Configuration example
├── 📄 config.example         # LlamaCloud config template
├── 📄 LICENSE               # MIT license
└── 📄 README.md             # This file
```

## 🔐 Security & Best Practices

- ✅ **API Key Protection**: Never commit keys to version control
- ✅ **Environment Variables**: Secure configuration management
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Error Handling**: Comprehensive error catching and reporting
- ✅ **Input Validation**: Secure parameter validation
- ✅ **No Data Logging**: Your queries stay private

## 🎨 Customization

### Using Your Own LlamaCloud Index

1. **Create your index** in LlamaCloud
2. **Update the configuration** in `src/index.ts`:

```typescript
this.config = {
  apiKey: process.env.LLAMA_CLOUD_API_KEY || "",
  pipelineUrl: "https://api.cloud.llamaindex.ai/api/v1/pipelines/YOUR-PIPELINE-ID/retrieve",
  indexName: "your-index-name",
  projectName: "your-project-name",
  organizationId: "your-organization-id"
};
```

3. **Rebuild**: `npm run build`

### Custom Tools

Extend the server by adding new tools in `src/index.ts`. Follow the existing patterns for type safety and error handling.

## 🐛 Troubleshooting

### Tools not showing in Cursor?

1. ✅ **Check API key**: Ensure `LLAMA_CLOUD_API_KEY` is set correctly
2. 🔄 **Restart Cursor**: Fully quit and restart Cursor IDE  
3. 📍 **Check paths**: Ensure absolute paths in MCP configuration
4. 🔍 **Check logs**: Look at Cursor developer console for errors
5. 🧪 **Test manually**: Run `npm run test` to verify server works

### Common Issues

**"Module not found"**: Run `npm run build` first
**"API key required"**: Set `LLAMA_CLOUD_API_KEY` environment variable  
**"Connection failed"**: Check your LlamaCloud API key and internet connection
**"Tools not listed"**: Verify Cursor MCP configuration syntax

### Getting Help

- 📖 Check the [MCP Documentation](https://modelcontextprotocol.io/)
- 💬 Open an [issue](https://github.com/uiqkos/llamacloud-rag-mcp/issues) 
- 🔍 Review Cursor logs in developer console

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and open an issue or pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`  
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) team
- [LlamaIndex](https://llamaindex.ai/) for the amazing RAG platform
- [Cursor IDE](https://cursor.sh/) for MCP integration
- [Cursor MCP Integration Guide 2025](https://www.aifreeapi.com/en/posts/cursor-mcp-integration-guide-2025) for best practices

---

**Made with ❤️ for the developer community**

*Star ⭐ this repository if it helped you!*
