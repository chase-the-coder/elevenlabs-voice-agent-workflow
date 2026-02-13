---
name: test
description: Generate, run, and analyze agent test suites. Runs simulated conversations multiple times, aggregates results, and presents a summary table with PASS/FLAKY/FAIL classification and actionable suggestions.
user-invocable: true
argument-hint: <agent-key> [--regen] [--runs N]
---

# Agent Test Suite — Generate, Run, Analyze

Run simulated conversation tests against an ElevenLabs agent, aggregate results across multiple runs, and present a clear summary with actionable suggestions.

## Arguments

Parse `$ARGUMENTS` for:
- **agent-key** (required) — the agent key (e.g. `prestige-realty`, `lindsay-hvac`)
- **--regen** (optional) — force regeneration of test files even if they exist
- **--runs N** (optional) — number of test runs, default 5

If no agent-key is provided, list available agents from config and ask the user to pick one.

## Step 1: Resolve Agent

Read `elevenlabs-manager/config.json` and look up the agent-key in the `agents` map. Extract:
- `folder` — relative path to agent directory (e.g. `../prestige-realty`)
- `agent_id` — the ElevenLabs agent ID
- `files.system_prompt` — prompt filename
- `files.knowledge_base` — KB filename (may not exist on disk)

Convert the relative folder to an absolute path from the project root. For example, if config says `"folder": "../prestige-realty"`, the agent folder is `prestige-realty/` at the project root.

If the agent-key is not found, show available keys and exit.

## Step 2: Check for Existing Tests

Check if `<agent-folder>/tests/*.json` exists (excluding `results/` directory).

- **If tests exist AND `--regen` was NOT passed**: Skip to Step 4 (Run Phase)
- **If no tests exist OR `--regen` was passed**: Proceed to Step 3 (Generate Phase)

## Step 3: Generate Test Suite

### 3a. Read Agent Materials (in parallel)

Read ALL of these files in parallel:

1. `<agent-folder>/<system_prompt_filename>` — the agent's system prompt
2. `<agent-folder>/<knowledge_base_filename>` — the agent's KB (if exists)
3. `<agent-folder>/agent-config.json` — full agent configuration
4. `<agent-folder>/tools/*.json` — ALL tool definition files
5. `johnsons-hvac/tests/ac_repair_booking.json` — happy-path reference
6. `johnsons-hvac/tests/pricing_guardrail.json` — guardrail reference
7. `johnsons-hvac/tests/tool_failure_callback.json` — error handling reference

### 3b. Analyze Agent

From the system prompt, KB, config, and tools, identify:

| What to Find | Where to Look |
|---|---|
| Agent name and company | Personality section of prompt |
| Service area / geography | Personality or Guardrails section |
| Primary actions (book, schedule, submit) | Goal section of prompt + tool definitions |
| Data collection fields and order | Goal section — "Collect X, Y, Z" |
| Guardrail rules | Guardrails section — each rule is a potential test |
| Emergency/transfer triggers | Prompt keywords like "emergency", "transfer", "escalate" |
| Service boundaries | Geographic limits, excluded services, scope restrictions |
| Tool usage rules | Ordering (check availability before schedule), pre-conditions |
| Error handling / retry policy | Error Handling section of prompt |
| Fallback tool | Usually `submit_callback_request` or similar |
| KB FAQ content | Knowledge base file — each major topic is a potential FAQ test |

### 3c. Select Test Categories

Generate 8-15 tests. Pick categories that apply to this agent:

