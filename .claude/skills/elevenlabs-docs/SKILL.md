---
name: elevenlabs-docs
description: Provides ElevenLabs developer documentation for building conversational AI agents. Includes pre-fetched references for prompting, server tools, knowledge base/RAG, agent configuration, and outbound calls, plus a full URL index of all Eleven Agents doc pages. Invoked when looking up ElevenLabs docs for agent building, tools, knowledge bases, prompts, phone numbers, Twilio, webhooks, voice config, or API reference.
user-invocable: true
---

# ElevenLabs Documentation Reference

Complete index of ElevenLabs developer docs for conversational AI agents.

## References (pre-fetched, instant access)

Read files from `references/` for the topics we use most:

| File | Covers |
|------|--------|
| `references/prompting-guide.md` | Prompt structure, examples, guardrails, character normalization, tool config, error handling |
| `references/server-tools.md` | Server tool JSON schema, auth methods, webhooks, requestBodySchema, best practices |
| `references/knowledge-base.md` | KB modes (prompt/auto/rag), RAG indexing, document types, API endpoints, gotchas |
| `references/agent-configuration.md` | Full agent config schema: conversation_config, tts, asr, turn, prompt, platform_settings |
| `references/outbound-calls.md` | Twilio outbound call API, config overrides, dynamic variables, batch calls |

## Full Doc Pages (on-demand via WebFetch)

For topics not covered by references above, use `WebFetch` on the URLs below.

---

## Build — Best Practices

| Topic | URL |
|-------|-----|
| Prompting Guide | https://elevenlabs.io/docs/eleven-agents/best-practices/prompting-guide |

## Build — LLM Configuration

| Topic | URL |
|-------|-----|
| LLM Config | https://elevenlabs.io/docs/eleven-agents/customization/llm |
| Custom LLM | https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm |
| Custom LLM: Cloudflare | https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm/cloudflare |
| Custom LLM: Groq Cloud | https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm/groq-cloud |
| Custom LLM: SambaNova | https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm/samba-nova-cloud |
| Custom LLM: Together AI | https://elevenlabs.io/docs/eleven-agents/customization/llm/custom-llm/together-ai |
| LLM Cascading | https://elevenlabs.io/docs/eleven-agents/customization/llm/llm-cascading |
| Optimizing Costs | https://elevenlabs.io/docs/eleven-agents/customization/llm/optimizing-costs |

## Build — Conversation & Workflows

| Topic | URL |
|-------|-----|
| Conversation Flow | https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow |
| Agent Workflows | https://elevenlabs.io/docs/eleven-agents/customization/agent-workflows |

## Build — Voice

| Topic | URL |
|-------|-----|
| Voice Config | https://elevenlabs.io/docs/eleven-agents/customization/voice |
| Multi-voice Support | https://elevenlabs.io/docs/eleven-agents/customization/voice/multi-voice-support |
| Pronunciation Dictionary | https://elevenlabs.io/docs/eleven-agents/customization/voice/pronunciation-dictionary |
| Speed Control | https://elevenlabs.io/docs/eleven-agents/customization/voice/speed-control |
| Expressive Mode | https://elevenlabs.io/docs/eleven-agents/customization/voice/expressive-mode |
| Conversational Voice Design | https://elevenlabs.io/docs/eleven-agents/customization/voice/best-practices/conversational-voice-design |
| Language | https://elevenlabs.io/docs/eleven-agents/customization/voice/customization/language |

## Build — Knowledge Base

| Topic | URL |
|-------|-----|
| KB Overview | https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base |
| KB Dashboard | https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/dashboard |
| RAG | https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag |

## Build — Tools

