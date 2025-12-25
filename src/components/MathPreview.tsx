import useMathJax from "@/hooks/useMathJax";

export function MathPreview({ content }: { content: string }) {
  useMathJax([content]);

  return (
    <div className="p-3 bg-secondary rounded-lg prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
