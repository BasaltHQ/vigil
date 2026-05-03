export interface Comparison {
    competitorName: string;
    slug: string;
    description: string;
    vigilAdvantage: string;
    features: { name: string; vigilHas: boolean; competitorHas: boolean }[];
}

export const COMPARISONS: Comparison[] = [
    {
        competitorName: 'Harvey AI',
        slug: 'vigil-vs-harvey',
        description: 'Harvey AI provides a powerful conversational interface for legal research. Vigil provides a swarm of executing agents.',
        vigilAdvantage: 'Vigil is an execution engine, not just a chat interface. While Harvey can draft a memo summarizing a contract, Vigil can autonomously redline the contract, enforce playbook compliance, and email the counterparty.',
        features: [
            { name: 'Generative Legal Research', vigilHas: true, competitorHas: true },
            { name: 'Contract Summarization', vigilHas: true, competitorHas: true },
            { name: 'Autonomous Playbook Redlining', vigilHas: true, competitorHas: false },
            { name: 'Multi-Agent Swarm Execution', vigilHas: true, competitorHas: false },
            { name: 'On-Premise Deployment Option', vigilHas: true, competitorHas: false }
        ]
    },
    {
        competitorName: 'Ironclad',
        slug: 'vigil-vs-ironclad',
        description: 'Ironclad is a legacy Contract Lifecycle Management (CLM) tool. Vigil is an active Contract Enforcement Engine.',
        vigilAdvantage: 'Ironclad is a static filing cabinet that relies on humans to read and enforce contracts. Vigil transforms contracts into executable code, actively monitoring data streams to enforce SLAs and compliance autonomously.',
        features: [
            { name: 'Contract Repository', vigilHas: true, competitorHas: true },
            { name: 'Workflow Approvals', vigilHas: true, competitorHas: true },
            { name: 'Autonomous Data Room Diligence', vigilHas: true, competitorHas: false },
            { name: 'Zero-Knowledge Privilege', vigilHas: true, competitorHas: false },
            { name: 'Active SLA Enforcement via Telemetry', vigilHas: true, competitorHas: false }
        ]
    },
    {
        competitorName: 'Kira Systems',
        slug: 'vigil-vs-kira',
        description: 'Kira specializes in contract analysis and data extraction. Vigil provides full-spectrum agentic law capabilities.',
        vigilAdvantage: 'Kira extracts data points; Vigil takes action. Vigil\'s swarm intelligence doesn\'t just tell you a contract is risky—it autonomously drafts the amendment to fix the risk.',
        features: [
            { name: 'Clause Extraction', vigilHas: true, competitorHas: true },
            { name: 'Due Diligence Summaries', vigilHas: true, competitorHas: true },
            { name: 'Generative Contract Drafting', vigilHas: true, competitorHas: false },
            { name: 'Continuous Entity Management', vigilHas: true, competitorHas: false },
            { name: 'Autonomous Counterparty Emailing', vigilHas: true, competitorHas: false }
        ]
    }
];

export function getAllComparisons(): Comparison[] {
    return COMPARISONS;
}

export function getComparisonBySlug(slug: string): Comparison | undefined {
    return COMPARISONS.find(c => c.slug === slug);
}