| Topic | URL |
|-------|-----|
| Tools Overview | https://elevenlabs.io/docs/eleven-agents/customization/tools |
| Client Tools | https://elevenlabs.io/docs/eleven-agents/customization/tools/client-tools |
| Server Tools | https://elevenlabs.io/docs/eleven-agents/customization/tools/server-tools |
| MCP Tools | https://elevenlabs.io/docs/eleven-agents/customization/tools/mcp |
| MCP Security | https://elevenlabs.io/docs/eleven-agents/customization/tools/mcp/security |
| System Tools | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools |
| End Call | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/end-call |
| Language Detection | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/language-detection |
| Agent Transfer | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/agent-transfer |
| Transfer to Human | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/transfer-to-human |
| Skip Turn | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/skip-turn |
| Play Keypad Touch Tone | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/play-keypad-touch-tone |
| Voicemail Detection | https://elevenlabs.io/docs/eleven-agents/customization/tools/system-tools/voicemail-detection |
| Tool Call Sounds | https://elevenlabs.io/docs/eleven-agents/customization/tools/tool-configuration/tool-call-sounds |
| Agent Tools Deprecation | https://elevenlabs.io/docs/eleven-agents/customization/tools/agent-tools-deprecation |

## Build — Personalization

| Topic | URL |
|-------|-----|
| Personalization Overview | https://elevenlabs.io/docs/eleven-agents/customization/personalization |
| Dynamic Variables | https://elevenlabs.io/docs/eleven-agents/customization/personalization/dynamic-variables |
| Overrides | https://elevenlabs.io/docs/eleven-agents/customization/personalization/overrides |
| Twilio Personalization | https://elevenlabs.io/docs/eleven-agents/customization/personalization/twilio-personalization |

## Build — Authentication, Widget, Privacy

| Topic | URL |
|-------|-----|
| Authentication | https://elevenlabs.io/docs/eleven-agents/customization/authentication |
| Widget | https://elevenlabs.io/docs/eleven-agents/customization/widget |
| Privacy Overview | https://elevenlabs.io/docs/eleven-agents/customization/privacy |
| Data Retention | https://elevenlabs.io/docs/eleven-agents/customization/privacy/retention |
| Audio Saving | https://elevenlabs.io/docs/eleven-agents/customization/privacy/audio-saving |

## Build — Events

| Topic | URL |
|-------|-----|
| Events Overview | https://elevenlabs.io/docs/eleven-agents/customization/events |
| Client Events | https://elevenlabs.io/docs/eleven-agents/customization/events/client-events |
| Client-to-Server Events | https://elevenlabs.io/docs/eleven-agents/customization/events/client-to-server-events |

## Build — Testing & Analysis

| Topic | URL |
|-------|-----|
| Agent Testing | https://elevenlabs.io/docs/eleven-agents/customization/agent-testing |
| Agent Analysis | https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis |
| Success Evaluation | https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis/success-evaluation |
| Data Collection | https://elevenlabs.io/docs/eleven-agents/customization/agent-analysis/data-collection |

## Integrate — Libraries & SDKs

| Topic | URL |
|-------|-----|
| Python SDK | https://elevenlabs.io/docs/eleven-agents/libraries/python |
| React SDK | https://elevenlabs.io/docs/eleven-agents/libraries/react |
| React Native SDK | https://elevenlabs.io/docs/eleven-agents/libraries/react-native |
| JavaScript SDK | https://elevenlabs.io/docs/eleven-agents/libraries/java-script |
| Kotlin SDK | https://elevenlabs.io/docs/eleven-agents/libraries/kotlin |
| Swift SDK | https://elevenlabs.io/docs/eleven-agents/libraries/swift |
| WebSockets | https://elevenlabs.io/docs/eleven-agents/libraries/web-sockets |
| WebSocket API Reference | https://elevenlabs.io/docs/eleven-agents/api-reference/eleven-agents/websocket |

## Integrate — Phone Numbers & Telephony

