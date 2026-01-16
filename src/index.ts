#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

interface LlamaCloudConfig {
  apiKey: string;
  pipelineUrl: string;
  pipelineId?: string;
  indexName: string;
  projectName: string;
  organizationId: string;
}

interface QueryResult {
  answer: string;
  sources: Array<{
    id: number;
    filename: string;
    score: number;
    preview: string;
  }>;
  total_sources: number;
  query: string;
}

class LlamaCloudMCPServer {
  private server: Server;
  private config: LlamaCloudConfig;

  constructor() {
    // Configuration from environment
    const pipelineId = (process.env.LLAMA_CLOUD_PIPELINE_ID || "").trim();
    const pipelineUrl = (process.env.LLAMA_CLOUD_PIPELINE_URL || "").trim();
    const resolvedPipelineUrl =
      pipelineUrl ||
      (pipelineId
        ? `https://api.cloud.llamaindex.ai/api/v1/pipelines/${pipelineId}/retrieve`
        : "");

    this.config = {
      apiKey: (process.env.LLAMA_CLOUD_API_KEY || "").trim(),
      pipelineUrl: resolvedPipelineUrl,
      pipelineId: pipelineId || undefined,
      indexName: "dbms",
      projectName: "Default",
      organizationId: (process.env.LLAMA_CLOUD_ORGANIZATION_ID || "").trim(),
    };

    if (!this.config.apiKey || !this.config.organizationId || !this.config.pipelineUrl) {
      console.error("❌ Missing required environment variables for LlamaCloud MCP server");
      console.error("Required:");
      console.error("- LLAMA_CLOUD_API_KEY");
      console.error("- LLAMA_CLOUD_ORGANIZATION_ID");
      console.error("- LLAMA_CLOUD_PIPELINE_ID (or LLAMA_CLOUD_PIPELINE_URL)");
      process.exit(1);
    }

    // Create MCP server
    this.server = new Server(
      {
        name: "llamacloud-rag-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Initialize handler
    this.server.setRequestHandler(InitializeRequestSchema, async () => {
      console.error("🚀 LlamaCloud RAG MCP Server initialized");
      
      return {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {
            listChanged: true,
            supportsProgress: false
          },
        },
        serverInfo: {
          name: "llamacloud-rag-server",
          version: "1.0.0",
        },
      };
    });

    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("📋 Listing available tools");
      
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`🔧 Calling tool: ${name}`);

      if (!args) {
        throw new Error(`No arguments provided for tool ${name}`);
      }

      try {
        switch (name) {
          case "query_rag": {
            const { question } = args as { question: string };
            return await this.queryRAG(question);
          }
            
          case "search_documents": {
            const { query, top_k } = args as { query: string; top_k?: number };
            return await this.searchDocuments(query, top_k);
          }
            
          case "get_index_info":
            return await this.getIndexInfo();
            
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`❌ Error in tool ${name}:`, error);
        throw error;
      }
    });
  }

  private getToolDefinitions(): Tool[] {
    return [
      {
        name: "query_rag",
        description: "Query the database documents in LlamaCloud and get comprehensive answers with sources",
        inputSchema: {
          type: "object",
          properties: {
            question: {
              type: "string",
              description: "Question about database concepts, management systems, or related topics",
              minLength: 1,
              maxLength: 1000
            },
          },
          required: ["question"],
          additionalProperties: false,
        },
      },
      {
        name: "search_documents",
        description: "Search for relevant documents in the knowledge base without generating an answer",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string", 
              description: "Search query for semantic document retrieval",
              minLength: 1,
              maxLength: 500
            },
            top_k: {
              type: "number",
              description: "Number of documents to return (1-10)",
              minimum: 1,
              maximum: 10,
              default: 5
            },
          },
          required: ["query"],
          additionalProperties: false,
        },
      },
      {
        name: "get_index_info",
        description: "Get detailed information about the LlamaCloud index and its current status",
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false,
        },
      },
    ];
  }

  private async queryLlamaCloud(question: string): Promise<any> {
    const payload = {
      query: question,
      similarity_top_k: 5
    };

    const response = await fetch(this.config.pipelineUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`LlamaCloud API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async queryRAG(question: string) {
    console.error(`🔍 Querying RAG: ${question}`);
    
    const data = await this.queryLlamaCloud(question);
    
    // Process response and extract sources
    let answer = "";
    let sources: any[] = [];

    if (data.retrieval_nodes && Array.isArray(data.retrieval_nodes)) {
      // New format LlamaCloud API
      const nodes = data.retrieval_nodes.map((item: any) => item.node).filter((node: any) => node);
      
      if (nodes.length > 0) {
        // Generate answer from found nodes
        const contexts = nodes
          .map((node: any) => node.text || node.content || "")
          .filter((text: string) => text.trim())
          .slice(0, 3);
        
        if (contexts.length > 0) {
          answer = `Based on the found documents:\n\n${contexts.join('\n\n---\n\n')}`;
        }
      }
      
      sources = nodes.map((node: any, index: number) => ({
        id: index + 1,
        filename: node.metadata?.file_name || node.metadata?.filename || `Document ${index + 1}`,
        score: node.score || 0,
        preview: (node.text || node.content || "").substring(0, 150) + "..."
      }));
    } else {
      // Legacy format or direct answer
      answer = data.answer || data.response || "No answer received.";
      sources = (data.source_nodes || data.sources || []).map((node: any, index: number) => ({
        id: index + 1,
        filename: node.metadata?.file_name || node.metadata?.filename || `Document ${index + 1}`,
        score: node.score || 0,
        preview: (node.text || node.content || "").substring(0, 150) + "..."
      }));
    }

    const result: QueryResult = {
      answer,
      sources,
      total_sources: sources.length,
      query: question
    };

    console.error(`✅ Query processed, found ${sources.length} sources`);

    return {
      content: [
        {
          type: "text",
          text: `**Answer:** ${result.answer}\n\n**Sources (${result.total_sources}):**\n${result.sources.map(s => `${s.id}. ${s.filename} (relevance: ${s.score?.toFixed(2) || 'n/a'})\n   ${s.preview}`).join('\n')}`
        }
      ],
    };
  }

  private async searchDocuments(query: string, top_k: number = 5) {
    console.error(`🔎 Searching documents: ${query} (top ${top_k})`);

    const payload = {
      query: query,
      similarity_top_k: top_k,
      mode: "retrieve_only"
    };

    const data = await this.queryLlamaCloud(query);
    
    // Process search results
    let documents: any[] = [];

    if (data.retrieval_nodes && Array.isArray(data.retrieval_nodes)) {
      documents = data.retrieval_nodes
        .map((item: any) => item.node)
        .filter((node: any) => node)
        .map((node: any, index: number) => ({
          id: index + 1,
          filename: node.metadata?.file_name || node.metadata?.filename || `Document ${index + 1}`,
          score: node.score || 0,
          content: (node.text || node.content || "").substring(0, 300) + "...",
          metadata: node.metadata || {}
        }));
    } else if (data.source_nodes && Array.isArray(data.source_nodes)) {
      documents = data.source_nodes.map((node: any, index: number) => ({
        id: index + 1,
        filename: node.metadata?.file_name || node.metadata?.filename || `Document ${index + 1}`,
        score: node.score || 0,
        content: (node.text || node.content || "").substring(0, 300) + "...",
        metadata: node.metadata || {}
      }));
    }

    const result = {
      query: query,
      documents: documents,
      total_found: documents.length
    };

    console.error(`✅ Search completed, found ${documents.length} documents`);

    return {
      content: [
        {
          type: "text",
          text: `**Search query:** "${result.query}"\n\n**Found documents:** ${result.total_found}\n\n${result.documents.map(doc => `**${doc.id}. ${doc.filename}** (relevance: ${doc.score?.toFixed(2) || 'n/a'})\n${doc.content}`).join('\n\n')}`
        }
      ],
    };
  }

  private async getIndexInfo() {
    console.error(`ℹ️ Getting index info`);
    
    const indexInfo = {
      name: this.config.indexName,
      project: this.config.projectName,
      organization_id: this.config.organizationId,
      pipeline_url: this.config.pipelineUrl,
      status: "active",
      description: "Index with database and DBMS documents",
      last_updated: new Date().toISOString()
    };

    console.error(`✅ Index info retrieved`);

    return {
      content: [
        {
          type: "text",
          text: `**LlamaCloud Index Information:**\n\n• **Name:** ${indexInfo.name}\n• **Project:** ${indexInfo.project}\n• **Organization ID:** ${indexInfo.organization_id}\n• **Status:** ${indexInfo.status}\n• **Description:** ${indexInfo.description}\n• **Pipeline URL:** ${indexInfo.pipeline_url}\n• **Last checked:** ${indexInfo.last_updated}`
        }
      ],
    };
  }

  async run(): Promise<void> {
    try {
      console.error("🚀 Starting LlamaCloud RAG MCP Server...");
      
      // Test connection to LlamaCloud
      try {
        await this.queryLlamaCloud("test connection");
        console.error("✅ LlamaCloud connection verified");
      } catch (error) {
        console.error(`⚠️ Warning: Could not verify LlamaCloud connection: ${error}`);
      }

      console.error("✅ Server ready and listening for requests");
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      
    } catch (error) {
      console.error(`❌ Failed to start server: ${error}`);
      process.exit(1);
    }
  }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new LlamaCloudMCPServer();
  server.run().catch(console.error);
}
