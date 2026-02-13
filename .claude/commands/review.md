---
description: Review agent changes against the original spec
allowed-tools: Bash, Read, Glob, Grep
model: sonnet
argument-hint: [spec-file-path]
---

# Review

## Purpose

Compare implemented agent changes against the original plan/spec to ensure everything was built as intended. Checks prompt changes, config modifications, tool additions, and KB updates against the plan's requirements.

## Variables

SPEC_FILE: $ARGUMENTS

## Instructions

- Read the spec file to understand original requirements
- Use git diff to see what actually changed
- Check each requirement against the implementation
- Verify CLAUDE.md conventions were followed
- Report issues by severity: skippable, tech_debt, blocker

## Issue Severity Guide

| Severity | Description | Action |
|----------|-------------|--------|
| `skippable` | Non-blocking, minor issue | Can push, note for later |
| `tech_debt` | Works but needs cleanup | Can push, create follow-up |
| `blocker` | Breaks functionality or violates conventions | Must fix before push |

## Workflow

1. **Locate the spec**
   - If SPEC_FILE provided, use it
   - Otherwise, check `specs/done/` for the most recent spec
   - Read the spec file completely

2. **Review the changes**
   - Run `git diff main` to see all changes on this branch
   - Compare each spec requirement to implementation
   - Check that all requirements are addressed

3. **Convention checks**
   - Prompt word count within budget (400-600 words)?
   - KB word count within budget (300-500 words)?
   - Combined prompt + KB under ~1,500 tokens?
   - Tool naming follows snake_case convention?
   - `forcePreToolSpeech: true` set on webhook tools?
   - `toolCallSoundBehavior: "always"` set on webhook tools?
   - Prompt follows required structure (Personality > Goal > Guardrails > Character Normalization > Tools > Error Handling)?
   - Character normalization included for data collection?
   - Filler instruction present in Tools section?

4. **ElevenLabs state check**
   - Was the change pushed to ElevenLabs?
   - To Main or a branch?
   - Were tests run? What were the results?

5. **Make recommendation**
   - APPROVED: All requirements met, no blockers
   - APPROVED_WITH_NOTES: Works, but has skippable/tech_debt issues
   - NEEDS_CHANGES: Has blocker issues

## Report

```
## Review Results

**Spec:** [spec file path]
**Agent(s):** [agent keys]
**Status:** APPROVED | APPROVED_WITH_NOTES | NEEDS_CHANGES

### Summary
[2-4 sentences: what was built and whether it matches spec]

### Requirements Checklist
- [x] Requirement 1 - Implemented correctly
- [x] Requirement 2 - Implemented correctly
- [ ] Requirement 3 - Partial (see issues)

### Convention Compliance
- [x] Prompt word count: [N] words (budget: 400-600)
- [x] KB word count: [N] words (budget: 300-500)
- [x] Prompt structure follows required order
- [x] Tool naming: snake_case
- [x] forcePreToolSpeech set on webhooks
- [ ] Missing: [any convention violations]

### Issues Found (if any)

**Issue #1** ([severity])
- Description: [what's wrong]
- Resolution: [how to fix]

### ElevenLabs State
- Pushed: [yes/no]
- Target: [Main / branch-name]
- Test results: [summary]

### Recommendation
[APPROVED / APPROVED_WITH_NOTES / NEEDS_CHANGES] - [brief rationale]
```
