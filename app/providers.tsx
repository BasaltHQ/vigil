"use client";

import { useEffect } from "react";
import { ThirdwebProvider } from "thirdweb/react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress known Thirdweb nested button hydration warnings from popping up in the dev overlay
    const originalError = console.error;
    console.error = (...args) => {
      const msg = args[0];
      if (typeof msg === 'string') {
        if (
          msg.includes("cannot be a descendant of <button>") ||
          msg.includes("cannot contain a nested <button>") ||
          msg.includes("This will cause a hydration error") ||
          msg.includes("Warning: Expected server HTML to contain a matching")
        ) {
          return;
        }
      }
      originalError.call(console, ...args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <ThirdwebProvider>
      {children}
    </ThirdwebProvider>
  );
}
