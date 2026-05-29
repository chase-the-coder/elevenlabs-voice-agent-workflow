# ElevenLabs Agent Manager

A TypeScript CLI tool to manage ElevenLabs conversational AI agents programmatically. Sync system prompts, knowledge bases, and tools between local markdown files and ElevenLabs.

## Features

- **Agent Management**: List, pull, push, and diff agents
- **System Prompts**: Edit prompts in markdown and sync to ElevenLabs
- **Knowledge Bases**: Manage KB content in local files
- **Tool Management**: Create and manage client, webhook, and system tools
- **Version Control**: Keep all agent configs in Git
- **Type Safety**: Built with TypeScript for reliability

## Installation

```bash
npm install
```

## Setup

1. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API key** to `.env`:
   ```
   ELEVENLABS_API_KEY=your_api_key_here
   ```
   Get your API key from: https://elevenlabs.io/app/settings/api-keys

3. **Discover existing agents**:
   ```bash
   npm run discover
   ```
   This will fetch all agents from ElevenLabs and help you map them to local folders.

   OR manually edit `config.json` with your agent IDs and folder mappings.

## Configuration

The `config.json` file maps ElevenLabs agents to local folders:

```json
{
  "apiKey": "${ELEVENLABS_API_KEY}",
  "agents": {
    "johnson-hvac": {
      "agent_id": "agent_abc123",
      "name": "Johnson's HVAC Sarah",
      "folder": "../johnsons-hvac",
      "files": {
        "system_prompt": "11labs-johnsons-hvac-system-prompt.md",
        "knowledge_base": "11labs-johnsons-hvac-kb.md"
      }
    }
  }
}
```

## Commands

### Agent Commands

#### List all agents
```bash
npm run agents:list
```

Shows all agents in your workspace with their IDs and local mapping status.

#### Pull agent configuration
```bash
npm run agents:pull <agent-key>
```

Downloads the current agent configuration from ElevenLabs and writes:
- System prompt to local markdown file
- Agent config to `agent-config.json`

Example:
```bash
npm run agents:pull johnson-hvac
```

#### Push local changes
```bash
npm run agents:push <agent-key>
```

Uploads local changes to ElevenLabs:
- Reads system prompt from markdown file
- Reads settings from `agent-config.json`
- Updates remote agent

Example:
```bash
npm run agents:push johnson-hvac
```

#### Compare local vs remote
```bash
npm run agents:diff <agent-key>
```

Shows differences between local files and remote configuration without making changes.

### Tool Commands

#### List tools
```bash
npm run tools:list <agent-key>
```

Shows all tools in the workspace and which ones have local config files.

#### Create a new tool
```bash
npm run tools:create <agent-key> [tool-name]
```

Interactive wizard to create a new tool. Supports:
- **Client tools**: For client-side execution with parameters
- **Webhook tools**: HTTP endpoints to call during conversation
- **System tools**: Built-in functions (transfer, end call, etc.)

Example:
```bash
npm run tools:create johnson-hvac check_availability
```

#### Push tools
```bash
npm run tools:push <agent-key>
```

Syncs all tool JSON files from `tools/` folder to ElevenLabs.

### Knowledge Base Commands

#### Sync knowledge base
```bash
npm run kb:sync <agent-key>
```

Creates or updates the knowledge base from local markdown file and attaches it to the agent.

Example:
```bash
npm run kb:sync johnson-hvac
```

#### Pull knowledge base
```bash
npm run kb:pull <agent-key>
```

Downloads knowledge base content from ElevenLabs (Note: API may have limitations on full content retrieval).

### Test Commands

#### Run an agent test suite
```bash
npm run tests:run <agent-key>
```

Runs every test scenario in the agent's `tests/` folder as simulated conversations (via the ElevenLabs `simulate-conversation` API), then prints a PASS / FLAKY / FAIL summary. Each scenario is a JSON file describing a simulated user and the evaluation criteria. See `johnsons-hvac/tests/` for 10 working examples.

Options:
- `--verbose` — print the full conversation transcript for each scenario
- `--test <filename>` — run a single test file instead of the whole suite
- `--no-save` — do not write results to `tests/results/`

