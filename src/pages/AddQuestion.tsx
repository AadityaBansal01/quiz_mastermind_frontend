import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { MathRenderer } from "@/components/MathRenderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminAPI } from "@/utils/api";
import {
  FileQuestion,
  CheckCircle2,
  Plus,
  Save,
  ArrowLeft,
  Eye,
  Code,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  class: string;
  chapter: string;
  topic: string;
  difficulty: string;
  questionType: string;
}

const initialForm: QuestionForm = {
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: -1,
  explanation: "",
  class: "",
  chapter: "",
  topic: "",
  difficulty: "medium",
  questionType: "practice",
};

const MATH_EXAMPLES = [
  { label: "Fraction", code: "\\frac{a}{b}", display: "$\\frac{a}{b}$" },
  { label: "Power", code: "x^2", display: "$x^2$" },
  { label: "Square Root", code: "\\sqrt{x}", display: "$\\sqrt{x}$" },
  {
    label: "Integral",
    code: "\\int_{a}^{b} f(x) dx",
    display: "$\\int_{a}^{b} f(x) dx$",
  },
  { label: "Sum", code: "\\sum_{i=1}^{n} i", display: "$\\sum_{i=1}^{n} i$" },
  {
    label: "Limit",
    code: "\\lim_{x \\to \\infty}",
    display: "$\\lim_{x \\to \\infty}$",
  },
  {
    label: "Sin/Cos",
    code: "\\sin\\theta, \\cos\\theta",
    display: "$\\sin\\theta, \\cos\\theta$",
  },
  {
    label: "Greek",
    code: "\\alpha, \\beta, \\pi, \\theta",
    display: "$\\alpha, \\beta, \\pi, \\theta$",
  },
];

