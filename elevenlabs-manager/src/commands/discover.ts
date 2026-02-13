import chalk from 'chalk';
import inquirer from 'inquirer';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';
import { LocalConfig, LocalAgentConfig } from '../utils/types.js';

/**
 * Discover agents from ElevenLabs and create/update config
 */
export async function discoverAgents(apiKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue('Discovering agents from ElevenLabs...\n'));

  const response = await client.listAgents();

  if (response.agents.length === 0) {
    console.log(chalk.yellow('No agents found in your ElevenLabs workspace.'));
    return;
  }

  console.log(chalk.green(`Found ${response.agents.length} agents:\n`));

  // Check if config exists
  const configExists = await configManager.exists();
  let existingConfig: LocalConfig | null = null;

  if (configExists) {
    existingConfig = await configManager.load();
    console.log(chalk.gray('Existing config file found. Will merge with discovered agents.\n'));
  } else {
    console.log(chalk.gray('No config file found. Creating new one.\n'));
  }

  const newConfig: LocalConfig = existingConfig || {
    apiKey: '${ELEVENLABS_API_KEY}',
    agents: {},
  };

  // Process each agent
  for (const agent of response.agents) {
    const agentInfo = agent as any;
    console.log(chalk.bold(`\n${agentInfo.name}`));
    console.log(chalk.gray(`ID: ${agentInfo.agentId}`));

    // Check if already mapped
    const existingKey = Object.keys(newConfig.agents).find(
      key => newConfig.agents[key].agent_id === agentInfo.agentId
    );

    if (existingKey) {
      console.log(chalk.green(`✓ Already mapped as '${existingKey}'`));
      continue;
    }

    // Ask user how to map this agent
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldMap',
        message: 'Map this agent to a local folder?',
        default: true,
      },
    ]);

    if (!answer.shouldMap) {
      console.log(chalk.gray('Skipped'));
      continue;
    }

    // Get local key and folder
    const detailsAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'key',
        message: 'Local key (e.g., "lindsays-hvac"):',
        validate: (input: string) => {
          if (input.length === 0) return 'Key is required';
          if (newConfig.agents[input]) return 'Key already exists';
          return true;
        },
      },
      {
        type: 'input',
        name: 'folder',
        message: 'Folder path (relative to project root):',
        default: (answers: any) => `./${answers.key}`,
      },
      {
        type: 'input',
        name: 'systemPromptFile',
        message: 'System prompt filename:',
        default: (answers: any) => `11labs-system-prompt-${answers.key}.md`,
      },
      {
        type: 'input',
        name: 'kbFile',
        message: 'Knowledge base filename:',
        default: (answers: any) => `11labs-kb-${answers.key}.md`,
      },
    ]);

    const localAgentConfig: LocalAgentConfig = {
      agent_id: agentInfo.agentId,
      name: agentInfo.name,
      folder: detailsAnswer.folder,
      files: {
        system_prompt: detailsAnswer.systemPromptFile,
        knowledge_base: detailsAnswer.kbFile,
      },
    };

    newConfig.agents[detailsAnswer.key] = localAgentConfig;
    console.log(chalk.green(`✓ Mapped as '${detailsAnswer.key}'`));
  }

  // Save config
  await configManager.save(newConfig);

  console.log(chalk.green(`\n✓ Configuration saved to config.json`));
  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.gray('  1. Set ELEVENLABS_API_KEY in .env file'));
  console.log(chalk.gray('  2. Run "npm run agents:pull <agent-key>" to download agent configs'));
  console.log(chalk.gray('  3. Edit local markdown files and push changes with "npm run agents:push"'));
}
