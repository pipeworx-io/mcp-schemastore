# mcp-schemastore

JSON Schema catalog (SchemaStore.org)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 250+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_schemas` | List SchemaStore catalog entries. Optional case-insensitive filter on name/description/fileMatch. |
| `find_schema_for` | Find catalog entries whose fileMatch globs cover the given filename. |
| `fetch_schema` | Fetch a JSON Schema document by URL (must be hosted on json.schemastore.org). |
| `lookup` | Exact-name lookup against the catalog (case-insensitive). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "schemastore": {
      "url": "https://gateway.pipeworx.io/schemastore/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 250+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Schemastore data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
