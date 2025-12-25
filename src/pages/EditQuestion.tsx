import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { adminAPI } from "@/utils/api";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { MathPreview } from "@/components/MathPreview";

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    topic: "",
    chapter: "",
    class: "11" as "11" | "12",

    difficulty: "easy",
    questionType: "practice",
  });

  useEffect(() => {
    if (id) loadQuestion();
  }, [id]);

  const loadQuestion = async () => {
    try {
      const res = await adminAPI.getQuestionById(id!);

      if (res.data.success) {
        const q = res.data.question;

        setForm((prev) => ({
          ...prev,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic,
          chapter: q.chapter,
          class: q.class.toString(),
          difficulty: q.difficulty || "easy",
          questionType: q.questionType || "practice",
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load question");
      navigate("/admin/questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        questionText: form.questionText,
        options: form.options,
        correctAnswer: form.correctAnswer,
        explanation: form.explanation,
        topic: form.topic,
        chapter: form.chapter,
        class: Number(form.class),
        difficulty: form.difficulty,
        questionType: form.questionType,
      };

      const res = await adminAPI.updateQuestion(id!, payload);

      if (res.data.success) {
        toast.success("Question updated!");
        navigate("/admin/questions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ============================
  // FINAL RETURN BLOCK
  // ============================
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Two columns layout */}
      <div className="pt-24 container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT — FORM */}
        <div className="max-w-2xl">
          <button
            onClick={() => navigate("/admin/questions")}
            className="flex items-center gap-2 mb-6 text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <h1 className="text-3xl font-display font-bold mb-6">
            Edit Question
          </h1>

          <div className="space-y-4 bg-card p-6 rounded-2xl shadow-md">
            {/* Question */}
            <div>
              <Label>Question Text</Label>
              <Textarea
                value={form.questionText}
                rows={3}
                onChange={(e) =>
                  setForm({ ...form, questionText: e.target.value })
                }
              />
            </div>

            {/* Options */}
            <div>
              <Label>Options</Label>
              {form.options.map((opt, i) => (
                <Input
                  key={i}
                  className="mb-3"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...form.options];
                    newOptions[i] = e.target.value;
                    setForm({ ...form, options: newOptions });
                  }}
                />
              ))}
            </div>

            {/* Topic */}
            <div>
              <Label>Topic</Label>
              <Input
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              />
            </div>

            {/* Chapter */}
            <div>
              <Label>Chapter</Label>
              <Input
                value={form.chapter}
                onChange={(e) => setForm({ ...form, chapter: e.target.value })}
              />
            </div>

            {/* Class */}
            <div>
              <Label>Class</Label>
              <select
                className="w-full mt-1 p-2 rounded-xl border bg-background"
                value={form.class}
                onChange={(e) =>
                  setForm({ ...form, class: e.target.value as "11" | "12" })
                }
              >
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <Label>Difficulty</Label>
              <select
                className="w-full mt-1 p-2 rounded-xl border bg-background"
                value={form.difficulty}
                onChange={(e) =>
                  setForm({ ...form, difficulty: e.target.value })
                }
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <Label>Question Type</Label>
              <select
                className="w-full mt-1 p-2 rounded-xl border bg-background"
                value={form.questionType}
                onChange={(e) =>
                  setForm({ ...form, questionType: e.target.value })
                }
              >
                <option value="practice">Practice</option>
                <option value="qod">Question of the Day</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
              </select>
            </div>

            {/* Correct Answer */}
            <div>
              <Label>Correct Answer (0-3)</Label>
              <Input
                type="number"
                value={form.correctAnswer}
                onChange={(e) =>
                  setForm({ ...form, correctAnswer: Number(e.target.value) })
                }
              />
            </div>

            {/* Explanation */}
            <div>
              <Label>Explanation</Label>
              <Textarea
                value={form.explanation}
                rows={3}
                onChange={(e) =>
                  setForm({ ...form, explanation: e.target.value })
                }
              />
            </div>

            <Button className="w-full btn-gradient mt-4" onClick={handleSave}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Question"
              )}
            </Button>
          </div>
        </div>

        {/* RIGHT — LIVE PREVIEW */}
        <div className="bg-card p-6 rounded-2xl shadow-md h-fit sticky top-24">
          <h2 className="text-xl font-semibold mb-4">Live Preview</h2>

          <div className="space-y-6">
            <div>
              <Label className="text-muted-foreground">Question:</Label>
              <MathPreview content={form.questionText} />
            </div>

            <div>
              <Label className="text-muted-foreground">Options:</Label>
              {form.options.map((opt, i) => (
                <MathPreview key={i} content={`${i + 1}. ${opt}`} />
              ))}
            </div>

            <div>
              <Label className="text-muted-foreground">Explanation:</Label>
              <MathPreview content={form.explanation} />
            </div>
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
                {form.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-secondary text-xs">
                {form.questionType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
