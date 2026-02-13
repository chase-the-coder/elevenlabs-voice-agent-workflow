# Agent Configuration Reference

> Source: https://github.com/elevenlabs/skills/blob/main/agents/references/agent-configuration.md

Complete reference for configuring conversational AI agents.

## Table of Contents

- [Configuration Structure](#configuration-structure) — Top-level shape
- [conversation_config](#conversation_config) — agent, tts, asr, turn settings
- [prompt](#prompt) — LLM, temperature, custom LLM
- [platform_settings](#platform_settings) — auth, privacy, call limits
- [Updatable Fields](#updatable-fields-patch) — All PATCH-able fields
- [Examples](#example-customer-support-agent) — Customer support, low-latency
- [Popular Voice IDs](#popular-voice-ids)
- [API Endpoints](#api-endpoints)

## Configuration Structure

```python
agent = client.conversational_ai.agents.create(
    name="My Agent",
    conversation_config={...},  # TTS, ASR, turn-taking settings
    prompt={...},               # LLM and system prompt
    tools=[...],                # Webhook, client, and system tools
    platform_settings={...}     # Auth, privacy, call limits
)
```

## conversation_config

Controls the real-time conversation behavior.

### agent

```json
{
  "agent": {
    "first_message": "Hello! How can I help you today?",
    "language": "en",
    "max_tokens_agent_response": 500
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `first_message` | string | What the agent says when conversation starts |
| `language` | string | ISO 639-1 language code (en, es, fr, etc.) |
| `max_tokens_agent_response` | int | Max tokens per agent response |

### tts (Text-to-Speech)

```json
{
  "tts": {
    "voice_id": "JBFqnCBsd6RMkjVDRZzb",
    "model_id": "eleven_flash_v2_5",
    "stability": 0.5,
    "similarity_boost": 0.75,
    "optimize_streaming_latency": 3
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `voice_id` | string | Voice to use (required) |
| `model_id` | string | TTS model - use flash models for low latency |
| `stability` | float | 0-1, lower = more expressive |
| `similarity_boost` | float | 0-1, higher = closer to original voice |
| `optimize_streaming_latency` | int | 0-4, higher = faster but lower quality |

**Recommended TTS models for real-time:**
- `eleven_flash_v2_5` — Ultra-low latency (~75ms)
- `eleven_turbo_v2_5` — Balanced quality/speed

### asr (Automatic Speech Recognition)

```json
{
  "asr": {
    "model_id": "scribe_v2_realtime",
    "keyterms": ["ElevenLabs", "TechCorp"]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `model_id` | string | ASR model (default: scribe_v2_realtime) |
| `keyterms` | array | Words to recognize accurately |

### turn (Turn-Taking)

```json
{
  "turn": {
    "mode": "server_vad",
    "silence_threshold_ms": 500,
    "interrupt_sensitivity": 0.5
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `mode` | string | `server_vad` (auto) or `turn_based` (manual) |
| `silence_threshold_ms` | int | Silence duration before agent responds |
| `interrupt_sensitivity` | float | 0-1, how easily user can interrupt |

## prompt

Configures the LLM behavior.

```json
{
  "prompt": "You are a helpful customer service agent...",
  "llm": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 500,
  "tools_strict_mode": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | System prompt defining agent behavior |
| `llm` | string | Model ID (see LLM providers below) |
| `temperature` | float | 0-1, higher = more creative |
| `max_tokens` | int | Max tokens for LLM response |
| `tools_strict_mode` | bool | Enforce strict tool parameter validation |

### LLM Providers

| Provider | Model IDs |
|----------|-----------|
| OpenAI | `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo` |
| Anthropic | `claude-3-5-sonnet`, `claude-3-5-haiku` |
| Google | `gemini-1.5-pro`, `gemini-1.5-flash` |
| Custom | `custom-llm` (requires custom_llm config) |

### Custom LLM

```json
{
  "prompt": "You are helpful.",
  "llm": "custom-llm",
  "custom_llm": {
    "url": "https://your-llm-endpoint.com/v1/chat/completions",
    "model_id": "your-model-id",
    "api_key": "your-api-key"
  }
}
```

## platform_settings

Platform-level configuration for security and limits.

### auth

| Field | Type | Description |
|-------|------|-------------|
| `enable_auth` | bool | Require signed URLs for connections |
| `allowlist` | array | Allowed origins for CORS |

### privacy

| Field | Type | Description |
|-------|------|-------------|
| `record_conversation` | bool | Store conversation audio/transcripts |
| `retention_days` | int | How long to keep recordings |

### call_limits

| Field | Type | Description |
|-------|------|-------------|
| `max_call_duration_secs` | int | Max conversation length |
| `max_concurrent_calls` | int | Max simultaneous conversations |

## Updatable Fields (PATCH)

Only include fields you want to change. All other settings remain unchanged.

| Section | Fields |
|---------|--------|
| Root | `name` |
| `conversation_config.agent` | `first_message`, `language`, `max_tokens_agent_response` |
| `conversation_config.tts` | `voice_id`, `model_id`, `stability`, `similarity_boost`, `optimize_streaming_latency` |
| `conversation_config.asr` | `model_id`, `keyterms` |
| `conversation_config.turn` | `mode`, `silence_threshold_ms`, `interrupt_sensitivity` |
| `prompt` | `prompt`, `llm`, `temperature`, `max_tokens`, `tools_strict_mode`, `custom_llm` |
| `tools` | Array of tools (replaces existing) |
| `platform_settings.auth` | `enable_auth`, `allowlist` |
| `platform_settings.privacy` | `record_conversation`, `retention_days` |
| `platform_settings.call_limits` | `max_call_duration_secs`, `max_concurrent_calls` |

## Example: Customer Support Agent

```json
{
  "name": "Support Agent",
  "conversation_config": {
    "agent": {
      "first_message": "Hi! Thanks for calling TechCorp support.",
      "language": "en"
    },
    "tts": {
      "voice_id": "XB0fDUnXU5powFXDhCwa",
      "model_id": "eleven_flash_v2_5"
    },
    "turn": {
      "mode": "server_vad",
      "silence_threshold_ms": 700
    }
  },
  "prompt": {
    "prompt": "You are a customer support agent. Be helpful, professional, concise.",
    "llm": "gpt-4o-mini",
    "temperature": 0.5
  },
  "tools": [
    {"type": "system", "name": "end_call"},
    {"type": "system", "name": "transfer_to_number", "phone_number": "+1234567890"}
  ],
  "platform_settings": {
    "call_limits": {
      "max_call_duration_secs": 900
    }
  }
}
```

## Example: Low-Latency Assistant

```json
{
  "name": "Quick Assistant",
  "conversation_config": {
    "agent": {
      "first_message": "Hey! What do you need?",
      "max_tokens_agent_response": 100
    },
    "tts": {
      "voice_id": "JBFqnCBsd6RMkjVDRZzb",
      "model_id": "eleven_flash_v2_5",
      "optimize_streaming_latency": 4
    },
    "turn": {
      "mode": "server_vad",
      "silence_threshold_ms": 300,
      "interrupt_sensitivity": 0.8
    }
  },
  "prompt": {
    "prompt": "Fast, efficient assistant. Brief answers.",
    "llm": "gpt-4o-mini",
    "temperature": 0.3,
    "max_tokens": 100
  }
}
```

## Popular Voice IDs

| Voice | ID |
|-------|-----|
| George | `JBFqnCBsd6RMkjVDRZzb` |
| Sarah | `EXAVITQu4vr4xnSDxMaL` |
| Daniel | `onwK4e9ZLuTAKqWW03F9` |
| Charlotte | `XB0fDUnXU5powFXDhCwa` |

## API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| Create | POST | `/v1/convai/agents/create` |
| Get | GET | `/v1/convai/agents/{agent_id}` |
| List | GET | `/v1/convai/agents` |
| Update | PATCH | `/v1/convai/agents/{agent_id}` |
| Delete | DELETE | `/v1/convai/agents/{agent_id}` |
