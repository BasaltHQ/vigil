"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Users, Database, Shield, CheckCircle2, Server, Globe, Scale } from "lucide-react";
import ConstellationGraph from "../ConstellationGraph";

const useBrandTheme = () => ({ currentTheme: { color: "#b71928", label: "Varuna", name: "Varuna", description: "Vigil AI", id: "varuna", tailwindColor: "red-600" } });

type Agent = {
  id: string;
  name: string;
  role: string;
  description: string;
};

type Swarm = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  agents: Agent[];
  demo: { agent: string; text: string; delay: number }[];
};

const AGENT_DICTIONARY: Record<string, { role: string; description: string }> = {
  keyes: { role: "Chief Claims Manager", description: "Central orchestrator and synthesis specialist. Manages handoffs and final review." },
  bannister: { role: "Defense Attorney", description: "Securities defense attorney and strategist. Focuses on compliance." },
  gittes: { role: "Cap Table Investigator", description: "Analyzes ownership structures and equity distribution." },
  gutman: { role: "Compliance Sentinel", description: "Oversees risk management and regulatory surveillance." },
  ohara: { role: "Offering Document Specialist", description: "Handles Private Placement Memoranda, Offering Circulars, and Investor Presentations." },
  neff: { role: "Blue Sky Specialist", description: "Handles state-level securities regulations and broker-dealer compliance." },
  spade: { role: "Governance Specialist", description: "Handles board resolutions, corporate records, and fiduciary duties." },
  marlowe: { role: "HR & Contracts Specialist", description: "Handles employment agreements, non-competes, and executive compensation." },
  archer: { role: "Regulatory Specialist", description: "Handles M&A transactions, partnerships, and joint ventures." },
  cairo: { role: "Documentation Specialist", description: "Drafts and files corporate documents and investor relations." },
  vance: { role: "Operations Specialist", description: "Handles corporate enforcement, deductions, and aristocratic networking." },
  queen: { role: "Analytics Specialist", description: "Tracks intellectual property, writing, and mystery resolution." },
  hammer: { role: "Integration Specialist", description: "Handles privacy, protection, and hardboiled tactics." },
  
  // Criminal
  holmes: { role: "Lead Strategist", description: "Case orchestrator handling overarching criminal defense strategy." },
  poirot: { role: "Evidence Analyst", description: "Forensic expert for deep evidentiary analysis and timeline mapping." },
  perry: { role: "Trial Specialist", description: "Criminal defense attorney focusing on trial preparation and cross-examination." },
  mccoy: { role: "Plea Negotiator", description: "Prosecution strategy and plea negotiation expert." },
  marple: { role: "Witness Specialist", description: "Handles witness interviews, depositions, and testimony preparation." },
  columbo: { role: "Investigation Specialist", description: "Handles police procedure, evidence gathering, and investigation tactics." },
  wolfe: { role: "Regulatory Specialist", description: "Handles legal research, motions practice, and appellate strategy." },
  morse: { role: "Documentation Specialist", description: "Drafts procedural documentation, briefs, and appeals." },
  chan: { role: "Compliance Specialist", description: "Handles jurisdictional issues, federal compliance, and procedure." },
  dupin: { role: "Operations Specialist", description: "Provides logic, reasoning, and deduction for complex cases." },
  brown: { role: "Analytics Specialist", description: "Provides psychological profiling and motive analysis." },

  // Family
  bennet: { role: "Family Coordinator", description: "Orchestrates complex family law cases, divorce, and custody battles." },
  eyre: { role: "Custody Specialist", description: "Specializes in child welfare and custody arrangements." },
  earnshaw: { role: "Property Division", description: "Analyzes and divides marital assets and property." },
  darcy: { role: "Contracts", description: "Drafts prenuptial and postnuptial agreements." },
  dashwood: { role: "Financial Specialist", description: "Handles spousal support, child support, and financial calculations." },
  march: { role: "Child Advocacy", description: "Provides voice and advocacy for children's welfare in disputes." },
  rochester: { role: "Estate Specialist", description: "Handles wills, trusts, probate, and wealth transfer planning." },
  woodhouse: { role: "Mediation Specialist", description: "Handles settlement negotiations, mediation preparation, and collaborative law." },
  knightley: { role: "Compliance Specialist", description: "Handles jurisdiction, venue, and procedural family law." },
  ferrars: { role: "Operations Specialist", description: "Handles discovery, disclosure, and financial forensics." },
  brandon: { role: "Analytics Specialist", description: "Handles valuation, business appraisals, and asset analysis." },
  tilney: { role: "Integration Specialist", description: "Coordinate between specialists and synthesize findings." },

  // Immigration
  polo: { role: "Lead Strategist", description: "Orchestrate visa applications, green card petitions, asylum cases, and deportation defense." },
  magellan: { role: "Visa Specialist", description: "Handle nonimmigrant visa petitions, status extensions, and work authorization." },
  columbus: { role: "Green Card Expert", description: "Handle permanent residence petitions across all categories." },
  darwin: { role: "Asylum Specialist", description: "Handle asylum claims, refugee applications, and Convention Against Torture protections." },
  earhart: { role: "Deportation Defense Expert", description: "Handle removal proceedings, detention issues, bonds, and relief from removal." },
  shackleton: { role: "Appeals Expert", description: "Handle appeals to the BIA, AAO, and federal courts." },
  cook: { role: "Regulatory Specialist", description: "Handle consular processing, interviews, and embassy procedures." },
  vespucci: { role: "Documentation Specialist", description: "Prepare USCIS forms, petitions, and supporting evidence packages." },
  drake: { role: "Compliance Specialist", description: "Handle I-9 compliance, employer audits, and worksite enforcement." },
  livingstone: { role: "Operations Specialist", description: "Research country conditions for asylum, TPS, and humanitarian cases." },
  hudson: { role: "Analytics Specialist", description: "Track priority dates, visa bulletin analysis, and case timing." },
  lewis: { role: "Integration Specialist", description: "Coordinate between specialists and synthesize strategy." },

  // Real Estate
  earp: { role: "Lead Strategist", description: "Orchestrate real estate transactions, landlord-tenant matters, zoning issues, and property disputes." },
  hickok: { role: "Transactions Specialist", description: "Handle purchase agreements, closings, and all aspects of real estate transfers." },
  oakley: { role: "Title Specialist", description: "Examine title, identify defects and encumbrances, and ensure clients receive clear, insurable title." },
  cassidy: { role: "Zoning Expert", description: "Handle zoning compliance, variances, land use applications, and development approvals." },
  cody: { role: "Leasing Specialist", description: "Handle residential and commercial leases, landlord-tenant disputes, and eviction matters." },
  holliday: { role: "Litigation Specialist", description: "Handle property disputes, boundary conflicts, easement litigation, and all real estate-related court matters." },
  masterson: { role: "Regulatory Specialist", description: "Handle mortgage financing, lending regulations, and loan documentation." },
  garrett: { role: "Documentation Specialist", description: "Draft contracts, deeds, and handle recording requirements." },
  horn: { role: "Compliance Specialist", description: "Handle environmental issues, disclosures, and permit compliance." },
  starr: { role: "Operations Specialist", description: "Coordinate inspections, due diligence, and property investigation." },
  james: { role: "Analytics Specialist", description: "Analyze property valuations, market conditions, and investment returns." },
  younger: { role: "Integration Specialist", description: "Coordinate between specialists and synthesize transaction strategy." },

  // IP Entertainment
  selznick: { role: "Production Counsel", description: "Specializes in film and TV production financing." },
  goldwyn: { role: "Copyright Expert", description: "Handle copyright registration, infringement analysis, fair use, and licensing." },
  mayer: { role: "Trademark Expert", description: "Handle trademark clearance, registration, enforcement, and brand strategy." },
  zanuck: { role: "Licensing Expert", description: "Handle IP licensing, distribution agreements, and content deals." },
  warner: { role: "Talent Contracts Expert", description: "Handle talent agreements, employment issues, guild compliance, and creative services contracts." },
  thalberg: { role: "Royalties Expert", description: "Handle royalty calculations, profit participation, accounting, and audit matters." },
  cohn: { role: "Regulatory Specialist", description: "Handle music rights, publishing, and sync licensing." },
  laemmle: { role: "Documentation Specialist", description: "Handle copyright/trademark registrations and filings." },
  zukor: { role: "Compliance Specialist", description: "Handle rights clearance, chain of title, and E&O matters." },
  fox: { role: "Operations Specialist", description: "Handle production deals, financing, and development agreements." },
  disney: { role: "Analytics Specialist", description: "Analyze IP portfolios, valuations, and strategic value." },
  universal: { role: "Integration Specialist", description: "Coordinate between specialists and synthesize entertainment strategy." },

  // Personal Injury
  house: { role: "Lead Strategist", description: "Orchestrate personal injury, medical malpractice, and products liability matters." },
  grey: { role: "Medical Expert", description: "Analyze medical records, understand injuries, and explain medical issues in legal terms." },
  welby: { role: "Standard of Care Expert", description: "Analyze medical malpractice cases, evaluating whether healthcare providers met the applicable standard of care." },
  quincy: { role: "Forensic Expert", description: "Analyze accident causation, reconstruct incidents, and establish the link between wrongdoing and harm." },
  trapper: { role: "Damages Expert", description: "Calculate economic and non-economic damages, project future losses, and support damage claims with evidence." },
  kildare: { role: "Settlement Expert", description: "Handle settlement negotiations, mediation, and case resolution strategies." },
  pierce: { role: "Regulatory Specialist", description: "Handle insurance coverage, bad faith claims, and policy analysis." },
  carter: { role: "Documentation Specialist", description: "Draft demand letters, complaints, and litigation documents." },
  ross: { role: "Compliance Specialist", description: "Handle statutes of limitations, procedural requirements, and case deadlines." },
  shepherd: { role: "Operations Specialist", description: "Manage discovery, depositions, and expert coordination." },
  kovac: { role: "Analytics Specialist", description: "Analyze verdict data, case valuations, and settlement ranges." },
  greene: { role: "Integration Specialist", description: "Coordinate between specialists and synthesize case strategy." }
};

