import chalk from 'chalk';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';
import {
  readSystemPrompt,
  writeSystemPrompt,
  readAgentConfig,
  writeAgentConfig,
} from '../utils/files.js';

/**
 * List all agents
 */
export async function listAgents(apiKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue('Fetching agents from ElevenLabs...'));

  const response = await client.listAgents();
  const localAgents = await configManager.getAllAgents();

  console.log(chalk.green(`\nFound ${response.agents.length} agents:\n`));

  for (const agent of response.agents) {
    const localKey = Object.keys(localAgents).find(
      key => localAgents[key].agent_id === (agent as any).agentId
    );

    if (localKey) {
      console.log(chalk.green(`✓ ${agent.name}`));
      console.log(chalk.gray(`  ID: ${(agent as any).agentId}`));
      console.log(chalk.gray(`  Local key: ${localKey}`));
      console.log(chalk.gray(`  Folder: ${localAgents[localKey].folder}\n`));
    } else {
      console.log(chalk.yellow(`⚠ ${agent.name}`));
      console.log(chalk.gray(`  ID: ${(agent as any).agentId}`));
      console.log(chalk.yellow(`  Not mapped locally\n`));
    }
  }
}

/**
 * Pull agent configuration from ElevenLabs to local files
 */
export async function pullAgent(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Pulling agent '${agentKey}' from ElevenLabs...`));

  const localAgent = await configManager.getAgent(agentKey);
  const remoteAgent = await client.getAgent(localAgent.agent_id) as any;

  // Extract system prompt from remote agent
  const systemPrompt = remoteAgent.conversationConfig?.agent?.prompt?.prompt || '';

  // Write system prompt to local file
  await writeSystemPrompt(localAgent, systemPrompt);
  console.log(chalk.green(`✓ Updated ${localAgent.files.system_prompt}`));

  // Write agent config
  const agentConfig = {
    agent_id: remoteAgent.agentId,
    name: remoteAgent.name,
    conversation_config: remoteAgent.conversationConfig,
    tools: remoteAgent.conversationConfig?.agent?.prompt?.toolIds || [],
    knowledge_base_ids: remoteAgent.conversationConfig?.agent?.prompt?.knowledgeBase?.map((kb: any) => kb.id) || [],
  };

  await writeAgentConfig(localAgent, agentConfig);
  console.log(chalk.green(`✓ Updated agent-config.json`));

  console.log(chalk.green(`\n✓ Successfully pulled agent '${agentKey}'`));
}

/**
 * Push local changes to ElevenLabs (creates agent if agent_id is empty)
 */
export async function pushAgent(apiKey: string, agentKey: string, options?: { branchName?: string }) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  const localAgent = await configManager.getAgent(agentKey);

  // Read local files
  const systemPrompt = await readSystemPrompt(localAgent);
  const agentConfig = await readAgentConfig(localAgent);

  // Build conversation config payload (using camelCase as expected by SDK)
  const conversationConfig: any = {
    ...agentConfig.conversation_config,
    agent: {
      ...agentConfig.conversation_config?.agent,
      prompt: {
        ...agentConfig.conversation_config?.agent?.prompt,
        prompt: systemPrompt, // Use local markdown content
      },
    },
  };

  // API rejects having both inline tools and toolIds — strip inline tools if toolIds exist
  if (conversationConfig.agent?.prompt?.toolIds?.length > 0) {
    delete conversationConfig.agent.prompt.tools;
  }

  // If agent_id is empty, create a new agent
  if (!localAgent.agent_id) {
    console.log(chalk.blue(`Creating new agent '${agentKey}' in ElevenLabs...`));

    const created = await client.createAgent({
      name: agentConfig.name || agentKey,
      conversationConfig,
    });

    const newAgentId = (created as any).agentId || (created as any).agent_id;

    if (!newAgentId) {
      console.log(chalk.red('Error: Failed to get agent_id from creation response'));
      console.log(chalk.gray(`  Response: ${JSON.stringify(created, null, 2)}`));
      return;
    }

    // Update config.json with new agent_id
    localAgent.agent_id = newAgentId;
    await configManager.setAgent(agentKey, localAgent);
    console.log(chalk.green(`✓ Created agent in ElevenLabs (ID: ${newAgentId})`));

    // Update local agent-config.json with new agent_id
    agentConfig.agent_id = newAgentId;
    await writeAgentConfig(localAgent, agentConfig);
    console.log(chalk.green(`✓ Updated local agent-config.json with new agent_id`));

    console.log(chalk.green(`\n✓ Successfully created agent '${agentKey}'`));
    console.log(chalk.gray(`  Agent ID: ${newAgentId}`));
    console.log(chalk.gray(`  System prompt from ${localAgent.files.system_prompt}`));
    return;
  }

  // Otherwise, update existing agent
  console.log(chalk.blue(`Pushing agent '${agentKey}' to ElevenLabs...`));

  const updates: any = {
    name: agentConfig.name,
    conversationConfig,
    versionDescription: `Updated from local files (${new Date().toISOString()})`,
  };

  // If branch name provided, find branch ID
  let branchId: string | undefined;
  if (options?.branchName) {
    try {
      const branches = await client.listBranches(localAgent.agent_id);
      const branch = branches.results.find((b: any) => b.name === options.branchName);
      if (!branch) {
        console.log(chalk.red(`Error: Branch '${options.branchName}' not found`));
        return;
      }
      branchId = branch.id;
      console.log(chalk.gray(`  Pushing to branch: ${options.branchName}`));
    } catch (error) {
      // Versioning might not be enabled, continue without branch
      console.log(chalk.yellow(`  Warning: Could not find branches (versioning may not be enabled)`));
    }
  }

  // Update the agent
  await client.updateAgent(localAgent.agent_id, updates, branchId);

  console.log(chalk.green(`\n✓ Successfully pushed agent '${agentKey}'`));
  console.log(chalk.gray(`  Updated system prompt from ${localAgent.files.system_prompt}`));
  if (branchId) {
    console.log(chalk.gray(`  New version created on branch: ${options.branchName}`));
  }
}

/**
 * Show differences between local and remote
 */
export async function diffAgent(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Comparing local and remote for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);

  // Get local and remote data
  const localSystemPrompt = await readSystemPrompt(localAgent);
  const localConfig = await readAgentConfig(localAgent);

  const remoteAgent = await client.getAgent(localAgent.agent_id) as any;
  const remoteSystemPrompt = remoteAgent.conversationConfig?.agent?.prompt?.prompt || '';

  // Compare system prompts
  console.log(chalk.bold('System Prompt:'));
  if (localSystemPrompt === remoteSystemPrompt) {
    console.log(chalk.green('  ✓ No changes\n'));
  } else {
    console.log(chalk.yellow('  ⚠ Different'));
    console.log(chalk.gray(`  Local: ${localSystemPrompt.length} characters`));
    console.log(chalk.gray(`  Remote: ${remoteSystemPrompt.length} characters\n`));
  }

  // Compare other settings
  console.log(chalk.bold('Configuration:'));
  const localLlm = localConfig.conversation_config?.agent?.prompt?.llm;
  const remoteLlm = remoteAgent.conversationConfig?.agent?.prompt?.llm;

  if (localLlm !== remoteLlm) {
    console.log(chalk.yellow(`  ⚠ LLM: ${localLlm} (local) vs ${remoteLlm} (remote)`));
  } else {
    console.log(chalk.green(`  ✓ LLM: ${localLlm}`));
  }

  const localTemp = localConfig.conversation_config?.agent?.prompt?.temperature;
  const remoteTemp = remoteAgent.conversationConfig?.agent?.prompt?.temperature;

  if (localTemp !== remoteTemp) {
    console.log(chalk.yellow(`  ⚠ Temperature: ${localTemp} (local) vs ${remoteTemp} (remote)`));
  } else {
    console.log(chalk.green(`  ✓ Temperature: ${localTemp}`));
  }

  console.log();
}
