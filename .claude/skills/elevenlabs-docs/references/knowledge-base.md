# ElevenLabs Knowledge Base & RAG

> Sources:
> - https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base
> - https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/dashboard
> - https://elevenlabs.io/docs/eleven-agents/customization/knowledge-base/rag

## Table of Contents

- [Knowledge Base Overview](#knowledge-base-overview) — Purpose, creation methods
- [Document Usage Modes](#document-usage-modes) — prompt, auto, rag
- [KB Dashboard](#kb-dashboard) — UI management, dependencies
- [RAG](#rag-retrieval-augmented-generation) — How it works, when to use, config, indexing
- [Best Practices](#best-practices) — Common patterns
- [Common Mistakes](#common-mistakes) — Gotchas to avoid
- [API Endpoints Reference](#api-endpoints-reference)

## Knowledge Base Overview

Knowledge bases equip conversational agents with domain-specific information beyond pre-trained data. Use cases include product catalogs, corporate policies, technical documentation, and customer FAQs.

## Creating KB Documents

Three creation methods via API:

### From File (Recommended)
Upload documents in PDF, TXT, DOCX, HTML, or EPUB formats. 21MB size limit per file.

**Always prefer file uploads over text API.** File uploads get proper HTML extraction which works better with both prompt injection and RAG. Text-type documents get raw markdown in `extracted_inner_html` instead of proper HTML extraction.

### From URL
Import content from web sources. The system does NOT currently scrape linked pages or auto-update over time (planned features).

### From Text
Create documents with raw text content. **Not recommended** — use file upload instead for better extraction quality.

## Adding Documents to Agents

Documents are added to agents through the conversation configuration by referencing:
- Document ID
- Document name
- Document type

Documents are reusable across multiple agents for consistent knowledge sharing.

## Document Usage Modes

| Mode | Behavior | Best For |
|------|----------|----------|
| **`prompt`** | Full KB content injected into every LLM turn | Small KBs (< 5,000 tokens / ~300 lines). No retrieval step, no failure risk. |
| **`auto`** (default) | System decides when to include content based on query relevance. Also eligible for RAG retrieval. | Medium KBs with RAG enabled |
| **`rag`** | Only retrieved via semantic search when relevant | Large KBs where content won't fit in prompt |

## KB Dashboard

Available at `elevenlabs.io/app/agents/knowledge-base`. Provides:
- Centralized document management
- Usage tracking across agents
- Dependency tracking (which agents use which documents)
- Documents cannot be deleted if agents depend on them

### Adding Documents via Dashboard
1. Go to agent configuration page
2. Select "Add document" in the knowledge base section
3. Choose existing document or upload new one

---

## RAG (Retrieval-Augmented Generation)

### What RAG Does

RAG allows agents to access large knowledge bases by retrieving only the most relevant chunks for each query, rather than fitting entire documents in the context window.

**Benefits:**
- Handle knowledge bases larger than prompt limits
- More accurate, source-grounded responses
- Minimize hallucinations
- Scale knowledge without specialized agents

**Tradeoff:** Introduces ~500ms latency to agent response times.

### How RAG Works

1. **Query processing**: User questions are analyzed and reformulated for better retrieval
2. **Embedding generation**: Processed queries convert to vector embeddings
3. **Retrieval**: System locates semantically similar content from the knowledge base
4. **Response generation**: Agents create responses using conversation context plus retrieved info

### When to Use RAG

| KB Size | Mode | RAG | Rationale |
|---------|------|-----|-----------|
| Small (< 5,000 tokens) | `prompt` | **Disabled** | Content fits in prompt; RAG adds unnecessary latency and failure risk |
| Medium (5,000 - 50,000 tokens) | `auto` | Enabled | Too large for prompt but manageable with retrieval |
| Large (50,000+ tokens) | `auto` or `rag` | Enabled | Must use retrieval; content cannot fit in prompt |

**CRITICAL:** Documents under 500 bytes cannot be indexed by RAG and are automatically injected as prompt content.

### RAG Configuration

**Enable RAG:** Toggle "Use RAG" in the Knowledge Base section of agent settings.

**Advanced settings:**
- **Embedding model**: Model used to generate vector embeddings
- **Max document chunks per query**: Number of chunks retrieved per query (more = higher cost)
- **Max vector distance**: Threshold for semantic similarity (higher = more results but lower relevance)

### RAG Index

**The RAG index MUST be computed after creating or updating a KB document.** Without indexing, the document will not appear in retrieval results.

**Indexing is automatic** when documents are added to RAG-enabled agents, but may take several minutes for large files.

**Manual indexing via API:**
```bash
curl -X POST "https://api.elevenlabs.io/v1/convai/knowledge-base/rag-index" \
  -H "xi-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "document_id": "KB_DOC_ID",
      "create_if_missing": true,
      "model": "e5_mistral_7b_instruct"
    }]
  }'
```

**Checking index status:**
```bash
curl "https://api.elevenlabs.io/v1/convai/knowledge-base/rag-index/{document_id}" \
  -H "xi-api-key: YOUR_KEY"
```

### Usage Limits by Subscription Tier

| Tier | Document Size Limit |
|------|-------------------|
| Free | 1MB |
| Starter | 2MB |
| Creator | 20MB |
| Pro | 100MB |
| Scale | 500MB |
| Business | 1GB |
| Enterprise | 1GB+ |

Non-enterprise accounts: 20MB or 300k characters total.

## Best Practices

1. **Use `prompt` mode by default** for small KBs. Only enable RAG when content is too large for prompt injection.
2. **Always use file uploads** instead of text API for better HTML extraction.
3. **Compute RAG index after every KB update** when RAG is enabled.
4. **Break large documents** into focused, well-structured pieces for better retrieval.
5. **Regularly review and update** content for accuracy.
6. **Analyze conversation transcripts** to identify knowledge gaps.
7. **Test retrieval** with representative queries before going live.

## Common Mistakes

- **Using RAG for small KBs** — causes empty retrieval when semantic search fails to match. Use `prompt` mode instead.
- **Uploading via text API** — gets raw markdown in `extracted_inner_html` instead of proper HTML.
- **Forgetting to compute RAG index** after creating/updating a document — causes empty retrieval results.
- **Setting vector distance too low** — misses relevant content.
- **Setting vector distance too high** — retrieves irrelevant content.
- **Not checking index status** — large documents may take minutes to index; queries during indexing return nothing.

## API Endpoints Reference

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List Documents | GET | `/v1/convai/knowledge-base` |
| Get Document | GET | `/v1/convai/knowledge-base/{id}` |
| Create from File | POST | `/v1/convai/knowledge-base` (multipart) |
| Create from URL | POST | `/v1/convai/knowledge-base/url` |
| Create from Text | POST | `/v1/convai/knowledge-base/text` |
| Update Document | PATCH | `/v1/convai/knowledge-base/{id}` |
| Delete Document | DELETE | `/v1/convai/knowledge-base/{id}` |
| Get Content | GET | `/v1/convai/knowledge-base/{id}/content` |
| Get Chunk | GET | `/v1/convai/knowledge-base/{id}/chunks/{chunk_id}` |
| Compute RAG Index | POST | `/v1/convai/knowledge-base/rag-index` |
| Get RAG Index | GET | `/v1/convai/knowledge-base/rag-index/{id}` |
| RAG Index Overview | GET | `/v1/convai/knowledge-base/rag-index` |
| Compute RAG Batch | POST | `/v1/convai/knowledge-base/rag-index/batch` |
| Delete RAG Index | DELETE | `/v1/convai/knowledge-base/rag-index/{id}` |
