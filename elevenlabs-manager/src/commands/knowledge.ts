import chalk from 'chalk';
import { ElevenLabsManager } from '../client.js';
import { getConfigManager } from '../utils/config.js';
import { readKnowledgeBase, readAgentConfig, writeAgentConfig, writeKnowledgeBase } from '../utils/files.js';

/**
 * Sync knowledge base from local markdown file to ElevenLabs
 */
export async function syncKnowledgeBase(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Syncing knowledge base for agent '${agentKey}'...`));

  const localAgent = await configManager.getAgent(agentKey);
  const agentConfig = await readAgentConfig(localAgent);

  // Read KB content from local markdown file
  const kbContent = await readKnowledgeBase(localAgent);

  console.log(chalk.gray(`Read ${kbContent.length} characters from ${localAgent.files.knowledge_base}`));

  const kbName = `${localAgent.name} - Knowledge Base`;

  // Check if KB document already exists
  const existingKbIds = agentConfig.knowledge_base_ids || [];

  if (existingKbIds.length > 0) {
    // Update existing KB
    const kbId = existingKbIds[0];
    console.log(chalk.blue(`Updating existing knowledge base (ID: ${kbId})...`));

    try {
      await client.updateKnowledgeBase(kbId, {
        name: kbName,
        text: kbContent,
      });

      console.log(chalk.green(`✓ Updated knowledge base document`));
    } catch (error) {
      console.log(chalk.red(`Failed to update KB: ${(error as Error).message}`));
      console.log(chalk.yellow(`Creating new knowledge base instead...`));

      // If update fails, create new one
      const newKb = await client.createKnowledgeBaseFromText({
        name: kbName,
        text: kbContent,
      });

      console.log(chalk.green(`✓ Created new knowledge base (ID: ${newKb.id})`));

      // Update agent config with new KB ID
      agentConfig.knowledge_base_ids = [newKb.id];
      await writeAgentConfig(localAgent, agentConfig);
    }
  } else {
    // Create new KB
    console.log(chalk.blue(`Creating new knowledge base...`));

    const newKb = await client.createKnowledgeBaseFromText({
      name: kbName,
      text: kbContent,
    });

    console.log(chalk.green(`✓ Created knowledge base (ID: ${newKb.id})`));

    // Update agent config with new KB ID
    agentConfig.knowledge_base_ids = [newKb.id];
    await writeAgentConfig(localAgent, agentConfig);
    console.log(chalk.green(`✓ Updated agent-config.json with KB ID`));
  }

  // Now attach KB to agent
  console.log(chalk.blue(`Attaching knowledge base to agent...`));

  const kbId = agentConfig.knowledge_base_ids![0];

  await client.updateAgent(localAgent.agent_id, {
    conversationConfig: {
      agent: {
        firstMessage: agentConfig.conversation_config?.agent?.first_message || '',
        language: agentConfig.conversation_config?.agent?.language || 'en',
        prompt: {
          prompt: agentConfig.conversation_config?.agent?.prompt?.prompt || '',
          llm: agentConfig.conversation_config?.agent?.prompt?.llm || 'gpt-4o',
          temperature: agentConfig.conversation_config?.agent?.prompt?.temperature,
          maxTokens: agentConfig.conversation_config?.agent?.prompt?.max_tokens,
          toolIds: agentConfig.conversation_config?.agent?.prompt?.tool_ids,
          knowledgeBase: [{ type: 'file', id: kbId, name: kbName, usageMode: 'auto' }],
        },
      },
    },
    versionDescription: `Updated knowledge base (${new Date().toISOString()})`,
  });

  console.log(chalk.green(`✓ Knowledge base attached to agent`));

  // Compute RAG index so semantic search works immediately
  console.log(chalk.blue(`Computing RAG index...`));
  try {
    const ragModel = agentConfig.conversation_config?.agent?.prompt?.rag?.embeddingModel || 'e5_mistral_7b_instruct';
    const ragResponse = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/rag-index', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ document_id: kbId, create_if_missing: true, model: ragModel }] }),
    });
    const ragResult = await ragResponse.json() as Record<string, any>;
    const indexStatus = ragResult[kbId]?.data?.status || 'unknown';
    console.log(chalk.green(`✓ RAG index triggered (status: ${indexStatus})`));
    if (indexStatus === 'created' || indexStatus === 'processing') {
      console.log(chalk.gray(`  Index is processing — may take up to a minute before RAG queries work`));
    }
  } catch (error) {
    console.log(chalk.yellow(`  Warning: Could not compute RAG index: ${(error as Error).message}`));
    console.log(chalk.yellow(`  You may need to manually trigger indexing before RAG queries will work`));
  }

  console.log(chalk.green(`\n✓ Knowledge base sync complete`));
}

/**
 * Convert HTML content from ElevenLabs KB API to markdown
 */
function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove outer html/body/div wrapper
  md = md.replace(/<html><body><div[^>]*>/, '');
  md = md.replace(/<\/div><\/body><\/html>/, '');

  // Convert headings (add newlines before for proper markdown spacing)
  md = md.replace(/<h1>(.*?)<\/h1>/g, '\n\n# $1\n');
  md = md.replace(/<h2>(.*?)<\/h2>/g, '\n\n## $1\n');
  md = md.replace(/<h3>(.*?)<\/h3>/g, '\n\n### $1\n');

  // Convert bold
  md = md.replace(/<b>(.*?)<\/b>/g, '**$1**');
  md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');

  // Convert italic
  md = md.replace(/<i>(.*?)<\/i>/g, '*$1*');
  md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');

  // Convert paragraphs to double newlines
  md = md.replace(/<p>/g, '\n\n');
  md = md.replace(/<\/p>/g, '');

  // Convert line breaks
  md = md.replace(/<br\s*\/?>/g, '\n');

  // Convert lists
  md = md.replace(/<ul>/g, '');
  md = md.replace(/<\/ul>/g, '');
  md = md.replace(/<ol>/g, '');
  md = md.replace(/<\/ol>/g, '');
  md = md.replace(/<li>/g, '\n- ');
  md = md.replace(/<\/li>/g, '');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

/**
 * Pull knowledge base from ElevenLabs to local file
 */
export async function pullKnowledgeBase(apiKey: string, agentKey: string) {
  const client = new ElevenLabsManager(apiKey);
  const configManager = getConfigManager();

  console.log(chalk.blue(`Pulling knowledge base for agent '${agentKey}'...`));

  const localAgent = await configManager.getAgent(agentKey);
  const agentConfig = await readAgentConfig(localAgent);

  // Get agent to find KB IDs
  const remoteAgent = await client.getAgent(localAgent.agent_id) as any;
  const kbRefs = remoteAgent.conversationConfig?.agent?.prompt?.knowledgeBase || [];

  if (kbRefs.length === 0) {
    console.log(chalk.yellow('No knowledge base attached to this agent.'));
    return;
  }

  console.log(chalk.blue(`Found ${kbRefs.length} knowledge base document(s)`));

  // Fetch the first KB document's content
  const kbId = kbRefs[0].id;
  const kbDoc = await client.getKnowledgeBase(kbId) as any;

  console.log(chalk.gray(`Document: ${kbDoc.name || 'Unknown'} (ID: ${kbId})`));

  // Fetch full text content via the content endpoint
  const rawContent = await client.getKnowledgeBaseContent(kbId);

  if (!rawContent || (typeof rawContent === 'string' && rawContent.trim().length === 0)) {
    console.log(chalk.yellow('Knowledge base document is empty.'));
    return;
  }

  // Convert HTML to markdown if the content is HTML
  const content = rawContent.trim().startsWith('<') ? htmlToMarkdown(rawContent) : rawContent;

  // Write content to local KB file
  await writeKnowledgeBase(localAgent, content);
  console.log(chalk.green(`✓ Updated ${localAgent.files.knowledge_base}`));

  // Update agent-config.json with KB ID
  agentConfig.knowledge_base_ids = kbRefs.map((ref: any) => ref.id);
  await writeAgentConfig(localAgent, agentConfig);
  console.log(chalk.green(`✓ Updated agent-config.json with KB IDs`));

  console.log(chalk.green(`\n✓ Successfully pulled knowledge base for '${agentKey}'`));
  console.log(chalk.gray(`  ${content.length} characters written to ${localAgent.files.knowledge_base}`));
}
