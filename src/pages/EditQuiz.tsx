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

// ⬇️ Only ONE correct import here
import QuestionSelectorDrawer from "@/components/quiz/QuestionSelectorDrawer";


// ✅ ADD DND IMPORTS HERE (B1)
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    class: "",
    duration: "",
    scheduledDate: "",
    questions: [],
  });

const [drawerOpen, setDrawerOpen] = useState(false);


  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const res = await adminAPI.getQuizById(id);
      if (res.data.success) {
        const q = res.data.quiz;

        setForm({
          title: q.title,
          description: q.description,
          class: q.class.toString(),
          duration: q.duration.toString(),
          scheduledDate: q.scheduledDate?.split("T")[0] || "",
          questions: q.questions || [], 
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updated = {
        title: form.title,
        description: form.description,
        class: parseInt(form.class),
        duration: parseInt(form.duration),
        scheduledDate: new Date(form.scheduledDate).toISOString(),
      };

      const res = await adminAPI.updateQuiz(id, updated);

      if (res.data.success) {
        toast.success("Quiz updated!");
        navigate("/admin/quizzes");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update quiz");
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

const handleAddQuestions = async (selectedIds: string[]) => {
  // KEEP existing questions and append new ones
  const existing = form.questions.map((q: any) => q._id);

  const merged = [...new Set([...existing, ...selectedIds])];

  try {
    const res = await adminAPI.updateQuizQuestions(id!, merged);

    if (res.data.success) {
      toast.success("Questions added!");
      setForm({ ...form, questions: res.data.quiz.questions });
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to update questions");
  }
};

const handleReorder = async (result: DropResult) => {
  if (!result.destination) return;

  const items = Array.from(form.questions);
  const [moved] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, moved);

  // Update UI immediately
  setForm({ ...form, questions: items });

  // Update backend
  try {
    const ids = items.map((q: any) => q._id);
    await adminAPI.updateQuizQuestions(id!, ids);
  } catch (err) {
    console.error(err);
    toast.error("Failed to reorder questions");
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => navigate("/admin/quizzes")}
          className="flex items-center gap-2 mb-6 text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-3xl font-display font-bold mb-6">Edit Quiz</h1>

        <div className="space-y-4 bg-card p-6 rounded-2xl shadow-md">
          <div>
            <Label>Quiz Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Class</Label>
            <Input
              type="number"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
            />
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>

          <div>
            <Label>Scheduled Date</Label>
            <Input
              type="date"
              value={form.scheduledDate}
              onChange={(e) =>
                setForm({ ...form, scheduledDate: e.target.value })
              }
            />
          </div>

{/* Questions List */}
<div>
 <div className="flex items-center justify-between mb-3">
  <Label className="text-base">Questions in this Quiz</Label>

  <Button
    size="sm"
    onClick={() => setDrawerOpen(true)}
  >
    Add / Manage Questions
  </Button>
</div>



 {form.questions && form.questions.length > 0 ? (
  <DragDropContext onDragEnd={handleReorder}>
    <Droppable droppableId="quiz-questions">
      {(provided) => (
        <div
          className="space-y-3 mt-2"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {form.questions.map((q: any, index: number) => (
            <Draggable key={q._id} draggableId={q._id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`border rounded-xl p-4 bg-secondary/20 flex items-start gap-3 ${
                    snapshot.isDragging ? "shadow-xl ring-2 ring-primary/30" : ""
                  }`}
                >
                  {/* Drag handle */}
                  <div {...provided.dragHandleProps} className="cursor-grab mt-1">
                    <span className="text-muted-foreground">≡</span>
                  </div>

                  {/* Question text */}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {index + 1}. {q.questionText}
                    </p>

                    <button
                      className="text-primary mt-2 underline"
                      onClick={() => navigate(`/admin/edit-question/${q._id}`)}
                    >
                      Edit Question
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    className="text-destructive hover:underline text-sm"
                    onClick={async () => {
                      const updated = form.questions.filter((x: any) => x._id !== q._id);
                      setForm({ ...form, questions: updated });

                      try {
                        const ids = updated.map((x: any) => x._id);
                        await adminAPI.updateQuizQuestions(id!, ids);
                        toast.success("Question removed");
                      } catch (err) {
                        console.error(err);
                        toast.error("Failed to remove question");
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </Draggable>
          ))}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  </DragDropContext>
) : (

    <p className="text-muted-foreground mt-2">
      No questions found in this quiz.
    </p>
  )}

<QuestionSelectorDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  onSelect={handleAddQuestions}
/>


</div>






          <Button
            className="w-full btn-gradient mt-4"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
