"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
    Briefcase,
    Users,
    Globe,
    Home,
    Film,
    Stethoscope,
    Gavel,
    ShieldAlert,
    Building2,
    Scale
} from "lucide-react";

interface SwarmInfo {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
}

interface CaseConfigPanelProps {
    swarms: SwarmInfo[];
    selectedSwarm: string;
    onSwarmChange: (swarmId: string) => void;
    jurisdiction: string;
    onJurisdictionChange: (value: string) => void;
    matterType: string;
    onMatterTypeChange: (value: string) => void;
    disabled?: boolean;
}

export default function CaseConfigPanel({
    swarms,
    selectedSwarm,
    onSwarmChange,
    jurisdiction,
    onJurisdictionChange,
    matterType,
    onMatterTypeChange,
    disabled = false
}: CaseConfigPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isSwarmOpen, setIsSwarmOpen] = useState(false);

    // Icon mapping for swarms
    const getSwarmIcon = (id: string, defaultEmoji: string) => {
        switch (id) {
            case 'corporate': return <Briefcase className="w-4 h-4 text-gray-400" />;
            case 'criminal': return <Scale className="w-4 h-4 text-gray-400" />; // Gavel is also good
            case 'family': return <Users className="w-4 h-4 text-gray-400" />;
            case 'immigration': return <Globe className="w-4 h-4 text-gray-400" />;
            case 'real_estate': return <Home className="w-4 h-4 text-gray-400" />;
            case 'ip_entertainment': return <Film className="w-4 h-4 text-gray-400" />;
            case 'personal_injury': return <Stethoscope className="w-4 h-4 text-gray-400" />;
            default: return <span className="text-sm">{defaultEmoji}</span>;
        }
    };

    // Default suggestions
    const matterTypes = [
        "Litigation",
        "Corporate Transaction",
        "Regulatory Compliance",
        "Intellectual Property",
        "Contract Review",
        "Employment Dispute",
        "Family Law Matter",
        "Criminal Defense"
    ];

    const selectedSwarmData = swarms.find(s => s.id === selectedSwarm);

    return (
        <div className="glass-panel m-2 mb-0 rounded-lg flex flex-col border border-white/5 transition-all duration-300 bg-black/40">
            <div
                className="p-3 border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="microtext text-gray-400 flex items-center gap-2">
                    <Building2 className="w-3 h-3" />
                    CASE CONFIGURATION
                </h2>
                <span className="text-gray-500">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 animate-slide-up">
                    {/* Swarm Selector - Custom Dropdown */}
                    <div className="space-y-1 relative">
                        <label className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Legal Specialty</label>

                        <button
                            onClick={() => !disabled && setIsSwarmOpen(!isSwarmOpen)}
                            className={`w-full flex items-center justify-between bg-black/60 border ${isSwarmOpen ? 'border-red-700/50' : 'border-white/10 hover:border-white/20'} rounded px-3 py-2 text-sm text-gray-200 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            disabled={disabled}
                        >
                            <div className="flex items-center gap-2">
                                {selectedSwarmData && getSwarmIcon(selectedSwarmData.id, selectedSwarmData.icon)}
                                <span>{selectedSwarmData?.name || "Select Swarm"}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSwarmOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isSwarmOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsSwarmOpen(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-1 z-20 glass-panel bg-black/95 border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-60 overflow-y-auto backdrop-blur-xl">
                                    {swarms.map((swarm) => (
                                        <div
                                            key={swarm.id}
                                            onClick={() => {
                                                onSwarmChange(swarm.id);
                                                setIsSwarmOpen(false);
                                            }}
                                            className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${selectedSwarm === swarm.id
                                                    ? 'bg-red-900/20 text-white'
                                                    : 'text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                                }`}
                                        >
                                            {getSwarmIcon(swarm.id, swarm.icon)}
                                            <span className="text-sm">{swarm.name}</span>
                                            {selectedSwarm === swarm.id && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-glow" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {selectedSwarmData && (
                            <p className="text-[10px] text-gray-500 leading-tight mt-1 pl-1">
                                {selectedSwarmData.description}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {/* Jurisdiction Input */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-mono tracking-wider">JURISDICTION</label>
                            <input
                                type="text"
                                value={jurisdiction}
                                onChange={(e) => onJurisdictionChange(e.target.value)}
                                disabled={disabled}
                                placeholder="e.g. California, Federal, NY"
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:border-white/30 outline-none transition-colors placeholder:text-gray-700 disabled:opacity-50"
                            />
                        </div>

                        {/* Matter Type Input (with datalist for suggestions) */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-mono tracking-wider">MATTER TYPE</label>
                            <input
                                type="text"
                                list="matter-types"
                                value={matterType}
                                onChange={(e) => onMatterTypeChange(e.target.value)}
                                disabled={disabled}
                                placeholder="e.g. Litigation"
                                className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:border-white/30 outline-none transition-colors placeholder:text-gray-700 disabled:opacity-50"
                            />
                            <datalist id="matter-types">
                                {matterTypes.map(type => (
                                    <option key={type} value={type} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
