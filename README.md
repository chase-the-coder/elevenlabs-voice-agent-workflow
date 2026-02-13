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
- An [ElevenLabs](https://elevenlabs.io) account with API access
- Git

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/elevenlabs-voice-agent-workflow.git
cd elevenlabs-voice-agent-workflow/elevenlabs-manager
npm install
```

### 2. Configure your API key

```bash
cp .env.example .env
# Edit .env and add your ElevenLabs API key
```

### 3. Discover your agents

```bash
npm run discover
```

This fetches your ElevenLabs agents and helps you map them to local folders. You can also manually edit `config.json`.

### 4. Start Claude Code

```bash
cd ..  # back to project root
claude
```

Claude Code will automatically read CLAUDE.md and understand the project conventions.

## The Workflow

This project uses a structured workflow powered by Claude Code slash commands. Here's the typical flow:

### `/prime` — Orient yourself
Run this at the start of every session. It reads the project structure, checks git state, and lists recent handoffs so Claude understands what's going on.

### `/plan <description>` — Design before building
Describe what you want to change. Claude will analyze the codebase, design an approach, and save a detailed plan to `specs/todo/`. Plans include file changes, token budget impact, test strategy, and rollback steps.

**Example:** `/plan Add a new dental office agent with appointment booking and insurance verification`

### `/build [path-to-plan]` — Execute the plan
Implements the changes specified in a plan file. Creates a git branch, makes the changes, commits, and asks whether to push to ElevenLabs Main or a new branch.

### `/review [spec-file]` — Verify the implementation
Compares what was built against the original spec. Checks prompt word count, convention compliance, and ElevenLabs push state. Reports issues as skippable, tech_debt, or blocker.

### `/test <agent-key>` — Run the test suite
Runs simulated conversations against your agent multiple times, aggregates results, and presents a summary table with PASS/FLAKY/FAIL classification. Tests are auto-generated from your agent's prompt and tools if they don't exist yet.

**Example:** `/test johnson-hvac --runs 5`

### Other commands

| Command | Purpose |
|---------|---------|
| `/commit` | Create a git commit with a descriptive message |
| `/handoff` | Save session state for seamless continuation later |
| `/pickup` | Resume from a previous session handoff |
| `/elevenlabs-docs` | Access ElevenLabs documentation instantly |

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

1. Run `/plan Add a new [business type] agent with [capabilities]`
2. Run `/build` to execute the plan
3. Run `/review` to verify against the spec
4. Run `/test <agent-key>` to validate behavior
5. Iterate on any FAIL or FLAKY results

The plan will automatically follow the conventions in CLAUDE.md: concise prompts (400-600 words), lean KBs (300-500 words), proper tool naming, latency optimization settings, and character normalization.

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

## Key Conventions

These are enforced by CLAUDE.md and the review command:

- **Prompt budget**: 400-600 words. Every token adds latency.
- **KB budget**: 300-500 words. Combined prompt+KB under ~1,500 tokens.
- **Prompt structure**: Personality > Goal > Guardrails > Character Normalization > Tools > Error Handling
- **Tool naming**: snake_case for tool names, camelCase for JSON properties
- **Latency settings**: `forcePreToolSpeech: true` and `toolCallSoundBehavior: "always"` on webhook tools
- **Change workflow**: Git branch first, then implement, commit, ask before pushing to ElevenLabs

## License

ISC