| Topic | URL |
|-------|-----|
| SIP Trunking | https://elevenlabs.io/docs/eleven-agents/phone-numbers/sip-trunking |
| Twilio: Native Integration | https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/native-integration |
| Twilio: Regional Routing | https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/regional-routing |
| Twilio: Register Call | https://elevenlabs.io/docs/eleven-agents/phone-numbers/twilio-integration/register-call |
| Vonage | https://elevenlabs.io/docs/eleven-agents/phone-numbers/telephony/vonage |
| Telnyx | https://elevenlabs.io/docs/eleven-agents/phone-numbers/telephony/telnyx |
| Plivo | https://elevenlabs.io/docs/eleven-agents/phone-numbers/telephony/plivo |
| Genesys | https://elevenlabs.io/docs/eleven-agents/phone-numbers/c-caa-s-integrations/genesys |
| Batch Calls | https://elevenlabs.io/docs/eleven-agents/phone-numbers/batch-calls |

## Integrate — WhatsApp

| Topic | URL |
|-------|-----|
| WhatsApp Overview | https://elevenlabs.io/docs/eleven-agents/whatsapp |
| WhatsApp Tools | https://elevenlabs.io/docs/eleven-agents/whatsapp/tools |

## Operate

| Topic | URL |
|-------|-----|
| Operate Overview | https://elevenlabs.io/docs/eleven-agents/operate/overview |
| Versioning | https://elevenlabs.io/docs/eleven-agents/operate/versioning |
| CLI | https://elevenlabs.io/docs/eleven-agents/operate/cli |
| Dashboard | https://elevenlabs.io/docs/eleven-agents/dashboard |
| Realtime Monitoring | https://elevenlabs.io/docs/eleven-agents/guides/realtime-monitoring |
| Post-call Webhooks | https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks |

## Operate — Legal & Compliance

| Topic | URL |
|-------|-----|
| HIPAA | https://elevenlabs.io/docs/eleven-agents/legal/hipaa |
| TCPA | https://elevenlabs.io/docs/eleven-agents/legal/tcpa |
| Disclosure Requirement | https://elevenlabs.io/docs/eleven-agents/legal/disclosure-requirement |
| AI Integrations | https://elevenlabs.io/docs/eleven-agents/legal/11-ai-integrations |

## Guides — Quickstarts

| Topic | URL |
|-------|-----|
| Next.js Quickstart | https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/next-js |
| JavaScript Quickstart | https://elevenlabs.io/docs/eleven-agents/guides/quickstarts/java-script |

## Guides — Features

| Topic | URL |
|-------|-----|
| Chat Mode | https://elevenlabs.io/docs/eleven-agents/guides/chat-mode |
| Burst Pricing | https://elevenlabs.io/docs/eleven-agents/guides/burst-pricing |
| ElevenLabs Docs Agent | https://elevenlabs.io/docs/eleven-agents/guides/elevenlabs-docs-agent |
| User Interviews Agent | https://elevenlabs.io/docs/eleven-agents/guides/user-interviews-agent |
| Simulate Conversations | https://elevenlabs.io/docs/eleven-agents/guides/simulate-conversations |

## Guides — No-Code Integrations

| Topic | URL |
|-------|-----|
| Ghost | https://elevenlabs.io/docs/eleven-agents/guides/no-code/ghost |
| Framer | https://elevenlabs.io/docs/eleven-agents/guides/no-code/framer |
| Squarespace | https://elevenlabs.io/docs/eleven-agents/guides/no-code/squarespace |
| Webflow | https://elevenlabs.io/docs/eleven-agents/guides/no-code/webflow |
| Wix | https://elevenlabs.io/docs/eleven-agents/guides/no-code/wix |
| WordPress | https://elevenlabs.io/docs/eleven-agents/guides/no-code/word-press |

## Guides — Code Integrations

| Topic | URL |
|-------|-----|
| Expo / React Native | https://elevenlabs.io/docs/eleven-agents/guides/integrations/expo-react-native |
| Raspberry Pi | https://elevenlabs.io/docs/eleven-agents/guides/integrations/raspberry-pi-voice-assistant |
| Cal.com | https://elevenlabs.io/docs/eleven-agents/guides/integrations/cal-com |
| Upstash Redis | https://elevenlabs.io/docs/eleven-agents/guides/integrations/upstash-redis |
| Zendesk | https://elevenlabs.io/docs/eleven-agents/guides/integrations/zendesk |
| HubSpot | https://elevenlabs.io/docs/eleven-agents/guides/integrations/hub-spot |
| Salesforce | https://elevenlabs.io/docs/eleven-agents/guides/integrations/salesforce |

