"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

interface AgentNode {
  id: string;
  name: string;
  type: string;
  subsidiary?: string;
  capabilities: string[];
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface AgentLink {
  source: string | AgentNode;
  target: string | AgentNode;
  type: string;
}

interface ConstellationGraphProps {
  swarmId?: string;
  activeAgents?: string[];
  onAgentClick?: (agentId: string) => void;
  isInteractive?: boolean;
}

// Agent data by swarm
const swarmAgentData: Record<string, { nodes: AgentNode[], links: AgentLink[] }> = {
  corporate: {
    nodes: [
      { id: "keyes", name: "Keyes", type: "coordinator", capabilities: ["orchestration", "claims", "synthesis"] },
      { id: "bannister", name: "Bannister", type: "specialist", subsidiary: "Securities", capabilities: ["securities", "defense", "strategy"] },
      { id: "ohara", name: "O'Hara", type: "specialist", subsidiary: "Offering", capabilities: ["offerings", "documents", "sailing"] },
      { id: "neff", name: "Neff", type: "specialist", subsidiary: "Blue Sky", capabilities: ["sales", "coordination", "insurance"] },
      { id: "gittes", name: "Gittes", type: "specialist", subsidiary: "Cap Table", capabilities: ["investigation", "ownership", "equity"] },
      { id: "spade", name: "Spade", type: "specialist", subsidiary: "Governance", capabilities: ["governance", "resolutions", "detective"] },
      { id: "marlowe", name: "Marlowe", type: "specialist", subsidiary: "HR", capabilities: ["contracts", "personnel", "pi"] },
      { id: "archer", name: "Archer", type: "regulatory", capabilities: ["transactions", "partnerships", "deals"] },
      { id: "cairo", name: "Cairo", type: "documentation", capabilities: ["investor-relations", "middleman", "networking"] },
      { id: "gutman", name: "Gutman", type: "compliance", capabilities: ["compliance", "risk", "weight"] },
      { id: "vance", name: "Vance", type: "operations", capabilities: ["enforcement", "aristocracy", "deduction"] },
      { id: "queen", name: "Queen", type: "analytics", capabilities: ["ip", "mystery", "writing"] },
      { id: "hammer", name: "Hammer", type: "integration", capabilities: ["privacy", "protection", "hardboiled"] },
    ],
    links: [
      { source: "keyes", target: "bannister", type: "coordinate" },
      { source: "keyes", target: "ohara", type: "coordinate" },
      { source: "keyes", target: "neff", type: "coordinate" },
      { source: "keyes", target: "gittes", type: "coordinate" },
      { source: "keyes", target: "spade", type: "coordinate" },
      { source: "keyes", target: "marlowe", type: "coordinate" },
      { source: "keyes", target: "archer", type: "coordinate" },
      { source: "keyes", target: "cairo", type: "coordinate" },
      { source: "keyes", target: "gutman", type: "coordinate" },
      { source: "keyes", target: "vance", type: "coordinate" },
      { source: "keyes", target: "queen", type: "coordinate" },
      { source: "keyes", target: "hammer", type: "coordinate" },
    ],
  },
  criminal: {
    nodes: [
      { id: "holmes", name: "Holmes", type: "coordinator", capabilities: ["strategy", "deduction", "orchestration"] },
      { id: "poirot", name: "Poirot", type: "specialist", subsidiary: "Evidence", capabilities: ["forensics", "evidence", "precision"] },
      { id: "marple", name: "Marple", type: "specialist", subsidiary: "Witnesses", capabilities: ["witnesses", "interviews", "observation"] },
      { id: "columbo", name: "Columbo", type: "specialist", subsidiary: "Investigation", capabilities: ["police", "procedure", "tenacity"] },
      { id: "perry", name: "Perry", type: "specialist", subsidiary: "Defense", capabilities: ["trial", "defense", "advocacy"] },
      { id: "mccoy", name: "McCoy", type: "specialist", subsidiary: "Prosecution", capabilities: ["prosecution", "plea", "sentencing"] },
      { id: "wolfe", name: "Wolfe", type: "regulatory", capabilities: ["research", "analysis", "strategy"] },
      { id: "morse", name: "Morse", type: "documentation", capabilities: ["procedure", "documentation", "appeals"] },
      { id: "chan", name: "Chan", type: "compliance", capabilities: ["jurisdiction", "compliance", "federal"] },
      { id: "dupin", name: "Dupin", type: "operations", capabilities: ["logic", "reasoning", "deduction"] },
      { id: "brown", name: "Brown", type: "analytics", capabilities: ["psychology", "motive", "profiling"] },
      { id: "archer", name: "Archer", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "holmes", target: "poirot", type: "coordinate" },
      { source: "holmes", target: "marple", type: "coordinate" },
      { source: "holmes", target: "columbo", type: "coordinate" },
      { source: "holmes", target: "perry", type: "coordinate" },
      { source: "holmes", target: "mccoy", type: "coordinate" },
      { source: "holmes", target: "wolfe", type: "coordinate" },
      { source: "holmes", target: "morse", type: "coordinate" },
      { source: "holmes", target: "chan", type: "coordinate" },
      { source: "holmes", target: "dupin", type: "coordinate" },
      { source: "holmes", target: "brown", type: "coordinate" },
      { source: "holmes", target: "archer", type: "coordinate" },
    ],
  },
  family: {
    nodes: [
      { id: "bennet", name: "Bennet", type: "coordinator", capabilities: ["family", "wisdom", "orchestration"] },
      { id: "eyre", name: "Eyre", type: "specialist", subsidiary: "Custody", capabilities: ["custody", "children", "protection"] },
      { id: "earnshaw", name: "Earnshaw", type: "specialist", subsidiary: "Property", capabilities: ["property", "division", "assets"] },
      { id: "dashwood", name: "Dashwood", type: "specialist", subsidiary: "Financial", capabilities: ["support", "calculation", "budget"] },
      { id: "march", name: "March", type: "specialist", subsidiary: "Child Advocacy", capabilities: ["advocacy", "welfare", "voice"] },
      { id: "rochester", name: "Rochester", type: "specialist", subsidiary: "Estate", capabilities: ["estate", "trusts", "wills"] },
      { id: "woodhouse", name: "Woodhouse", type: "regulatory", capabilities: ["mediation", "settlement", "agreement"] },
      { id: "darcy", name: "Darcy", type: "documentation", capabilities: ["prenuptial", "postnuptial", "contracts"] },
      { id: "knightley", name: "Knightley", type: "compliance", capabilities: ["jurisdiction", "venue", "procedure"] },
      { id: "ferrars", name: "Ferrars", type: "operations", capabilities: ["discovery", "disclosure", "financials"] },
      { id: "brandon", name: "Brandon", type: "analytics", capabilities: ["valuation", "appraisal", "analysis"] },
      { id: "tilney", name: "Tilney", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "bennet", target: "eyre", type: "coordinate" },
      { source: "bennet", target: "earnshaw", type: "coordinate" },
      { source: "bennet", target: "dashwood", type: "coordinate" },
      { source: "bennet", target: "march", type: "coordinate" },
      { source: "bennet", target: "rochester", type: "coordinate" },
      { source: "bennet", target: "woodhouse", type: "coordinate" },
      { source: "bennet", target: "darcy", type: "coordinate" },
      { source: "bennet", target: "knightley", type: "coordinate" },
      { source: "bennet", target: "ferrars", type: "coordinate" },
      { source: "bennet", target: "brandon", type: "coordinate" },
      { source: "bennet", target: "tilney", type: "coordinate" },
    ],
  },
  immigration: {
    nodes: [
      { id: "polo", name: "Polo", type: "coordinator", capabilities: ["navigation", "strategy", "orchestration"] },
      { id: "magellan", name: "Magellan", type: "specialist", subsidiary: "Visas", capabilities: ["visas", "work", "temporary"] },
      { id: "columbus", name: "Columbus", type: "specialist", subsidiary: "Green Card", capabilities: ["permanent", "residence", "eb"] },
      { id: "darwin", name: "Darwin", type: "specialist", subsidiary: "Asylum", capabilities: ["asylum", "refugee", "protection"] },
      { id: "earhart", name: "Earhart", type: "specialist", subsidiary: "Deportation", capabilities: ["removal", "defense", "bond"] },
      { id: "shackleton", name: "Shackleton", type: "specialist", subsidiary: "Appeals", capabilities: ["appeals", "bia", "circuit"] },
      { id: "cook", name: "Cook", type: "regulatory", capabilities: ["consular", "processing", "interview"] },
      { id: "vespucci", name: "Vespucci", type: "documentation", capabilities: ["forms", "petitions", "evidence"] },
      { id: "drake", name: "Drake", type: "compliance", capabilities: ["employment", "i9", "verification"] },
      { id: "livingstone", name: "Livingstone", type: "operations", capabilities: ["country", "conditions", "research"] },
      { id: "hudson", name: "Hudson", type: "analytics", capabilities: ["priority", "dates", "tracking"] },
      { id: "lewis", name: "Lewis", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "polo", target: "magellan", type: "coordinate" },
      { source: "polo", target: "columbus", type: "coordinate" },
      { source: "polo", target: "darwin", type: "coordinate" },
      { source: "polo", target: "earhart", type: "coordinate" },
      { source: "polo", target: "shackleton", type: "coordinate" },
      { source: "polo", target: "cook", type: "coordinate" },
      { source: "polo", target: "vespucci", type: "coordinate" },
      { source: "polo", target: "drake", type: "coordinate" },
      { source: "polo", target: "livingstone", type: "coordinate" },
      { source: "polo", target: "hudson", type: "coordinate" },
      { source: "polo", target: "lewis", type: "coordinate" },
    ],
  },
  real_estate: {
    nodes: [
      { id: "earp", name: "Earp", type: "coordinator", capabilities: ["property", "law", "orchestration"] },
      { id: "hickok", name: "Hickok", type: "specialist", subsidiary: "Transactions", capabilities: ["purchase", "closing", "deals"] },
      { id: "oakley", name: "Oakley", type: "specialist", subsidiary: "Title", capabilities: ["title", "liens", "defects"] },
      { id: "cody", name: "Cody", type: "specialist", subsidiary: "Leasing", capabilities: ["landlord", "tenant", "eviction"] },
      { id: "cassidy", name: "Cassidy", type: "specialist", subsidiary: "Zoning", capabilities: ["zoning", "land", "use"] },
      { id: "holliday", name: "Holliday", type: "specialist", subsidiary: "Litigation", capabilities: ["dispute", "boundary", "court"] },
      { id: "masterson", name: "Masterson", type: "regulatory", capabilities: ["financing", "mortgage", "lending"] },
      { id: "garrett", name: "Garrett", type: "documentation", capabilities: ["contracts", "deeds", "recording"] },
      { id: "horn", name: "Horn", type: "compliance", capabilities: ["environmental", "disclosure", "permits"] },
      { id: "starr", name: "Starr", type: "operations", capabilities: ["due", "diligence", "inspection"] },
      { id: "james", name: "James", type: "analytics", capabilities: ["valuation", "market", "analysis"] },
      { id: "younger", name: "Younger", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "earp", target: "hickok", type: "coordinate" },
      { source: "earp", target: "oakley", type: "coordinate" },
      { source: "earp", target: "cody", type: "coordinate" },
      { source: "earp", target: "cassidy", type: "coordinate" },
      { source: "earp", target: "holliday", type: "coordinate" },
      { source: "earp", target: "masterson", type: "coordinate" },
      { source: "earp", target: "garrett", type: "coordinate" },
      { source: "earp", target: "horn", type: "coordinate" },
      { source: "earp", target: "starr", type: "coordinate" },
      { source: "earp", target: "james", type: "coordinate" },
      { source: "earp", target: "younger", type: "coordinate" },
    ],
  },
  ip_entertainment: {
    nodes: [
      { id: "selznick", name: "Selznick", type: "coordinator", capabilities: ["production", "strategy", "orchestration"] },
      { id: "goldwyn", name: "Goldwyn", type: "specialist", subsidiary: "Copyright", capabilities: ["copyright", "infringement", "fair-use"] },
      { id: "mayer", name: "Mayer", type: "specialist", subsidiary: "Trademark", capabilities: ["trademark", "brand", "protection"] },
      { id: "zanuck", name: "Zanuck", type: "specialist", subsidiary: "Licensing", capabilities: ["licensing", "distribution", "deals"] },
      { id: "warner", name: "Warner", type: "specialist", subsidiary: "Talent", capabilities: ["talent", "contracts", "guilds"] },
      { id: "thalberg", name: "Thalberg", type: "specialist", subsidiary: "Royalties", capabilities: ["royalties", "profit", "accounting"] },
      { id: "cohn", name: "Cohn", type: "regulatory", capabilities: ["music", "publishing", "sync"] },
      { id: "laemmle", name: "Laemmle", type: "documentation", capabilities: ["registrations", "filings", "applications"] },
      { id: "zukor", name: "Zukor", type: "compliance", capabilities: ["clearance", "rights", "chain"] },
      { id: "fox", name: "Fox", type: "operations", capabilities: ["production", "deals", "financing"] },
      { id: "disney", name: "Disney", type: "analytics", capabilities: ["ip", "portfolio", "valuation"] },
      { id: "universal", name: "Universal", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "selznick", target: "goldwyn", type: "coordinate" },
      { source: "selznick", target: "mayer", type: "coordinate" },
      { source: "selznick", target: "zanuck", type: "coordinate" },
      { source: "selznick", target: "warner", type: "coordinate" },
      { source: "selznick", target: "thalberg", type: "coordinate" },
      { source: "selznick", target: "cohn", type: "coordinate" },
      { source: "selznick", target: "laemmle", type: "coordinate" },
      { source: "selznick", target: "zukor", type: "coordinate" },
      { source: "selznick", target: "fox", type: "coordinate" },
      { source: "selznick", target: "disney", type: "coordinate" },
      { source: "selznick", target: "universal", type: "coordinate" },
    ],
  },
  personal_injury: {
    nodes: [
      { id: "house", name: "House", type: "coordinator", capabilities: ["diagnosis", "strategy", "orchestration"] },
      { id: "grey", name: "Grey", type: "specialist", subsidiary: "Medical", capabilities: ["medical", "records", "injury"] },
      { id: "welby", name: "Welby", type: "specialist", subsidiary: "Standard of Care", capabilities: ["malpractice", "standard", "care"] },
      { id: "quincy", name: "Quincy", type: "specialist", subsidiary: "Forensics", capabilities: ["causation", "forensic", "reconstruction"] },
      { id: "trapper", name: "Trapper", type: "specialist", subsidiary: "Damages", capabilities: ["damages", "calculation", "economic"] },
      { id: "kildare", name: "Kildare", type: "specialist", subsidiary: "Settlement", capabilities: ["settlement", "negotiation", "mediation"] },
      { id: "pierce", name: "Pierce", type: "regulatory", capabilities: ["insurance", "coverage", "bad-faith"] },
      { id: "carter", name: "Carter", type: "documentation", capabilities: ["demand", "letters", "complaints"] },
      { id: "ross", name: "Ross", type: "compliance", capabilities: ["statute", "limitations", "procedure"] },
      { id: "shepherd", name: "Shepherd", type: "operations", capabilities: ["discovery", "depositions", "experts"] },
      { id: "kovac", name: "Kovac", type: "analytics", capabilities: ["verdict", "analysis", "valuation"] },
      { id: "greene", name: "Greene", type: "integration", capabilities: ["coordination", "handoffs", "synthesis"] },
    ],
    links: [
      { source: "house", target: "grey", type: "coordinate" },
      { source: "house", target: "welby", type: "coordinate" },
      { source: "house", target: "quincy", type: "coordinate" },
      { source: "house", target: "trapper", type: "coordinate" },
      { source: "house", target: "kildare", type: "coordinate" },
      { source: "house", target: "pierce", type: "coordinate" },
      { source: "house", target: "carter", type: "coordinate" },
      { source: "house", target: "ross", type: "coordinate" },
      { source: "house", target: "shepherd", type: "coordinate" },
      { source: "house", target: "kovac", type: "coordinate" },
      { source: "house", target: "greene", type: "coordinate" },
    ],
  },
};

const MIN_ANIMATION_DURATION = 1500; // 1.5 seconds

export default function ConstellationGraph({ swarmId = "corporate", activeAgents = [], onAgentClick, isInteractive = true }: ConstellationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isTaskRunning, setIsTaskRunning] = useState(false);
  // Removed local activeAgents state
  const [agentStates, setAgentStates] = useState<Map<string, string>>(new Map());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeConnections, setActiveConnections] = useState<Map<string, number>>(new Map());
  const simulationRef = useRef<d3.Simulation<AgentNode, AgentLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const stateChangeQueue = useRef<any[]>([]);
  const isProcessingQueue = useRef(false);

  // Get agent data for current swarm
  const [dynamicAgentData, setDynamicAgentData] = useState<{ nodes: AgentNode[], links: AgentLink[] } | null>(null);

  useEffect(() => {
    // Use the comprehensive hardcoded swarm agent data
    // Dynamic agent data from the backend is no longer needed since
    // all swarm configurations are defined in swarmAgentData above.
    setDynamicAgentData(null);
  }, [swarmId]);

  const agentData = useMemo(() => {
    return dynamicAgentData || swarmAgentData[swarmId] || swarmAgentData.corporate;
  }, [swarmId, dynamicAgentData]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: width,
          height: Math.max(0, height - 40) // Leave space for controls, ensure no negative value
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height * 0.42; // Shifted up to clear the bottom legend

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Create main group for zoom/pan
    const g = svg.append("g");

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    if (isInteractive) {
      svg.call(zoom);
      zoomRef.current = zoom;
    } else {
      // Set to static scale
      g.attr("transform", "translate(0, 0) scale(1)");
    }

    // Add gradient definitions
    const defs = svg.append("defs");

    // Vigil Red gradient
    const redGradient = defs.append("linearGradient")
      .attr("id", "noir-gradient-d3")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");

    redGradient.append("stop")
      .attr("offset", "0%")
      .attr("style", "stop-color:#cc0000;stop-opacity:1");

    redGradient.append("stop")
      .attr("offset", "100%")
      .attr("style", "stop-color:#4a0000;stop-opacity:1");

    // Add glow filter
    const filter = defs.append("filter")
      .attr("id", "glow");

    filter.append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add pulse filter for active connections
    const pulseFilter = defs.append("filter")
      .attr("id", "pulse-glow");

    pulseFilter.append("feGaussianBlur")
      .attr("stdDeviation", "8")
      .attr("result", "coloredBlur");

    const pulseMerge = pulseFilter.append("feMerge");
    pulseMerge.append("feMergeNode").attr("in", "coloredBlur");
    pulseMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Generate fully connected mesh (Neural Network topology)
    const neuralLinks: AgentLink[] = [];
    agentData.nodes.forEach((source, i) => {
      agentData.nodes.slice(i + 1).forEach(target => {
        neuralLinks.push({
          source: source.id,
          target: target.id,
          type: "neural"
        });
      });
    });

    // Calculate fixed positions for perfect circle topology
    const radius = Math.min(width, height) * 0.35; // 35% of container size
    const coordinatorNode = agentData.nodes.find(n => n.type === "coordinator");
    const otherAgents = agentData.nodes.filter(n => n.type !== "coordinator");
    const angleStep = (2 * Math.PI) / otherAgents.length;

    agentData.nodes.forEach((node) => {
      if (node.type === "coordinator") {
        // Coordinator at the origin (center)
        node.fx = centerX;
        node.fy = centerY;
      } else {
        // Others in a perfect circle
        // Find index among other agents to determine angle
        const index = otherAgents.findIndex(n => n.id === node.id);
        const angle = index * angleStep - Math.PI / 2; // Start from top (-PI/2)

        node.fx = centerX + radius * Math.cos(angle);
        node.fy = centerY + radius * Math.sin(angle);
      }
    });

    // Update local data
    const linksReference = neuralLinks;

    // Create force simulation
    // We keep the simulation running for interaction effects, but nodes are pinned
    const simulation = d3.forceSimulation<AgentNode>(agentData.nodes)
      .force("link", d3.forceLink<AgentNode, AgentLink>(linksReference)
        .id(d => d.id)
        .strength(0) // No link strength needed as nodes are fixed
      )
      .force("charge", d3.forceManyBody().strength(0)) // No charge needed
      .force("collision", d3.forceCollide().radius(30)); // Keep basic collision for drag interactions

    simulationRef.current = simulation;

    // Create links group with neural aesthetic
    const linkGroup = g.append("g").attr("class", "links");

    const link = linkGroup.selectAll("path")
      .data(linksReference)
      .enter().append("path") // Use paths for potential curves
      .attr("class", d => `link link-${(d.source as any).id || d.source}-${(d.target as any).id || d.target}`)
      .attr("stroke", "rgba(255, 255, 255, 0.12)") // Increased visibility (was 0.03)
      .attr("stroke-width", 1)
      .attr("fill", "none");

    // Create nodes group
    const nodeGroup = g.append("g").attr("class", "nodes");

    const node = nodeGroup.selectAll("g")
      .data(agentData.nodes)
      .enter().append("g")
      .attr("class", d => `node node-${d.id}`)
      .style("cursor", isInteractive ? "move" : "pointer")
      .on("click", (event, d) => {
        if (onAgentClick) onAgentClick(d.id);
      });

    if (isInteractive) {
      node.call(d3.drag<SVGGElement, AgentNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );
    }

    // Add node shapes
    node.each(function (d) {
      const g = d3.select(this);

      // Node construction (Shapes)
      if (d.type === "coordinator") {
        // Central Orchestrator Node - Hexagon
        g.append("polygon")
          .attr("points", "0,-25 21.65,-12.5 21.65,12.5 0,25 -21.65,12.5 -21.65,-12.5")
          .attr("fill", "url(#noir-gradient-d3)")
          .attr("stroke", "rgba(255, 255, 255, 0.8)")
          .attr("stroke-width", 2)
          .attr("filter", "url(#glow)")
          .attr("class", "agent-shape");
      } else {
        // Standard Neural Nodes
        g.append("circle")
          .attr("r", 12)
          .attr("fill", "rgba(10, 10, 10, 0.9)") // Slightly darker/more opaque to hide lines behind
          .attr("stroke", getColorForType(d.type))
          .attr("stroke-width", 1.5)
          .attr("class", "agent-shape");
      }

      // Add agent name
      g.append("text")
        .attr("dy", d.type === "coordinator" ? 40 : 25)
        .attr("text-anchor", "middle")
        .attr("class", "microtext-label agent-label")
        .style("fill", "rgba(255, 255, 255, 0.5)")
        .style("font-size", "8px")
        .style("letter-spacing", "0.1em")
        .text(d.name.toUpperCase());

      // Add document badge (initially hidden)
      g.append("rect")
        .attr("x", 8)
        .attr("y", -14)
        .attr("width", 10)
        .attr("height", 12)
        .attr("rx", 1)
        .attr("fill", "white")
        .attr("class", "doc-badge")
        .style("opacity", 0);

      // Add state symbol (initially invisible)
      g.append("text")
        .attr("x", d.type === "coordinator" ? 0 : -18)
        .attr("y", d.type === "coordinator" ? -30 : -2)
        .attr("text-anchor", "middle")
        .attr("class", "state-symbol")
        .style("fill", "#cc0000")
        .style("font-size", "12px")
        .style("opacity", 0)
        .text("");

      // Add pulsing core for activity
      g.append("circle")
        .attr("r", 2)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", "#cc0000") // Vigil Red core for activity
        .attr("class", "activity-core")
        .style("opacity", 0);
    });

    // Update positions on tick
    simulation.on("tick", () => {
      link.attr("d", d => {
        return `M ${(d.source as AgentNode).x},${(d.source as AgentNode).y} L ${(d.target as AgentNode).x},${(d.target as AgentNode).y}`;
      });

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, AgentNode, AgentNode>, d: AgentNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      // d.fx and d.fy are already set for layout, so we just update them
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, AgentNode, AgentNode>, d: AgentNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, AgentNode, AgentNode>, d: AgentNode) {
      if (!event.active) simulation.alphaTarget(0);
      // For this layout, we might want them to snap back to the perfect circle if released?
      // Or just stay where user put them. Let's keep them where dragged for flexibility.
      // If we wanted snap-back:
      // d.fx = originalCalculatedX; 
      // d.fy = originalCalculatedY;
      // For now, let's leave them pinned where dropped.
      d.fx = event.x;
      d.fy = event.y;
    }

    // Helper functions
    function getShapeForType(type: string): string {
      return "circle"; // Uniform neural nodes
    }

    function getColorForType(type: string): string {
      return "rgba(150, 150, 150, 0.5)"; // Uniform neural color
    }

    // Per-agent unique color for tool calls
    function getAgentToolColor(agentName: string): string {
      const coordinators = ['Keyes', 'Holmes', 'Bennet', 'Polo', 'Earp', 'Selznick', 'House'];
      if (coordinators.some(c => c.toLowerCase() === agentName.toLowerCase())) return '#cc0000';
      let hash = 0;
      for (let i = 0; i < agentName.length; i++) hash = agentName.charCodeAt(i) + ((hash << 5) - hash);
      const hue = ((hash % 360) + 360) % 360;
      return `hsl(${hue}, 80%, 60%)`;
    }

    // Listen for events
    const handleTaskStart = () => setIsTaskRunning(true);
    const handleTaskEnd = () => {
      setIsTaskRunning(false);
      setTimeout(() => {
        // activeAgents is now controlled by prop, no local reset needed
        setAgentStates(new Map());
        setActiveConnections(new Map());
        updateAllAgentVisuals();
      }, 2000);
    };

    // handleAgentsUpdate removed - controlled by prop

    const handleAgentStateChange = (event: CustomEvent) => {
      stateChangeQueue.current.push(event.detail);
      processStateChangeQueue();
    };

    const processStateChangeQueue = () => {
      if (isProcessingQueue.current || stateChangeQueue.current.length === 0) {
        return;
      }
      isProcessingQueue.current = true;

      const { agent, action, message, target } = stateChangeQueue.current.shift();

      if (action === "document_upload") {
        pulseNodeParams("keyes");
        isProcessingQueue.current = false;
        processStateChangeQueue();
        return;
      }

      setAgentStates(prev => {
        const newStates = new Map(prev);
        newStates.set(agent, action);
        return newStates;
      });

      updateAgentVisualState(agent, action);

      if (action === 'collaborating' || action === 'delegating' || action === 'handoff') {
        // Use direct target from event detail first, fall back to regex matching
        let targetAgent = target || null;
        if (!targetAgent) {
          const targetPatterns = [
            /with (\w+)/i,
            /to (\w+)/i,
            /asking (\w+)/i,
            /consulting (\w+)/i
          ];
          for (const pattern of targetPatterns) {
            const match = message?.match(pattern);
            if (match) {
              targetAgent = match[1];
              break;
            }
          }
        }

        if (targetAgent) {
          const isDocTransfer = message?.toLowerCase().includes("document") ||
            message?.toLowerCase().includes("file") ||
            message?.toLowerCase().includes("case") ||
            message?.toLowerCase().includes("draft");
          animateConnection(agent, targetAgent, isDocTransfer ? "document" : "interaction");
        } else {
          pulseNodeParams(agent);
        }
      } else if (action === 'thinking' || action === 'responding') {
        pulseNodeParams(agent);
      } else if (action === 'tool_call' || action === 'working') {
        pulseNodeParams(agent);
      }

      // Use MIN_ANIMATION_DURATION to ensure the user has time to see the animation
      setTimeout(() => {
        isProcessingQueue.current = false;
        processStateChangeQueue();
      }, MIN_ANIMATION_DURATION);
    };

    function updateAgentVisualState(agentName: string, action: string) {
      if (!agentName) return;
      const agentNode = d3.select(svgRef.current)
        .selectAll(".node")
        .filter((d: any) => d.name === agentName || d.id === agentName.toLowerCase());

      const shape = agentNode.select(".agent-shape");
      const core = agentNode.select(".activity-core");
      const docBadge = agentNode.select(".doc-badge");
      const stateSymbol = agentNode.select(".state-symbol");

      const symbolMap: Record<string, string> = {
        "thinking": "◌",
        "responding": "◉",
        "processing_document": "▤",
        "collaborating": "◈",
        "delegating": "⬢",
        "handoff": "⬢",
        "tool_call": "◊",
        "working": "◉",
      };

      if (action === "thinking") {
        shape.attr("stroke", "#cc0000").attr("stroke-width", 2)
          .style("stroke-dasharray", "4,2")
          .transition().duration(1000).ease(d3.easeLinear)
          .styleTween("stroke-dashoffset", () => d3.interpolateString("12", "0")); // Rotating dash effect
        core.transition().style("opacity", 0.6).attr("fill", "#cc0000");
        stateSymbol.text(symbolMap[action] || "").style("fill", "#cc0000").transition().style("opacity", 1);
      } else if (action === "responding") {
        shape.style("stroke-dasharray", null).attr("stroke", "#cc0000").attr("stroke-width", 3).attr("filter", "url(#glow)");
        core.transition().style("opacity", 1).attr("r", 5).attr("fill", "#ffffff"); // Bright white core for generating
        stateSymbol.text(symbolMap[action] || "").style("fill", "#cc0000").transition().style("opacity", 1);
      } else if (action === "processing_document") {
        shape.style("stroke-dasharray", null).attr("stroke", "#ff00ff").attr("stroke-width", 2);
        stateSymbol.text(symbolMap[action] || "").style("fill", "#ff00ff").transition().style("opacity", 1);

        // Pulse the doc badge
        docBadge.transition().duration(300).style("opacity", 1)
          .transition().duration(500).attr("fill", "#ffeaff")
          .transition().duration(500).attr("fill", "white").style("opacity", 1);

        // Keep visible for the duration of the state logic (handled by queue timing)
      } else if (action === "collaborating" || action === "delegating" || action === "handoff") {
        shape.style("stroke-dasharray", null).attr("stroke", "#ffd700").attr("stroke-width", 2);
        stateSymbol.text(symbolMap[action] || "").style("fill", "#ffd700").transition().style("opacity", 1);
      } else if (action === "tool_call" || action === "working") {
        const toolColor = getAgentToolColor(agentName);
        shape.style("stroke-dasharray", "3,2")
          .attr("stroke", toolColor).attr("stroke-width", 2.5)
          .attr("filter", "url(#tool-glow)")
          .transition().duration(400).ease(d3.easeElastic)
          .attr("stroke-width", 3)
          .transition().duration(600)
          .attr("stroke-width", 2);
        core.transition().style("opacity", 0.8).attr("fill", toolColor).attr("r", 4);
        stateSymbol.text(symbolMap[action] || "").style("fill", toolColor).transition().style("opacity", 1);
      } else {
        shape.style("stroke-dasharray", null).attr("stroke", "rgba(150,150,150,0.5)").attr("stroke-width", 1.5).attr("filter", null);
        core.transition().style("opacity", 0).attr("r", 2);
        stateSymbol.transition().style("opacity", 0);
        docBadge.transition().style("opacity", 0);
      }
    }

    function pulseNodeParams(agentName: string) {
      const agentNode = d3.select(svgRef.current)
        .selectAll(".node")
        .filter((d: any) => d.name === agentName || d.id === agentName.toLowerCase());

      agentNode.select(".agent-shape")
        .transition().duration(200).attr("stroke-width", 4).attr("stroke", "#cc0000").attr("filter", "url(#pulse-glow)")
        .transition().duration(500).attr("stroke-width", 1.5).attr("stroke", "rgba(150,150,150,0.5)").attr("filter", null);
    }

    function animateConnection(sourceAgent: string, targetAgent: string, type: string) {
      const sName = sourceAgent.toLowerCase();
      const tName = targetAgent.toLowerCase();

      const linkPath = d3.select(svgRef.current)
        .selectAll(".link")
        .filter((d: any) => {
          const src = d.source.id || d.source;
          const tgt = d.target.id || d.target;
          return (src === sName && tgt === tName) || (src === tName && tgt === sName);
        });

      if (!linkPath.empty()) {
        const edgeColor = type === "document" ? "#ff00ff" : "#ffd700";

        // Animate edge: light up, dash, then fade
        linkPath
          .attr("stroke", edgeColor)
          .attr("stroke-width", 2.5)
          .attr("filter", "url(#glow)")
          .style("stroke-dasharray", "6,3")
          .transition().duration(1200)
          .style("stroke-dashoffset", "0")
          .attr("stroke-width", 1.5)
          .transition().duration(600)
          .attr("stroke", "rgba(255, 255, 255, 0.12)")
          .attr("stroke-width", 1)
          .attr("filter", null)
          .style("stroke-dasharray", null);

        const pathNode = linkPath.node() as SVGPathElement;
        if (pathNode && pathNode.getTotalLength) {
          const length = pathNode.getTotalLength();
          const linksGroup = d3.select(svgRef.current).select("g.links");

          // Trailing glow circle
          const trail = linksGroup.append("circle")
            .attr("r", 6)
            .attr("fill", "none")
            .attr("stroke", edgeColor)
            .attr("stroke-width", 1)
            .attr("opacity", 0.4)
            .attr("filter", "url(#pulse-glow)");

          trail.transition()
            .duration(1200)
            .ease(d3.easeLinear)
            .attrTween("cx", function () {
              return function (t) { return String(pathNode.getPointAtLength(Math.max(0, t - 0.1) * length).x); };
            })
            .attrTween("cy", function () {
              return function (t) { return String(pathNode.getPointAtLength(Math.max(0, t - 0.1) * length).y); };
            })
            .transition().duration(200).attr("opacity", 0).remove();

          // Main particle — bright dot
          const particle = linksGroup.append("circle")
            .attr("r", 3)
            .attr("fill", edgeColor)
            .attr("filter", "url(#glow)");

          particle.transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attrTween("cx", function () {
              return function (t) { return String(pathNode.getPointAtLength(t * length).x); };
            })
            .attrTween("cy", function () {
              return function (t) { return String(pathNode.getPointAtLength(t * length).y); };
            })
            .remove();
        }
      }
    }

    function updateAllAgentVisuals() {
      // Reset all nodes to idle state
      d3.select(svgRef.current)
        .selectAll(".node")
        .each(function () {
          const node = d3.select(this);
          node.select(".agent-shape")
            .style("stroke-dasharray", null)
            .attr("stroke", "rgba(150,150,150,0.5)")
            .attr("stroke-width", 1.5)
            .attr("filter", null);
          node.select(".activity-core")
            .transition().style("opacity", 0).attr("r", 2);
          node.select(".state-symbol")
            .transition().style("opacity", 0);
          node.select(".doc-badge")
            .transition().style("opacity", 0);
        });
    }

    window.addEventListener('basalt-task-start', handleTaskStart);
    window.addEventListener('basalt-task-end', handleTaskEnd);
    // Removed basalt-agents-update listener
    window.addEventListener('basalt-agent-state-change', handleAgentStateChange as EventListener);

    return () => {
      window.removeEventListener('basalt-task-start', handleTaskStart);
      window.removeEventListener('basalt-task-end', handleTaskEnd);
      window.removeEventListener('basalt-agent-state-change', handleAgentStateChange as EventListener);
      simulation.stop();
    };
  }, [dimensions, agentData]); // activeAgents removed - handled by separate effect below

  // Separate effect: highlight/unhighlight agents based on prop changes without re-rendering D3
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    svg.selectAll(".node").each(function (d: any) {
      const node = d3.select(this);
      const isActive = activeAgents.some(
        a => a.toLowerCase() === d.id || a.toLowerCase() === d.name?.toLowerCase()
      );
      const shape = node.select(".agent-shape");
      const core = node.select(".activity-core");

      if (isActive) {
        // Highlight active agents with a subtle glow
        if (d.type === "coordinator") {
          shape.attr("stroke", "rgba(255,255,255,0.9)").attr("stroke-width", 2.5).attr("filter", "url(#glow)");
        } else {
          shape.attr("stroke", "#00e5ff").attr("stroke-width", 2).attr("filter", "url(#glow)");
        }
        core.transition().duration(300).style("opacity", 0.6);
      } else {
        // Only reset if not currently managed by a state-change animation
        const currentState = agentStates.get(d.name) || agentStates.get(d.id);
        if (!currentState || currentState === 'completed') {
          if (d.type === "coordinator") {
            shape.attr("stroke", "rgba(255, 255, 255, 0.8)").attr("stroke-width", 2).attr("filter", "url(#glow)");
          } else {
            shape.attr("stroke", "rgba(150,150,150,0.5)").attr("stroke-width", 1.5).attr("filter", null);
          }
          core.transition().duration(300).style("opacity", 0);
        }
      }
    });
  }, [activeAgents, agentStates]);

  // Control functions
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  const handleRestart = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  };

  return (
    <div className="w-full h-full flex flex-col" ref={containerRef}>
      {/* Header with status and controls */}
      <div className="flex items-center justify-between p-2 border-b border-glass-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`status-dot ${isTaskRunning ? "status-online animate-pulse" : "status-offline"}`} />
            <span className="microtext-label">{isTaskRunning ? "PROCESSING" : "IDLE"}</span>
          </div>
          <div className="glass-divider h-4" />
          <span className="data-label">ACTIVE: {activeAgents.length}</span>
        </div>

        {/* Zoom controls */}
        {isInteractive && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="glass-button p-1"
              title="Zoom Out"
            >
              <span className="text-xs">−</span>
            </button>
            <span className="microtext-label">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="glass-button p-1"
              title="Zoom In"
            >
              <span className="text-xs">+</span>
            </button>
            <div className="glass-divider h-4 mx-1" />
            <button
              onClick={handleReset}
              className="glass-button px-2 py-1"
              title="Reset View"
            >
              <span className="microtext">RESET</span>
            </button>
            <button
              onClick={handleRestart}
              className="glass-button px-2 py-1"
              title="Restart Simulation"
            >
              <span className="microtext">◉</span>
            </button>
          </div>
        )}
      </div>

      {/* SVG Container */}
      <div className="flex-1 relative overflow-hidden">
        <svg ref={svgRef} className={`w-full h-full ${isInteractive ? 'cursor-move' : ''}`}>
          {/* Enhanced filters for different states */}
          <defs>
            {/* Gradients */}
            <linearGradient id="noir-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
              <stop offset="100%" stopColor="rgba(100, 100, 100, 0.5)" />
            </linearGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="thinking-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="responding-glow">
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="collab-glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="tool-glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="complete-flash">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pulse-glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        {/* Updated Legend */}
        <div className={`absolute ${isInteractive ? 'bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 rounded-full px-6 py-2' : 'right-4 top-1/2 -translate-y-1/2 flex flex-col items-start gap-4 rounded-xl px-4 py-4'} glass-panel border border-white/10 shadow-lg bg-black/60 backdrop-blur-md`}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse shadow-[0_0_5px_rgba(100,100,100,0.8)]" />
            <span className="microtext-label text-[10px] text-gray-300 tracking-widest font-semibold">THINKING</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
            <span className="microtext-label text-[10px] text-white tracking-widest font-bold">RESPONDING</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full border border-white/80 bg-transparent" />
            <span className="microtext-label text-[10px] text-gray-300 tracking-widest font-semibold">COLLABORATING</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-sm bg-gray-700 border border-gray-500" />
            <span className="microtext-label text-[10px] text-gray-400 tracking-widest font-semibold">TOOL</span>
          </div>
        </div>
      </div>
    </div>
  );
} 