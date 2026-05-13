interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * SchemaStore MCP
 *
 * Auth: none.
 * Source: https://www.schemastore.org/api/json/catalog.json
 */


const CATALOG_URL = 'https://www.schemastore.org/api/json/catalog.json';

type CatalogEntry = {
  name: string;
  description?: string;
  url: string;
  fileMatch?: string[];
  versions?: Record<string, string>;
};

let CACHE: { at: number; schemas: CatalogEntry[] } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const tools: McpToolExport['tools'] = [
  {
    name: 'list_schemas',
    description: 'List SchemaStore catalog entries. Optional case-insensitive filter on name/description/fileMatch.',
    inputSchema: {
      type: 'object',
      properties: {
        filter: { type: 'string', description: 'e.g. "github", "tsconfig", "openapi"' },
        limit: { type: 'number', description: '1-500 (default 50)' },
      },
    },
  },
  {
    name: 'find_schema_for',
    description: 'Find catalog entries whose fileMatch globs cover the given filename.',
    inputSchema: {
      type: 'object',
      properties: { filename: { type: 'string', description: 'e.g. package.json, .github/workflows/ci.yml' } },
      required: ['filename'],
    },
  },
  {
    name: 'fetch_schema',
    description: 'Fetch a JSON Schema document by URL (must be hosted on json.schemastore.org).',
    inputSchema: {
      type: 'object',
      properties: { url: { type: 'string', description: 'e.g. https://json.schemastore.org/package.json' } },
      required: ['url'],
    },
  },
  {
    name: 'lookup',
    description: 'Exact-name lookup against the catalog (case-insensitive).',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'e.g. "package.json"' } },
      required: ['name'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_schemas': {
      const all = await loadCatalog();
      const filter = (args.filter as string | undefined)?.toLowerCase();
      const limit = Math.min(500, Math.max(1, (args.limit as number) ?? 50));
      const filtered = filter
        ? all.filter((e) => {
            const hay = [e.name, e.description ?? '', ...(e.fileMatch ?? [])].join(' ').toLowerCase();
            return hay.includes(filter);
          })
        : all;
      return { total: all.length, matches: filtered.length, results: filtered.slice(0, limit) };
    }
    case 'find_schema_for': {
      const filename = reqStr(args, 'filename', '"package.json"');
      const all = await loadCatalog();
      const matches = all.filter((e) => (e.fileMatch ?? []).some((pat) => globMatch(pat, filename)));
      return { filename, matches };
    }
    case 'fetch_schema': {
      const url = reqStr(args, 'url', '"https://json.schemastore.org/package.json"');
      const host = new URL(url).host;
      if (host !== 'json.schemastore.org' && host !== 'www.schemastore.org') {
        throw new Error(`Refusing to fetch schema from non-SchemaStore host: ${host}`);
      }
      const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
      if (!res.ok) throw new Error(`SchemaStore: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    case 'lookup': {
      const name = reqStr(args, 'name', '"package.json"').toLowerCase();
      const all = await loadCatalog();
      const hit = all.find((e) => e.name.toLowerCase() === name);
      return { name, result: hit ?? null };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

const UA = 'pipeworx-mcp-schemastore/1.0 (+https://pipeworx.io)';

async function loadCatalog(): Promise<CatalogEntry[]> {
  const now = Date.now();
  if (CACHE && now - CACHE.at < CACHE_TTL_MS) return CACHE.schemas;
  const res = await fetch(CATALOG_URL, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`SchemaStore catalog: ${res.status}`);
  const json = (await res.json()) as { schemas: CatalogEntry[] };
  CACHE = { at: now, schemas: json.schemas ?? [] };
  return CACHE.schemas;
}

function globMatch(pattern: string, name: string): boolean {
  // Simple glob: ** = any path, * = any non-slash chars, ? = single char. Anchored to full name.
  const re =
    '^' +
    pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]') +
    '$';
  return new RegExp(re).test(name);
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
