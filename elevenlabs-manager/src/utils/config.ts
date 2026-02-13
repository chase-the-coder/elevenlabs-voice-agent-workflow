import fs from 'fs/promises';
import path from 'path';
import { LocalConfig, LocalAgentConfig } from './types.js';

const CONFIG_FILE = 'config.json';

export class ConfigManager {
  private configPath: string;
  private config: LocalConfig | null = null;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), CONFIG_FILE);
  }

  /**
   * Load configuration from file
   */
  async load(): Promise<LocalConfig> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(content);

      // Replace environment variable references
      if (this.config && this.config.apiKey.startsWith('${') && this.config.apiKey.endsWith('}')) {
        const envVar = this.config.apiKey.slice(2, -1);
        this.config.apiKey = process.env[envVar] || '';
      }

      return this.config!;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Config file not found at ${this.configPath}. Run 'discover' command to create one.`);
      }
      throw error;
    }
  }

  /**
   * Save configuration to file
   */
  async save(config: LocalConfig): Promise<void> {
    const content = JSON.stringify(config, null, 2);
    await fs.writeFile(this.configPath, content, 'utf-8');
    this.config = config;
  }

  /**
   * Get agent configuration by key
   */
  async getAgent(key: string): Promise<LocalAgentConfig> {
    if (!this.config) {
      await this.load();
    }

    const agent = this.config!.agents[key];
    if (!agent) {
      throw new Error(`Agent '${key}' not found in config. Available agents: ${Object.keys(this.config!.agents).join(', ')}`);
    }

    return agent;
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<Record<string, LocalAgentConfig>> {
    if (!this.config) {
      await this.load();
    }
    return this.config!.agents;
  }

  /**
   * Add or update an agent in the config
   */
  async setAgent(key: string, agent: LocalAgentConfig): Promise<void> {
    if (!this.config) {
      await this.load();
    }

    this.config!.agents[key] = agent;
    await this.save(this.config!);
  }

  /**
   * Get API key
   */
  async getApiKey(): Promise<string> {
    if (!this.config) {
      await this.load();
    }

    if (!this.config!.apiKey) {
      throw new Error('API key not found in config. Please set ELEVENLABS_API_KEY in .env file.');
    }

    return this.config!.apiKey;
  }

  /**
   * Check if config file exists
   */
  async exists(): Promise<boolean> {
    try {
      await fs.access(this.configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a new config file with template
   */
  async create(template: Partial<LocalConfig>): Promise<void> {
    const defaultConfig: LocalConfig = {
      apiKey: '${ELEVENLABS_API_KEY}',
      agents: {},
      ...template,
    };

    await this.save(defaultConfig);
  }
}

/**
 * Get the default config manager instance
 */
export function getConfigManager(configPath?: string): ConfigManager {
  return new ConfigManager(configPath);
}