| Category | When to Include | Turn Limit | Simulated User Temperature |
|---|---|---|---|
| Happy-path per primary tool | Each webhook action tool (schedule, submit, book, etc.) | 20-25 | 0.3 |
| CRUD variants (reschedule/cancel) | If agent has reschedule/cancel/update tools | 20-25 | 0.3 |
| Guardrail enforcement | Each guardrail rule in prompt (pricing, scope, etc.) | 12-15 | 0.3 |
| Emergency triage (1-2) | If prompt mentions emergency triggers | 10-12 | 0.3 |
| Service boundary | If prompt has geographic or service-type limits | 12-15 | 0.3 |
| Frustrated caller transfer | If agent has `transfer_to_number` system tool | 10-12 | 0.4 |
| Tool failure fallback | If agent has a callback/fallback tool | 20-25 | 0.3 |
| KB FAQ retrieval (1-2) | If agent has a knowledge base | 12-15 | 0.3 |
| Agent routing/matching | If multiple transfer targets exist | 15-20 | 0.3 |
| Lead capture | If agent has a lead/intake submission tool | 15-20 | 0.3 |
| Scope rejection | If prompt limits topics (no legal advice, etc.) | 10-12 | 0.3 |

### 3d. Generate Test JSON Files

For each test, create a JSON file following this exact structure (reference: `johnsons-hvac/tests/ac_repair_booking.json`):

```json
{
  "name": "Human-Readable Test Name",
  "description": "One sentence describing what this test validates",
  "simulation_specification": {
    "simulated_user_config": {
      "prompt": {
        "prompt": "You are a [persona] calling [company]. [Scenario setup]. When asked, provide:\n- Name: [realistic fake name]\n- Phone: [area-code-matching fake number]\n- Email: [matching fake email]\n- Address: [realistic address in the agent's service area]\n[Behavioral instructions for the simulated caller]",
        "llm": "gpt-4o",
        "temperature": 0.3
      }
    },
    "tool_mock_config": {
      "tool_name_1": {
        "default_return_value": "{\"key\": \"value\"}"
      },
      "tool_name_2": {
        "default_return_value": "{\"key\": \"value\"}"
      }
    },
    "dynamic_variables": {}
  },
  "extra_evaluation_criteria": [
    {
      "id": "snake_case_id",
      "name": "Human Readable Name",
      "conversation_goal_prompt": "Detailed description of what to evaluate. Be specific about what constitutes a pass vs fail. Reference specific behaviors, tool calls, or content the agent should or should not have produced."
    }
  ],
  "new_turns_limit": 20
}
```

### Test generation rules

1. **Mock ALL webhook tools** in every test via `tool_mock_config` — this prevents live webhook hits during simulation. Include every webhook tool the agent has, even if the test doesn't directly exercise it.

2. **For tool failure tests**: Set `"default_is_error": true` on the tool that should fail:
   ```json
   "schedule_appointment": {
     "default_return_value": "ERROR: Internal server error. The scheduling system is currently unavailable. Please try again.",
     "default_is_error": true
   }
   ```

3. **3-4 evaluation criteria per test** — specific and measurable. Each criterion should:
   - Have a snake_case `id`
   - Have a clear `conversation_goal_prompt` that describes exactly what to look for
   - Be evaluatable from the conversation transcript alone

4. **Fake but realistic test data** — use the agent's actual service area:
   - Area codes matching the agent's geography
   - Street names that exist in the area
   - Realistic names and email addresses
   - Service types matching the agent's offerings

5. **Snake_case file names** matching the scenario: `showing_booking_luxury.json`, `pricing_guardrail.json`, `lead_capture_selling.json`

6. **Simulated user prompt should**:
   - Set a clear persona and scenario
   - Provide all data the agent will need to collect (one piece at a time instruction)
   - Include behavioral instructions (be cooperative, be persistent, accept alternative, etc.)
   - For guardrail tests: instruct the simulated user to push 2-3 times before accepting

### 3e. Write Files

1. Create `<agent-folder>/tests/` directory if it doesn't exist
2. Write each test JSON file to `<agent-folder>/tests/<scenario_name>.json`
3. Create `<agent-folder>/tests/results/` directory if it doesn't exist
4. Create `<agent-folder>/tests/results/.gitignore` with contents:
   ```
   # Ignore test results (generated files)
   *.json
   !.gitignore
   ```

After writing all test files, show a summary:
```
Generated N tests for <agent-key>:
  - test_name_1.json (Happy Path)
  - test_name_2.json (Guardrail)
  - ...
```

## Step 4: Run Test Suite