export default function AddQuestion() {
  const navigate = useNavigate();
  const [form, setForm] = useState<QuestionForm>(initialForm);
  const [questionsAdded, setQuestionsAdded] = useState(0);
  const [activeTab, setActiveTab] = useState("write");
  const [saving, setSaving] = useState(false);

  // Auto-save draft every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (form.questionText) {
        localStorage.setItem("mathquiz_question_draft", JSON.stringify(form));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [form]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("mathquiz_question_draft");
    if (draft) {
      const parsed = JSON.parse(draft);
      setForm(parsed);
      toast.info("Draft loaded");
    }
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const insertMathSymbol = (
    code: string,
    field: "questionText" | "explanation" | number
  ) => {
    const insertion = `$${code}$`;
    if (typeof field === "number") {
      const newOptions = [...form.options];
      newOptions[field] = newOptions[field] + insertion;
      setForm({ ...form, options: newOptions });
    } else {
      setForm({ ...form, [field]: form[field] + insertion });
    }
  };

  const validateForm = (): string | null => {
    if (!form.questionText.trim()) return "Question text is required";
    if (form.options.some((opt) => !opt.trim()))
      return "All options are required";
    if (form.correctAnswer === -1) return "Please select the correct answer";
    if (!form.explanation.trim()) return "Explanation is required";
    if (!form.class) return "Please select a class";
    if (!form.chapter.trim()) return "Chapter is required";
    if (!form.topic.trim()) return "Topic is required";
    return null;
  };

  const handleSubmit = async (addAnother: boolean = false) => {
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setSaving(true);

      // Prepare question data for backend
      const questionData = {
        questionText: form.questionText,
        options: form.options,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
        class: parseInt(form.class),
        chapter: form.chapter,
        topic: form.topic,
        difficulty: form.difficulty,
        questionType: form.questionType,
      };

      // Save to backend
      const response = await adminAPI.createQuestion(questionData);

      if (response.data.success) {
        localStorage.removeItem("mathquiz_question_draft");
        toast.success("Question added successfully!");
        setQuestionsAdded((prev) => prev + 1);

        if (addAnother) {
          setForm(initialForm);
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          navigate("/admin/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Failed to save question:", error);
      toast.error(error.response?.data?.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold">Add Question</h1>
              <p className="text-muted-foreground">
                Create a new math question with LaTeX support
              </p>
            </div>
            {questionsAdded > 0 && (
              <div className="ml-auto px-4 py-2 rounded-xl bg-success/10 text-success font-medium">
                {questionsAdded} question{questionsAdded > 1 ? "s" : ""} added
                this session
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card rounded-2xl shadow-lg p-8 animate-fade-in">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="write"
                    className="flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    Write
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Math Reference */}
              <div className="mb-6 p-4 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    LaTeX Math Reference
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Wrap math expressions in $ for inline or $$ for block.
                  Example: $x^2$ or $$\frac{"a"}
                  {"b"}$$
                </p>
                <div className="flex flex-wrap gap-2">
                  {MATH_EXAMPLES.map((ex) => (
                    <Tooltip key={ex.label}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() =>
                            insertMathSymbol(ex.code, "questionText")
                          }
                          className="px-2 py-1 rounded-lg bg-background hover:bg-primary/10 text-xs font-mono transition-colors"
                        >
                          <MathRenderer text={ex.display} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {ex.label}: <code>{ex.code}</code>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <Label
                    htmlFor="questionText"
                    className="text-base font-semibold"
                  >
                    Question Text *
                  </Label>
                  <Textarea
                    id="questionText"
                    value={form.questionText}
                    onChange={(e) =>
                      setForm({ ...form, questionText: e.target.value })
                    }
                    placeholder="Enter your question here. Use $...$ for inline math, $$...$$ for block math.&#10;Example: What is the value of $\sin^2\theta + \cos^2\theta$?"
                    rows={4}
                    className="rounded-xl font-mono text-sm"
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">
                    Options * (use $ for math)
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {form.options.map((option, index) => (
                      <div key={index} className="relative">
                        <Input
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1} (e.g., $x^2$)`}
                          className={`pr-12 rounded-xl font-mono text-sm ${
                            form.correctAnswer === index
                              ? "border-success bg-success/5"
                              : ""
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({ ...form, correctAnswer: index })
                          }
                          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                            form.correctAnswer === index
                              ? "bg-success text-success-foreground"
                              : "hover:bg-secondary"
                          }`}
                          title="Mark as correct"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the checkmark to mark the correct answer
                  </p>
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <Label
                    htmlFor="explanation"
                    className="text-base font-semibold"
                  >
                    Explanation * (supports LaTeX)
                  </Label>
                  <Textarea
                    id="explanation"
                    value={form.explanation}
                    onChange={(e) =>
                      setForm({ ...form, explanation: e.target.value })
                    }
                    placeholder="Explain the step-by-step solution using LaTeX math notation..."
                    rows={3}
                    className="rounded-xl font-mono text-sm"
                  />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select
                      value={form.class}
                      onValueChange={(value) =>
                        setForm({ ...form, class: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="11">Class 11</SelectItem>
                        <SelectItem value="12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Difficulty *</Label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(value) =>
                        setForm({ ...form, difficulty: value })
                      }
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chapter">Chapter *</Label>
                    <Input
                      id="chapter"
                      value={form.chapter}
                      onChange={(e) =>
                        setForm({ ...form, chapter: e.target.value })
                      }
                      placeholder="e.g., Trigonometry"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic *</Label>
                    <Input
                      id="topic"
                      value={form.topic}
                      onChange={(e) =>
                        setForm({ ...form, topic: e.target.value })
                      }
                      placeholder="e.g., Identities"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Question Type *</Label>
                  <Select
                    value={form.questionType}
                    onValueChange={(value) =>
                      setForm({ ...form, questionType: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="practice">Practice</SelectItem>
                      <SelectItem value="qod">Question of the Day</SelectItem>
                      <SelectItem value="weekly">Weekly Quiz</SelectItem>
                      <SelectItem value="biweekly">Biweekly Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                    className="flex-1 btn-gradient"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Question
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={saving}
                    variant="outline"
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Save & Add Another
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Live Preview */}
            <div className="bg-card rounded-2xl shadow-lg p-8 animate-fade-in delay-100 sticky top-24 h-fit">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5" />
                Live Preview
              </h2>

              {form.questionText ? (
                <div className="space-y-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {form.topic && (
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {form.topic}
                      </span>
                    )}
                    {form.difficulty && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          form.difficulty === "easy"
                            ? "bg-success/10 text-success"
                            : form.difficulty === "medium"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {form.difficulty}
                      </span>
                    )}
                    {form.class && (
                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        Class {form.class}
                      </span>
                    )}
                  </div>

                  {/* Question */}
                  <div className="text-lg font-medium leading-relaxed">
                    <MathRenderer text={form.questionText} block />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {form.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border ${
                          form.correctAnswer === idx
                            ? "border-success bg-success/5"
                            : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              form.correctAnswer === idx
                                ? "bg-success text-success-foreground"
                                : "bg-secondary"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>

                          <div className="flex-1">
                            {opt ? (
                              <MathRenderer text={opt} />
                            ) : (
                              <span className="text-muted-foreground">
                                Option {idx + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  {form.explanation && (
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <h4 className="font-semibold mb-2">Explanation:</h4>
                      <MathRenderer text={form.explanation} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileQuestion className="w-16 h-16 mb-4 opacity-50" />
                  <p>Start typing to see live preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
