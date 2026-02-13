import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { ConversationConfig, ToolConfig } from './utils/types.js';

export class ElevenLabsManager {
  private client: ElevenLabsClient;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new ElevenLabsClient({ apiKey });
  }

  // ============ Agent Operations ============

  /**
   * List all agents
   */
  async listAgents(params?: { page_size?: number; search?: string }) {
    return await this.client.conversationalAi.agents.list(params);
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(agentId: string) {
    return await this.client.conversationalAi.agents.get(agentId);
  }

  /**
   * Update an agent
   */
  async updateAgent(
    agentId: string,
    updates: {
      name?: string;
      conversationConfig?: Partial<ConversationConfig>;
      tags?: string[];
      versionDescription?: string;
      enableVersioningIfNotEnabled?: boolean;
    },
    branchId?: string
  ) {
    return await this.client.conversationalAi.agents.update(
      agentId,
      updates,
      branchId ? { branchId } : undefined
    );
  }

  /**
   * Create a new agent
   */
  async createAgent(config: {
    name: string;
    conversationConfig: ConversationConfig;
    tags?: string[];
  }) {
    return await this.client.conversationalAi.agents.create(config as any);
  }

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: string) {
    return await this.client.conversationalAi.agents.delete(agentId);
  }

  // ============ Versioning Operations ============

  /**
   * List branches for an agent
   */
  async listBranches(agentId: string) {
    return await this.client.conversationalAi.agents.branches.list(agentId);
  }

  /**
   * Get a specific branch
   */
  async getBranch(agentId: string, branchId: string) {
    return await this.client.conversationalAi.agents.branches.get(agentId, branchId);
  }

  /**
   * Create a new branch
   */
  async createBranch(
    agentId: string,
    params: {
      parentVersionId: string;
      name: string;
      description?: string;
    }
  ) {
    return await this.client.conversationalAi.agents.branches.create(agentId, params);
  }

  /**
   * Merge a branch
   */
  async mergeBranch(
    agentId: string,
    sourceBranchId: string,
    params: {
      targetBranchId: string;
      archiveSourceBranch?: boolean;
    }
  ) {
    return await this.client.conversationalAi.agents.branches.merge(
      agentId,
      sourceBranchId,
      params
    );
  }

  /**
   * Archive/unarchive a branch
   */
  async updateBranch(
    agentId: string,
    branchId: string,
    params: {
      archived?: boolean;
    }
  ) {
    return await this.client.conversationalAi.agents.branches.update(agentId, branchId, params);
  }

  /**
   * Get current traffic deployment
   */
  async getDeployment(agentId: string) {
    return await this.client.conversationalAi.agents.deployments.get(agentId);
  }

  /**
   * Deploy traffic across branches
   */
  async deployTraffic(
    agentId: string,
    params: {
      deployments: Array<{ branchId: string; percentage: number }>;
    }
  ) {
    return await this.client.conversationalAi.agents.deployments.create(agentId, params);
  }

  // ============ Tool Operations ============

  /**
   * List all tools
   */
  async listTools() {
    return await this.client.conversationalAi.tools.list();
  }

  /**
   * Get a specific tool by ID
   */
  async getTool(toolId: string) {
    return await this.client.conversationalAi.tools.get(toolId);
  }

  /**
   * Create a new tool
   */
  async createTool(toolConfig: { toolConfig: ToolConfig }) {
    return await this.client.conversationalAi.tools.create(toolConfig as any);
  }

  /**
   * Update an existing tool
   */
  async updateTool(toolId: string, toolConfig: { toolConfig: ToolConfig }) {
    return await this.client.conversationalAi.tools.update(toolId, toolConfig as any);
  }

  /**
   * Delete a tool
   */
  async deleteTool(toolId: string) {
    return await this.client.conversationalAi.tools.delete(toolId);
  }

  // ============ Knowledge Base Operations ============

  /**
   * Create a knowledge base document from text
   */
  async createKnowledgeBaseFromText(params: { name: string; text: string }) {
    return await (this.client.conversationalAi.knowledgeBase.documents as any).createFromText(params);
  }

  /**
   * Get a knowledge base document metadata
   */
  async getKnowledgeBase(documentId: string) {
    return await (this.client.conversationalAi.knowledgeBase.documents as any).get(documentId);
  }

  /**
   * Get the full text content of a knowledge base document via direct API call
   */
  async getKnowledgeBaseContent(documentId: string): Promise<string> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-base/${documentId}/content`,
      { headers: { 'xi-api-key': this.apiKey } }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch KB content: ${response.status} ${response.statusText}`);
    }
    return await response.text();
  }

  /**
   * Update a knowledge base document
   */
  async updateKnowledgeBase(documentId: string, updates: { name?: string; text?: string }) {
    return await (this.client.conversationalAi.knowledgeBase.documents as any).update(documentId, updates);
  }

  /**
   * Delete a knowledge base document
   */
  async deleteKnowledgeBase(documentId: string) {
    return await (this.client.conversationalAi.knowledgeBase.documents as any).delete(documentId);
  }

  // ============ Simulation Operations ============

  /**
   * Simulate a conversation with an agent
   */
  async simulateConversation(
    agentId: string,
    request: {
      simulationSpecification: {
        simulatedUserConfig: {
          prompt?: {
            prompt: string;
            llm?: string;
            temperature?: number;
          };
        };
        toolMockConfig?: Record<string, { defaultReturnValue?: string; defaultIsError?: boolean }>;
        dynamicVariables?: Record<string, string>;
      };
      extraEvaluationCriteria?: Array<{
        id: string;
        name: string;
        type?: 'prompt';
        conversationGoalPrompt: string;
      }>;
      newTurnsLimit?: number;
    }
  ) {
    return await this.client.conversationalAi.agents.simulateConversation(agentId, request as any);
  }

  // ============ Webhook Operations ============
  // Note: Webhooks may not be available in current SDK version

  /**
   * List workspace webhooks
   */
  async listWebhooks() {
    return await (this.client as any).conversationalAi?.webhooks?.list();
  }

  /**
   * Create a workspace webhook
   */
  async createWebhook(config: {
    url: string;
    events: string[];
    secret?: string;
  }) {
    return await (this.client as any).conversationalAi?.webhooks?.create(config);
  }

  /**
   * Update a workspace webhook
   */
  async updateWebhook(webhookId: string, config: {
    url?: string;
    events?: string[];
  }) {
    return await (this.client as any).conversationalAi?.webhooks?.update(webhookId, config);
  }

  /**
   * Delete a workspace webhook
   */
  async deleteWebhook(webhookId: string) {
    return await (this.client as any).conversationalAi?.webhooks?.delete(webhookId);
  }
}

/**
 * Create an ElevenLabs manager instance
 */
export function createClient(apiKey: string): ElevenLabsManager {
  return new ElevenLabsManager(apiKey);
}
