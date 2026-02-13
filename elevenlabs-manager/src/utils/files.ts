import fs from 'fs/promises';
import path from 'path';
import { LocalAgentConfig, AgentConfig } from './types.js';

/**
 * Read a text file
 */
export async function readFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Write a text file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Read a JSON file
 */
export async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath);
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${(error as Error).message}`);
  }
}

/**
 * Write a JSON file with pretty formatting
 */
export async function writeJson(filePath: string, data: any): Promise<void> {
  const content = JSON.stringify(data, null, 2);
  await writeFile(filePath, content);
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the full path for an agent file
 */
export function getAgentFilePath(localAgent: LocalAgentConfig, fileName: string): string {
  return path.join(process.cwd(), localAgent.folder, fileName);
}

/**
 * Read agent's system prompt from markdown file
 */
export async function readSystemPrompt(localAgent: LocalAgentConfig): Promise<string> {
  const filePath = getAgentFilePath(localAgent, localAgent.files.system_prompt);
  return await readFile(filePath);
}

/**
 * Write agent's system prompt to markdown file
 */
export async function writeSystemPrompt(localAgent: LocalAgentConfig, content: string): Promise<void> {
  const filePath = getAgentFilePath(localAgent, localAgent.files.system_prompt);
  await writeFile(filePath, content);
}

/**
 * Read agent's knowledge base from markdown file
 */
export async function readKnowledgeBase(localAgent: LocalAgentConfig): Promise<string> {
  const filePath = getAgentFilePath(localAgent, localAgent.files.knowledge_base);
  return await readFile(filePath);
}

/**
 * Write agent's knowledge base to markdown file
 */
export async function writeKnowledgeBase(localAgent: LocalAgentConfig, content: string): Promise<void> {
  const filePath = getAgentFilePath(localAgent, localAgent.files.knowledge_base);
  await writeFile(filePath, content);
}

/**
 * Read agent-config.json from agent folder
 */
export async function readAgentConfig(localAgent: LocalAgentConfig): Promise<Partial<AgentConfig>> {
  const filePath = getAgentFilePath(localAgent, 'agent-config.json');

  if (!(await fileExists(filePath))) {
    // Return default config if file doesn't exist
    return {
      agent_id: localAgent.agent_id,
      name: localAgent.name,
      conversation_config: {
        agent: {
          first_message: '',
          language: 'en',
          prompt: {
            prompt: '',
            llm: 'gpt-4o',
            temperature: 0,
            max_tokens: -1,
          },
        },
      },
      tools: [],
      knowledge_base_ids: [],
    };
  }

  return await readJson<Partial<AgentConfig>>(filePath);
}

/**
 * Write agent-config.json to agent folder
 */
export async function writeAgentConfig(localAgent: LocalAgentConfig, config: Partial<AgentConfig>): Promise<void> {
  const filePath = getAgentFilePath(localAgent, 'agent-config.json');
  await writeJson(filePath, config);
}

/**
 * List all tool JSON files in an agent's tools folder
 */
export async function listToolFiles(localAgent: LocalAgentConfig): Promise<string[]> {
  const toolsDir = getAgentFilePath(localAgent, 'tools');

  try {
    const files = await fs.readdir(toolsDir);
    return files.filter(f => f.endsWith('.json'));
  } catch {
    return [];
  }
}

/**
 * Read a tool configuration from JSON file
 */
export async function readToolConfig(localAgent: LocalAgentConfig, toolName: string): Promise<any> {
  const filePath = getAgentFilePath(localAgent, `tools/${toolName}.json`);
  return await readJson(filePath);
}

/**
 * Write a tool configuration to JSON file
 */
export async function writeToolConfig(localAgent: LocalAgentConfig, toolName: string, config: any): Promise<void> {
  const filePath = getAgentFilePath(localAgent, `tools/${toolName}.json`);
  await writeJson(filePath, config);
}
