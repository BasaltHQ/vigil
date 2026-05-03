export interface CodexTerm {
    term: string;
    slug: string;
    definition: string;
    longDescription: string;
    category: 'Legal AI Architecture' | 'Security' | 'Compliance' | 'Legal Operations' | 'Corporate Governance' | 'Machine Learning';
    relatedSlugs: string[];
}

export const CODEX: CodexTerm[] = [
    {
        term: 'Agentic Law',
        slug: 'agentic-law',
        definition: 'The application of autonomous AI agents to execute multi-step legal workflows, replacing traditional billable hour tasks.',
        longDescription: 'Agentic Law represents the shift from passive legal research tools to active, executing entities. In an Agentic Law paradigm, an AI system does not just find a relevant case or summarize a contract; it autonomously reads the contract, flags non-standard liabilities based on a predefined risk matrix, generates a redlined version, and emails the counterparty. Vigil is the premier platform for Agentic Law, allowing law firms and corporate counsel to deploy swarms of specialized agents to handle M&A due diligence, corporate governance, and contract lifecycle management autonomously.',
        category: 'Legal Operations',
        relatedSlugs: ['legal-swarm-intelligence', 'autonomous-redlining']
    },
    {
        term: 'Legal Swarm Intelligence',
        slug: 'legal-swarm-intelligence',
        definition: 'A decentralized coordination model where multiple specialized legal AI agents collaborate on complex legal problems.',
        longDescription: 'No single lawyer is an expert in every field of law, and no single AI model should be expected to process an entire M&A data room flawlessly. Legal Swarm Intelligence solves this by deploying dozens of narrowly focused agents simultaneously. During due diligence, Vigil deploys an "IP Swarm" to check patent chains, an "Employment Swarm" to review executive compensation agreements, and a "Tax Swarm" to identify liabilities. These agents cross-communicate, passing findings to a central "Lead Counsel Agent" that synthesizes the final risk memo. This mimics the structure of a real-world law firm but operates at machine speed.',
        category: 'Legal AI Architecture',
        relatedSlugs: ['agentic-law', 'due-diligence-automation']
    },
    {
        term: 'Autonomous Redlining',
        slug: 'autonomous-redlining',
        definition: 'The process by which an AI agent reviews a contract and automatically proposes edits (redlines) to align with a specific legal playbook.',
        longDescription: 'Autonomous Redlining goes beyond simple anomaly detection. When a third-party MSA is uploaded to Vigil, the system does not just highlight risky clauses. It analyzes the specific language, compares it to the client\'s historical negotiation playbook, and generates a heavily redlined Microsoft Word document. If the counterparty proposed a $5M liability cap and the playbook requires a $1M cap, the AI strikes the text, inserts the preferred language, and adds a margin comment explaining the legal justification for the change, ready for human review.',
        category: 'Legal Operations',
        relatedSlugs: ['playbook-enforcement', 'contract-lifecycle']
    },
    {
        term: 'Zero-Knowledge Privilege',
        slug: 'zero-knowledge-privilege',
        definition: 'A security architecture ensuring that highly sensitive, privileged legal data cannot be read or accessed by the AI provider or underlying LLM.',
        longDescription: 'Attorney-client privilege is the foundation of the legal profession. Passing unencrypted M&A term sheets or litigation strategies to a public LLM API violates this privilege. Vigil employs a Zero-Knowledge Privilege architecture. Documents are encrypted client-side and converted into irreversible vector embeddings. When external LLM reasoning is required, Vigil uses autonomous context masking to pseudonymize all sensitive entities (e.g., swapping "Google" with "Entity A") before the prompt leaves the secure perimeter. For maximum security, Vigil can deploy entirely air-gapped swarms on-premise.',
        category: 'Security',
        relatedSlugs: ['context-masking', 'on-premise-deployment']
    },
    {
        term: 'Playbook Enforcement',
        slug: 'playbook-enforcement',
        definition: 'The automated application of a legal department\'s standard negotiation and risk tolerance guidelines to incoming contracts.',
        longDescription: 'Every sophisticated corporate legal department maintains a "playbook"—a set of rules dictating acceptable indemnification clauses, governing law preferences, and liability caps. Historically, junior lawyers had to memorize these rules and manually enforce them during contract review. Vigil ingests these playbooks and enforces them mathematically. When a contract deviates from the playbook, the swarm instantly flags the deviation, categorizes the risk severity, and suggests the exact playbook-approved fallback language.',
        category: 'Compliance',
        relatedSlugs: ['autonomous-redlining', 'legal-operations']
    },
    {
        term: 'Continuous Entity Management',
        slug: 'continuous-entity-management',
        definition: 'The use of AI to autonomously maintain the good standing and corporate veil of global subsidiaries.',
        longDescription: 'Managing a global corporate structure requires tracking thousands of filing deadlines, drafting annual board resolutions, and maintaining accurate capitalization tables. Vigil\'s Continuous Entity Management system monitors jurisdictional databases globally. It autonomously drafts required state filings, calculates cap table dilution scenarios during funding rounds, and prepares shareholder consent forms, drastically reducing the administrative overhead for corporate secretaries and general counsel.',
        category: 'Corporate Governance',
        relatedSlugs: ['cap-table-automation', 'jurisdictional-mapping']
    },
    {
        term: 'LLM Legal Hallucination',
        slug: 'llm-legal-hallucination',
        definition: 'The phenomenon where an AI generates entirely fictitious legal citations, statutes, or case law.',
        longDescription: 'In the legal field, a hallucination is not just an error; it is a sanctionable offense. Early generative AI tools were notorious for inventing fake case law (e.g., Mata v. Avianca). Vigil eliminates legal hallucinations through a strict Retrieval-Augmented Generation (RAG) architecture. A Vigil agent is mathematically restricted from citing a case unless it can retrieve the full text of that case from a verified, immutable legal database (like LexisNexis or Westlaw) and anchor its reasoning directly to the verified text.',
        category: 'Legal AI Architecture',
        relatedSlugs: ['retrieval-augmented-generation', 'verifiable-citations']
    },
    {
        term: 'Retrieval-Augmented Generation (RAG)',
        slug: 'retrieval-augmented-generation',
        definition: 'A framework that grounds AI responses in verified, proprietary documents rather than relying on the AI\'s internal memory.',
        longDescription: 'RAG is the core anti-hallucination mechanism in Vigil. When you ask Vigil, "What are the termination rights in the Smith contract?", it does not guess based on generic training data. It searches the client\'s secure vector database, retrieves the exact signed Smith contract, injects the termination clause into the context window, and generates an answer strictly based on that text. This ensures 100% factual accuracy and allows the AI to provide exact page-and-paragraph citations for its conclusions.',
        category: 'Machine Learning',
        relatedSlugs: ['llm-legal-hallucination', 'vector-database']
    }
];

export function getAllCodexTerms(): CodexTerm[] {
    return CODEX;
}

export function getCodexTermBySlug(slug: string): CodexTerm | undefined {
    return CODEX.find(t => t.slug === slug);
}
