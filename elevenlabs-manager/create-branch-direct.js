#!/usr/bin/env node
/**
 * Direct branch creation without interactive prompts
 * Usage: npm run branches:create-direct johnson-hvac experiment-v1 "Description here"
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { getConfigManager } from './dist/utils/config.js';
import chalk from 'chalk';

const [agentKey, branchName, description] = process.argv.slice(2);

if (!agentKey || !branchName) {
  console.log(chalk.red('Usage: npm run branches:create-direct <agent-key> <branch-name> [description]'));
  console.log(chalk.gray('Example: npm run branches:create-direct johnson-hvac experiment-v1 "Testing new features"'));
  process.exit(1);
}

async function createBranch() {
  try {
    const configManager = getConfigManager();
    const apiKey = await configManager.getApiKey();
    const localAgent = await configManager.getAgent(agentKey);

    const client = new ElevenLabsClient({ apiKey });

    // Get Main branch
    const branches = await client.conversationalAi.agents.branches.list(localAgent.agent_id);
    const mainBranch = branches.results.find(b => b.name === 'Main');

    if (!mainBranch) {
      console.log(chalk.red('Main branch not found. Enable versioning first.'));
      process.exit(1);
    }

    // Get latest version
    const branchDetails = await client.conversationalAi.agents.branches.get(localAgent.agent_id, mainBranch.id);
    const latestVersion = branchDetails.mostRecentVersions[0];

    console.log(chalk.blue(`Creating branch '${branchName}' from version ${latestVersion.seqNoInBranch}...`));

    // Create branch
    const result = await client.conversationalAi.agents.branches.create(localAgent.agent_id, {
      parentVersionId: latestVersion.id,
      name: branchName,
      description: description || `Branch: ${branchName}`
    });

    console.log(chalk.green(`\n✓ Branch created successfully!`));
    console.log(chalk.gray(`  Branch ID: ${result.createdBranchId}`));
    console.log(chalk.gray(`  Version ID: ${result.createdVersionId}`));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray(`  npm run agents:push ${agentKey} --branch ${branchName}`));
  } catch (error) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

createBranch();
