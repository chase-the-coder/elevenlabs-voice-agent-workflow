#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { getConfigManager } from './utils/config.js';
import { listAgents, pullAgent, pushAgent, diffAgent } from './commands/agents.js';
import { listTools, createTool, pushTools } from './commands/tools.js';
import { syncKnowledgeBase, pullKnowledgeBase } from './commands/knowledge.js';
import { discoverAgents } from './commands/discover.js';
import {
  enableVersioning,
  listBranches,
  createBranch,
  deployTraffic,
  mergeBranch,
} from './commands/versioning.js';
import { runTests } from './commands/testing.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('elevenlabs-manager')
  .description('CLI tool to manage ElevenLabs conversational AI agents')
  .version('1.0.0');

// ============ Discover Command ============
program
  .command('discover')
  .description('Discover agents from ElevenLabs and create config file')
  .action(async () => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) {
        console.error(chalk.red('Error: ELEVENLABS_API_KEY not found in environment'));
        process.exit(1);
      }

      await discoverAgents(apiKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// ============ Agent Commands ============
const agents = program.command('agents').description('Manage agents');

agents
  .command('list')
  .description('List all agents')
  .action(async () => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await listAgents(apiKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

agents
  .command('pull <agent-key>')
  .description('Pull agent configuration from ElevenLabs to local files')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await pullAgent(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

agents
  .command('push <agent-key>')
  .description('Push local changes to ElevenLabs')
  .option('--branch <name>', 'Push to specific branch (requires versioning enabled)')
  .action(async (agentKey: string, options: { branch?: string }) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await pushAgent(apiKey, agentKey, { branchName: options.branch });
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

agents
  .command('diff <agent-key>')
  .description('Show differences between local and remote')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await diffAgent(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// ============ Tool Commands ============
const tools = program.command('tools').description('Manage tools');

tools
  .command('list <agent-key>')
  .description('List all tools for an agent')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await listTools(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

tools
  .command('create <agent-key> [tool-name]')
  .description('Create a new tool interactively')
  .action(async (agentKey: string, toolName?: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await createTool(apiKey, agentKey, toolName);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

tools
  .command('push <agent-key>')
  .description('Push local tool configurations to ElevenLabs')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await pushTools(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// ============ Versioning Commands ============
const branches = program.command('branches').description('Manage agent versions and branches');

branches
  .command('list <agent-key>')
  .description('List all branches for an agent')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await listBranches(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

branches
  .command('create <agent-key> [branch-name]')
  .description('Create a new branch from the main branch')
  .action(async (agentKey: string, branchName?: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await createBranch(apiKey, agentKey, branchName);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

branches
  .command('deploy <agent-key>')
  .description('Configure traffic deployment across branches')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await deployTraffic(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

branches
  .command('merge <agent-key> [source-branch]')
  .description('Merge a branch back to main')
  .action(async (agentKey: string, sourceBranch?: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await mergeBranch(apiKey, agentKey, sourceBranch);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

const versioning = program.command('versioning').description('Manage agent versioning');

versioning
  .command('enable <agent-key>')
  .description('Enable versioning on an agent (cannot be undone)')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await enableVersioning(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// ============ Knowledge Base Commands ============
const kb = program.command('kb').description('Manage knowledge bases');

kb.command('sync <agent-key>')
  .description('Sync knowledge base from local markdown file to ElevenLabs')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await syncKnowledgeBase(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

kb.command('pull <agent-key>')
  .description('Pull knowledge base from ElevenLabs to local file')
  .action(async (agentKey: string) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await pullKnowledgeBase(apiKey, agentKey);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// ============ Test Commands ============
const tests = program.command('tests').description('Run agent test suites');

tests
  .command('run <agent-key>')
  .description('Run all test scenarios for an agent')
  .option('--verbose', 'Print full conversation transcripts')
  .option('--test <filename>', 'Run a single test file')
  .option('--no-save', 'Do not save results to file')
  .action(async (agentKey: string, options: { verbose?: boolean; test?: string; save?: boolean }) => {
    try {
      const configManager = getConfigManager();
      const apiKey = await configManager.getApiKey();
      await runTests(apiKey, agentKey, options);
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
