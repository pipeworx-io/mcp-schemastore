# @pipeworx/schemastore

JSON Schema Store MCP — catalog of JSON Schemas for hundreds of well-known config/data file formats (package.json, tsconfig.json, GitHub Actions workflows, OpenAPI, etc). Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `list_schemas(filter?, limit?)` — list catalog entries; `filter` is a case-insensitive substring on name/description/fileMatch
- `find_schema_for(filename)` — find schemas that match a given filename (e.g. `package.json`, `.github/workflows/ci.yml`)
- `fetch_schema(url)` — fetch the raw JSON Schema document from the catalog (schemastore-hosted URL)
- `lookup(name)` — exact-name lookup against the catalog

## Data source

`https://www.schemastore.org/api/json/catalog.json`

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
