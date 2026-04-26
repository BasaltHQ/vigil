"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Tool {
  name: string;
  category: string;
  description: string;
  parameters: Record<string, any>;
  usage_stats: {
    execution_count: number;
    last_execution_time: number | null;
  };
}

interface ToolExecution {
  id: string;
  tool_name: string;
  parameters: Record<string, any>;
  result: any;
  status: "success" | "error";
  timestamp: string;
}

export default function ToolWorkbench() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolParams, setToolParams] = useState<Record<string, any>>({});
  const [executions, setExecutions] = useState<ToolExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch tools list
  const fetchTools = async () => {
    try {
      const response = await fetch("/api/tools");
      if (response.ok) {
        const data = await response.json();
        setTools(data.tools);
        if (data.tools.length > 0 && !selectedTool) {
          selectTool(data.tools[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  // Select a tool and initialize parameters
  const selectTool = (tool: Tool) => {
    setSelectedTool(tool);
    const initialParams: Record<string, any> = {};
    
    Object.entries(tool.parameters).forEach(([key, param]) => {
      if (param.default !== undefined) {
        initialParams[key] = param.default;
      } else if (param.type === "string") {
        initialParams[key] = "";
      } else if (param.type === "number" || param.type === "integer") {
        initialParams[key] = 0;
      } else if (param.type === "boolean") {
        initialParams[key] = false;
      } else if (param.type === "array") {
        initialParams[key] = [];
      } else if (param.type === "object") {
        initialParams[key] = {};
      }
    });
    
    setToolParams(initialParams);
  };

  // Execute tool
  const executeTool = async () => {
    if (!selectedTool) return;
    
    setIsExecuting(true);
    
    try {
      // Mock execution - replace with actual API call
      const execution: ToolExecution = {
        id: `exec-${Date.now()}`,
        tool_name: selectedTool.name,
        parameters: { ...toolParams },
        result: {
          message: `Successfully executed ${selectedTool.name}`,
          data: { example: "result data" }
        },
        status: "success",
        timestamp: new Date().toISOString(),
      };
      
      setExecutions(prev => [execution, ...prev]);
    } catch (error) {
      const execution: ToolExecution = {
        id: `exec-${Date.now()}`,
        tool_name: selectedTool.name,
        parameters: { ...toolParams },
        result: { error: error instanceof Error ? error.message : "Unknown error" },
        status: "error",
        timestamp: new Date().toISOString(),
      };
      
      setExecutions(prev => [execution, ...prev]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(tools.map(t => t.category)))];
  
  // Filter tools by category
  const filteredTools = selectedCategory === "all" 
    ? tools 
    : tools.filter(t => t.category === selectedCategory);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      navigation: "🧭",
      document: "📄",
      research: "🔍",
      compliance: "⚖️",
      transaction: "💼",
      governance: "🏛️",
      utility: "🔧",
      preset: "🤖",
    };
    return icons[category] || "📦";
  };

  // Render parameter input
  const renderParameterInput = (key: string, param: any) => {
    const value = toolParams[key];
    
    if (param.enum) {
      return (
        <select
          value={value}
          onChange={(e) => setToolParams({ ...toolParams, [key]: e.target.value })}
          className="w-full p-2 bg-base01 rounded-lg"
        >
          {param.enum.map((option: string) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    
    switch (param.type) {
      case "boolean":
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setToolParams({ ...toolParams, [key]: e.target.checked })}
              className="mr-2"
            />
            <span>{value ? "Yes" : "No"}</span>
          </label>
        );
        
      case "number":
      case "integer":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setToolParams({ ...toolParams, [key]: Number(e.target.value) })}
            className="w-full p-2 bg-base01 rounded-lg"
          />
        );
        
      case "array":
        return (
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                setToolParams({ ...toolParams, [key]: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="w-full p-2 bg-base01 rounded-lg font-mono text-sm"
            rows={3}
          />
        );
        
      case "object":
        return (
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                setToolParams({ ...toolParams, [key]: JSON.parse(e.target.value) });
              } catch {}
            }}
            className="w-full p-2 bg-base01 rounded-lg font-mono text-sm"
            rows={4}
          />
        );
        
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setToolParams({ ...toolParams, [key]: e.target.value })}
            className="w-full p-2 bg-base01 rounded-lg"
            placeholder={param.description}
          />
        );
    }
  };

  return (
    <div className="h-full flex">
      {/* Left sidebar - Tool list */}
      <div className="w-80 bg-base02 border-r border-base01 flex flex-col">
        <div className="p-4 border-b border-base01">
          <h2 className="text-xl font-bold mb-4">🔧 Tool Workbench</h2>
          
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-base01 rounded-lg"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Tool list */}
        <div className="flex-1 overflow-auto">
          {filteredTools.map((tool) => (
            <div
              key={tool.name}
              onClick={() => selectTool(tool)}
              className={`p-4 border-b border-base01 cursor-pointer hover:bg-base01 transition-colors ${
                selectedTool?.name === tool.name ? "bg-base01" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getCategoryIcon(tool.category)}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500">{tool.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                  <div className="text-xs text-gray-600 mt-2">
                    Used {tool.usage_stats.execution_count} times
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Middle - Tool configuration */}
      <div className="flex-1 flex flex-col">
        {selectedTool ? (
          <>
            {/* Tool header */}
            <div className="p-6 border-b border-base01 bg-base02">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getCategoryIcon(selectedTool.category)}</span>
                <div>
                  <h1 className="text-2xl font-bold">{selectedTool.name}</h1>
                  <p className="text-gray-400">{selectedTool.description}</p>
                </div>
              </div>
            </div>
            
            {/* Parameters */}
            <div className="flex-1 p-6 overflow-auto">
              <h2 className="text-lg font-semibold mb-4">Parameters</h2>
              <div className="space-y-4">
                {Object.entries(selectedTool.parameters).map(([key, param]) => (
                  <div key={key}>
                    <label className="block mb-2">
                      <span className="font-medium">
                        {key}
                        {param.required && <span className="text-red-400 ml-1">*</span>}
                      </span>
                      {param.description && (
                        <span className="text-sm text-gray-500 ml-2">
                          - {param.description}
                        </span>
                      )}
                    </label>
                    {renderParameterInput(key, param)}
                  </div>
                ))}
              </div>
              
              {/* Execute button */}
              <button
                onClick={executeTool}
                disabled={isExecuting}
                className="mt-6 w-full p-3 bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isExecuting ? "Executing..." : "Execute Tool"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🔧</div>
              <p className="text-xl">Select a tool to configure</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Right - Execution history */}
      <div className="w-96 bg-base02 border-l border-base01 flex flex-col">
        <div className="p-4 border-b border-base01">
          <h3 className="text-lg font-bold">Execution History</h3>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {executions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No executions yet
            </div>
          ) : (
            <div className="space-y-4">
              {executions.map((exec) => (
                <div
                  key={exec.id}
                  className={`p-4 rounded-lg ${
                    exec.status === "success" ? "bg-green-900/20" : "bg-red-900/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{exec.tool_name}</h4>
                    <span className={`text-sm ${
                      exec.status === "success" ? "text-green-400" : "text-red-400"
                    }`}>
                      {exec.status === "success" ? "✅ Success" : "❌ Error"}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {new Date(exec.timestamp).toLocaleString()}
                  </div>
                  
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                      Parameters
                    </summary>
                    <pre className="mt-2 p-2 bg-base01 rounded overflow-x-auto">
                      {JSON.stringify(exec.parameters, null, 2)}
                    </pre>
                  </details>
                  
                  <details className="text-sm mt-2">
                    <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                      Result
                    </summary>
                    <pre className="mt-2 p-2 bg-base01 rounded overflow-x-auto">
                      {JSON.stringify(exec.result, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