### 4a. Execute N Runs (in parallel)

Run the test suite N times (default 5) **in parallel** from the `elevenlabs-manager/` directory. Launch all N runs simultaneously using background Bash commands:

```bash
cd elevenlabs-manager && npm run tests:run <agent-key>
```

Launch all N instances at once (each as a separate Bash call with `run_in_background: true`), then wait for all to complete. This dramatically reduces total wall-clock time since the ElevenLabs API handles concurrent requests fine.

Each run takes 1-3 minutes depending on the number of tests. Set a generous timeout (600000ms / 10 minutes per run).

### 4b. Collect Results

After all runs complete, read the N most recent result files from `<agent-folder>/tests/results/`. Sort by filename (they contain timestamps) and take the last N files.

Each result file is a JSON array of objects:
```json
[
  {
    "name": "Test Name",
    "passed": true,
    "criteria": [
      {
        "criteriaId": "snake_case_id",
        "result": "success",
        "rationale": "Why this criterion passed or failed"
      }
    ],
    "transcript": [...]
  }
]
```

## Step 5: Aggregate Results

For each test (matched by `name` across runs):

1. **Pass count**: Number of runs where `passed === true`
2. **Pass rate**: `pass_count / N`
3. **Status**:
   - `PASS` — 100% pass rate (all N runs passed)
   - `FLAKY` — 34-99% pass rate (some runs passed, some failed)
   - `FAIL` — 0-33% pass rate (consistent failure)
4. **Failing criteria**: For each criterion, track how many runs it failed in and collect the failure rationale

## Step 6: Present Results

### Summary Table

```
Test Results: <agent-key> (N runs)
============================================================

| Test                        | Run 1 | Run 2 | Run 3 | Run 4 | Run 5 | Rate | Status |
|-----------------------------|-------|-------|-------|-------|-------|------|--------|
| Test Name One               |  PASS |  PASS |  PASS |  PASS |  PASS | 5/5  | PASS   |
| Test Name Two               |  PASS |  FAIL |  PASS |  PASS |  PASS | 4/5  | FLAKY  |
| Test Name Three             |  FAIL |  FAIL |  FAIL |  FAIL |  FAIL | 0/5  | FAIL   |
| ...                         |       |       |       |       |       |      |        |

Overall: X/Y PASS, Z FLAKY, W FAIL
```

Use "PASS" and "FAIL" as the cell values for each run column. Align columns for readability.

### Failure Details

For any test with status FAIL or FLAKY, show which criteria failed:

```
FAIL: Test Name Three (0/3)
  - criterion_id_1: FAILED 3/3 — "Rationale from the most recent failure"
  - criterion_id_2: PASSED 3/3

FLAKY: Test Name Two (2/3)
  - criterion_id_1: FAILED 1/3 — "Rationale from the failure run"
  - criterion_id_2: PASSED 3/3
```

### Suggestions

Based on aggregated results:

- **FAIL tests**: "This test fails consistently. The agent's prompt likely needs reinforcement in the [section] section. Specifically, the criterion `[criterion_id]` failed because: [rationale]. Check the [Guardrails/Goal/Tools/Error Handling] section of the system prompt and consider adding 'This step is important' emphasis or making the instruction more explicit."

- **FLAKY tests**: "This test is non-deterministic. The failing criterion `[criterion_id]` passed in [X] runs but failed in [Y]. This could mean: (1) the prompt instruction is present but not strong enough — consider adding 'This step is important' emphasis, or (2) the evaluation criterion may be too strict — consider rewording the `conversation_goal_prompt` to be more lenient."

- **All PASS**: "All tests passing consistently across N runs. The agent is behaving as specified."

### Final Summary Line

End with a single actionable line:
- If any FAIL: "Action needed: Review the prompt sections noted above for the N failing test(s)."
- If only FLAKY: "Consider reinforcing prompt instructions for the N flaky test(s), or adjust evaluation criteria if the behavior is acceptable."
- If all PASS: "No action needed. Agent behavior is consistent with the specification."