Example:
```bash
npm run tests:run johnson-hvac -- --verbose
```

### Versioning Commands

Agent versioning enables safe experimentation with branches, traffic deployment, and instant rollback.

#### Enable versioning
```bash
npm run versioning:enable <agent-key>
```

Enables versioning on an agent (one-time, cannot be undone). Creates the "Main" branch automatically.

**Warning:** Once enabled, versioning cannot be disabled.

#### List branches
```bash
npm run branches:list <agent-key>
```

Shows all branches, their versions, and current traffic deployment.

#### Create a new branch
```bash
npm run branches:create <agent-key> [branch-name]
```

Creates a new branch from the latest version on Main. Interactive wizard prompts for name and description.

Example:
```bash
npm run branches:create johnson-hvac experiment-gpt4
```

#### Push to a specific branch
```bash
npm run agents:push <agent-key> --branch <branch-name>
```

Pushes local changes to a specific branch instead of Main.

Example:
```bash
npm run agents:push johnson-hvac --branch experiment-gpt4
```

#### Deploy traffic across branches
```bash
npm run branches:deploy <agent-key>
```

Interactive wizard to split traffic between branches (percentages must sum to 100%).

Example deployment:
- Main: 90%
- experiment-gpt4: 10%

#### Merge branch to main
```bash
npm run branches:merge <agent-key> [source-branch]
```

Merges a branch back to Main and optionally archives it. Traffic automatically transfers to Main.

## Workflow Examples

### Safe production deployment with versioning

1. **Enable versioning** (one-time):
   ```bash
   npm run versioning:enable johnson-hvac
   ```

2. **Create experiment branch**:
   ```bash
   npm run branches:create johnson-hvac experiment-better-prompts
   ```

3. **Make local changes**:
   ```bash
   # Edit johnson-hvac/11labs-system-prompt.md
   ```

4. **Push to experiment branch**:
   ```bash
   npm run agents:push johnson-hvac --branch experiment-better-prompts
   ```

5. **Deploy 10% traffic to test**:
   ```bash
   npm run branches:deploy johnson-hvac
   # Set: Main=90%, experiment-better-prompts=10%
   ```

6. **Monitor performance** in ElevenLabs dashboard

7. **If successful, increase traffic**:
   ```bash
   npm run branches:deploy johnson-hvac
   # Set: Main=50%, experiment-better-prompts=50%
   ```

8. **Merge to main when confident**:
   ```bash
   npm run branches:merge johnson-hvac experiment-better-prompts
   ```

### Update an agent's system prompt

1. Edit the markdown file:
   ```bash
   # Edit ../johnsons-hvac/11labs-johnsons-hvac-system-prompt.md
   ```

2. Push changes to ElevenLabs:
   ```bash
   npm run agents:push johnson-hvac
   ```

3. Verify in ElevenLabs dashboard

### Create a new tool

1. Run the create command:
   ```bash
   npm run tools:create johnson-hvac schedule_appointment
   ```

2. Follow the interactive prompts

3. Edit the generated JSON file if needed:
   ```bash
   # Edit ../johnsons-hvac/tools/schedule_appointment.json
   ```

4. Push to ElevenLabs:
   ```bash
   npm run tools:push johnson-hvac
   ```

### Backup current configuration

```bash
npm run agents:pull johnson-hvac
git add .
git commit -m "Backup agent configs"
```

## Folder Structure

```
elevenlabs-voice-agent-workflow/
├── elevenlabs-manager/          # This tool
│   ├── src/                     # TypeScript source
│   ├── config.json              # Agent mappings
│   └── .env                     # API key
├── johnsons-hvac/
│   ├── agent-config.json        # Agent settings
│   ├── 11labs-johnsons-hvac-system-prompt.md
│   ├── 11labs-johnsons-hvac-kb.md
│   └── tools/                   # Tool definitions
│       ├── check_availability.json
│       └── schedule_appointment.json
└── johnsons-hvac/
    ├── agent-config.json
    ├── 11labs-johnsons-hvac-system-prompt.md
    ├── 11labs-johnsons-hvac-kb.md
    └── tools/
```

