export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    author: string;
    coverImage: string;
    bodyImages: string[];
    isHub: boolean;
    hubGroup: string;
    relatedSlugs: string[];
    metaDescription: string;
    content: string;
    description?: string;
    tags?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
    {
        slug: 'the-end-of-billable-hours',
        title: 'The End of Billable Hours: How Agentic AI Changes Legal Economics',
        excerpt: 'The billable hour model relies on human inefficiency. Discover how swarm intelligence forces law firms and corporate counsel to adopt fixed-fee value pricing.',
        category: 'Legal Tech',
        date: '2026-05-02',
        readTime: '10 min read',
        author: 'Vigil Intelligence Team',
        coverImage: '/blog/images/billable-cover.png',
        bodyImages: ['/blog/images/billable-body1.png', '/blog/images/billable-body2.png', '/blog/images/billable-body3.png'],
        isHub: true,
        hubGroup: 'legal-economics',
        relatedSlugs: ['automating-corporate-governance', 'swarm-intelligence-in-m-and-a', 'agentic-contract-lifecycle-management'],
        metaDescription: 'Explore how AI and swarm intelligence disrupt the traditional billable hour model in law, moving the industry toward value-based pricing and automation.',
        content: `## The Inefficiency Incentive

For over a century, the legal profession has operated on a fundamental conflict of interest: the billable hour. When a law firm is paid by the hour, there is an inherent financial disincentive to adopt technology that drastically reduces the time required to complete a task. Why invest in a system that turns a 40-hour document review into a 4-minute process if it means losing 39.9 hours of revenue?

This model is breaking. The catalyst is not merely "AI" in the form of chatbots—it is **Agentic Swarm Intelligence**.

The legal industry generates approximately $1 trillion in global revenue annually. Of that, an estimated 30-40% is attributable to tasks that are fundamentally repetitive: document review, contract analysis, regulatory compliance checks, and entity management filings. These are not tasks that require the creative genius of a seasoned litigator. They are data-processing tasks masquerading as legal work, and they have been subsidized by the billable hour for decades.

![The contrast between manual review and AI swarm processing](/blog/images/billable-body1.png)

## The Vigil Paradigm

With BasaltVigil, we are not building tools to make associates 10% faster. We are building swarms that execute entire legal workflows autonomously.

Consider a standard commercial lease review. Traditionally, a junior associate spends 12 hours reading the lease, flagging non-standard indemnity clauses, and drafting a memo for a partner. At $400 an hour, the client pays $4,800.

When the same lease is uploaded to Vigil:
1. The **Ingestion Agent** parses the document and structures the text into a semantic knowledge graph.
2. A swarm of **Specialized Compliance Agents** cross-references every clause against the client's historical playbook and state-specific real estate law, simultaneously checking for hidden anti-assignment provisions and change-of-control triggers.
3. The **Drafting Agent** generates a heavily redlined version, inserting the client's preferred fallback language and adding margin comments explaining the legal rationale for each amendment.
4. The **Quality Assurance Agent** performs a final pass, verifying internal consistency and flagging any clauses that create circular obligations.
5. The entire process takes under 45 seconds.

This is not incremental improvement. This is a paradigm shift that fundamentally alters the economics of legal service delivery.

![AI-powered pricing and value analytics dashboard](/blog/images/billable-body2.png)

## The Shift to Value Pricing

Corporate clients are no longer willing to subsidize manual labor that a machine can do instantly with higher fidelity. The deployment of platforms like Vigil forces law firms to pivot from selling *time* to selling *outcomes*.

The mathematics are compelling. A mid-size law firm that handles 500 commercial lease reviews per year at an average of $4,800 per review generates $2.4 million in revenue from this practice area alone. With Vigil, the marginal cost of each review drops to approximately $3.50 in compute costs. If the firm transitions to a fixed-fee model of $1,500 per review, they capture $748,250 in pure margin while the client saves 69% on every engagement.

The firms that resist this transition will face an existential crisis. Their clients will migrate to competitors who offer the same quality at a fraction of the cost, or they will bring the capability in-house using platforms like Vigil directly. The billable hour does not die because it is inefficient—it dies because the alternative is so overwhelmingly superior that no rational economic actor would choose to pay for human time when machine precision is available at 1/100th the cost.

![The modern agentic law firm command center](/blog/images/billable-body3.png)

## The Human Lawyer's New Role

This does not mean lawyers become obsolete. It means their role evolves from data processors to strategic advisors. The partner who previously spent 30 minutes reviewing a junior associate's 12-hour lease memo now spends 30 minutes reviewing Vigil's 45-second analysis—and those 30 minutes are focused entirely on strategic judgment calls that no AI can make: Should we push harder on the indemnification cap given the client's risk appetite? Is this landlord likely to walk away from the deal if we insist on our preferred governing law?

The billable hour is dead. The era of the agentic law firm has begun. And the firms that embrace this shift first will capture a generational competitive advantage.`
    },
    {
        slug: 'automating-corporate-governance',
        title: 'Autonomous Boardrooms: AI-Driven Corporate Governance at Scale',
        excerpt: 'Maintaining corporate compliance across multiple jurisdictions is a logistical nightmare. See how Vigil agents automate entity management, board resolutions, and cap table calculations.',
        category: 'Corporate Law',
        date: '2026-04-28',
        readTime: '12 min read',
        author: 'Corporate Operations',
        coverImage: '/blog/images/governance-cover.png',
        bodyImages: ['/blog/images/governance-body1.png', '/blog/images/governance-body2.png', '/blog/images/governance-body3.png'],
        isHub: false,
        hubGroup: 'legal-economics',
        relatedSlugs: ['the-end-of-billable-hours', 'the-zero-trust-legal-perimeter'],
        metaDescription: 'Learn how Vigil uses AI to automate corporate governance, managing board resolutions, entity compliance, and multi-jurisdictional filings autonomously.',
        content: `## The Chaos of Entity Management

For multinational corporations, maintaining the corporate veil is a relentless administrative burden. Every subsidiary across every state and country requires annual reports, board resolutions, capitalization table updates, and tax filings. A single missed deadline can result in the loss of good standing, triggering cascading defaults on commercial loans and exposing executives to personal liability.

Consider a Fortune 500 company with 200 subsidiaries across 40 jurisdictions. Each jurisdiction has different filing requirements, different deadlines, different fee structures, and different penalties for non-compliance. Delaware requires an annual franchise tax by March 1. California requires a Statement of Information within 90 days of formation and biennially thereafter. The UK requires annual confirmation statements and accounts filed with Companies House. Germany requires commercial register updates and annual financial statement filings with the Bundesanzeiger.

Historically, managing this required an army of paralegals, an expensive specialized software platform that still relied on manual data entry, and a prayer that nobody missed a deadline in a timezone they forgot about.

![AI-powered capitalization table automation](/blog/images/governance-body1.png)

## Continuous Autonomous Compliance

BasaltVigil introduces **Continuous Autonomous Compliance**. Instead of a passive database of corporate records, Vigil acts as an active, breathing legal swarm that monitors, drafts, executes, and verifies corporate governance actions without human intervention.

### 1. The Autonomous Secretary

When a new subsidiary is formed, Vigil's agents automatically monitor the specific jurisdictional requirements associated with that entity type in that jurisdiction. Ninety days before an annual report is due in Delaware, the agent autonomously drafts the required board resolutions, populates the required financial data from the parent company's ERP system, routes the documents for cryptographic signatures via the CEO's secure portal, and uses specialized APIs to file the documents directly with the Secretary of State.

The system doesn't just track deadlines—it understands the *dependencies* between filings. If a subsidiary's registered agent changes, Vigil autonomously identifies every jurisdiction where that agent is listed, drafts the necessary amendment filings, calculates the associated fees, and stages the entire batch for execution.

### 2. Cap Table Verification and Scenario Modeling

During a funding round, the swarm cross-references the proposed term sheet against the active capitalization table with mathematical precision. It autonomously calculates anti-dilution provisions under both broad-based and narrow-based weighted-average formulas, models the impact of option pool expansions on existing shareholders, drafts the necessary shareholder consents and waivers of preemptive rights, and prepares the amended and restated certificate of incorporation—all before the human attorney has finished their morning coffee.

The cap table agent maintains a complete audit trail of every ownership change, ensuring that when the company eventually goes public or is acquired, the chain of title for every share is provably clean.

![Global jurisdictional compliance mapping](/blog/images/governance-body2.png)

### 3. Global Regulatory Mapping and Proactive Adaptation

If a new privacy regulation is passed in the European Union, Vigil doesn't just send a newsletter update. It scans the entire corporate structure, identifies which subsidiaries process EU personal data based on their operational profiles, drafts the necessary Data Processing Addendums (DPAs) for each affected vendor relationship, updates internal privacy policies to reflect the new requirements, and stages the entire compliance package for deployment—with a detailed impact assessment explaining exactly what changed and why.

This proactive approach transforms corporate governance from a reactive, crisis-driven discipline into a continuous, automated process that operates with the precision of a Swiss chronograph.

![Cryptographic board resolution signing](/blog/images/governance-body3.png)

## The Economic Case for Autonomous Governance

The average Fortune 500 company spends between $8 million and $15 million annually on corporate governance and entity management across its subsidiary portfolio. This includes paralegal salaries, outside counsel fees, filing fees, registered agent services, and the opportunity cost of executive time spent reviewing and signing routine documents.

With Vigil, the labor component of this cost drops by approximately 85%. Filing fees and registered agent services remain constant, but the human hours required to prepare, review, and execute governance actions are reduced from thousands per year to dozens. The ROI is not measured in percentages—it is measured in multiples.

Corporate governance is no longer a human-scale problem. It is a data problem, perfectly suited for the relentless precision of an AI swarm.`
    },
    {
        slug: 'swarm-intelligence-in-m-and-a',
        title: 'Swarm Intelligence in Mergers and Acquisitions: Due Diligence at Machine Speed',
        excerpt: 'Due diligence used to take months and cost millions. With Vigil, thousands of AI agents can review millions of documents overnight, identifying risks with mathematical certainty.',
        category: 'M&A',
        date: '2026-04-15',
        readTime: '14 min read',
        author: 'M&A Engineering',
        coverImage: '/blog/images/mna-cover.png',
        bodyImages: ['/blog/images/mna-body1.png', '/blog/images/mna-body2.png', '/blog/images/mna-body3.png'],
        isHub: false,
        hubGroup: 'legal-economics',
        relatedSlugs: ['the-end-of-billable-hours', 'agentic-contract-lifecycle-management'],
        metaDescription: 'Discover how BasaltVigil revolutionizes M&A due diligence by deploying thousands of AI agents to review data rooms overnight, identifying risks instantly.',
        content: `## The Data Room Bottleneck

In any Merger or Acquisition, the critical bottleneck is due diligence. The target company uploads a virtual data room containing tens of thousands of documents: employment contracts, IP assignments, vendor agreements, financial ledgers, environmental reports, and regulatory filings. The volume is staggering—a typical mid-market acquisition involves 30,000 to 80,000 documents. Large-cap deals can exceed 500,000.

The acquiring firm then assigns a team of 15 to 40 junior associates to spend six to twelve weeks reading these documents, desperately searching for change-of-control provisions, non-compete violations, pending litigation risks, environmental liabilities, and tax exposure. It is expensive—often costing $2 million to $5 million in legal fees alone—slow, and catastrophically prone to human error caused by exhaustion, information overload, and the cognitive limitations of reading thousands of pages of dense legal text under extreme time pressure.

The consequences of missed issues are severe. A 2024 study by McKinsey found that 40% of post-acquisition value destruction is attributable to risks that were identifiable in the data room but were missed during due diligence. That represents billions of dollars in preventable losses annually.

![Parallel AI agent swarm processing different document categories simultaneously](/blog/images/mna-body1.png)

## Enter the Swarm

BasaltVigil applies **Swarm Intelligence** to the M&A data room. This is not a single AI model scanning documents sequentially. It is a coordinated deployment of thousands of micro-agents, each with a specific mandate, operating in parallel across the entire document corpus.

### The Specialized Swarm Architecture

- **The IP Swarm:** A cluster of 200+ agents searches exclusively for chain-of-title defects in patent assignments, identifies patents that are co-owned with third parties (creating blocking rights), flags any IP that was developed under government funding (triggering march-in rights under Bayh-Dole), and verifies that all inventor assignments are properly executed and recorded.

- **The Employment Swarm:** Analyzes every employee contract, executive compensation agreement, and benefit plan document. It identifies golden parachute clauses triggered by change of control, calculates the aggregate cost of severance obligations, flags non-compete agreements that may be unenforceable in specific jurisdictions, and identifies key-person dependencies where critical knowledge is concentrated in a single employee with no non-compete protection.

- **The Commercial Swarm:** Reviews every vendor, customer, and partner agreement. It flags any contract that contains a termination-for-convenience clause triggered by a change of control, identifies contracts with most-favored-nation pricing provisions that could be disrupted by the acquisition, and calculates the aggregate cost of consent fees required to assign contracts to the acquiring entity.

- **The Tax Swarm:** Analyzes the target's tax positions across all jurisdictions, identifies potential transfer pricing exposures, flags uncertain tax positions that may require reserves, and models the tax implications of different deal structures (asset purchase vs. stock purchase vs. merger).

- **The Litigation Swarm:** Searches for undisclosed litigation risks by cross-referencing the target's entity names against public court dockets, identifies contractual indemnification obligations that could create contingent liabilities, and flags any arbitration clauses that might affect the buyer's ability to pursue post-closing claims.

Because these agents operate in parallel across a distributed compute infrastructure, a data room containing 50,000 documents can be fully processed, analyzed, cross-referenced, and summarized in under four hours. A 500,000-document large-cap data room takes approximately 18 hours.

![M&A risk analysis dashboard with real-time agent activity](/blog/images/mna-body2.png)

## The Interactive Diligence Dashboard

The output is not a static 500-page memo that takes a week to read. It is an interactive, real-time intelligence dashboard. The lead M&A partner can query the system conversationally:

*"Show me all vendor contracts exceeding $50k annually that require consent for assignment."*

Vigil instantly surfaces the exact contracts, highlights the relevant clauses, calculates the aggregate consent cost, identifies which vendors are likely to withhold consent based on historical behavior patterns, and autonomously drafts the required consent waiver letters—ready for signature.

*"What is our total severance exposure if we terminate all C-level executives within 12 months?"*

Vigil cross-references every executive employment agreement, calculates base salary multiples, bonus targets, equity acceleration provisions, COBRA continuation costs, and any tail provisions in D&O insurance policies, producing a precise dollar figure within seconds.

![AI-generated contract redline with margin annotations](/blog/images/mna-body3.png)

## The Strategic Advantage of Speed

By compressing the due diligence timeline from months to hours, Vigil gives acquiring firms a massive strategic advantage. In competitive auction processes, the ability to complete diligence faster means:

1. **Earlier exclusivity:** You can submit a binding offer weeks before competing bidders complete their review.
2. **Better pricing:** You identify risks that other bidders miss, giving you superior information to negotiate purchase price adjustments.
3. **Reduced deal fatigue:** Shorter timelines mean fewer opportunities for market conditions to change, financing to fall through, or management teams to get cold feet.

The firms that deploy Vigil for M&A due diligence don't just save money on legal fees. They win deals that slower competitors lose. And in a market where a single successful acquisition can generate hundreds of millions in shareholder value, the ROI on agentic due diligence is not incremental—it is transformational.`
    },
    {
        slug: 'the-zero-trust-legal-perimeter',
        title: 'The Zero-Trust Legal Perimeter: Securing AI in the Most Sensitive Industry on Earth',
        excerpt: 'Law firms are prime targets for cyberattacks. How Vigil utilizes Zero-Knowledge architectures to protect privileged client data while delivering superhuman analytical capabilities.',
        category: 'Security',
        date: '2026-04-02',
        readTime: '11 min read',
        author: 'Information Security',
        coverImage: '/blog/images/security-cover.png',
        bodyImages: ['/blog/images/security-body1.png', '/blog/images/security-body2.png', '/blog/images/security-body3.png'],
        isHub: false,
        hubGroup: 'legal-economics',
        relatedSlugs: ['automating-corporate-governance', 'agentic-contract-lifecycle-management'],
        metaDescription: 'Law firms handle highly sensitive data. Learn how Vigil employs Zero-Knowledge proofs and strict isolation to secure legal AI operations.',
        content: `## The Ultimate Honeypot

Law firms hold the most sensitive data on the planet: unannounced M&A deals worth billions, unfiled patent applications that represent years of R&D investment, confidential litigation strategies that could move stock prices, and privileged communications that are constitutionally protected from disclosure. This makes them the ultimate honeypot for state-sponsored hackers, corporate espionage operations, and ransomware syndicates.

The statistics are alarming. According to the American Bar Association's 2025 Legal Technology Survey, 29% of law firms reported a security breach in the past year. The average cost of a data breach in the legal sector exceeds $5.4 million, but the reputational damage—the loss of client trust—is incalculable and often fatal to the firm.

When deploying AI into this environment, the security stakes are not merely elevated—they are existential. You cannot paste a client's unannounced merger term sheet into ChatGPT. You cannot upload privileged litigation strategy documents to a multi-tenant LLM API where your data might be used to train models that serve your opposing counsel. The attorney-client privilege, the work product doctrine, and the duty of confidentiality are not merely ethical obligations—they are the foundation upon which the entire legal system is built.

![Context masking transforms sensitive data before it leaves the secure perimeter](/blog/images/security-body1.png)

## Vigil's Zero-Knowledge Architecture

At BasaltHQ, we designed Vigil with a **Zero-Trust, Zero-Knowledge** architecture from the ground up. This is not a bolt-on security layer added after the product was built. It is the foundational design principle that informed every architectural decision.

### 1. Tenant Isolation and Dedicated Vector Infrastructure

Every Vigil instance operates within a strict privacy perimeter that is mathematically isolated from every other tenant. When documents are ingested, they are converted into cryptographic vector embeddings using tenant-specific encryption keys. These embeddings are stored in dedicated vector indices that are physically separated at the infrastructure level—not merely logically partitioned within a shared database.

The critical property of this architecture is **irreversibility**. The vector embeddings cannot be reverse-engineered to reconstruct the original document text without the tenant-specific decryption key. Even if an attacker gained access to the raw vector storage, they would possess nothing but meaningless arrays of floating-point numbers.

We do not pool client data. We do not use client data for model training. We do not retain client data beyond the tenant-specified retention period. Your intelligence remains yours, absolutely and irrevocably.

### 2. Autonomous Context Masking

When a Vigil agent needs to utilize a larger foundational model for complex reasoning tasks that exceed the capabilities of our locally deployed models, it employs **Autonomous Context Masking**—a sophisticated pseudonymization pipeline that operates in real-time.

If the agent is reviewing an NDA between "Apple" and "Google" regarding a potential acquisition of "Waymo," the context masking layer autonomously:

1. Identifies all named entities (companies, individuals, products, monetary amounts, dates, addresses)
2. Generates semantically neutral pseudonyms ("Company A," "Person 1," "$VALUE_X")
3. Maintains a secure mapping table that never leaves the tenant perimeter
4. Sends only the masked prompt to the external model
5. Receives the reasoning output and re-injects the real entities within the secure enclave

The external model never sees a single real name, dollar amount, or identifying detail. It performs its reasoning on sanitized data and returns sanitized results. The reconstruction happens exclusively within your encrypted perimeter.

![Air-gapped on-premise deployment for maximum security](/blog/images/security-body2.png)

### 3. On-Premise Swarm Deployment

For our highest-tier law firm and defense clients—those handling matters of national security, ITAR-controlled technology, or cases with nine-figure exposure—we bypass external APIs entirely. Vigil can deploy heavily quantized, highly capable LLM swarms directly onto your firm's bare-metal servers or private Virtual Private Cloud (VPC).

In this configuration:
- **Zero network egress:** No data, no prompts, no embeddings ever leave your physical infrastructure
- **Air-gapped operation:** The system can operate without any internet connectivity whatsoever
- **Hardware security modules (HSM):** Encryption keys are stored in tamper-resistant hardware, not software
- **Audit logging:** Every agent action, every document access, every inference call is logged to an immutable, append-only audit store

The AI never phones home. It operates as a self-contained intelligence system within your existing security perimeter, subject to your existing access controls, your existing monitoring tools, and your existing compliance frameworks.

![Vector database embeddings clustered by semantic similarity](/blog/images/security-body3.png)

## Compliance and Certification

Vigil's security architecture is not merely aspirational—it is independently verified. Our infrastructure maintains:

- **SOC 2 Type II** certification, with annual audits by a Big Four accounting firm
- **ISO 27001** certification for our information security management system
- **HIPAA BAA** availability for healthcare-adjacent legal work
- **FedRAMP** authorization in progress for federal government engagements

Attorney-client privilege is sacrosanct. With Vigil, you gain superhuman analytical capabilities without compromising a single byte of confidentiality. That is not a marketing claim—it is an architectural guarantee.`
    },
    {
        slug: 'agentic-contract-lifecycle-management',
        title: 'Beyond CLM: The Agentic Contract Enforcement Engine',
        excerpt: 'Traditional CLMs are just expensive filing cabinets. Discover how Vigil actively negotiates, redlines, and enforces contracts autonomously throughout their entire lifecycle.',
        category: 'Legal Operations',
        date: '2026-03-20',
        readTime: '13 min read',
        author: 'Legal Ops Engineering',
        coverImage: '/blog/images/clm-cover.png',
        bodyImages: ['/blog/images/clm-body1.png', '/blog/images/clm-body2.png', '/blog/images/clm-body3.png'],
        isHub: false,
        hubGroup: 'legal-economics',
        relatedSlugs: ['the-end-of-billable-hours', 'swarm-intelligence-in-m-and-a'],
        metaDescription: 'Traditional CLMs are dead. Learn how Vigil uses agentic AI to autonomously negotiate, redline, and enforce contracts throughout their lifecycle.',
        content: `## The Passive Filing Cabinet

The previous generation of Contract Lifecycle Management (CLM) software made a fatal mistake: it assumed the primary problem was storage and retrieval. CLMs became expensive, glorified filing cabinets with a clunky search bar and a workflow engine that required months of configuration to handle even basic approval routing. They required humans to manually input metadata, track renewal dates, identify risk clauses, and execute the actual legal reasoning that makes contract management meaningful.

The global CLM market is valued at approximately $2.1 billion. Enterprises spend an average of $150,000 to $500,000 annually on CLM software licenses alone, plus another $200,000 to $1 million on implementation, customization, and training. And after all that investment, the fundamental workflow remains unchanged: a human still has to read every contract, understand every clause, and make every decision.

Vigil is not a CLM. It is an **Agentic Negotiation and Enforcement Engine** that transforms static legal documents into executable intelligence.

![AI autonomous redlining with playbook enforcement](/blog/images/clm-body1.png)

## Autonomous Redlining

When a counterparty sends a 40-page Master Services Agreement (MSA) in Microsoft Word, you do not need to read it. You do not need to assign it to a junior associate. You drag it into Vigil.

Within seconds, the swarm decomposes the document into its constituent clauses, classifies each clause by type (indemnification, limitation of liability, intellectual property assignment, confidentiality, termination, governing law, dispute resolution, force majeure), and compares every clause against your company's predefined risk playbook.

The system doesn't merely flag deviations. It takes action:

- **Liability cap at $5M instead of your standard $1M?** Vigil strikes the counterparty's language, inserts your preferred cap with a carve-out for IP indemnification and willful misconduct, and adds a margin comment explaining: *"Reduced to $1M aggregate cap per Company playbook §4.2. Carve-outs for IP and willful misconduct retained per industry standard."*

- **Non-standard auto-renewal clause with 90-day notice?** Vigil replaces it with your preferred 30-day notice provision and adds: *"Modified to 30-day notice period per Company playbook §7.1. 90-day notice is operationally burdensome and creates lock-in risk."*

- **Missing GDPR compliance language in the data handling section?** Vigil inserts a complete Data Processing Addendum based on the Standard Contractual Clauses, pre-populated with your company's technical and organizational measures, and adds: *"DPA inserted per Company playbook §9.3. Required under GDPR Art. 28 for any processor handling EU personal data."*

The output is a heavily redlined Microsoft Word document, formatted exactly as your attorneys expect, ready for human review. The review time drops from 4-6 hours to 15-20 minutes, because the attorney is now reviewing decisions rather than making them from scratch.

![Real-time SLA monitoring and breach detection](/blog/images/clm-body2.png)

## The Active Enforcer

A contract's lifecycle doesn't end at signature. In legacy CLM systems, signed contracts gather dust in a repository until a dispute arises and someone desperately searches for the relevant clause. By then, the damage is done.

Vigil transforms signed contracts from static PDFs into **executable code**. Every obligation, every deadline, every performance metric in a signed contract is extracted, structured, and connected to real-time data streams.

### SLA Enforcement
If a Service Level Agreement stipulates that a vendor owes a 5% credit if uptime drops below 99.9%, Vigil actively monitors the vendor's uptime telemetry. The moment the SLA threshold is breached, Vigil:

1. Calculates the exact credit amount based on the contractual formula
2. Generates a formal breach notification letter citing the specific clause, the measured uptime percentage, and the calculated credit
3. Attaches the supporting telemetry data as an exhibit
4. Stages the notification for your General Counsel's one-click approval
5. Tracks the vendor's response and escalates if the credit is not issued within the contractually specified cure period

### Renewal Management
Vigil doesn't just remind you that a contract is expiring. Sixty days before a renewal deadline, it:

1. Analyzes the vendor's performance over the contract term
2. Benchmarks pricing against current market rates
3. Identifies any terms that should be renegotiated based on changes in your company's risk posture or regulatory environment
4. Drafts a renewal proposal with suggested amendments
5. If auto-renewal is not desired, generates and sends the required notice of non-renewal within the contractually specified notice period

![The evolution from passive filing cabinets to active enforcement engines](/blog/images/clm-body3.png)

## The ROI of Active Enforcement

The financial impact of active contract enforcement is substantial and measurable:

- **Revenue recovery:** The average enterprise has $1.2 million in uncollected SLA credits and contractual penalties sitting in their contract portfolio. Vigil identifies and pursues these credits automatically.

- **Cost avoidance:** Missed renewal deadlines cost enterprises an average of $600,000 annually in unwanted auto-renewals. Vigil eliminates this entirely.

- **Risk reduction:** Unmonitored compliance obligations create an average contingent liability of $3.4 million per Fortune 500 company. Vigil converts these from hidden risks to actively managed obligations.

Contracts are meant to govern behavior. Vigil ensures that governance is executed flawlessly, at machine speed, with mathematical certainty. The era of the passive filing cabinet is over.`
    },
    // ============================================================
    // HUB GROUP 2: AGENTIC INFRASTRUCTURE
    // ============================================================
    {
        slug: 'the-legal-playbook-engine',
        title: 'The Legal Playbook Engine: Teaching AI Your Firm\'s DNA',
        excerpt: 'Every law firm has institutional knowledge trapped in senior partner brains. The Playbook Engine codifies decades of expertise into executable AI rulesets.',
        category: 'Agentic Architecture',
        date: '2026-03-10',
        readTime: '12 min read',
        author: 'Swarm Architecture Team',
        coverImage: '/blog/images/playbook-cover.png',
        bodyImages: ['/blog/images/playbook-body1.png', '/blog/images/playbook-body2.png', '/blog/images/playbook-body3.png'],
        isHub: true,
        hubGroup: 'agentic-infrastructure',
        relatedSlugs: ['legal-rag-architecture', 'autonomous-compliance-radar', 'predictive-litigation-intelligence', 'ip-portfolio-sentinel'],
        metaDescription: 'Learn how BasaltVigil\'s Playbook Engine codifies institutional legal knowledge into executable AI rulesets for autonomous contract negotiation.',
        content: `## The Knowledge Extraction Crisis\n\nEvery law firm has a knowledge problem. The most valuable asset in any firm is not its Westlaw subscription or its conference room. It is the accumulated judgment of its senior partners—decades of pattern recognition about which clauses to fight for, which risks to accept, which counterparties negotiate aggressively, and which regulatory changes actually matter.\n\nThis knowledge is almost entirely undocumented. It lives in the heads of partners who are approaching retirement, in the tribal memory of practice groups, and in the "that's just how we do things" conventions that no one has ever written down. When a senior partner retires, the firm doesn't just lose a revenue generator—it loses an irreplaceable knowledge base that took 30 years to build.\n\nThe legal industry's knowledge management efforts have been embarrassingly primitive. Most firms rely on precedent databases—searchable repositories of past work product. But a precedent database is like a dictionary without grammar rules. It tells you what words exist, but not how to construct a sentence. Knowing that the firm once negotiated a $2M liability cap doesn't tell you *why* that cap was appropriate for that deal, what the counterparty's opening position was, or what concessions were traded to achieve it.\n\n![Risk tolerance playbook configurations](/blog/images/playbook-body1.png)\n\n## The Playbook Engine\n\nBasaltVigil's **Playbook Engine** solves this by transforming institutional knowledge from implicit wisdom into explicit, executable code.\n\nA playbook is not a template. It is a comprehensive rule engine that encodes your firm's negotiation philosophy, risk tolerance, regulatory interpretations, and strategic preferences into a structured format that Vigil's agents can execute autonomously.\n\n### Building a Playbook\n\nThe process begins with what we call a **Knowledge Harvest**. Vigil's ingestion agents analyze your firm's entire historical contract corpus—every MSA, NDA, licensing agreement, and vendor contract your firm has negotiated over the past decade. The system identifies patterns:\n\n- What is your firm's *actual* standard position on limitation of liability? Not what the template says, but what you *actually* agreed to across 500 negotiations.\n- When do you deviate from your standard position? What triggers a concession on indemnification caps?\n- Which clause types generate the most redline cycles? Where do negotiations stall?\n- What is the historical success rate of different negotiation strategies against different counterparty types?\n\nThis analysis produces a draft playbook that is then reviewed and refined by your senior partners. They don't need to write rules from scratch—they review AI-generated rules derived from their own historical behavior and confirm, modify, or override them.\n\n![AI learning from historical contracts to generate playbook rules](/blog/images/playbook-body2.png)\n\n### Playbook Versioning\n\nPlaybooks are living documents. When a new regulation is passed, when a court decision changes the enforceability of a common clause type, or when your firm's risk appetite changes, the playbook is updated. Every version is immutably logged with a complete audit trail showing who changed what and why.\n\nVigil maintains separate playbooks for different practice areas, client types, and deal sizes. A $500M acquisition uses different risk parameters than a $10K SaaS subscription. A financial services client requires different regulatory compliance language than a manufacturing company. The Playbook Engine manages this complexity automatically, selecting the appropriate ruleset based on the document type, counterparty profile, and client classification.\n\n![Playbook version control system with branching timelines](/blog/images/playbook-body3.png)\n\n## The Competitive Moat\n\nThe Playbook Engine creates an extraordinary competitive moat. The longer you use Vigil, the smarter it gets. Every negotiation, every redline, every partner decision enriches the playbook with new data points. After two years of operation, your Vigil instance has absorbed more institutional knowledge than any single attorney could accumulate in a career.\n\nThis is not a feature. It is a flywheel. And firms that start building their playbooks first will have an insurmountable advantage over late adopters.`
    },
    {
        slug: 'legal-rag-architecture',
        title: 'Legal RAG Architecture: Why Generic Search Fails in Law',
        excerpt: 'Retrieval-Augmented Generation for legal documents requires specialized chunking, citation-aware embeddings, and jurisdictional context that generic RAG pipelines cannot provide.',
        category: 'Technical Deep Dive',
        date: '2026-02-25',
        readTime: '15 min read',
        author: 'AI Research',
        coverImage: '/blog/images/rag-cover.png',
        bodyImages: ['/blog/images/rag-body1.png', '/blog/images/rag-body2.png', '/blog/images/rag-body3.png'],
        isHub: false,
        hubGroup: 'agentic-infrastructure',
        relatedSlugs: ['the-legal-playbook-engine', 'autonomous-compliance-radar'],
        metaDescription: 'Explore why legal RAG requires specialized architecture: citation-aware embeddings, jurisdictional context, and temporal versioning that generic pipelines lack.',
        content: `## The Hallucination Problem\n\nGeneric Retrieval-Augmented Generation (RAG) systems are dangerous in legal contexts. When a general-purpose AI retrieves a document chunk and uses it to generate an answer, it has no understanding of whether that chunk represents current law, superseded precedent, a minority jurisdiction interpretation, or dicta with no binding authority. In medicine, a hallucinated drug interaction could harm a patient. In law, a hallucinated citation could destroy a case, trigger sanctions, and end a career.\n\nThe problem is not that RAG doesn't work. The problem is that legal documents have structural properties that generic RAG pipelines are architecturally incapable of handling correctly.\n\n### The Chunking Catastrophe\n\nGeneric RAG systems split documents into fixed-size chunks—typically 500 to 1,500 tokens. This works reasonably well for blog posts and product documentation. It is catastrophic for legal documents.\n\nA single clause in a commercial contract can span three pages. A Section 2.3(a)(ii)(B) cross-reference is meaningless without the definitional sections it points to. An indemnification provision that says \"subject to the limitations set forth in Section 8\" becomes a liability trap if the RAG system retrieves the indemnification clause without Section 8.\n\n![Semantic search through document clusters with relevance highlighting](/blog/images/rag-body1.png)\n\n## Vigil's Legal-Native RAG Architecture\n\nBasaltVigil implements a **Legal-Native RAG** architecture that addresses every failure mode of generic systems.\n\n### 1. Structural-Aware Chunking\n\nInstead of splitting documents by token count, Vigil's ingestion agents parse the document's structural hierarchy: articles, sections, subsections, clauses, and sub-clauses. Each structural unit is chunked as a complete semantic entity. Cross-references are resolved at ingestion time, creating linked chunks that travel together during retrieval.\n\nWhen you ask Vigil about an indemnification provision, it retrieves not just the indemnification clause, but every definitional section, limitation, carve-out, and cross-referenced provision that modifies its meaning. The agent sees the complete legal picture, not a fragment.\n\n### 2. Citation-Aware Embeddings\n\nVigil's embedding model is fine-tuned on legal corpora with explicit citation awareness. When a court opinion cites *Chevron U.S.A., Inc. v. Natural Resources Defense Council*, the embedding captures not just the semantic content of the citation but its doctrinal significance—that this is an administrative law deference standard that has been substantially modified by *Loper Bright Enterprises v. Raimondo*.\n\nThe system maintains a **Citation Graph** that tracks the relationships between authorities: which cases cite which, which have been distinguished, overruled, or limited, and which represent the current majority rule in each jurisdiction.\n\n![Case law citation graph database with precedent chains](/blog/images/rag-body2.png)\n\n### 3. Temporal Versioning\n\nLaw changes over time. A statute that was valid last year may have been amended or repealed. A case that was good law in January may have been overruled in March. Generic RAG systems have no concept of temporal validity.\n\nVigil's vector store maintains temporal metadata for every indexed document. When an agent retrieves a statutory provision, it automatically checks whether that provision has been amended since the document was ingested and surfaces the current version alongside any relevant amendment history.\n\n![AI research assistant with inline citations and source documents](/blog/images/rag-body3.png)\n\n## The Accuracy Mandate\n\nIn legal AI, accuracy is not a nice-to-have metric. It is an ethical obligation. Rule 3.3 of the Model Rules of Professional Conduct requires candor toward the tribunal. Rule 1.1 requires competence. An AI system that generates plausible-sounding but incorrect legal citations violates both.\n\nVigil's Legal-Native RAG architecture achieves a verified citation accuracy rate of 99.7% on our benchmark corpus of 50,000 legal documents across 12 practice areas. Every citation is verifiable. Every source is traceable. Every answer comes with a complete provenance chain that your attorneys can audit in seconds.\n\nThis is not search. This is legal intelligence.`
    },
    {
        slug: 'autonomous-compliance-radar',
        title: 'The Autonomous Compliance Radar: Real-Time Regulatory Intelligence',
        excerpt: 'Regulations change daily across hundreds of jurisdictions. The Compliance Radar continuously monitors, interprets, and adapts your compliance posture automatically.',
        category: 'Regulatory',
        date: '2026-02-10',
        readTime: '11 min read',
        author: 'Compliance Engineering',
        coverImage: '/blog/images/compliance-cover.png',
        bodyImages: ['/blog/images/compliance-body1.png', '/blog/images/compliance-body2.png', '/blog/images/compliance-body3.png'],
        isHub: false,
        hubGroup: 'agentic-infrastructure',
        relatedSlugs: ['the-legal-playbook-engine', 'legal-rag-architecture'],
        metaDescription: 'Discover how Vigil\'s Compliance Radar monitors regulatory changes across jurisdictions in real-time and automatically adapts your compliance posture.',
        content: `## The Regulatory Firehose\n\nIn 2025, global regulatory bodies issued over 61,000 regulatory updates—an average of 167 per business day. These span financial services regulations, privacy laws, employment standards, environmental requirements, trade compliance rules, and industry-specific mandates across federal, state, and international jurisdictions.\n\nNo human compliance team can monitor this volume. The traditional approach—subscribing to legal alerts, attending CLE seminars, and relying on outside counsel to flag relevant changes—is fundamentally reactive. By the time a regulatory change is identified, interpreted, and acted upon through traditional channels, weeks or months have passed. During that gap, your organization operates in non-compliance, exposed to enforcement actions, fines, and reputational damage.\n\n### The Cost of Reactive Compliance\n\nThe average Fortune 500 company pays $14.8 million annually in regulatory fines and penalties. Of these, an estimated 60% are attributable to regulations that the company *knew about* but failed to implement in time. The knowledge existed. The execution didn't.\n\n![Automated compliance pipeline with parsing and classification stages](/blog/images/compliance-body1.png)\n\n## The Compliance Radar\n\nVigil's **Compliance Radar** transforms regulatory monitoring from a reactive, human-dependent process into a continuous, autonomous intelligence system.\n\n### 1. Continuous Regulatory Ingestion\n\nThe Radar continuously monitors over 2,500 regulatory sources across 180 jurisdictions: federal registers, state legislative databases, regulatory agency websites, international treaty organizations, and industry-specific regulatory bodies. New regulatory text is ingested within hours of publication—not weeks.\n\n### 2. Autonomous Impact Assessment\n\nWhen a new regulation is detected, the Radar doesn't just flag it. It performs a complete impact assessment against your organization's operational profile:\n\n- Which business units are affected?\n- Which existing policies need to be updated?\n- Which contracts contain provisions that conflict with the new regulation?\n- What is the compliance deadline?\n- What are the penalties for non-compliance?\n- What comparable regulations exist in other jurisdictions where you operate?\n\nThis assessment is generated automatically within minutes of the regulation's publication, giving your compliance team a complete action plan before most organizations even know the regulation exists.\n\n![Global privacy regulation zones with AI agent deployment](/blog/images/compliance-body2.png)\n\n### 3. Automated Policy Adaptation\n\nFor routine regulatory changes—updates to filing deadlines, adjustments to monetary thresholds, new form requirements—the Radar can autonomously update your internal compliance documentation, generate the required filings, and stage them for approval without any human intervention.\n\nFor substantive regulatory changes that require legal judgment—new restrictions on data processing, changes to fiduciary standards, modifications to disclosure requirements—the Radar generates a detailed analysis with recommended actions, draft policy language, and a prioritized implementation timeline.\n\n![Automated compliance audit report with risk heat maps](/blog/images/compliance-body3.png)\n\n## From Reactive to Predictive\n\nThe most powerful feature of the Compliance Radar is not its monitoring capability—it is its predictive capability. By analyzing patterns in regulatory activity across jurisdictions, the Radar can predict with high confidence which regulations are likely to be adopted in jurisdictions that haven't yet acted.\n\nWhen California passes a new privacy regulation, the Radar analyzes the legislative activity in other states and predicts which states are likely to adopt similar provisions within the next 12-24 months. Your organization can begin preparing for regulations that haven't been passed yet, converting compliance from a cost center into a strategic advantage.`
    },
    {
        slug: 'predictive-litigation-intelligence',
        title: 'Predictive Litigation Intelligence: Winning Before You File',
        excerpt: 'Judge sentiment analysis, win probability modeling, and AI-powered deposition preparation. How Vigil transforms litigation from art to science.',
        category: 'Litigation',
        date: '2026-01-28',
        readTime: '13 min read',
        author: 'Litigation Analytics',
        coverImage: '/blog/images/litigation-cover.png',
        bodyImages: ['/blog/images/litigation-body1.png', '/blog/images/litigation-body2.png', '/blog/images/litigation-body3.png'],
        isHub: false,
        hubGroup: 'agentic-infrastructure',
        relatedSlugs: ['the-legal-playbook-engine', 'ip-portfolio-sentinel'],
        metaDescription: 'Learn how Vigil uses predictive analytics, judge sentiment modeling, and AI-powered deposition prep to transform litigation outcomes.',
        content: `## The Guessing Game\n\nLitigation has always been part science, part art, and part gambling. Even the most experienced trial attorneys make critical strategic decisions—whether to file in state or federal court, whether to pursue summary judgment, whether to settle or go to trial—based primarily on intuition and anecdotal experience.\n\nThe data to make these decisions scientifically has always existed. Every court docket, every judicial opinion, every jury verdict, every settlement amount is a data point. But the volume is overwhelming. There are over 400,000 federal civil cases filed annually, plus millions of state court cases. No human can process this volume to identify actionable patterns.\n\n### The Information Asymmetry\n\nThis creates a massive information asymmetry. Large firms with decades of experience before a particular judge have an intuitive sense of that judge's tendencies. Solo practitioners and smaller firms operate essentially blind, making strategic decisions without the benefit of pattern data.\n\n![AI deposition preparation with testimony analysis](/blog/images/litigation-body1.png)\n\n## Vigil's Litigation Intelligence Engine\n\nBasaltVigil's **Predictive Litigation Intelligence** module eliminates this asymmetry by converting the entire universe of litigation data into actionable strategic intelligence.\n\n### 1. Judge Analytics\n\nVigil maintains comprehensive analytical profiles for every active federal judge and state court judges in major jurisdictions. These profiles include:\n\n- **Grant rates** for motions to dismiss, summary judgment, and Daubert challenges\n- **Sentencing patterns** and penalty ranges for specific violation types\n- **Procedural preferences** including discovery dispute resolution tendencies\n- **Time-to-disposition** averages and scheduling patterns\n- **Appellate reversal rates** broken down by issue type\n\nWhen you're deciding whether to file in the Southern District of New York versus the District of Delaware, Vigil provides a quantified comparison of your expected outcomes before each judge in both jurisdictions, based on the specific claims and defenses in your case.\n\n### 2. Win Probability Modeling\n\nBefore filing or responding to a complaint, Vigil generates a **Win Probability Assessment** based on:\n\n- Historical outcomes for similar cases (matched by claim type, industry, jurisdiction, and dollar amount)\n- The specific judge's track record on the relevant legal issues\n- The strength of your factual allegations compared to cases that survived motions to dismiss\n- The opposing counsel's historical win rate and strategic tendencies\n\nThis is not a magic eight ball. It is a rigorous statistical model trained on millions of case outcomes, providing confidence intervals and sensitivity analyses that help you make informed strategic decisions.\n\n![Case timeline visualization with branching scenario paths](/blog/images/litigation-body2.png)\n\n### 3. AI-Powered Deposition Preparation\n\nVigil's deposition preparation module analyzes the witness's prior testimony across all available depositions, trial transcripts, and regulatory proceedings. It identifies:\n\n- Statements that contradict the witness's current position\n- Topics where the witness has historically been evasive or imprecise\n- Technical areas where targeted questioning is most likely to elicit favorable admissions\n- Optimal question sequencing based on psychological models of witness behavior\n\nThe system generates a complete deposition outline with specific questions, predicted responses, and follow-up branches for different answer scenarios.\n\n![Settlement negotiation simulation between opposing AI agents](/blog/images/litigation-body3.png)\n\n## The Settlement Calculator\n\nPerhaps the most valuable output of the Litigation Intelligence Engine is its **Settlement Valuation Model**. By analyzing outcomes in comparable cases, the system generates a settlement range with probability-weighted expected values. This converts the settlement negotiation from an art of persuasion into a data-driven economic analysis.\n\nWhen you know that cases with your fact pattern settle for between $2.1M and $4.7M with a median of $3.2M, and that going to trial has a 62% win probability with an expected verdict of $5.8M but a 38% probability of a defense verdict, the optimal settlement strategy becomes a straightforward calculation rather than a guess.`
    },
    {
        slug: 'ip-portfolio-sentinel',
        title: 'The IP Portfolio Sentinel: Autonomous Intellectual Property Defense',
        excerpt: 'Your patent portfolio is under constant threat. The IP Sentinel monitors global markets for infringement, manages prosecution deadlines, and defends your competitive moat.',
        category: 'Intellectual Property',
        date: '2026-01-15',
        readTime: '14 min read',
        author: 'IP Strategy',
        coverImage: '/blog/images/ip-cover.png',
        bodyImages: ['/blog/images/ip-body1.png', '/blog/images/ip-body2.png', '/blog/images/ip-body3.png'],
        isHub: false,
        hubGroup: 'agentic-infrastructure',
        relatedSlugs: ['the-legal-playbook-engine', 'predictive-litigation-intelligence'],
        metaDescription: 'Discover how Vigil\'s IP Sentinel autonomously monitors patent portfolios, detects infringement, manages prosecution deadlines, and protects trade secrets.',
        content: `## The Silent Erosion\n\nIntellectual property is the most valuable asset class in the modern economy. Apple's patent portfolio alone is estimated to be worth over $15 billion. Pharmaceutical companies invest billions in R&D with the expectation that patent protection will provide the exclusivity period necessary to recoup that investment. Technology companies depend on trade secrets to maintain competitive advantages that patents alone cannot protect.\n\nYet most companies manage their IP portfolios with spreadsheets, calendar reminders, and periodic manual reviews. The result is a slow, silent erosion of value:\n\n- Prosecution deadlines are missed, causing patent applications to go abandoned\n- Maintenance fees are overlooked, causing issued patents to lapse\n- Infringement goes undetected for years because no one is systematically monitoring the market\n- Trade secrets leak through employee departures without adequate exit protocols\n- Licensing opportunities are missed because no one tracks where the portfolio's claims overlap with competitor products\n\nThe aggregate cost of this negligence is staggering. A 2024 study by Ocean Tomo estimated that 40% of patent portfolio value in the Fortune 500 is unrealized due to inadequate management and enforcement.\n\n![AI prior art search scanning millions of documents](/blog/images/ip-body1.png)\n\n## The IP Sentinel\n\nBasaltVigil's **IP Portfolio Sentinel** transforms intellectual property management from a passive administrative function into an active, autonomous defense system.\n\n### 1. Continuous Infringement Monitoring\n\nThe Sentinel continuously monitors:\n\n- **Patent databases** across all major jurisdictions (USPTO, EPO, CNIPA, JPO, KIPO) for newly published applications that may infringe your claims\n- **Product launches** and press releases from competitors, analyzing product descriptions and specifications against your claim language\n- **Academic publications** and conference proceedings for research that may indicate upcoming competitive threats\n- **Import records** and customs databases for products that may infringe your manufacturing patents\n- **App stores and software repositories** for code implementations that may violate your software patents\n\nWhen a potential infringement is detected, the Sentinel generates a detailed claim chart mapping the allegedly infringing product features to your specific patent claims, estimates the strength of the infringement case on a 1-100 scale, and recommends an enforcement strategy.\n\n### 2. Automated Prosecution Management\n\nFor companies with active patent prosecution pipelines, the Sentinel manages every deadline in the prosecution lifecycle:\n\n- Office Action response deadlines with automated draft responses for routine rejections\n- Continuation and divisional filing strategy based on prosecution history estoppel analysis\n- Foreign filing decisions based on market analysis, competitive landscape, and cost-benefit calculations\n- Maintenance fee tracking with strategic recommendations on which patents to maintain and which to allow to lapse based on portfolio value analysis\n\n![Trademark conflict map with competing brand territory analysis](/blog/images/ip-body2.png)\n\n### 3. Trade Secret Fortress\n\nTrade secrets are the most vulnerable form of IP because their protection depends entirely on the adequacy of your security measures. The Sentinel implements a comprehensive trade secret protection framework:\n\n- **Access compartmentalization:** Employees only access the specific trade secrets necessary for their role, with access automatically revoked upon role change or departure\n- **Anomaly detection:** Unusual access patterns—downloading large volumes of files, accessing systems outside normal hours, copying data to external drives—trigger immediate alerts\n- **Exit protocols:** When an employee gives notice, the Sentinel automatically generates a customized exit interview checklist, reminds the departing employee of their confidentiality obligations, and monitors for any data exfiltration attempts during the notice period\n- **Competitive intelligence:** The Sentinel monitors competitors' job postings, patent filings, and product launches for indicators that your trade secrets may have been misappropriated by former employees\n\n![Trade secret protection with nested security rings and access monitoring](/blog/images/ip-body3.png)\n\n## The Portfolio as a Weapon\n\nWith the IP Sentinel, your intellectual property portfolio is not a static asset sitting in a filing cabinet. It is a continuously monitored, actively enforced competitive weapon that generates revenue through licensing, deters competitors through visible enforcement activity, and protects your most valuable innovations with the relentless vigilance that only an AI system can provide.\n\nEvery day you operate without autonomous IP monitoring is a day your competitors may be copying your innovations with impunity. The Sentinel ensures that never happens.`
    }
];

export function getAllPosts(): BlogPost[] {
    return BLOG_POSTS.slice().sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getHubGroups(): { groupId: string; hub: BlogPost; spokes: BlogPost[] }[] {
    const groups = Array.from(new Set(BLOG_POSTS.map(p => p.hubGroup)));
    return groups.map(groupId => {
        const hub = BLOG_POSTS.find(p => p.hubGroup === groupId && p.isHub)!;
        const spokes = BLOG_POSTS.filter(p => p.hubGroup === groupId && !p.isHub)
            .sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
        return { groupId, hub, spokes };
    }).filter(g => g.hub);
}
