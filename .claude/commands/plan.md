---
description: Create a detailed implementation plan and save to specs/todo/
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
model: opus
argument-hint: [feature or task description]
---

# Plan

## Purpose

Create a detailed implementation plan for agent changes, new agents, prompt optimizations, tool additions, or other work. The plan is saved to `specs/todo/` and can later be executed with `/build`. Separates planning from execution for cleaner workflows.

## Variables

USER_PROMPT: $ARGUMENTS
PLAN_OUTPUT_DIR: specs/todo/

## Instructions

- Think deeply about the best approach before writing
- Reference CLAUDE.md for project conventions (prompt structure, token budgets, tool naming, etc.)
- Consider the impact on test scenarios and latency
- Generate a descriptive kebab-case filename based on the topic
- Plans should be detailed enough for another session to follow without additional context
- For prompt changes, always reference the ElevenLabs prompting guide

## Workflow

1. **Setup folders**
   - Run `mkdir -p specs/todo specs/done` to ensure structure exists

2. **Analyze requirements**
   - Parse USER_PROMPT to understand the core task
   - Identify which agent(s) are affected
   - Read current agent files (prompt, config, KB, tools) to understand baseline

3. **Design solution**
   - Develop approach aligned with CLAUDE.md conventions
   - Consider token budget impact (prompt + KB under ~1,500 tokens)
   - Plan for latency implications
   - Identify which files need to change

4. **Assess complexity**
   - Count the phases needed
   - If 4+ complex phases, consider splitting into multiple specs
   - Name split specs with numeric prefixes: `01-agent-prompt-update.md`, `02-agent-tool-addition.md`

5. **Document the plan**
   - Create comprehensive markdown document with:
     - Problem statement and objectives
     - Agent(s) affected
     - Files to modify
     - Step-by-step changes
     - ElevenLabs push strategy (Main vs branch)
     - Test plan (which test scenarios to run, expected improvements)
     - Rollback plan

6. **Save and report**
   - Generate descriptive filename
   - Write plan to `specs/todo/[filename].md`
   - Provide summary

## Plan Template

```markdown
# [Plan Title]

## Objective
[What we're trying to achieve and why]

## Agent(s)
- [agent-key]: [what's changing]

## Changes

### [Phase 1: Description]
- File: [path]
- Change: [what to modify]
- Rationale: [why]

### [Phase 2: Description]
...

## Push Strategy
- [ ] Push to ElevenLabs Main
- [ ] Create ElevenLabs branch: [branch-name]

## Test Plan
- Run test suite for [agent-key]: [expected results]
- Key criteria to watch: [specific criteria]

## Rollback
- [How to revert if needed]

## Token Budget Impact
- Current: [X words prompt, Y words KB]
- After: [X words prompt, Y words KB]
```

## Report

```
Plan Created

File: specs/todo/[filename].md
Agent(s): [agent keys]
Phases: [count]

Key Changes:
- [change 1]
- [change 2]

Next: Run `/build specs/todo/[filename].md` to implement
```
