---
description: Execute a plan file, then move plan to done/
allowed-tools: Read, Write, Bash, Edit, Glob, Grep
model: sonnet
argument-hint: [path-to-plan]
---

# Build

## Purpose

Execute an implementation plan from `specs/todo/` — making the actual changes to agent prompts, configs, tools, and KBs. After successful completion, moves the plan to `specs/done/`. Pairs with `/plan`.

## Variables

PATH_TO_PLAN: $ARGUMENTS

## Instructions

- If no path provided, check `specs/todo/` and ask which plan to execute
- Read the entire plan before starting
- Follow the plan's phases in order
- Follow CLAUDE.md conventions (Change Workflow, prompt structure, tool naming, etc.)
- IMPORTANT: Always ask the user before pushing to ElevenLabs (Main vs branch)
- If execution fails, leave the plan in `specs/todo/` for retry

## Workflow

1. **Locate the plan**
   - If PATH_TO_PLAN is provided, use it
   - Otherwise, list files in `specs/todo/` and ask user which to execute

2. **Read and understand**
   - Read the plan file completely
   - Read current state of affected agent files
   - Identify any potential issues before starting

3. **Create git branch** (per CLAUDE.md Change Workflow)
   - `git checkout -b feature/[agent-name]-[brief-description]`
   - Unless we're already on an appropriate feature branch

4. **Implement changes**
   - Follow the plan's phases step by step
   - Modify prompt, config, tools, KB files as specified
   - For prompt changes: verify word count stays within budget

5. **Commit changes**
   - Stage and commit all modified files
   - Use conventional commit format

6. **Ask about ElevenLabs push**
   - Ask user: Push to ElevenLabs Main, or create a branch?
   - Execute the push per user's choice using CLI commands from `elevenlabs-manager/`

7. **Move plan to done**
   - On success: `mv [PATH_TO_PLAN] specs/done/`
   - On failure: leave in `specs/todo/` for retry

8. **Show status**
   - Run `git status` to show what changed
   - Report what was pushed to ElevenLabs

## Report

```
Build Complete

Plan: [original path]
Status: SUCCESS / FAILED
Location: specs/done/[filename] (moved) OR specs/todo/[filename] (retry needed)

Changes Made:
- [change 1]
- [change 2]

Git:
- Branch: [branch name]
- Commit: [hash] [message]

ElevenLabs:
- Pushed to: [Main / branch-name / not yet pushed]

Next: Run `/validate [agent-key]` to test, or `/review` to verify against spec
```
