import chalk from 'chalk';
import inquirer from 'inquirer';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';

/**
 * Enable versioning on an agent
 */
export async function enableVersioning(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Enabling versioning for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);

  const confirmAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow('Once enabled, versioning cannot be disabled. Continue?'),
      default: false,
    },
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.gray('Cancelled.'));
    return;
  }

  await client.updateAgent(localAgent.agent_id, {
    enableVersioningIfNotEnabled: true,
  });

  console.log(chalk.green(`\n✓ Versioning enabled for agent '${agentKey}'`));
  console.log(chalk.gray('  Main branch created automatically'));
  console.log(chalk.blue('\nNext steps:'));
  console.log(chalk.gray('  - Use "npm run branches:list <agent-key>" to see branches'));
  console.log(chalk.gray('  - Use "npm run branches:create <agent-key>" to create experiment branches'));
}

/**
 * List all branches for an agent
 */
export async function listBranches(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Fetching branches for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);

  try {
    const branches = await client.listBranches(localAgent.agent_id);

    if (!branches.results || branches.results.length === 0) {
      console.log(chalk.yellow('No branches found. Versioning may not be enabled.'));
      console.log(chalk.gray('Run "npm run versioning:enable <agent-key>" to enable versioning.'));
      return;
    }

    console.log(chalk.green(`Found ${branches.results.length} branch(es):\n`));

    for (const branch of branches.results) {
      const isMain = branch.name === 'Main';
      const isArchived = branch.isArchived;

      if (isMain) {
        console.log(chalk.green(`✓ ${branch.name} (main)`));
      } else if (isArchived) {
        console.log(chalk.gray(`  ${branch.name} (archived)`));
      } else {
        console.log(chalk.blue(`  ${branch.name}`));
      }

      console.log(chalk.gray(`  ID: ${branch.id}`));
      if (branch.description) {
        console.log(chalk.gray(`  Description: ${branch.description}`));
      }
      console.log(chalk.gray(`  Created: ${new Date(branch.createdAt * 1000).toLocaleString()}`));
      console.log(chalk.gray(`  Current traffic: ${branch.currentLivePercentage}%`));
      console.log();
    }

    // Show current traffic deployment
    try {
      const deployment = await client.getDeployment(localAgent.agent_id);
      if (deployment.deployments && deployment.deployments.length > 0) {
        console.log(chalk.bold('Traffic deployment:'));
        for (const deploy of deployment.deployments) {
          const deployBranch = branches.results.find((b: any) => b.id === deploy.branchId);
          const branchName = deployBranch ? deployBranch.name : deploy.branchId;
          console.log(chalk.gray(`  ${branchName}: ${deploy.percentage}%`));
        }
      }
    } catch (error) {
      // Deployment endpoint might not be available or no deployment set
    }
  } catch (error: any) {
    console.log(chalk.red(`Error fetching branches: ${error.message}`));
    console.log(chalk.yellow('\nThis could mean:'));
    console.log(chalk.gray('  1. Versioning is not enabled for this agent'));
    console.log(chalk.gray('  2. The API endpoint is not available'));
    console.log(chalk.gray('  3. There was a temporary network issue'));
    if (error.body) {
      console.log(chalk.gray(`\nAPI Response: ${JSON.stringify(error.body, null, 2)}`));
    }
    return;
  }
}

/**
 * Create a new branch
 */
export async function createBranch(apiKey: string, agentKey: string, branchName?: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Creating new branch for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);

  // Get main branch to find latest version
  try {
    const branches = await client.listBranches(localAgent.agent_id);

    if (!branches || !branches.results) {
      console.log(chalk.red('Error: Unable to fetch branches. Versioning may not be fully enabled.'));
      console.log(chalk.yellow('\nPlease try creating the branch directly in the ElevenLabs dashboard:'));
      console.log(chalk.gray('  1. Go to https://elevenlabs.io/app/conversational-ai'));
      console.log(chalk.gray('  2. Select your Ian Test agent'));
      console.log(chalk.gray('  3. Look for Versions/Branches section'));
      console.log(chalk.gray('  4. Create branch manually'));
      return;
    }

    const mainBranch = branches.results.find((b: any) => b.name === 'Main');

    if (!mainBranch) {
      console.log(chalk.red('Error: Main branch not found. Versioning may not be enabled.'));
      console.log(chalk.gray('Run "npm run versioning:enable <agent-key>" first.'));
      return;
    }

    // Get full branch details with versions
    const branchDetails = await client.getBranch(localAgent.agent_id, mainBranch.id);

    if (!branchDetails.mostRecentVersions || branchDetails.mostRecentVersions.length === 0) {
      console.log(chalk.red('Error: No versions found on Main branch.'));
      console.log(chalk.yellow('\nIt appears versioning was just enabled. Try pushing a change first:'));
      console.log(chalk.gray('  npm run agents:push johnson-hvac'));
      return;
    }

    // Versions are returned with most recent first
    const latestVersion = branchDetails.mostRecentVersions[0];
    console.log(chalk.gray(`Found ${branchDetails.mostRecentVersions.length} recent versions. Using latest: ${latestVersion.id}`));

    // Prompt for branch details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Branch name:',
        default: branchName,
        validate: (input: string) => {
          if (!input) return 'Branch name is required';
          if (input.length > 140) return 'Branch name must be 140 characters or less';
          if (!/^[a-zA-Z0-9()[\]{}\-/. ]+$/.test(input)) {
            return 'Branch name can only contain letters, numbers, and () [] {} - / .';
          }
          return true;
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (what are you testing?):',
      },
    ]);

    const result = await client.createBranch(localAgent.agent_id, {
      parentVersionId: latestVersion.id,
      name: answers.name,
      description: answers.description,
    });

    console.log(chalk.green(`\n✓ Created branch: ${answers.name}`));
    console.log(chalk.gray(`  Branch ID: ${result.createdBranchId}`));
    console.log(chalk.gray(`  Initial version ID: ${result.createdVersionId}`));

    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray(`  1. Push changes: npm run agents:push ${agentKey} --branch ${answers.name}`));
    console.log(chalk.gray(`  2. Deploy traffic: npm run branches:deploy ${agentKey}`));
  } catch (error: any) {
    console.log(chalk.red(`\nError creating branch: ${error.message}`));
    console.log(chalk.yellow('\nThe branches API may not be fully supported yet.'));
    console.log(chalk.gray('Please create branches manually in the ElevenLabs dashboard for now.'));
  }
}

