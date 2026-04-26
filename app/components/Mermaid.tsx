"use client";

import React, { useEffect, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "monospace",
});

interface MermaidProps {
    chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (chart) {
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

            // Attempt to render
            try {
                mermaid.render(id, chart)
                    .then(({ svg }) => {
                        setSvg(svg);
                        setError(null);
                    })
                    .catch((err) => {
                        console.error("Mermaid rendering failed:", err);
                        setError(err.message || "Failed to render diagram");
                    });
            } catch (e: any) {
                setError(e.message);
            }
        }
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-lg text-red-400 text-xs font-mono overflow-auto">
                <p className="font-bold mb-1">Mermaid Error:</p>
                {error}
                <pre className="mt-2 text-gray-500">{chart}</pre>
            </div>
        );
    }

    return (
        <div
            className="mermaid-chart my-4 p-4 bg-white/5 border border-white/10 rounded-lg overflow-x-auto flex justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
