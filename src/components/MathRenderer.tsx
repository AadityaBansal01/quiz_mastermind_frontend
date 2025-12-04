import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  text: string;
  block?: boolean;
}

// Renders text with LaTeX math expressions
// Inline math: $x^2$ or \(x^2\)
// Block math: $$x^2$$ or \[x^2\]
export function MathRenderer({ text, block = false }: MathRendererProps) {
  if (!text) return null;

  // Function to parse and render text with math expressions
  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    // Pattern to match both inline ($...$) and block ($$...$$) math
    const mathPattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\[[\s\S]*?\\\]|\\\(.*?\\\))/g;
    
    let match;
    let lastIndex = 0;

    while ((match = mathPattern.exec(text)) !== null) {
      // Add text before the math expression
      if (match.index > lastIndex) {
        parts.push(
          <span key={key++}>{text.slice(lastIndex, match.index)}</span>
        );
      }

      const mathStr = match[0];
      let latex = '';
      let isBlock = false;

      if (mathStr.startsWith('$$') && mathStr.endsWith('$$')) {
        latex = mathStr.slice(2, -2);
        isBlock = true;
      } else if (mathStr.startsWith('$') && mathStr.endsWith('$')) {
        latex = mathStr.slice(1, -1);
      } else if (mathStr.startsWith('\\[') && mathStr.endsWith('\\]')) {
        latex = mathStr.slice(2, -2);
        isBlock = true;
      } else if (mathStr.startsWith('\\(') && mathStr.endsWith('\\)')) {
        latex = mathStr.slice(2, -2);
      }

      try {
        if (isBlock) {
          parts.push(
            <div key={key++} className="my-2">
              <BlockMath math={latex} />
            </div>
          );
        } else {
          parts.push(
            <InlineMath key={key++} math={latex} />
          );
        }
      } catch (error) {
        // If LaTeX parsing fails, show the original text
        parts.push(<span key={key++} className="text-destructive">{mathStr}</span>);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last math expression
    if (lastIndex < text.length) {
      parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  if (block) {
    return <div className="math-content">{renderContent()}</div>;
  }

  return <span className="math-content">{renderContent()}</span>;
}

// Simple component for pure LaTeX input
export function MathBlock({ latex }: { latex: string }) {
  try {
    return <BlockMath math={latex} />;
  } catch {
    return <span className="text-destructive">Invalid LaTeX: {latex}</span>;
  }
}

export function MathInline({ latex }: { latex: string }) {
  try {
    return <InlineMath math={latex} />;
  } catch {
    return <span className="text-destructive">Invalid LaTeX: {latex}</span>;
  }
}