const SWARMS: Swarm[] = [
  {
    id: "corporate",
    name: "Corporate & Securities",
    icon: Server,
    description: "Orchestrates SEC compliance, cap table management, and structural governance.",
    agents: [
      { id: "keyes", name: "Keyes", role: "Chief Claims Manager", description: "Central orchestrator and synthesis specialist. Manages handoffs and final review." },
      { id: "bannister", name: "Bannister", role: "Defense Attorney", description: "Securities defense attorney and strategist. Focuses on compliance." },
      { id: "gittes", name: "Gittes", role: "Cap Table Investigator", description: "Analyzes ownership structures and equity distribution." },
      { id: "gutman", name: "Gutman", role: "Compliance Sentinel", description: "Oversees risk management and regulatory surveillance." }
    ],
    demo: [
      { agent: "Keyes", text: "Initiating review of Form S-1 draft for IPO.", delay: 500 },
      { agent: "Keyes", text: "Handoff to Bannister for securities compliance check.", delay: 2500 },
      { agent: "Bannister", text: "Analyzing Risk Factors section. Identifying exposure in Section 3.2.", delay: 4500 },
      { agent: "Gittes", text: "Verifying capitalization table against proposed offering structure.", delay: 6500 },
      { agent: "Gutman", text: "Running Regulation D surveillance. No immediate flags detected.", delay: 8500 },
      { agent: "Keyes", text: "Aggregating findings. Compiling final markup.", delay: 10500 }
    ]
  },
  {
    id: "criminal",
    name: "Criminal Defense",
    icon: Shield,
    description: "Specialized in evidentiary analysis, witness prep, and prosecution strategy.",
    agents: [
      { id: "holmes", name: "Holmes", role: "Lead Strategist", description: "Case orchestrator handling overarching criminal defense strategy." },
      { id: "poirot", name: "Poirot", role: "Evidence Analyst", description: "Forensic expert for deep evidentiary analysis and timeline mapping." },
      { id: "perry", name: "Perry", role: "Trial Specialist", description: "Criminal defense attorney focusing on trial preparation and cross-examination." },
      { id: "mccoy", name: "McCoy", role: "Plea Negotiator", description: "Prosecution strategy and plea negotiation expert." }
    ],
    demo: [
      { agent: "Holmes", text: "Opening defense file #CR-4409. Murder in the first degree.", delay: 500 },
      { agent: "Poirot", text: "Analyzing crime scene forensics. Blood spatter inconsistent with prosecution timeline.", delay: 2500 },
      { agent: "Perry", text: "Drafting motion to exclude Exhibit C based on Poirot's findings.", delay: 5000 },
      { agent: "McCoy", text: "Preparing fallback plea negotiation parameters just in case.", delay: 7000 },
      { agent: "Holmes", text: "Strategy locked. Proceeding to trial prep.", delay: 9000 }
    ]
  },
  {
    id: "ip_entertainment",
    name: "IP & Entertainment",
    icon: Globe,
    description: "Manages licensing, copyright, and entertainment contract negotiations.",
    agents: [
      { id: "selznick", name: "Selznick", role: "Production Counsel", description: "Specializes in film and TV production financing." },
      { id: "goldwyn", name: "Goldwyn", role: "Talent Negotiator", description: "Handles above-the-line talent agreements." },
      { id: "warner", name: "Warner", role: "Distribution Strategist", description: "Focuses on global distribution and syndication rights." },
      { id: "disney", name: "Disney", role: "IP Custodian", description: "Brand guardian and intellectual property licensing specialist." }
    ],
    demo: [
      { agent: "Selznick", text: "Reviewing multi-picture financing agreement from Studio A.", delay: 500 },
      { agent: "Goldwyn", text: "Flagging Director's cut clause. Needs revision for final approval rights.", delay: 2500 },
      { agent: "Disney", text: "Merchandising rights retained. Initiating trademark registration for new characters.", delay: 5000 },
      { agent: "Warner", text: "Structuring international VOD windows.", delay: 7500 }
    ]
  },
  {
    id: "real_estate",
    name: "Real Estate",
    icon: Database,
    description: "Handles commercial acquisitions, zoning, and leasing structures.",
    agents: [
      { id: "earp", name: "Earp", role: "Acquisition Partner", description: "Lead negotiator for commercial real estate purchases." },
      { id: "hickok", name: "Hickok", role: "Zoning Specialist", description: "Handles municipal zoning, variances, and land use." },
      { id: "oakley", name: "Oakley", role: "Title Examiner", description: "Deep investigation into title history and encumbrances." },
      { id: "cassidy", name: "Cassidy", role: "Leasing Director", description: "Structures commercial leases and tenant agreements." }
    ],
    demo: [
      { agent: "Earp", text: "Initiating acquisition protocol for 100 Main St commercial tower.", delay: 500 },
      { agent: "Oakley", text: "Running title search. Found unreleased mechanic's lien from 2018.", delay: 3000 },
      { agent: "Hickok", text: "Verifying zoning classification. Cleared for mixed-use retail/office.", delay: 5500 },
      { agent: "Earp", text: "Drafting purchase agreement with condition to clear 2018 lien.", delay: 8000 }
    ]
  },
  {
    id: "personal_injury",
    name: "Personal Injury",
    icon: Shield,
    description: "Evaluates medical negligence, forensics, and injury damages.",
    agents: [
      { id: "house", name: "House", role: "Medical Coordinator", description: "Diagnosis strategy and orchestration." },
      { id: "grey", name: "Grey", role: "Medical Records", description: "Analyzes medical records and injury causation." },
      { id: "quincy", name: "Quincy", role: "Forensic Reconstruction", description: "Reconstructs accident timelines and physical damage." },
      { id: "trapper", name: "Trapper", role: "Damages Assessor", description: "Calculates economic and non-economic damages." }
    ],
    demo: [
      { agent: "House", text: "Reviewing Case File #PI-9902. Alleged medical malpractice.", delay: 500 },
      { agent: "Grey", text: "Analyzing surgical records. Flagging non-standard anesthesia protocol.", delay: 2500 },
      { agent: "Quincy", text: "Forensic review of post-op timeline confirms delayed response.", delay: 4500 },
      { agent: "Trapper", text: "Calculating economic damages based on projected lost earnings.", delay: 7000 }
    ]
  },
  {
    id: "family",
    name: "Family Law",
    icon: Users,
    description: "Handles asset division, child custody, and prenuptial agreements.",
    agents: [
      { id: "bennet", name: "Bennet", role: "Family Coordinator", description: "Orchestrates complex family law cases." },
      { id: "eyre", name: "Eyre", role: "Custody Specialist", description: "Specializes in child welfare and custody arrangements." },
      { id: "earnshaw", name: "Earnshaw", role: "Property Division", description: "Analyzes and divides marital assets." },
      { id: "darcy", name: "Darcy", role: "Contracts", description: "Drafts prenuptial and postnuptial agreements." }
    ],
    demo: [
      { agent: "Bennet", text: "Initiating high-net-worth divorce proceedings.", delay: 500 },
      { agent: "Earnshaw", text: "Tracing offshore assets and real estate holdings.", delay: 2500 },
      { agent: "Eyre", text: "Drafting joint custody agreement with strict geographical boundaries.", delay: 4500 },
      { agent: "Darcy", text: "Reviewing original prenuptial agreement for enforcement clauses.", delay: 6500 }
    ]
  },
  {
    id: "immigration",
    name: "Immigration",
    icon: Globe,
    description: "Navigates complex visas, permanent residence, and deportation defense.",
    agents: [
      { id: "polo", name: "Polo", role: "Strategy Coordinator", description: "Navigates overall immigration strategy." },
      { id: "magellan", name: "Magellan", role: "Visa Specialist", description: "Handles temporary and work visa applications." },
      { id: "columbus", name: "Columbus", role: "Residency Expert", description: "Specializes in EB green cards and permanent residency." },
      { id: "darwin", name: "Darwin", role: "Asylum Advocate", description: "Handles refugee status and asylum applications." }
    ],
    demo: [
      { agent: "Polo", text: "Reviewing multinational executive transfer petition.", delay: 500 },
      { agent: "Magellan", text: "Preparing L-1A visa documentation for the beneficiary.", delay: 2500 },
      { agent: "Columbus", text: "Drafting concurrent EB-1C immigrant petition strategy.", delay: 4500 },
      { agent: "Polo", text: "Finalizing petition packet for consular processing.", delay: 6500 }
    ]
  }
];

