// Local configuration types

export interface LocalConfig {
  apiKey: string;
  agents: Record<string, LocalAgentConfig>;
}

export interface LocalAgentConfig {
  agent_id: string;
  name: string;
  folder: string;
  files: {
    system_prompt: string;
    knowledge_base: string;
  };
}

// Agent configuration types

export interface AgentConfig {
  agent_id: string;
  name: string;
  conversation_config: ConversationConfig;
  platform_settings?: PlatformSettings;
  tools?: string[];
  knowledge_base_ids?: string[];
}

export interface ConversationConfig {
  agent: AgentSettings;
  tts?: TTSConfig;
  asr?: ASRConfig;
  turn?: TurnConfig;
  conversation?: ConversationSettings;
}

export interface AgentSettings {
  first_message: string;
  language: string;
  prompt: PromptConfig;
}

export interface PromptConfig {
  prompt: string;
  llm: string;
  temperature?: number;
  max_tokens?: number;
  tool_ids?: string[];
  knowledge_base?: Array<{ id: string }>;
}

export interface TTSConfig {
  model_id?: string;
  voice_id?: string;
  stability?: number;
  similarity_boost?: number;
  speed?: number;
}

export interface ASRConfig {
  quality?: string;
  provider?: string;
}

export interface TurnConfig {
  turn_timeout?: number;
  turn_eagerness?: 'patient' | 'normal' | 'eager';
}

export interface ConversationSettings {
  max_duration_seconds?: number;
  text_only?: boolean;
}

export interface PlatformSettings {
  // Platform-specific settings
  [key: string]: any;
}

// Tool configuration types

export interface BaseToolConfig {
  name: string;
  description?: string;
}

export interface ClientToolConfig extends BaseToolConfig {
  type: 'client';
  expects_response?: boolean;
  parameters?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  response_timeout_secs?: number;
  disable_interruptions?: boolean;
}

export interface WebhookToolConfig extends BaseToolConfig {
  type: 'webhook';
  api_schema: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
  };
  response_timeout_secs?: number;
}

export interface SystemToolConfig extends BaseToolConfig {
  type: 'system';
  params: {
    phone_number?: string;
    agent_id?: string;
    [key: string]: any;
  };
}

export type ToolConfig = ClientToolConfig | WebhookToolConfig | SystemToolConfig;

// Knowledge base types

export interface KnowledgeBaseDocument {
  id: string;
  name: string;
  content?: string;
  file_path?: string;
}

// API response types

export interface ListAgentsResponse {
  agents: Array<{
    agent_id: string;
    name: string;
    created_at: string;
    tags?: string[];
  }>;
  next_cursor?: string;
  has_more: boolean;
}

export interface ListToolsResponse {
  tools: Array<{
    id: string;
    tool_config: ToolConfig;
  }>;
}

// CLI types

export interface CLIOptions {
  verbose?: boolean;
  config?: string;
}
