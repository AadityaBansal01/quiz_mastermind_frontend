import { useEffect } from "react";

declare global {
  interface Window {
    MathJax: {
      typesetPromise?: () => Promise<void>;
    };
  }
}

export default function useMathJax(dependencies: any[] = []) {
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) =>
        console.error("MathJax render error:", err)
      );
    }
  }, dependencies);
}