export function SwarmConstellation() {
  const { currentTheme } = useBrandTheme();
  const [activeSwarmId, setActiveSwarmId] = useState<string>(SWARMS[0].id);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [demoLog, setDemoLog] = useState<{ agent: string; text: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSwarm = SWARMS.find(s => s.id === activeSwarmId) || SWARMS[0];

  useEffect(() => {
    // Reset state when swarm changes
    setDemoLog([]);
    setSelectedAgent(null);

    // Stop all previous interactions visually
    window.dispatchEvent(new CustomEvent('basalt-task-end'));

    let timeouts: NodeJS.Timeout[] = [];

    // Start task after a short delay
    const startT = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('basalt-task-start'));

      // Schedule demo messages
      activeSwarm.demo.forEach((item) => {
        const t = setTimeout(() => {
          setDemoLog(prev => [...prev, { agent: item.agent, text: item.text }]);
          
          // Determine action type based on text content
          let action = 'responding';
          if (item.text.toLowerCase().includes('handoff') || item.text.toLowerCase().includes('to ')) {
             action = 'handoff';
          } else if (item.text.toLowerCase().includes('running') || item.text.toLowerCase().includes('verifying') || item.text.toLowerCase().includes('analyzing')) {
             action = 'tool_call';
          }

          // Dispatch event to ConstellationGraph
          window.dispatchEvent(new CustomEvent('basalt-agent-state-change', {
            detail: {
              agent: item.agent,
              action: action,
              message: item.text
            }
          }));

        }, item.delay);
        timeouts.push(t);
      });
    }, 500);
    timeouts.push(startT);

    return () => timeouts.forEach(clearTimeout);
  }, [activeSwarmId, activeSwarm]);

  useEffect(() => {
    // Auto-scroll demo log
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [demoLog]);

  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden" id="constellation">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />
      
      {/* Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-10 blur-[100px] rounded-full pointer-events-none"
        style={{ backgroundColor: currentTheme.color }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-4 py-2 shadow-sm mb-6">
            <Scale className="h-4 w-4 mr-2" style={{ color: currentTheme.color }} />
            <span className="text-sm font-bold text-white uppercase tracking-wider">The Constellation</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Interactive <span style={{ color: currentTheme.color }}>Agentic Swarms</span>
          </h2>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Vigil organizes highly specialized legal agents into dynamic swarms. Select a division below to observe the Constellation in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Swarm Selector */}
          <div className="lg:col-span-3 flex flex-col gap-3 h-full">
            <h3 className="text-sm font-mono text-muted-foreground mb-1 uppercase tracking-widest">Divisions</h3>
            {SWARMS.map((swarm) => (
              <button
                key={swarm.id}
                onClick={() => setActiveSwarmId(swarm.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                  activeSwarmId === swarm.id 
                    ? 'bg-black/80 shadow-lg scale-[1.02]' 
                    : 'bg-black/40 border-white/5 hover:border-white/20 text-muted-foreground'
                }`}
                style={{ 
                  borderColor: activeSwarmId === swarm.id ? currentTheme.color : undefined,
                  color: activeSwarmId === swarm.id ? 'white' : undefined
                }}
              >
                <swarm.icon 
                  className={`w-5 h-5 transition-colors ${activeSwarmId === swarm.id ? 'animate-pulse' : ''}`} 
                  style={{ color: activeSwarmId === swarm.id ? currentTheme.color : undefined }}
                />
                <span className="font-bold">{swarm.name}</span>
              </button>
            ))}

            {/* Agent Inspector */}
            <div className="mt-auto pt-6 p-6 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md min-h-[200px]">
              <h3 className="text-sm font-mono text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Agent Inspector
              </h3>
              {selectedAgent ? (
                <div className="animate-in fade-in slide-in-from-bottom-2">
                  <h4 className="text-xl font-bold text-white mb-1">{selectedAgent.name}</h4>
                  <div className="text-sm font-bold mb-4" style={{ color: currentTheme.color }}>{selectedAgent.role}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedAgent.description}</p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground/50 italic text-center">
                  Select a node in the constellation to view agent details.
                </div>
              )}
            </div>
          </div>

          {/* Center/Right Column: The Constellation Visualization & Terminal */}
          <div className="lg:col-span-9 flex flex-col gap-8 h-full">
            
            {/* The Visual Constellation */}
            <div className="relative flex-1 min-h-[400px] rounded-2xl border border-white/10 bg-[#050505] overflow-hidden">
               <ConstellationGraph 
                  swarmId={activeSwarmId} 
                  activeAgents={selectedAgent ? [selectedAgent.id] : []} 
                  isInteractive={false}
                  onAgentClick={(agentId) => {
                    let agent = activeSwarm.agents.find(a => a.id === agentId);
                    if (!agent) {
                      const dictInfo = AGENT_DICTIONARY[agentId] || {
                        role: "Specialist Node",
                        description: `Agent ${agentId} is an active node in the ${activeSwarm.name} constellation.`
                      };
                      agent = {
                        id: agentId,
                        name: agentId.charAt(0).toUpperCase() + agentId.slice(1),
                        role: dictInfo.role,
                        description: dictInfo.description
                      };
                    }
                    setSelectedAgent(agent);
                  }}
               />
            </div>

            {/* Simulated Demo Terminal */}
            <div className="h-[250px] rounded-2xl border border-white/10 bg-black/80 flex flex-col overflow-hidden font-mono text-sm relative">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Live Telemetry: {activeSwarm.name}</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50 animate-pulse" />
                </div>
              </div>
              
              <div 
                ref={scrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3"
              >
                {demoLog.length === 0 ? (
                  <div className="text-muted-foreground/50 italic flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                    Awaiting swarm initialization...
                  </div>
                ) : (
                  demoLog.map((log, i) => (
                    <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <span style={{ color: currentTheme.color }} className="font-bold min-w-[80px]">
                        [{log.agent}]
                      </span>
                      <span className="text-slate-300">
                        {log.text}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <div className="w-full h-[2px] bg-white animate-scanline" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
