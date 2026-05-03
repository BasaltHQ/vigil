export interface Industry {
    name: string;
    slug: string;
    description: string;
    keyFeatures: string[];
}

export const INDUSTRIES: Industry[] = [
    {
        name: 'Corporate Law',
        slug: 'corporate-law',
        description: 'Automate M&A due diligence, entity management, and complex capitalization table calculations with swarm intelligence.',
        keyFeatures: ['M&A Due Diligence Swarms', 'Cap Table Scenarios', 'Board Resolution Generation']
    },
    {
        name: 'Real Estate Law',
        slug: 'real-estate-law',
        description: 'Instantly review commercial leases, enforce indemnification playbooks, and automate title defect analysis.',
        keyFeatures: ['Commercial Lease Redlining', 'Title Defect Detection', 'Zoning Compliance Checks']
    },
    {
        name: 'Intellectual Property',
        slug: 'intellectual-property',
        description: 'Deploy agents to monitor patent filings globally, analyze chain-of-title, and draft preliminary injunctions.',
        keyFeatures: ['Chain-of-Title Analysis', 'Patent Prior Art Search', 'Infringement Monitoring']
    },
    {
        name: 'Employment Law',
        slug: 'employment-law',
        description: 'Ensure global HR compliance by autonomously auditing employment contracts against shifting state and federal regulations.',
        keyFeatures: ['Non-Compete Enforceability Checks', 'Global HR Compliance', 'Executive Comp Analysis']
    },
    {
        name: 'Healthcare Compliance',
        slug: 'healthcare-compliance',
        description: 'Navigate the labyrinth of HIPAA, Stark Law, and Anti-Kickback statutes with agents that constantly audit vendor agreements.',
        keyFeatures: ['HIPAA BAA Automation', 'Stark Law Auditing', 'Vendor Agreement Reviews']
    }
];

export function getAllIndustries(): Industry[] {
    return INDUSTRIES;
}

export function getIndustryBySlug(slug: string): Industry | undefined {
    return INDUSTRIES.find(i => i.slug === slug);
}
