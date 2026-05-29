# ElevenLabs Voice Agent Workflow

An opinionated workflow for building and managing ElevenLabs conversational AI agents using Claude Code. Includes a TypeScript CLI for syncing agents with ElevenLabs, Claude Code skills for AI-assisted development, and a complete example agent with test suite.

## What's Included

- **elevenlabs-manager/**: TypeScript CLI for syncing agents, tools, knowledge bases, and branches with ElevenLabs
- **johnsons-hvac/**: Complete example agent (prompt, KB, config, tools, 13 test scenarios)
- **.claude/**: Claude Code skills and commands for the full development workflow
- **discovery-template.md**: Comprehensive questionnaire for new client discovery sessions
- **CLAUDE.md**: Project conventions and best practices (Claude Code reads this automatically)

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- An [ElevenLabs](https://elevenlabs.io) account with API access
- Git

## Quick Start

### 1. Clone the template

```bash
git clone https://github.com/chase-the-coder/elevenlabs-voice-agent-workflow.git
cd elevenlabs-voice-agent-workflow
```

### 2. Make it your own

Remove the template's origin and create your own repository:

```bash
git remote remove origin
gh repo create my-voice-agents --private --source=. --remote=origin --push
```

This detaches from the original template and pushes to a new repo under your GitHub account. Use `--public` instead of `--private` if you prefer.

### 3. Install dependencies

```bash
cd elevenlabs-manager
npm install
```

### 4. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and add your ElevenLabs API key (get one at [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)).

### 5. Discover your agents

```bash
npm run discover
```

This fetches your ElevenLabs agents and helps you map them to local folders. You can also manually edit `config.json`.

### 6. Start Claude Code

```bash
cd ..  # back to project root
claude
```

Claude Code will automatically read CLAUDE.md and understand the project conventions. Run `/prime` to get oriented.

## The Workflow

This project uses a structured workflow powered by Claude Code slash commands. Here's the typical flow for building or modifying an agent:

### `/prime` — Orient yourself
Run this at the start of every new Claude Code session. Claude reads the project structure, checks your current git branch, lists all agents, and checks for any session handoffs from previous work. This gives Claude full context before you ask it to do anything.

### `/plan <description>` — Design before building
Describe what you want in plain English. Claude will:
- Read the existing agent files (prompt, config, KB, tools) to understand the baseline
- Consult the ElevenLabs documentation (bundled locally via the `/elevenlabs-docs` skill — no web fetching needed) for best practices on prompting, tool configuration, and knowledge base setup
- Design an implementation approach following the conventions in CLAUDE.md (prompt structure, token budgets, latency optimization)
- Save a detailed plan to `specs/todo/` with step-by-step file changes, token budget impact, and rollback steps

**Example:** `/plan Add a new dental office agent with appointment booking and insurance verification`

### `/build [path-to-plan]` — Execute the plan
Takes a plan from `specs/todo/` and implements it step by step:
1. Creates a **local git branch** for the changes
2. Generates or modifies the system prompt, knowledge base, tool definitions, and agent config
3. Commits all changes locally
4. **Asks you** whether to push to ElevenLabs Main (production) or create a new ElevenLabs branch for A/B testing

This two-layer approach (local git + ElevenLabs branches) means you always have version control locally, and you can safely test changes on ElevenLabs by splitting traffic between branches before merging to Main.

### `/review [spec-file]` — Verify the implementation
Compares what was actually built against the original plan to catch mistakes before going live:
- Checks every requirement in the spec against the implementation
- Verifies prompt word count is within budget (400-600 words)
- Verifies KB word count is within budget (300-500 words)
- Confirms prompt follows the required section order (Personality > Goal > Guardrails > Character Normalization > Tools > Error Handling)
- Checks that webhook tools have `forcePreToolSpeech: true` and `toolCallSoundBehavior: "always"` for latency optimization
- Verifies tool naming conventions (snake_case) and that all tools are attached to the agent config
- Reports issues by severity: **skippable** (cosmetic), **tech_debt** (works but needs cleanup), or **blocker** (must fix before pushing)

### `/test <agent-key>` — Run the test suite
Runs simulated phone conversations against your agent using ElevenLabs' simulation API:
1. **Auto-generates tests** if none exist — analyzes your agent's prompt, KB, and tools to create 8-15 test scenarios covering happy paths, guardrails, emergency handling, edge cases, and tool failures
2. **Runs N simulations** (default 5) in parallel — each test is a full conversation between a simulated caller and your agent
3. **Aggregates results** across runs and classifies each test as:
   - **PASS** — 100% pass rate across all runs
   - **FLAKY** — 34-99% pass rate (non-deterministic behavior)
   - **FAIL** — 0-33% pass rate (consistent failure)
4. **Provides actionable suggestions** — for failing tests, it identifies which prompt section needs reinforcement and what to change

**Example:** `/test johnson-hvac --runs 5`

Tests use mocked tool responses (no real webhooks are called during testing), so you can run them without any backend infrastructure connected.

### `/elevenlabs-docs` — Access documentation instantly
Provides the full ElevenLabs developer documentation for conversational AI agents without needing to fetch anything from the web. Includes pre-fetched references for:
- **Prompting guide** — prompt structure, emphasis patterns, character normalization
- **Server tools** — webhook tool JSON schema, auth methods, request body configuration
- **Knowledge base** — KB modes (prompt/auto/rag), RAG indexing, document types
- **Agent configuration** — full config schema for conversation settings, TTS, ASR, turn-taking
- **Outbound calls** — Twilio integration, dynamic variables, batch calls

Claude automatically consults these docs when building or modifying agents via `/plan` and `/build`.

### Other commands

| Command | Purpose |
|---------|---------|
| `/commit` | Create a git commit with a descriptive message |
| `/handoff` | Save session state (current work, decisions made, next steps) so you can close the session and pick up later |
| `/pickup` | Resume from a previous handoff — Claude reads the saved state and continues where you left off |

## How Changes Get to ElevenLabs

There are two layers of version control in this workflow:

1. **Local git** — All changes are committed to git branches first. This gives you full history, diffs, and the ability to revert.
2. **ElevenLabs branches** — ElevenLabs has its own branching system for A/B testing. You can split traffic (e.g., 90% Main / 10% experiment) to safely test changes before merging.

The `/build` command always asks before pushing to ElevenLabs. Your options:
- **Push to Main** — Changes go live immediately
- **Create a new ElevenLabs branch** — Changes are deployed to a branch. You can then use `npm run branches:deploy` to split traffic and test, then `npm run branches:merge` to promote to Main when satisfied

## CLI Reference

All commands run from the `elevenlabs-manager/` directory:

### Agent Commands
```bash
npm run agents:list                           # List all agents
npm run agents:pull <agent-key>               # Pull config from ElevenLabs
npm run agents:push <agent-key>               # Push changes to ElevenLabs Main
npm run agents:push <agent-key> --branch <n>  # Push to a specific branch
npm run agents:diff <agent-key>               # Compare local vs remote
```

### Tool Commands
```bash
npm run tools:list <agent-key>                # List tools
npm run tools:create <agent-key> [tool-name]  # Create a new tool
npm run tools:push <agent-key>                # Sync tools to ElevenLabs
```

### Knowledge Base
```bash
npm run kb:sync <agent-key>                   # Push local KB to ElevenLabs
npm run kb:pull <agent-key>                   # Pull KB from ElevenLabs
```

### Versioning & Branches
```bash
npm run versioning:enable <agent-key>         # Enable versioning (one-time)
npm run branches:list <agent-key>             # List branches and traffic
npm run branches:create-direct <key> <name> "<desc>"  # Create branch
npm run branches:deploy <agent-key>           # Deploy traffic split
npm run branches:merge <agent-key> [branch]   # Merge branch to Main
```

### Testing
```bash
npm run tests:run <agent-key>                 # Run test suite
```

## Creating a New Agent

### End-to-end example

```
You:    /plan Add a new dental office agent with appointment booking and insurance verification
Claude: [reads existing agents for patterns, consults ElevenLabs docs, writes plan to specs/todo/]
        Plan saved. Ready to build?

You:    /build
Claude: [creates git branch, generates prompt + KB + tools + config, commits]
        Push to ElevenLabs Main, or create a new branch?

You:    Create a branch called "dental-v1"
Claude: [pushes to ElevenLabs branch "dental-v1"]
        Done. Run /review to verify, or /test to run simulations.

You:    /test dental-office --runs 5
Claude: [generates 12 test scenarios, runs 5x each in parallel, aggregates results]
        Results: 10 PASS, 1 FLAKY, 1 FAIL
        FAIL: insurance_verification — agent not confirming policy number before tool call
        Suggestion: Add emphasis in Tools section...

You:    Fix the failing test
Claude: [updates prompt, commits, asks about ElevenLabs push]
```

### What happens at each step

1. **`/plan`** — Claude reads the ElevenLabs prompting guide (bundled locally), studies the example agent (Johnson's HVAC) for patterns, and designs the full agent: system prompt, knowledge base, tool definitions, and config. The plan is saved to `specs/todo/` for your approval before any files are created.

2. **`/build`** — Executes the approved plan. Creates the agent folder with all files following the naming conventions (`11labs-system-prompt-<agent>.md`, `11labs-kb-<agent>.md`, etc.). Registers the agent in `elevenlabs-manager/config.json`. Commits to a git branch and asks before pushing anything to ElevenLabs.

3. **`/review`** — Compares the implementation against the original plan. Catches issues like prompts that are too long (adds latency), missing tool configurations, or convention violations. Reports each issue with a severity level so you know what to fix before going live.

4. **`/test`** — Auto-generates test scenarios based on your agent's prompt and tools (guardrail tests, happy paths, error handling, edge cases). Runs each test multiple times to distinguish real failures from LLM non-determinism. A test that fails 2 out of 5 runs is marked FLAKY — meaning the prompt instruction exists but isn't strong enough.

5. **Iterate** — Fix any FAIL or FLAKY tests by strengthening prompt instructions (e.g., adding "This step is important" emphasis), then re-test until stable.

## Project Structure

```
elevenlabs-voice-agent-workflow/
├── elevenlabs-manager/          # CLI tool
│   ├── src/                     # TypeScript source
│   ├── config.json              # Agent mappings (edit this)
│   ├── .env.example             # API key template
│   └── .env                     # Your API key (git-ignored)
├── johnsons-hvac/               # Example agent
│   ├── 11labs-system-prompt-johnsons-hvac.md
│   ├── 11labs-kb-johnsons-hvac.md
│   ├── agent-config.json
│   ├── manual-test-guide.md
│   ├── tools/
│   │   └── submit_callback_request.json
│   └── tests/                   # 13 test scenarios
├── .claude/
│   ├── commands/                # Slash commands (prime, plan, build, etc.)
│   └── skills/                  # Skills (test, elevenlabs-docs)
├── CLAUDE.md                    # Project conventions (read by Claude Code)
├── .cursorrules                 # Editor conventions
├── discovery-template.md        # Client discovery questionnaire
└── README.md                    # This file
```

## Agent Folder Structure

Each agent follows this convention:

```
my-agent/
├── 11labs-system-prompt-my-agent.md   # System prompt (markdown)
├── 11labs-kb-my-agent.md              # Knowledge base (markdown)
├── agent-config.json                  # Full ElevenLabs agent config
├── manual-test-guide.md               # Manual testing scenarios
├── tools/                             # Tool definitions
│   └── tool_name.json
└── tests/                             # Automated test scenarios
    ├── scenario_name.json
    └── results/                       # Test output (git-ignored)
```

## What Claude Can Do in This Project

When you open Claude Code in this repo, it automatically reads `CLAUDE.md` and the files in `.claude/` (commands and skills). These teach Claude how to manage your ElevenLabs agents. Here's what Claude gains the ability to do:

### Read and write local files
- Create and edit agent prompts, knowledge bases, tool definitions, and configs
- Generate test scenarios and manual test guides
- Save plans to `specs/todo/` and move completed plans to `specs/done/`

### Run CLI commands that interact with the ElevenLabs API
Using your API key (from `elevenlabs-manager/.env`), Claude can run bash commands to:
- **Push agent changes** to ElevenLabs (prompts, configs, tools, knowledge bases)
- **Pull agent configs** from ElevenLabs to sync locally
- **Create and manage branches** on ElevenLabs for A/B testing
- **Deploy traffic splits** between branches
- **Merge branches** to Main (production)
- **Run test simulations** against your live agent via the ElevenLabs API

### Pre-approved permissions
This project ships with permissions pre-approved in `.claude/settings.json` (the committed, shared project settings file) so the workflow runs smoothly without constant "approve?" prompts. Because it's committed, every clone gets it automatically — Claude can drive the CLI on the first session, no setup. Out of the box, Claude can:
- Run all `npm run` commands (the elevenlabs-manager CLI)
- Run `git` commands (branching, committing, diffing)
- Run `npx` commands (MCP servers, build tools)
- Use all ElevenLabs, n8n, and n8n-instance MCP tools (if those servers are configured — see below)
- Perform basic file operations (`mkdir`, `ls`, `mv`, `cp`)

To tighten or loosen this, edit `.claude/settings.json`. Your own machine-local overrides go in `.claude/settings.local.json` (gitignored, never shared).

### What Claude will NOT do without asking
Even with permissions pre-approved, the workflow itself has guardrails — Claude will always ask for your confirmation before:
- **Pushing to ElevenLabs** — `/build` always asks whether to push to Main or a new branch
- **Merging branches** — you control when changes go to production
- **Deploying traffic** — you set the percentage split

These guardrails are in the slash command logic, not the permission system, so they apply regardless of your permission settings.

### Why this matters
If you're new to Claude Code: this project gives Claude a lot of context about ElevenLabs best practices and your agent architecture. It doesn't give Claude any access beyond what the CLI tool already provides — Claude is just running the same `npm run` commands you would run manually, but it knows when and how to use them because of the instructions in CLAUDE.md and the slash commands.

## Recommended MCP Servers (Optional)

MCP (Model Context Protocol) servers give Claude Code additional capabilities beyond the built-in CLI. **They are entirely optional — the elevenlabs-manager CLI does everything (push, pull, tools, KB, branches, tests) over the ElevenLabs SDK/REST without any MCP server.** Add them only if you want the extras below.

The fastest setup: copy the bundled template and fill in your keys (delete any server block you don't need):

```bash
cp .mcp.json.example .mcp.json
```

`.mcp.json` is gitignored so your keys never get committed. You can also configure these globally in `~/.claude/mcp.json` instead. The individual server blocks are documented below for reference.

### ElevenLabs MCP

Gives Claude direct access to ElevenLabs API capabilities (voice generation, audio tools, etc.) beyond what the CLI provides.

```json
{
  "mcpServers": {
    "ElevenLabs": {
      "command": "uvx",
      "args": ["elevenlabs-mcp"],
      "env": {
        "ELEVENLABS_API_KEY": "your_elevenlabs_api_key"
      }
    }
  }
}
```

**Requires:** [uv](https://docs.astral.sh/uv/) installed (`brew install uv` on macOS, or `pip install uv`)

### n8n MCP (Documentation + Workflow Management)

Gives Claude access to n8n node documentation and the ability to create/manage n8n workflows. This is what powers the webhook tools that ElevenLabs agents call during conversations (scheduling, callbacks, etc.).

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your_n8n_api_key"
      }
    }
  }
}
```

Without `N8N_API_URL` and `N8N_API_KEY`, the MCP still works for documentation access — Claude can look up n8n node details and help you design workflows. Add the URL and key to let Claude also create and manage workflows on your n8n instance.

**Source:** [github.com/czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp)

### n8n Instance MCP (Built-in n8n MCP Server)

n8n Cloud and self-hosted n8n instances (v1.x+) have a built-in MCP server endpoint. This connects Claude directly to your n8n instance for workflow execution and management. Uses [supergateway](https://github.com/nicobailey/supergateway) to bridge n8n's Streamable HTTP transport to stdio.

```json
{
  "mcpServers": {
    "n8n-instance": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://your-n8n-instance.com/mcp-server/http",
        "--header",
        "authorization:Bearer your_n8n_mcp_api_key"
      ]
    }
  }
}
```

To generate the API key: in your n8n instance, go to **Settings > API > Create API Key**, and select the **MCP Server API** scope.

### Combining MCP configs

You can include all servers in a single `~/.claude/mcp.json` file:

```json
{
  "mcpServers": {
    "ElevenLabs": { ... },
    "n8n-mcp": { ... },
    "n8n-instance": { ... }
  }
}
```

Or add them per-project in a `.mcp.json` file at the project root (same format). Per-project configs are merged with your global config.

## Key Conventions

These are enforced by CLAUDE.md and the review command:

- **Prompt budget**: 400-600 words. Every token adds latency.
- **KB budget**: 300-500 words. Combined prompt+KB under ~1,500 tokens.
- **Prompt structure**: Personality > Goal > Guardrails > Character Normalization > Tools > Error Handling
- **Tool naming**: snake_case for tool names, camelCase for JSON properties
- **Latency settings**: `forcePreToolSpeech: true` and `toolCallSoundBehavior: "always"` on webhook tools
- **Change workflow**: Git branch first, then implement, commit, ask before pushing to ElevenLabs

## License

MIT
