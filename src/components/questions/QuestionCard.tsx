import { MathPreview } from "@/components/MathPreview";
import { Button } from "@/components/ui/button";

interface QuestionCardProps {
  question: any;
  onSelect?: () => void;
  showSelect?: boolean;
}

export function QuestionCard({ question, onSelect, showSelect = false }: QuestionCardProps) {
  return (
    <div className="border rounded-2xl p-5 bg-card hover:shadow-lg transition-shadow">
      {/* Question */}
      <div className="mb-3">
        <p className="font-semibold mb-1 text-primary">Question</p>
        <MathPreview content={question.questionText} />
      </div>

      {/* Options */}
      <div className="mb-3">
        <p className="font-semibold mb-1 text-primary">Options</p>
        <ul className="list-disc pl-6">
          {question.options.map((opt: string, i: number) => (
            <li key={i}>
              <MathPreview content={`${i + 1}. ${opt}`} />
            </li>
          ))}
        </ul>
      </div>

      {/* Chips */}
      <div className="flex gap-2 mt-3 text-xs">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full">
          {question.difficulty}
        </span>
        <span className="px-3 py-1 bg-secondary rounded-full">
          {question.questionType}
        </span>
        <span className="px-3 py-1 bg-muted rounded-full">
          Class {question.class}
        </span>
      </div>

      {/* Select Button (Only if passed) */}
      {showSelect && (
        <Button
          className="mt-4 w-full"
          variant="secondary"
          onClick={onSelect}
        >
          Add to Quiz
        </Button>
      )}
    </div>
  );
}
