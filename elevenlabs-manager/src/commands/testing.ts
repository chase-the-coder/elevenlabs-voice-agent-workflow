import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';

interface TestScenario {
  name: string;
  description: string;
  simulation_specification: {
    simulated_user_config: {
      prompt: {
        prompt: string;
        llm?: string;
        temperature?: number;
      };
    };
    tool_mock_config?: Record<string, { default_return_value?: string; default_is_error?: boolean }>;
    dynamic_variables?: Record<string, string>;
  };
  extra_evaluation_criteria: Array<{
    id: string;
    name: string;
    conversation_goal_prompt: string;
  }>;
  new_turns_limit?: number;
}

interface CriterionResult {
  criteriaId: string;
  result: 'success' | 'failure' | 'unknown';
  rationale: string;
}

interface TestResult {
  name: string;
  passed: boolean;
  criteria: CriterionResult[];
  transcript?: Array<{ role: string; message?: string }>;
  error?: string;
}

/**
 * Load test scenarios from an agent's tests directory
 */
async function loadTestScenarios(testsDir: string, testFilter?: string): Promise<{ file: string; scenario: TestScenario }[]> {
  let files: string[];
  try {
    files = await fs.readdir(testsDir);
  } catch {
    throw new Error(`Tests directory not found: ${testsDir}`);
  }

  let jsonFiles = files.filter(f => f.endsWith('.json')).sort();

  if (testFilter) {
    const filterName = testFilter.endsWith('.json') ? testFilter : `${testFilter}.json`;
    jsonFiles = jsonFiles.filter(f => f === filterName);
    if (jsonFiles.length === 0) {
      throw new Error(`Test file '${testFilter}' not found in ${testsDir}`);
    }
  }

  const scenarios: { file: string; scenario: TestScenario }[] = [];
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(testsDir, file), 'utf-8');
    try {
      const scenario = JSON.parse(content) as TestScenario;
      scenarios.push({ file, scenario });
    } catch {
      console.error(chalk.yellow(`  Warning: Skipping ${file} (invalid JSON)`));
    }
  }

  return scenarios;
}

/**
 * Convert snake_case test JSON to camelCase SDK format
 */
function buildApiRequest(scenario: TestScenario) {
  const request: any = {
    simulationSpecification: {
      simulatedUserConfig: {
        prompt: {
          prompt: scenario.simulation_specification.simulated_user_config.prompt.prompt,
          llm: scenario.simulation_specification.simulated_user_config.prompt.llm || 'gpt-4o',
          temperature: scenario.simulation_specification.simulated_user_config.prompt.temperature ?? 0.3,
        },
      },
      toolMockConfig: {},
      dynamicVariables: scenario.simulation_specification.dynamic_variables || {},
    },
    extraEvaluationCriteria: scenario.extra_evaluation_criteria.map(c => ({
      id: c.id,
      name: c.name,
      type: 'prompt' as const,
      conversationGoalPrompt: c.conversation_goal_prompt,
    })),
    newTurnsLimit: scenario.new_turns_limit || 15,
  };

  // Convert tool mock config from snake_case to camelCase, omitting undefined fields
  if (scenario.simulation_specification.tool_mock_config) {
    for (const [toolName, config] of Object.entries(scenario.simulation_specification.tool_mock_config)) {
      const mock: Record<string, any> = {};
      if (config.default_return_value !== undefined) {
        mock.defaultReturnValue = config.default_return_value;
      }
      if (config.default_is_error !== undefined) {
        mock.defaultIsError = config.default_is_error;
      }
      request.simulationSpecification.toolMockConfig[toolName] = mock;
    }
  }

  return request;
}

/**
 * Run a single test scenario against the simulate conversation API
 */
