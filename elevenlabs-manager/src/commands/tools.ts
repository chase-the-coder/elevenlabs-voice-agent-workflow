import chalk from 'chalk';
import inquirer from 'inquirer';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';
import { writeToolConfig, listToolFiles, readToolConfig } from '../utils/files.js';
import { ToolConfig } from '../utils/types.js';

/**
 * List all tools for an agent
 */
export async function listTools(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();
  const localAgent = await configManager.getAgent(agentKey);

  console.log(chalk.blue(`Fetching tools for agent '${agentKey}'...\n`));

  // Get remote tools
  const response = await client.listTools();

  // Get local tool files
  const localToolFiles = await listToolFiles(localAgent);

  console.log(chalk.green(`Found ${response.tools.length} tools in workspace:\n`));

  for (const tool of response.tools) {
    const toolData = tool as any;
    const toolName = toolData.toolConfig.name;
    const hasLocal = localToolFiles.includes(`${toolName}.json`);

    console.log(hasLocal ? chalk.green(`✓ ${toolName}`) : chalk.gray(`  ${toolName}`));
    console.log(chalk.gray(`  ID: ${toolData.id}`));
    console.log(chalk.gray(`  Type: ${toolData.toolConfig.type}`));
    if (hasLocal) {
      console.log(chalk.gray(`  Local: tools/${toolName}.json`));
    }
    console.log();
  }

  if (localToolFiles.length > 0) {
    console.log(chalk.bold(`\nLocal tool files (${localToolFiles.length}):`));
    for (const file of localToolFiles) {
      console.log(chalk.gray(`  • tools/${file}`));
    }
  }
}

/**
 * Create a new tool interactively
 */
export async function createTool(apiKey: string, agentKey: string, toolName?: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();
  const localAgent = await configManager.getAgent(agentKey);

  console.log(chalk.blue(`Creating new tool for agent '${agentKey}'...\n`));

  // Prompt for tool details if not provided
  if (!toolName) {
    const nameAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'toolName',
        message: 'Tool name:',
        validate: (input: string) => input.length > 0 || 'Name is required',
      },
    ]);
    toolName = nameAnswer.toolName;
  }

  const typeAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'toolType',
      message: 'Tool type:',
      choices: ['client', 'webhook', 'system'],
    },
  ]);

  let toolConfig: ToolConfig;

  if (typeAnswer.toolType === 'client') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Description (what the tool does):',
      },
      {
        type: 'confirm',
        name: 'expectsResponse',
        message: 'Does this tool expect a response?',
        default: true,
      },
    ]);

    toolConfig = {
      type: 'client',
      name: toolName!,
      description: answers.description,
      expects_response: answers.expectsResponse,
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    };
  } else if (typeAnswer.toolType === 'webhook') {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Description (when to use this tool):',
      },
      {
        type: 'input',
        name: 'url',
        message: 'Webhook URL:',
        validate: (input: string) => input.startsWith('http') || 'Must be a valid URL',
      },
      {
        type: 'list',
        name: 'method',
        message: 'HTTP method:',
        choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        default: 'POST',
      },
    ]);

    toolConfig = {
      type: 'webhook',
      name: toolName!,
      description: answers.description,
      api_schema: {
        url: answers.url,
        method: answers.method,
        headers: {},
      },
    };
  } else {
    // system tool
    const systemTypeAnswer = await inquirer.prompt([
      {
        type: 'list',
        name: 'systemType',
        message: 'System tool type:',
        choices: [
          'transfer_to_number',
          'transfer_to_agent',
          'end_call',
          'play_keypad_touch_tone',
        ],
      },
    ]);

    let params: any = {};

    if (systemTypeAnswer.systemType === 'transfer_to_number') {
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'phoneNumber',
          message: 'Phone number (with country code, e.g., +15555551234):',
        },
      ]);
      params.phone_number = answer.phoneNumber;
    }

    toolConfig = {
      type: 'system',
      name: toolName!,
      params,
    };
  }

  // Save tool config locally
  await writeToolConfig(localAgent, toolName!, toolConfig);
  console.log(chalk.green(`\n✓ Saved tool config to tools/${toolName}.json`));

  // Create tool in ElevenLabs
  const createdTool = await client.createTool({ toolConfig: toolConfig as any });
  console.log(chalk.green(`✓ Created tool in ElevenLabs (ID: ${(createdTool as any).id})`));

  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.gray('  1. Edit tools/' + toolName + '.json to customize parameters'));
  console.log(chalk.gray('  2. Run push command to attach tool to agent'));
}

/**
 * Push local tool configurations to ElevenLabs
 */
export async function pushTools(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();
  const localAgent = await configManager.getAgent(agentKey);

  console.log(chalk.blue(`Syncing tools for agent '${agentKey}'...`));

  const toolFiles = await listToolFiles(localAgent);

  if (toolFiles.length === 0) {
    console.log(chalk.yellow('No local tool files found.'));
    return;
  }

  for (const file of toolFiles) {
    const toolName = file.replace('.json', '');
    const toolConfig = await readToolConfig(localAgent, toolName);

    try {
      // Try to find existing tool by name
      const existingTools = await client.listTools();
      const existing = existingTools.tools.find((t: any) => t.toolConfig.name === toolName);

      if (existing) {
        await client.updateTool((existing as any).id, { toolConfig: toolConfig as any });
        console.log(chalk.green(`✓ Updated tool: ${toolName}`));
      } else {
        const created = await client.createTool({ toolConfig: toolConfig as any });
        console.log(chalk.green(`✓ Created tool: ${toolName} (ID: ${(created as any).id})`));
      }
    } catch (error) {
      console.log(chalk.red(`✗ Failed to sync tool ${toolName}: ${(error as Error).message}`));
    }
  }

  console.log(chalk.green(`\n✓ Tool sync complete`));
}
