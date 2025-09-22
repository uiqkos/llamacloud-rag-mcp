# Contributing to LlamaCloud RAG MCP Server

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/llamacloud-rag-mcp.git
   cd llamacloud-rag-mcp
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```

## 🛠️ Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the `src/` directory

3. **Build and test**:
   ```bash
   npm run build
   npm run test
   ```

4. **Test with Cursor** (if applicable):
   - Update your local Cursor MCP configuration
   - Test the changes in Cursor IDE

### Code Style

- **TypeScript**: All code should be written in TypeScript
- **ESM**: Use ES modules (`import/export`)
- **Async/Await**: Prefer async/await over Promises
- **Error Handling**: Always handle errors appropriately
- **Types**: Use strict typing, avoid `any`

### Commit Guidelines

Use clear, descriptive commit messages:

```bash
# Good
git commit -m "Add support for custom LlamaCloud endpoints"
git commit -m "Fix error handling in query_rag tool"
git commit -m "Update documentation for installation process"

# Avoid
git commit -m "Fix stuff"
git commit -m "Update"
```

## 🧪 Testing

Before submitting a pull request:

1. **Run the test suite**:
   ```bash
   npm run test
   ```

2. **Test manually with your API key**:
   ```bash
   LLAMA_CLOUD_API_KEY="your-key" npm run test
   ```

3. **Test the installation script**:
   ```bash
   ./install.sh
   ```

## 📝 Documentation

- Update the README.md if you add new features
- Add JSDoc comments to new functions
- Update examples if behavior changes

## 🐛 Bug Reports

When filing a bug report, please include:

- **Node.js version**: `node --version`
- **Operating system**: macOS, Linux, Windows
- **Error messages**: Full error output
- **Steps to reproduce**: Clear reproduction steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens

## ✨ Feature Requests

When requesting a feature:

- **Use case**: Explain why this feature would be useful
- **Proposed solution**: How you think it should work
- **Alternatives**: Other ways to achieve the same goal
- **Implementation ideas**: Technical approach (optional)

## 📋 Pull Request Process

1. **Update documentation** as needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update CHANGELOG.md** (if one exists)
5. **Reference any related issues**

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Tested with Cursor IDE

## Related Issues
Fixes #(issue number)
```

## 🔧 Technical Architecture

### Key Components

- **`src/index.ts`**: Main MCP server implementation
- **LlamaCloudMCPServer class**: Core server functionality
- **Tool handlers**: Individual tool implementations
- **Type definitions**: TypeScript interfaces and types

### Adding New Tools

1. **Add tool definition** to `getToolDefinitions()` method
2. **Add case** to the switch statement in the call handler
3. **Implement the tool method**
4. **Add proper TypeScript types**
5. **Update documentation**

Example:
```typescript
// Add to getToolDefinitions()
{
  name: "my_new_tool",
  description: "Description of what it does",
  inputSchema: {
    type: "object",
    properties: {
      param: {
        type: "string",
        description: "Parameter description"
      }
    },
    required: ["param"],
    additionalProperties: false
  }
}

// Add to call handler
case "my_new_tool": {
  const { param } = args as { param: string };
  return await this.myNewTool(param);
}

// Implement the method
private async myNewTool(param: string) {
  // Implementation
  return {
    content: [
      {
        type: "text",
        text: `Result: ${param}`
      }
    ]
  };
}
```

## 🔒 Security Considerations

- **Never commit API keys** or sensitive information
- **Validate all inputs** from MCP calls
- **Use environment variables** for configuration
- **Follow security best practices** for API calls

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🆘 Getting Help

If you need help:

- 📖 Check the [documentation](README.md)
- 💬 Open an [issue](https://github.com/username/llamacloud-rag-mcp/issues)
- 🔍 Look at existing issues and pull requests

Thank you for contributing! 🙏