/**
 * Deploy traffic across branches
 */
export async function deployTraffic(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Configuring traffic deployment for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);
  const branches = await client.listBranches(localAgent.agent_id);

  // Filter out archived branches
  const activeBranches = branches.results.filter((b: any) => !b.isArchived);

  if (activeBranches.length === 0) {
    console.log(chalk.yellow('No active branches found.'));
    return;
  }

  console.log(chalk.gray('Active branches:'));
  activeBranches.forEach((b: any, i: number) => {
    console.log(chalk.gray(`  ${i + 1}. ${b.name}`));
  });
  console.log();

  const deployments: Array<{ branchId: string; percentage: number }> = [];
  let remainingPercentage = 100;

  for (let i = 0; i < activeBranches.length; i++) {
    const branch = activeBranches[i];
    const isLast = i === activeBranches.length - 1;

    let percentage: number;
    if (isLast) {
      percentage = remainingPercentage;
      console.log(chalk.gray(`${branch.name}: ${percentage}% (remaining)`));
    } else {
      const answer = await inquirer.prompt([
        {
          type: 'number',
          name: 'percentage',
          message: `Traffic percentage for ${branch.name} (${remainingPercentage}% remaining):`,
          default: branch.name === 'Main' ? remainingPercentage : 0,
          validate: (input: number) => {
            if (input < 0 || input > remainingPercentage) {
              return `Must be between 0 and ${remainingPercentage}`;
            }
            return true;
          },
        },
      ]);
      percentage = answer.percentage;
    }

    if (percentage > 0) {
      deployments.push({
        branchId: branch.id,
        percentage,
      });
      remainingPercentage -= percentage;
    }
  }

  if (remainingPercentage !== 0) {
    console.log(chalk.red(`\nError: Percentages must sum to exactly 100% (currently ${100 - remainingPercentage}%)`));
    return;
  }

  console.log(chalk.blue('\nDeployment summary:'));
  deployments.forEach((d) => {
    const branch = activeBranches.find((b: any) => b.id === d.branchId);
    console.log(chalk.gray(`  ${branch.name}: ${d.percentage}%`));
  });

  const confirmAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Deploy this configuration?',
      default: true,
    },
  ]);

  if (!confirmAnswer.confirm) {
    console.log(chalk.gray('Cancelled.'));
    return;
  }

  await client.deployTraffic(localAgent.agent_id, { deployments });

  console.log(chalk.green('\n✓ Traffic deployment updated'));
}

/**
 * Merge a branch back to main
 */
export async function mergeBranch(apiKey: string, agentKey: string, sourceBranchName?: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Merging branch for agent '${agentKey}'...\n`));

  const localAgent = await configManager.getAgent(agentKey);
  const branches = await client.listBranches(localAgent.agent_id);

  // Get non-main, non-archived branches
  const mergableBranches = branches.results.filter(
    (b: any) => b.name !== 'Main' && !b.isArchived
  );

  if (mergableBranches.length === 0) {
    console.log(chalk.yellow('No branches available to merge.'));
    return;
  }

  let sourceBranch: any;

  if (sourceBranchName) {
    sourceBranch = mergableBranches.find((b: any) => b.name === sourceBranchName);
    if (!sourceBranch) {
      console.log(chalk.red(`Branch '${sourceBranchName}' not found.`));
      return;
    }
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'branchId',
        message: 'Which branch to merge into Main?',
        choices: mergableBranches.map((b: any) => ({
          name: b.description ? `${b.name} - ${b.description}` : b.name,
          value: b.id,
        })),
      },
    ]);
    sourceBranch = mergableBranches.find((b: any) => b.id === answer.branchId);
  }

  const mainBranch = branches.results.find((b: any) => b.name === 'Main');

  const archiveAnswer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'archive',
      message: `Archive ${sourceBranch.name} after merging?`,
      default: true,
    },
  ]);

  console.log(chalk.blue('\nMerging...'));

  await client.mergeBranch(localAgent.agent_id, sourceBranch.id, {
    targetBranchId: mainBranch.id,
    archiveSourceBranch: archiveAnswer.archive,
  });

  console.log(chalk.green(`\n✓ Merged ${sourceBranch.name} into Main`));
  if (archiveAnswer.archive) {
    console.log(chalk.gray(`  ${sourceBranch.name} has been archived`));
  }
  console.log(chalk.gray('  Traffic automatically transferred to Main'));
}
