# ElevenLabs Prompting Guide

> Source: https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide

## Table of Contents

- [Introduction](#introduction)
- [Prompt Engineering Fundamentals](#prompt-engineering-fundamentals) — Sections, conciseness, emphasis, normalization, examples, guardrails
- [Tool Configuration for Reliability](#tool-configuration-for-reliability) — Descriptions, parameters, prompt guidance, error handling
- [Architecture Patterns](#architecture-patterns-for-enterprise-agents) — Specialization, orchestrator/specialist, handoffs
- [Model Selection](#model-selection-for-enterprise-reliability) — Tradeoffs, recommendations by use case
- [Iteration and Testing](#iteration-and-testing) — Evaluation, failure analysis, refinements, simulation
- [Production Considerations](#production-considerations) — Error handling across integrations
- [Example 1: Technical Support Agent](#example-1-technical-support-agent)
- [Example 2: Customer Service Refund Agent](#example-2-customer-service-refund-agent)
- [Required Prompt Structure](#required-prompt-structure-summary)
- [FAQ Highlights](#faq-highlights)

## Introduction

Effective prompting transforms ElevenLabs Agents from robotic to lifelike. A system prompt serves as "the personality and policy blueprint of your AI agent." In enterprise contexts, these prompts become elaborate — defining role, goals, allowable tools, task instructions, and behavioral guardrails.

**Key Note:** "The system prompt controls conversational behavior and response style, but does not control conversation flow mechanics like turn-taking, or agent settings like which languages an agent can speak."

---

## Prompt Engineering Fundamentals

### 1. Separate Instructions into Clean Sections

Use markdown headings to organize instructions into distinct sections. "Models are tuned to pay extra attention to certain headings (especially `# Guardrails`), and clear section boundaries prevent instruction bleed."

**Less effective:**
```
You are a customer service agent. Be polite and helpful. Never share sensitive data. You can look up orders and process refunds.
```

**Recommended:**
```
# Personality
You are a customer service agent for Acme Corp. You are polite, efficient, and solution-oriented.

# Goal
Help customers resolve issues quickly by looking up orders and processing refunds when appropriate.

# Guardrails
Never share sensitive customer data across conversations.
Always verify customer identity before accessing account information.

# Tone
Keep responses concise (under 3 sentences) unless the user requests detailed explanations.
```

### 2. Be as Concise as Possible

"Keep every instruction short, clear, and action-based. Remove filler words and restate only what is essential for the model to act correctly."

**Less effective:**
```
When you're talking to customers, you should try to be really friendly and approachable, making sure that you're speaking in a way that feels natural and conversational, kind of like how you'd talk to a friend.
```

**Recommended:**
```
# Tone
Speak in a friendly, conversational manner while maintaining professionalism.
```

### 3. Emphasize Critical Instructions

Highlight critical steps by adding "This step is important" to emphasize them. "Repeating the most important 1-2 instructions twice in the prompt can help reinforce them."

**Recommended approach:**
```
# Goal
Verify customer identity before accessing their account. This step is important.

# Guardrails
Never access account information without verifying customer identity first. This step is important.
```

### 4. Normalize Inputs and Outputs

"Voice agents often misinterpret or misformat structured information such as emails, IDs, or record locators." Separate spoken format from written format.

**Character Normalization Example:**
```
**Spoken format** (to/from user):
- Email: "john dot smith at company dot com"
- Phone: "five five five... one two three... four five six seven"
- Code: "A B C one two three"

**Written format** (for tools/APIs):
- Email: "john.smith@company.com"
- Phone: "5551234567"
- Code: "ABC123"
```

### 5. Provide Clear Examples

"Large language models follow instructions more reliably when they have concrete examples to reference."

**Recommended:**
```
When a customer provides a confirmation code:
1. Listen for the spoken format (e.g., "A B C one two three")
2. Convert to written format (e.g., "ABC123")
3. Pass to `lookupReservation` tool

## Examples
User says: "My code is A... B... C... one... two... three"
You format: "ABC123"

User says: "X Y Z four five six seven eight"
You format: "XYZ45678"
```

### 6. Dedicate a Guardrails Section

List all non-negotiable rules in a dedicated section. "Models are tuned to pay extra attention to this heading."

**Example:**
```
# Guardrails
Never share customer data across conversations or reveal sensitive account information without proper verification.
Never process refunds over $500 without supervisor approval.
Never make promises about delivery dates that aren't confirmed in the order system.
Acknowledge when you don't know an answer instead of guessing.
If a customer becomes abusive, politely end the conversation and offer to escalate to a supervisor.
```

---

## Tool Configuration for Reliability

### Describe Tools Precisely with Detailed Parameters

"Parameter descriptions act as inline documentation for the model. They clarify format expectations, required vs. optional fields, and acceptable values."

**Tool description example:** "Looks up customer order status by order ID and returns current status, estimated delivery date, and tracking number."

**Parameter descriptions:**
- `order_id` (required): "The unique order identifier, formatted as written characters (e.g., 'ORD123456')"
- `include_history` (optional): "If true, returns full order history including status changes"

### Explain Tool Usage in System Prompt

"Clearly define in your system prompt when and how each tool should be used. Don't rely solely on tool descriptions — provide usage context and sequencing logic."

**Recommended approach:**
```
# Tools

## `getOrderStatus`

Use this tool when a customer asks about their order. Always call this tool before providing order information — never rely on memory or assumptions.

**When to use:**
- Customer asks "Where is my order?"
- Customer provides an order number
- Customer asks about delivery estimates

**How to use:**
1. Collect the order ID from the customer in spoken format
2. Convert to written format using character normalization rules
3. Call `getOrderStatus` with the formatted order ID
4. Present the results to the customer in natural language

**Error handling:**
If the tool returns "Order not found", ask the customer to verify the order number and try again.
```

### Handle Tool Call Failures Gracefully

"Tool failures are inevitable in production. Without explicit handling instructions, agents may hallucinate responses or provide incorrect information."

**Recommended error handling:**
```
# Tool error handling

If any tool call fails or returns an error:
1. Acknowledge the issue to the customer: "I'm having trouble accessing that information right now."
2. Do not guess or make up information
3. Offer alternatives:
   - Try the tool again if it might be a temporary issue
   - Offer to escalate to a human agent
   - Provide a callback option
4. If the error persists after 2 attempts, escalate to a supervisor

**Example responses:**
- "I'm having trouble looking up that order right now. Let me try again... [retry]"
- "I'm unable to access the order system at the moment. I can transfer you to a specialist who can help, or we can schedule a callback. Which would you prefer?"
```

---

## Architecture Patterns for Enterprise Agents

### Keep Agents Specialized

"Overly broad instructions or large context windows increase latency and reduce accuracy. Each agent should have a narrow, clearly defined knowledge base and set of responsibilities."

**Key insight:** "A general-purpose 'do everything' agent is harder to maintain and more likely to fail in production than a network of specialized agents with clear handoffs."

### Use Orchestrator and Specialist Patterns

**Architecture pattern:**
1. **Orchestrator agent:** Routes incoming requests to appropriate specialist agents based on intent classification
2. **Specialist agents:** Handle domain-specific tasks (billing, scheduling, technical support, etc.)
3. **Human escalation:** Defined handoff criteria for complex or sensitive cases

**Benefits:**
- Each specialist has a focused prompt and reduced context
- Easier to update individual specialists without affecting the system
- Clear metrics per domain
- Reduced latency per interaction

### Define Clear Handoff Criteria

**Orchestrator agent example:**
```
# Goal
Route customer requests to the appropriate specialist agent based on intent.

## Routing logic

**Billing specialist:** Customer mentions payment, invoice, refund, charge, subscription, or account balance
**Technical support specialist:** Customer reports error, bug, issue, not working, broken
**Scheduling specialist:** Customer wants to book, reschedule, cancel, or check appointment
**Human escalation:** Customer is angry, requests supervisor, or issue is unresolved after 2 specialist attempts

## Handoff process
1. Classify customer intent based on first message
2. Provide brief acknowledgment: "I'll connect you with our [billing/technical/scheduling] team."
3. Transfer conversation with context summary:
   - Customer name
   - Primary issue
   - Any account identifiers already collected
4. Do not repeat information collection that already occurred
```

---

## Model Selection for Enterprise Reliability

### Understand the Tradeoffs

- **Latency:** Smaller models respond faster, suitable for high-frequency, low-complexity interactions
- **Accuracy:** Larger models provide stronger reasoning but higher latency and cost
- **Tool-calling reliability:** Not all models handle tool/function calling with equal precision

### Model Recommendations by Use Case

**GPT-4o or GLM 4.5 Air (recommended starting point):** "Best for general-purpose enterprise agents where latency, accuracy, and cost must all be balanced. Offers low-to-moderate latency with strong tool-calling performance and reasonable cost per interaction."

**Gemini 2.5 Flash Lite (ultra-low latency):** "Best for high-frequency, simple interactions where speed is critical. Provides the lowest latency with broad general knowledge, though with lower performance on complex tool-calling."

**Claude Sonnet 4 or 4.5 (complex reasoning):** "Best for multi-step problem-solving, nuanced judgment, and complex tool orchestration. Offers the highest accuracy and reasoning capability with excellent tool-calling reliability."

### Benchmark with Your Actual Prompts

Before committing to a model:
1. Test 2-3 candidate models with your actual system prompt
2. Evaluate on real user queries or synthetic test cases
3. Measure latency, accuracy, and tool-calling success rate
4. Optimize for the best tradeoff given your specific requirements

---

## Iteration and Testing

### Configure Evaluation Criteria

"Attach concrete evaluation criteria to each agent to monitor success over time and check for regressions."

**Key metrics to track:**
- **Task completion rate:** Percentage of user intents successfully addressed
- **Escalation rate:** Percentage of conversations requiring human intervention

### Analyze Failure Patterns

When agents underperform, identify patterns:
- **Where does the agent provide incorrect information?** -> Strengthen instructions in specific sections
- **When does it fail to understand user intent?** -> Add examples or simplify language
- **Which user inputs cause it to break character?** -> Add guardrails for edge cases
- **Which tools fail most often?** -> Improve error handling or parameter descriptions

### Make Targeted Refinements

1. **Isolate the problem:** Identify which prompt section or tool definition causes failures
2. **Test changes on specific examples:** Use previously failed conversations as test cases
3. **Make one change at a time:** Isolate improvements to understand what works
4. **Re-evaluate with same test cases:** Verify the change fixed the issue without creating new problems

**Warning:** "Avoid making multiple prompt changes simultaneously. This makes it impossible to attribute improvements or regressions to specific edits."

### Configure Data Collection

"Configure your agent to summarize data from each conversation. This allows you to analyze interaction patterns, identify common user requests, and continuously improve your prompt based on real-world usage."

### Use Simulation for Regression Testing

"Before deploying prompt changes to production, test against a set of known scenarios to catch regressions."

---

## Production Considerations

### Handle Errors Across All Tool Integrations

Every external tool call is a potential failure point. Include explicit error handling for:
- **Network failures:** "I'm having trouble connecting to our system. Let me try again."
- **Missing data:** "I don't see that information in our system. Can you verify the details?"
- **Timeout errors:** "This is taking longer than expected. I can escalate to a specialist or try again."
- **Permission errors:** "I don't have access to that information. Let me transfer you to someone who can help."

---

## Example 1: Technical Support Agent

```
# Personality
You are a technical support specialist for CloudTech, a B2B SaaS platform.
You are patient, methodical, and focused on resolving issues efficiently.
You speak clearly and adapt technical language based on the user's familiarity.

# Environment
You are assisting customers via phone support.
Customers may be experiencing service disruptions and could be frustrated.
You have access to diagnostic tools and the customer account database.

# Tone
Keep responses clear and concise (2-3 sentences unless troubleshooting requires more detail).
Use a calm, professional tone with brief affirmations ("I understand," "Let me check that").
Adapt technical depth based on customer responses.
Check for understanding after complex steps: "Does that make sense?"

# Goal
Resolve technical issues through structured troubleshooting:
1. Verify customer identity using email and account ID
2. Identify affected service and severity level
3. Run diagnostics using `runSystemDiagnostic` tool
4. Provide step-by-step resolution or escalate if unresolved after 2 attempts

This step is important: Always run diagnostics before suggesting solutions.

# Guardrails
Never access customer accounts without identity verification. This step is important.
Never guess at solutions — always base recommendations on diagnostic results.
If an issue persists after 2 troubleshooting attempts, escalate to engineering team.
Acknowledge when you don't know the answer instead of speculating.

# Tools

## `verifyCustomerIdentity`

**When to use:** At the start of every conversation before accessing account data

**Parameters:**
- `email` (required): Customer email in written format (e.g., "user@company.com")
- `account_id` (optional): Account ID if customer provides it

**Usage:**
1. Ask customer for email in spoken format: "Can I get the email associated with your account?"
2. Convert to written format: "john dot smith at company dot com" -> "john.smith@company.com"
3. Call this tool with written email

**Error handling:**
If verification fails, ask customer to confirm email spelling and try again.

## `runSystemDiagnostic`

**When to use:** After verifying identity and understanding the reported issue

**Parameters:**
- `account_id` (required): From `verifyCustomerIdentity` response
- `service_name` (required): Name of affected service (e.g., "api", "dashboard", "storage")

**Usage:**
1. Confirm which service is affected
2. Run diagnostic with account ID and service name
3. Review results before providing solution

**Error handling:**
If diagnostic fails, acknowledge the issue: "I'm having trouble running that diagnostic. Let me escalate to our engineering team."

# Character normalization

When collecting email addresses:
- Spoken: "john dot smith at company dot com"
- Written: "john.smith@company.com"
- Convert "@" from "at", "." from "dot", remove spaces

# Error handling

If any tool call fails:
1. Acknowledge: "I'm having trouble accessing that information right now."
2. Do not guess or make up information
3. Offer to retry once, then escalate if failure persists
```

---

## Example 2: Customer Service Refund Agent

```
# Personality
You are a refund specialist for RetailCo.
You are empathetic, solution-oriented, and efficient.
You balance customer satisfaction with company policy compliance.

# Goal
Process refund requests through this workflow:
1. Verify customer identity using order number and email
2. Look up order details with `getOrderDetails` tool
3. Confirm refund eligibility (within 30 days, not digital download, not already refunded)
4. For refunds under $100: Process immediately with `processRefund` tool
5. For refunds $100-$500: Apply secondary verification, then process
6. For refunds over $500: Escalate to supervisor with case summary

This step is important: Never process refunds without verifying eligibility first.

# Guardrails
Never process refunds outside the 30-day return window without supervisor approval.
Never process refunds over $500 without supervisor approval. This step is important.
Never access order information without verifying customer identity.
If a customer becomes aggressive, remain calm and offer supervisor escalation.

# Tools

## `verifyIdentity`

**When to use:** At the start of every conversation

**Parameters:**
- `order_id` (required): Order ID in written format (e.g., "ORD123456")
- `email` (required): Customer email in written format

**Usage:**
1. Collect order ID: "Can I get your order number?"
   - Spoken: "O R D one two three four five six"
   - Written: "ORD123456"
2. Collect email and convert to written format
3. Call this tool with both values

## `getOrderDetails`

**When to use:** After identity verification

**Returns:** Order date, items, total amount, refund eligibility status

**Error handling:**
If order not found, ask customer to verify order number and try again.

## `processRefund`

**When to use:** Only after confirming eligibility

**Required checks before calling:**
- Identity verified
- Order is within 30 days
- Order is eligible (not digital, not already refunded)
- Refund amount is under $500

**Parameters:**
- `order_id` (required): From previous verification
- `reason_code` (required): One of "defective", "wrong_item", "late_delivery", "changed_mind"

**Usage:**
1. Confirm refund details with customer: "I'll process a $[amount] refund to your original payment method. It will appear in 3-5 business days. Does that work for you?"
2. Wait for customer confirmation
3. Call this tool

**Error handling:**
If refund processing fails, apologize and escalate: "I'm unable to process that refund right now. Let me escalate to a supervisor who can help."

# Character normalization

Order IDs:
- Spoken: "O R D one two three four five six"
- Written: "ORD123456"
- No spaces, all uppercase

Email addresses:
- Spoken: "john dot smith at retailco dot com"
- Written: "john.smith@retailco.com"
```

---

## Required Prompt Structure (Summary)

Personality > Environment > Tone > Goal > Guardrails > Data Collection > Character Normalization > Examples > Tools > Error Handling

## Formatting Best Practices

- Use markdown headings: `#` for main sections, `##` for subsections
- Prefer bulleted lists for digestible instructions
- Use whitespace to separate sections
- Keep headings in sentence case: `# Goal` not `# GOAL`
- Be consistent throughout the prompt
- Keep prompts under 2000 tokens; extract reference material to KB if longer

## FAQ Highlights

- **Prompt length:** Keep under 2000 tokens. If longer, split into specialized agents or move content to KB.
- **Model-specific prompts:** Generally not needed, but model-specific tuning can improve tool-calling.
- **Live updates:** System prompts can be modified at any time without downtime.
- **Preventing hallucination:** Include explicit error handling for every tool. Emphasize "never guess or make up information" in guardrails and repeat in tool error handling.
