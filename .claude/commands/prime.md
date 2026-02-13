---
description: Gain a general understanding of the codebase
allowed-tools: Bash, Read, Glob
model: sonnet
---

# Prime

## Purpose

Quickly understand this ElevenLabs agent management codebase by reading key files and summarizing the project structure. Run this when starting work on a new session or when unfamiliar with the project.

## Workflow

1. Run `git ls-files` to list all tracked files
2. Read `CLAUDE.md` for project conventions and workflows
3. List all agent folders and identify which agents exist
4. For each agent, note which files are present (prompt, config, KB, tools, tests)
5. Read `elevenlabs-manager/package.json` for available CLI commands
6. Check current git branch and status
7. Check `specs/handoffs/` for any recent session handoffs

## Report

Summarize your understanding:

```
Project: ElevenLabs Voice Agent Workflow
Purpose: ElevenLabs conversational AI agent management with local version control

Agents:
- [agent-key] ([folder]): [brief description, file count]
- [agent-key] ([folder]): [brief description, file count]

CLI Tool: elevenlabs-manager/
Key Commands: agents:push, agents:pull, agents:diff, kb:sync, tools:push

Structure:
- [folder]: [purpose]
- [folder]: [purpose]

Git State:
- Branch: [current branch]
- Status: [clean/dirty]

Recent Handoffs: [list or "none"]

Ready to work. What would you like to do?
```