## API Reference — Agents

| Endpoint | URL |
|----------|-----|
| Create Agent | https://elevenlabs.io/docs/api-reference/agents/create |
| Get Agent | https://elevenlabs.io/docs/api-reference/agents/get |
| List Agents | https://elevenlabs.io/docs/api-reference/agents/list |
| Update Agent | https://elevenlabs.io/docs/api-reference/agents/update |
| Delete Agent | https://elevenlabs.io/docs/api-reference/agents/delete |
| Duplicate Agent | https://elevenlabs.io/docs/api-reference/agents/duplicate |
| Get Agent Link | https://elevenlabs.io/docs/api-reference/agents/get-link |
| Simulate Conversation | https://elevenlabs.io/docs/api-reference/agents/simulate-conversation |
| Simulate (Stream) | https://elevenlabs.io/docs/api-reference/agents/simulate-conversation-stream |
| Calculate | https://elevenlabs.io/docs/api-reference/agents/calculate |
| Get Summaries | https://elevenlabs.io/docs/api-reference/agents/get-summaries |

## API Reference — Agent Branches & Deployments

| Endpoint | URL |
|----------|-----|
| List Branches | https://elevenlabs.io/docs/api-reference/agents/branches/list |
| Create Branch | https://elevenlabs.io/docs/api-reference/agents/branches/create |
| Get Branch | https://elevenlabs.io/docs/api-reference/agents/branches/get |
| Update Branch | https://elevenlabs.io/docs/api-reference/agents/branches/update |
| Delete Branch | https://elevenlabs.io/docs/api-reference/agents/branches/delete |
| Merge Branch | https://elevenlabs.io/docs/api-reference/agents/branches/merge |
| Create Deployment | https://elevenlabs.io/docs/api-reference/agents/deployments/create |
| Create Draft | https://elevenlabs.io/docs/api-reference/agents/drafts/create |
| Delete Draft | https://elevenlabs.io/docs/api-reference/agents/drafts/delete |

## API Reference — Conversations

| Endpoint | URL |
|----------|-----|
| List Conversations | https://elevenlabs.io/docs/api-reference/conversations/list |
| Get Conversation | https://elevenlabs.io/docs/api-reference/conversations/get |
| Delete Conversation | https://elevenlabs.io/docs/api-reference/conversations/delete |
| Get Audio | https://elevenlabs.io/docs/api-reference/conversations/get-audio |
| Get Signed URL | https://elevenlabs.io/docs/api-reference/conversations/get-signed-url |
| Get WebRTC Token | https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token |
| Create Conversation | https://elevenlabs.io/docs/api-reference/conversations/create |

## API Reference — Tools

| Endpoint | URL |
|----------|-----|
| List Tools | https://elevenlabs.io/docs/api-reference/tools/list |
| Get Tool | https://elevenlabs.io/docs/api-reference/tools/get |
| Create Tool | https://elevenlabs.io/docs/api-reference/tools/create |
| Update Tool | https://elevenlabs.io/docs/api-reference/tools/update |
| Delete Tool | https://elevenlabs.io/docs/api-reference/tools/delete |
| Get Dependent Agents | https://elevenlabs.io/docs/api-reference/tools/get-dependent-agents |

## API Reference — Knowledge Base