async function runSingleTest(
  client: ElevenLabsManager,
  agentId: string,
  scenario: TestScenario,
): Promise<TestResult> {
  try {
    const request = buildApiRequest(scenario);
    const response = await client.simulateConversation(agentId, request) as any;

    // Extract criteria results
    const criteriaResults: CriterionResult[] = [];
    const resultsList = response.analysis?.evaluationCriteriaResultsList || [];
    const resultsMap = response.analysis?.evaluationCriteriaResults || {};

    // Try list first, fall back to map
    if (resultsList.length > 0) {
      for (const r of resultsList) {
        criteriaResults.push({
          criteriaId: r.criteriaId,
          result: r.result,
          rationale: r.rationale,
        });
      }
    } else {
      for (const [id, r] of Object.entries(resultsMap) as [string, any][]) {
        criteriaResults.push({
          criteriaId: id,
          result: r.result,
          rationale: r.rationale,
        });
      }
    }

    const passed = criteriaResults.every(c => c.result === 'success');

    // Extract transcript
    const transcript = (response.simulatedConversation || []).map((msg: any) => ({
      role: msg.role,
      message: msg.message,
    }));

    return { name: scenario.name, passed, criteria: criteriaResults, transcript };
  } catch (error) {
    return {
      name: scenario.name,
      passed: false,
      criteria: [],
      error: (error as Error).message,
    };
  }
}

/**
 * Save test results to a JSON file
 */
async function saveResults(resultsDir: string, results: TestResult[]): Promise<string> {
  await fs.mkdir(resultsDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(resultsDir, `results-${timestamp}.json`);
  await fs.writeFile(filePath, JSON.stringify(results, null, 2), 'utf-8');
  return filePath;
}

/**
 * Run all tests for an agent
 */
export async function runTests(
  apiKey: string,
  agentKey: string,
  options?: { verbose?: boolean; test?: string; save?: boolean }
) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();
  const localAgent = await configManager.getAgent(agentKey);

  const testsDir = path.join(process.cwd(), localAgent.folder, 'tests');
  const scenarios = await loadTestScenarios(testsDir, options?.test);

  if (scenarios.length === 0) {
    console.log(chalk.yellow(`No test scenarios found in ${testsDir}`));
    return;
  }

  console.log(chalk.blue(`\nRunning tests for agent '${agentKey}' (${localAgent.agent_id})...\n`));

  const results: TestResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < scenarios.length; i++) {
    const { file, scenario } = scenarios[i];
    const testNum = `[${i + 1}/${scenarios.length}]`;
    console.log(chalk.bold(`${testNum} ${scenario.name}`));
    console.log(chalk.gray(`  ${scenario.description}`));

    const result = await runSingleTest(client, localAgent.agent_id, scenario);
    results.push(result);

    if (result.error) {
      console.log(chalk.red(`  ERROR: ${result.error}`));
      failCount++;
      console.log();
      continue;
    }

    // Print each criterion result
    for (const criterion of result.criteria) {
      if (criterion.result === 'success') {
        console.log(chalk.green(`  ✓ ${criterion.criteriaId}: ${criterion.result}`));
      } else if (criterion.result === 'failure') {
        console.log(chalk.red(`  ✗ ${criterion.criteriaId}: ${criterion.result}`));
        console.log(chalk.gray(`    Rationale: "${criterion.rationale}"`));
      } else {
        console.log(chalk.yellow(`  ? ${criterion.criteriaId}: ${criterion.result}`));
        console.log(chalk.gray(`    Rationale: "${criterion.rationale}"`));
      }
    }

    if (result.passed) {
      console.log(chalk.green(`  PASSED`));
      passCount++;
    } else {
      console.log(chalk.red(`  FAILED`));
      failCount++;
    }

    // Print transcript if verbose
    if (options?.verbose && result.transcript) {
      console.log(chalk.gray(`\n  --- Transcript ---`));
      for (const msg of result.transcript) {
        const roleLabel = msg.role === 'agent' ? chalk.cyan('  Agent') : chalk.magenta('  User ');
        console.log(`${roleLabel}: ${msg.message || '(no message)'}`);
      }
      console.log(chalk.gray(`  --- End Transcript ---`));
    }

    console.log();
  }

  // Print summary
  console.log(chalk.bold('─'.repeat(50)));
  const total = passCount + failCount;
  if (failCount === 0) {
    console.log(chalk.green(`\nResults: ${passCount}/${total} passed ✓`));
  } else {
    console.log(chalk.red(`\nResults: ${passCount}/${total} passed, ${failCount} failed`));
  }

  // Save results if requested
  if (options?.save !== false) {
    const resultsDir = path.join(process.cwd(), localAgent.folder, 'tests', 'results');
    const savedPath = await saveResults(resultsDir, results);
    console.log(chalk.gray(`Results saved to ${savedPath}`));
  }

  // Exit with appropriate code
  if (failCount > 0) {
    process.exit(1);
  }
}
