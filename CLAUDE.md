# ElevenLabs Agent Management

Manages ElevenLabs conversational AI agents with local version control. The `elevenlabs-manager/` directory is the CLI tool. Agent data lives in sibling folders at the project root.

```
elevenlabs-voice-agent-workflow/
├── elevenlabs-manager/    # CLI tool (run commands from here)
├── johnsons-hvac/         # Agent data
├── CLAUDE.md
└── .cursorrules
```

Each agent folder contains: `11labs-system-prompt-{agent}.md`, `agent-config.json`, and optionally `11labs-kb-{agent}.md` and `tools/`.

## ElevenLabs Docs

Full ElevenLabs developer documentation is available via the `/elevenlabs-docs` skill. It provides a complete URL index for all Eleven Agents docs pages and pre-fetched key references (prompting guide, server tools, knowledge base/RAG) for instant access.

## Agent Keys

- `johnson-hvac` — Johnson's HVAC (`johnsons-hvac/`)

## CLI Commands (from `elevenlabs-manager/`)

```bash
# Agents
npm run agents:list
npm run agents:pull <agent-key>
npm run agents:push <agent-key> [--branch <name>]
npm run agents:diff <agent-key>

# Branches
npm run branches:list <agent-key>
npm run branches:create-direct <agent-key> <branch-name> "<description>"
npm run branches:deploy <agent-key>
npm run branches:merge <agent-key> [source-branch]

# Tools
npm run tools:list <agent-key>
npm run tools:create <agent-key> [tool-name]
npm run tools:push <agent-key>

# Knowledge Base
npm run kb:sync <agent-key>             # Push local KB markdown to ElevenLabs
npm run kb:pull <agent-key>             # Pull KB from ElevenLabs (converts HTML to markdown)

# Versioning (one-time, irreversible)
npm run versioning:enable <agent-key>
```

## New Agent Defaults

Unless told otherwise, all new agents should use:

- **LLM Model:** `gpt-4o` (same as Johnson's HVAC)
- **Voice:** Same voice as Johnson's HVAC (`voiceId: uYXf8XasLslADfZ2MB4u`)
- **Webhook URLs:** Same n8n webhook base URLs as Johnson's HVAC where the tools are similar (check_availability, schedule_appointment, etc.)
- **Phone Numbers:** Same placeholder phone numbers as Johnson's HVAC until real numbers are provided
- **Webhook tool settings:** `forcePreToolSpeech: true`, `toolCallSoundBehavior: "always"` on all webhook tools
- **Cascade timeout:** `cascadeTimeoutSeconds: 5`

## CRITICAL: Change Workflow (All Agent/Tool/Config Changes)

IMPORTANT: ANY change to agents, tools, configs, prompts, or knowledge bases MUST follow this workflow. No exceptions.

1. **Create a local git branch** before making any changes: `git checkout -b feature/[agent-name]-[brief-description]`
2. Make the changes locally (prompt, config, tools, KB, etc.)
3. **Commit changes** to the local branch
4. **Always ask the user**: push to ElevenLabs Main, or create a new ElevenLabs branch and push to it?

### For Prompt Updates

Before ANY system prompt change, read the ElevenLabs prompting guide (available locally via `/elevenlabs-docs` skill at `references/prompting-guide.md`).

### Required Prompt Structure

Personality > Goal > Guardrails > Character Normalization > Tools > Error Handling

**Token budget:** Target ~400-600 words for prompt, ~300-500 words for KB. Combined prompt + KB should stay under ~1,500 tokens. Every token adds latency — lean is fast. Reference `johnsons-hvac/` for the gold standard (~430 word prompt, ~325 word KB, avg 798ms TTFB).

**Sections NOT needed** (proven to add bloat without improving behavior):
- ~~Environment~~ — redundant with Personality
- ~~Tone~~ — fold "1-2 sentences" into Personality
- ~~Data Collection~~ — one sentence in Goal: "Collect X, Y, Z one field at a time"
- ~~Examples/Dialogues~~ — GPT-4o handles fine without them
- ~~Spelling Verification~~ — one sentence in Character Normalization is enough

Key rules:
- Keep instructions concise and action-based
- Mark critical steps with "This step is important"
- Include character normalization for emails/phones/names (see prompting guide)
- Include guardrails and tool error handling
- Add filler instruction in Tools section: "Before calling any tool, briefly tell the caller what you're doing." This eliminates perceived dead silence during tool calls when combined with `forcePreToolSpeech`
- When a caller spells or corrects data, include a one-sentence instruction to apply the correction before passing to tools

## Tool Creation Workflow

1. **Create a local git branch first** (see Change Workflow above)
2. Create `[agent-folder]/tools/[tool_name].json`
3. Push tool: `npm run tools:push <agent-key>`
4. Add returned tool ID to agent's `agent-config.json` under `conversation_config.agent.prompt.toolIds`
5. Commit all changes to the local branch
6. **Ask the user**: push to ElevenLabs Main, or create a new ElevenLabs branch and push to it?
7. Reference tool in system prompt with usage instructions and error handling

### Tool Naming Conventions

- Tool names: **snake_case** (`submit_phone_number`, not `submitPhoneNumber`)
- File names match tool name: `submit_phone_number.json`
- JSON properties: **camelCase** (`apiSchema`, `requestBodySchema`)
- POST/PUT/PATCH webhooks MUST include `requestBodySchema` with a `description` field
- Use only `toolIds` in agent config — never both `tools` and `toolIds`
- Server tools reference: available locally via `/elevenlabs-docs` skill at `references/server-tools.md`

## Latency Optimization

Every token in the prompt and KB adds LLM processing time. These settings were validated on Johnson's HVAC (avg 798ms TTFB):

- **`forcePreToolSpeech: true`** — Set on each webhook tool object via `/v1/convai/tools/{id}` PATCH (not on the agent config). Makes the LLM generate speech before the tool fires, eliminating dead silence. Reduced perceived tool wait from 7.3s to 1.0s.
- **`toolCallSoundBehavior: "always"`** — Set on each webhook tool object. Plays ambient audio during tool execution.
- **`cascadeTimeoutSeconds: 5`** — In agent config. Controls when GPT-4o falls back to the backup LLM.
- **Filler instruction in prompt** — "Before calling any tool, briefly tell the caller what you're doing." Works with `forcePreToolSpeech` to give the caller something to hear while tools execute.

Note: `forcePreToolSpeech` and `toolCallSoundBehavior` live on the **tool objects** (`/v1/convai/tools/{id}`), NOT on the agent config. The `agents:push` CLI only updates the prompt — tool settings must be updated via direct API PATCH to each tool.

## Knowledge Base

### KB Usage Modes

- **`prompt`** — Full KB content injected into every LLM turn. Best for small KBs (under ~5,000 tokens / ~300 lines). No retrieval step, no failure risk. **Use this by default for all new agents.**
- **`auto`** — System decides when to include content based on query relevance. Only use with RAG for large documents.
- **`rag`** — Semantic search retrieves only matching chunks. Only needed when the KB is too large to fit in the prompt context window.

### When to Use RAG vs Prompt Mode

| KB Size | Mode | RAG |
|---|---|---|
| Small (< 5,000 tokens) | `prompt` | **Disabled** |
| Medium (5,000 - 50,000 tokens) | `auto` | Enabled |
| Large (50,000+ tokens) | `auto` or `rag` | Enabled |

Documents under 500 bytes are automatically injected as prompt (RAG cannot index them).

### RAG (only if needed)

If RAG is enabled, the RAG index **must** be computed after creating/updating a KB document. The `kb:sync` command handles this automatically. If done manually:

```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/knowledge-base/rag-index" \
  -H "xi-api-key: YOUR_KEY" -H "Content-Type: application/json" \
  -d '{"items": [{"document_id": "KB_DOC_ID", "create_if_missing": true, "model": "e5_mistral_7b_instruct"}]}'
```

### KB Format

Use headers + concise paragraphs, not verbose Q&A for every fact. Q&A format is only needed for FAQs where the question-answer pairing adds value. Keep answers to 1-2 sentences. Don't duplicate info that's already in the system prompt (e.g., service types, pricing rules). Reference `johnsons-hvac/11labs-kb-johnsons-hvac.md` for the target format (~325 words, ~40 lines).

### KB Upload Method

Always upload KB files as **file uploads** (type: `file`), not via text API (type: `text`). File uploads get proper HTML extraction which works better with both prompt injection and RAG.

Reference: available locally via `/elevenlabs-docs` skill at `references/knowledge-base.md`

## Common Mistakes

- Making changes without creating a local git branch first
- Pushing to ElevenLabs without asking the user whether to use Main or a new branch
- **Verbose prompts** — adding Environment, Tone, Data Collection, Examples sections that bloat the prompt. Every extra token adds latency. Johnson's HVAC went from 2,554 words (4-7s TTFB) to 436 words (0.5-0.7s TTFB)
- **Missing forcePreToolSpeech** — without it, callers hear dead silence for 5-7s during tool calls
- **Using RAG for small KBs** — causes empty retrieval when semantic search fails to match. Use `prompt` mode instead for KBs under ~5,000 tokens
- **Uploading KB via text API instead of file upload** — text-type documents get raw markdown in `extracted_inner_html` instead of proper HTML extraction
- **Forgetting to compute RAG index after creating/updating a KB** (when RAG is enabled — causes empty retrieval results)
- Creating a tool but forgetting to attach its ID to the agent's `toolIds`
- Missing `requestBodySchema` or its `description` for POST webhook tools
- Skipping character normalization for structured data collection
- Missing guardrails or error handling sections in prompts