| Endpoint | URL |
|----------|-----|
| List Documents | https://elevenlabs.io/docs/api-reference/knowledge-base/list |
| Get Document | https://elevenlabs.io/docs/api-reference/knowledge-base/get-document |
| Update Document | https://elevenlabs.io/docs/api-reference/knowledge-base/update |
| Delete Document | https://elevenlabs.io/docs/api-reference/knowledge-base/delete |
| Create from URL | https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-url |
| Create from Text | https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-text |
| Create from File | https://elevenlabs.io/docs/api-reference/knowledge-base/create-from-file |
| Get Content | https://elevenlabs.io/docs/api-reference/knowledge-base/get-content |
| Get Chunk | https://elevenlabs.io/docs/api-reference/knowledge-base/get-chunk |
| Get Source File URL | https://elevenlabs.io/docs/api-reference/knowledge-base/get-source-file-url |
| Create Folder | https://elevenlabs.io/docs/api-reference/knowledge-base/create-folder |
| Move Document | https://elevenlabs.io/docs/api-reference/knowledge-base/move-document |
| Bulk Move | https://elevenlabs.io/docs/api-reference/knowledge-base/bulk-move |
| Compute RAG Index | https://elevenlabs.io/docs/api-reference/knowledge-base/compute-rag-index |
| Get RAG Index | https://elevenlabs.io/docs/api-reference/knowledge-base/get-rag-index |
| RAG Index Overview | https://elevenlabs.io/docs/api-reference/knowledge-base/rag-index-overview |
| Compute RAG Batch | https://elevenlabs.io/docs/api-reference/knowledge-base/compute-rag-index-batch |
| Delete RAG Index | https://elevenlabs.io/docs/api-reference/knowledge-base/delete-rag-index |
| Get KB Agents | https://elevenlabs.io/docs/api-reference/knowledge-base/get-agents |
| Get KB Size | https://elevenlabs.io/docs/api-reference/knowledge-base/size |
| Get KB Summaries | https://elevenlabs.io/docs/api-reference/knowledge-base/get-summaries |

## API Reference — Phone Numbers

| Endpoint | URL |
|----------|-----|
| Create Phone Number | https://elevenlabs.io/docs/api-reference/phone-numbers/create |
| List Phone Numbers | https://elevenlabs.io/docs/api-reference/phone-numbers/list |
| Get Phone Number | https://elevenlabs.io/docs/api-reference/phone-numbers/get |
| Update Phone Number | https://elevenlabs.io/docs/api-reference/phone-numbers/update |
| Delete Phone Number | https://elevenlabs.io/docs/api-reference/phone-numbers/delete |

## API Reference — Calling

| Endpoint | URL |
|----------|-----|
| SIP Trunk Outbound Call | https://elevenlabs.io/docs/api-reference/sip-trunk/outbound-call |
| Twilio Outbound Call | https://elevenlabs.io/docs/api-reference/twilio/outbound-call |
| Twilio Register Call | https://elevenlabs.io/docs/api-reference/twilio/register-call |

## API Reference — WhatsApp

| Endpoint | URL |
|----------|-----|
| List WhatsApp Accounts | https://elevenlabs.io/docs/api-reference/whats-app/accounts/list |
| Get WhatsApp Account | https://elevenlabs.io/docs/api-reference/whats-app/accounts/get |
| Update WhatsApp Account | https://elevenlabs.io/docs/api-reference/whats-app/accounts/update |
| Delete WhatsApp Account | https://elevenlabs.io/docs/api-reference/whats-app/accounts/delete |
| WhatsApp Outbound Call | https://elevenlabs.io/docs/api-reference/whats-app/outbound-call |
| WhatsApp Outbound Message | https://elevenlabs.io/docs/api-reference/whats-app/outbound-message |

## API Reference — Batch Calling

| Endpoint | URL |
|----------|-----|
| Create Batch Call | https://elevenlabs.io/docs/api-reference/batch-calling/create |
| List Batch Calls | https://elevenlabs.io/docs/api-reference/batch-calling/list |
| Get Batch Call | https://elevenlabs.io/docs/api-reference/batch-calling/get |
| Cancel Batch Call | https://elevenlabs.io/docs/api-reference/batch-calling/cancel |
| Retry Batch Call | https://elevenlabs.io/docs/api-reference/batch-calling/retry |
| Delete Batch Call | https://elevenlabs.io/docs/api-reference/batch-calling/delete |
