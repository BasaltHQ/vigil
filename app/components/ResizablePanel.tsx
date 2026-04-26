"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface ResizablePanelProps {
  children: ReactNode;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
}

export default function ResizablePanel({
  children,
  defaultSize = 50,
  minSize = 20,
  maxSize = 80,
  onResize,
}: ResizablePanelProps) {
  const [size, setSize] = useState(defaultSize);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const container = panelRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newSize = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newSize >= minSize && newSize <= maxSize) {
        setSize(newSize);
        onResize?.(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minSize, maxSize, onResize]);

  return (
    <div
      ref={panelRef}
      className="relative h-full"
      style={{ width: `${size}%` }}
    >
      {children}
      <div
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-0 w-1 bg-gradient-to-b from-transparent via-red-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="glass-panel px-1 py-2 rounded">
            <div className="flex flex-col gap-0.5">
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <div className="w-1 h-1 bg-red-500 rounded-full" />
              <div className="w-1 h-1 bg-red-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 