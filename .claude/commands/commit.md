---
description: Create a git commit with a descriptive message
allowed-tools: Bash, Read
model: sonnet
argument-hint: [optional: commit message]
---

# Commit

## Purpose

Create a git commit with a properly formatted, descriptive message. Analyzes changes and generates a meaningful commit message if none provided.

## Variables

USER_MESSAGE: $ARGUMENTS

## Instructions

- Generate concise, descriptive commit messages
- Use present tense ("add", "fix", "update" not "added", "fixed")
- Keep subject line under 50 characters
- Use conventional format: `type: description`

## Commit Types

| Type | When to Use |
|------|-------------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `chore` | Maintenance, dependencies, config |
| `perf` | Performance improvements (latency, token budget) |

## Workflow

1. **Check for changes**
   - Run `git status` to see what's modified
   - If no changes, inform user and exit

2. **Analyze changes**
   - Run `git diff HEAD` to understand what changed
   - Identify the type of change
   - Note which agent(s) are affected

3. **Generate commit message**
   - If USER_MESSAGE provided, use it
   - Otherwise, generate based on changes
   - Format: `type: brief description`
   - If agent-specific, prefix with agent name: `fix(lindsays-hvac): update service area`

4. **Stage and commit**
   - Stage specific changed files by name (avoid `git add -A` to prevent committing secrets)
   - Run `git commit -m "[message]"`

5. **Confirm success**
   - Show the commit hash and message
   - Ask if user wants to push

## Report

```
Commit Created

Hash: [short hash]
Message: [commit message]
Files: [count] changed
Agent(s): [affected agent names or "none"]

Push to remote? Run: git push
```