## Troubleshooting

### "API key not found"
- Check that `.env` file exists with `ELEVENLABS_API_KEY`
- Verify the API key is valid

### "Agent not found in config"
- Run `npm run discover` to map agents
- Or manually add agent to `config.json`

### "Failed to read file"
- Verify the folder path in `config.json` is correct
- Check that the markdown files exist

## Development

Build TypeScript:
```bash
npm run build
```

Run directly with tsx:
```bash
npm run dev -- agents list
```

## ElevenLabs API & SDK Reference

This CLI is a thin wrapper over the official ElevenLabs TypeScript SDK plus two direct REST calls. Everything lives under the `conversationalAi` namespace of the SDK.

- **SDK:** [`@elevenlabs/elevenlabs-js`](https://github.com/elevenlabs/elevenlabs-js), pinned `^2.34.0` (verified against 2.49.x). The `^` range already pulls the latest 2.x — run `npm update @elevenlabs/elevenlabs-js` to refresh, then `npm run build`.
- **Client setup:** `new ElevenLabsClient({ apiKey })` (see `src/client.ts`).

### Command → API mapping

| CLI command | SDK method / endpoint | Docs |
|---|---|---|
| `agents:list` | `conversationalAi.agents.list()` | [List Agents](https://elevenlabs.io/docs/api-reference/agents/list) |
| `agents:pull` | `conversationalAi.agents.get(id)` | [Get Agent](https://elevenlabs.io/docs/api-reference/agents/get) |
| `agents:push` | `conversationalAi.agents.update(id, updates, { branchId })` | [Update Agent](https://elevenlabs.io/docs/api-reference/agents/update) |
| `tools:list` / `tools:create` / `tools:push` | `conversationalAi.tools.{list,get,create,update}` | [Tools](https://elevenlabs.io/docs/api-reference/tools/list) |
| `kb:sync` | `conversationalAi.knowledgeBase.documents.createFromText` + RAG index | [Create from Text](https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-text) |
| `kb:pull` | `GET /v1/convai/knowledge-base/{id}/content` (direct fetch) | [Get Content](https://elevenlabs.io/docs/api-reference/knowledge-base/get-content) |
| `branches:list` / `create` / `merge` | `conversationalAi.agents.branches.*` | [Branches](https://elevenlabs.io/docs/api-reference/agents/branches/list) |
| `branches:deploy` | `conversationalAi.agents.deployments.create(id, { deployments })` | [Create Deployment](https://elevenlabs.io/docs/api-reference/agents/deployments/create) |
| `tests:run` | `conversationalAi.agents.simulateConversation(id, request)` | [Simulate Conversation](https://elevenlabs.io/docs/api-reference/agents/simulate-conversation) |

### Direct REST endpoints used

The SDK does not (yet) cover these, so `src/client.ts` calls them directly with the `xi-api-key` header:

- `GET https://api.elevenlabs.io/v1/convai/knowledge-base/{documentId}/content` — full KB document text (used by `kb:pull`).
- `POST https://api.elevenlabs.io/v1/convai/knowledge-base/rag-index` — compute the RAG index after a KB update (used by `kb:sync` when RAG is enabled).

### Notes on current API behavior

- **Agent tools are referenced by ID.** Attach tools to an agent via `toolIds` in `agent-config.json`. The agent-level inline `tools` array is [deprecated](https://elevenlabs.io/docs/eleven-agents/customization/tools/agent-tools-deprecation) — never set both.
- **`forcePreToolSpeech` and `toolCallSoundBehavior` live on the tool object**, not the agent config. `agents:push` only updates the prompt; tool settings are patched per tool via `/v1/convai/tools/{id}`.
- **Knowledge bases:** upload as file (type `file`), not text, for proper HTML extraction. Use `prompt` mode (RAG disabled) for KBs under ~5,000 tokens; enable RAG only for larger documents and always recompute the index after an update.

Full doc index (URLs + pre-fetched references) is available via the `/elevenlabs-docs` Claude Code skill.

## License

MIT
