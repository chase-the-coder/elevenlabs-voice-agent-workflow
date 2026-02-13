# ElevenLabs Server Tools

> Source: https://elevenlabs.io/docs/eleven-agents/customization/tools/server-tools

## Overview

Server tools enable agents to connect to external APIs and data systems. They execute on ElevenLabs infrastructure (not client-side), making HTTP requests to your endpoints during conversations.

**Primary use cases:**
1. **Data retrieval** — fetch real-time info from REST APIs, databases, or third-party integrations
2. **Action execution** — trigger authenticated operations like scheduling, processing returns, or updating records

## Tool Configuration

### Required Fields

- **Name**: Intuitive, descriptive name (e.g., `get_weather`, `check_availability`). Avoid abbreviations.
- **Description**: Detailed explanation of what the tool does and when the LLM should use it.
- **URL**: The API endpoint. Supports path parameters in curly braces: `/api/resource/{id}`
- **HTTP Method**: GET, POST, PUT, PATCH, DELETE

### Parameters

Three types of parameters:

1. **Path Parameters**: Dynamic variables in the URL path (e.g., `{latitude}`, `{longitude}`)
2. **Query Parameters**: Appended to the URL query string
3. **Body Parameters**: Included in the request payload (POST/PUT/PATCH)

Each parameter has:
- **Name**: Parameter identifier
- **Description**: Detailed format expectations (e.g., "Date in YYYY-mm-dd format")
- **Type**: string, number, boolean, etc.
- **Required**: Whether the parameter is mandatory
- **Value source**:
  - `LLM Prompt` — LLM determines the value from conversation context
  - `Static` — Fixed value configured at setup
  - `Dynamic Variable` — Passed at conversation start

### Request Body Schema (for POST/PUT/PATCH)

POST webhook tools MUST include a `requestBodySchema`. This tells ElevenLabs exactly what JSON structure to send.

**Schema format:**
```json
{
  "type": "object",
  "description": "Description of the request body",
  "properties": {
    "param_name": {
      "type": "string",
      "description": "What this parameter is for"
    },
    "another_param": {
      "type": "number",
      "description": "Numeric parameter description"
    }
  },
  "required": ["param_name"]
}
```

**IMPORTANT**: The schema must include a top-level `description` field. Without it, the tool may not work correctly.

### Headers

Custom headers for authentication or other purposes. Can reference secrets stored securely in ElevenLabs.

## Authentication Methods

### OAuth2 Client Credentials
- Client ID
- Client Secret
- Token URL
- Optional: Scopes

### OAuth2 JWT
- Signing Secret
- Token URL
- Algorithm (e.g., RS256, HS256)
- Configurable claims and expiration

### Basic Authentication
- Username
- Password

### Bearer Token
- Token stored as a secret
- Sent as `Authorization: Bearer <token>` header

### Custom Headers
- Arbitrary name-value pairs
- Values can reference secrets: `{{agent_id}}`, `{{secret_name}}`

## Tool JSON File Structure

When creating tools via the ElevenLabs API or our CLI, use this structure:

```json
{
  "name": "tool_name",
  "description": "Detailed description of when and how this tool should be used",
  "type": "webhook",
  "apiSchema": {
    "url": "https://your-api.example.com/endpoint",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{secret_name}}"
    },
    "pathParams": {},
    "queryParams": {},
    "requestBodySchema": {
      "type": "object",
      "description": "Description of the request body",
      "properties": {
        "caller_phone_number": {
          "type": "string",
          "description": "The caller's phone number in E.164 format"
        }
      },
      "required": ["caller_phone_number"]
    }
  }
}
```

## Dynamic Variable Assignment

Tool responses can populate dynamic variables for use in subsequent tool calls or prompt templates. Configure which response fields map to which variables.

## Tool Call Sounds

Configure ambient audio that plays while a tool is executing. This fills the silence during API calls and improves user experience. Configure via the tool's settings in the dashboard or API.

## Best Practices

1. **Use intuitive names with detailed descriptions** — helps the LLM correctly decide when to invoke the tool
2. **Include parameter format specifications** — e.g., "YYYY-mm-dd" for dates, "E.164 format" for phone numbers
3. **Provide orchestration guidance in the system prompt** — explain when, why, and how to use each tool
4. **Use high-intelligence models** — GPT-4o mini or Claude 3.5 Sonnet (or newer) for tool-dependent workflows. Avoid low-capability models for complex tool orchestration.
5. **Always include error handling in the system prompt** — define what the agent should say/do when a tool call fails
6. **Test tool calls** — verify the endpoint returns expected responses before going live

## Tool Types Summary

| Type | Execution | Use Case |
|------|-----------|----------|
| **Server Tools** | ElevenLabs infrastructure | API calls, database queries, webhooks |
| **Client Tools** | User's browser/app | UI updates, local storage, client-side logic |
| **System Tools** | ElevenLabs platform | End call, transfer, language detection, etc. |
| **MCP Tools** | MCP server | Model Context Protocol integrations |

## Common Mistakes

- Missing `requestBodySchema` or its `description` for POST webhook tools
- Using abbreviations in tool names (use full descriptive names)
- Not specifying parameter formats in descriptions
- Relying solely on tool descriptions without system prompt guidance
- Using low-capability models for tool-heavy agents
- Not handling tool errors in the system prompt
