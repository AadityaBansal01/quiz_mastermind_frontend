// src/pages/AdminConcepts.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cotdAPI } from "@/utils/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Calendar,
  BookOpen,
} from "lucide-react";

interface Concept {
  _id: string;
  title: string;
  formula: string;
  explanation: string;
  example?: string;
  class: number;
  chapter: string;
  topic: string;
  scheduledDate: string;
}

export default function AdminConcepts() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [filterClass, setFilterClass] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    formula: "",
    explanation: "",
    example: "",
    class: "11",
    chapter: "",
    topic: "",
    scheduledDate: "",
  });

  const loadConcepts = async (classFilter?: string) => {
    try {
      setLoading(true);
      const classNum =
        classFilter && classFilter !== "all" ? Number(classFilter) : undefined;
      const res = await cotdAPI.getAllConcepts(classNum);
      if (res.data.success) {
        setConcepts(res.data.concepts || []);
      }
    } catch (err) {
      console.error("Failed to fetch concepts:", err);
      toast.error("Failed to load concepts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConcepts(filterClass);
  }, [filterClass]);

  const resetForm = () => {
    setFormData({
      title: "",
      formula: "",
      explanation: "",
      example: "",
      class: "11",
      chapter: "",
      topic: "",
      scheduledDate: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    const {
      title,
      formula,
      explanation,
      class: cls,
      chapter,
      topic,
      scheduledDate,
    } = formData;

    if (
      !title ||
      !formula ||
      !explanation ||
      !cls ||
      !chapter ||
      !topic ||
      !scheduledDate
    ) {
      toast.error("Please fill all required fields (*)");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        class: Number(formData.class),
      };

      if (editingId) {
        const res = await cotdAPI.updateConcept(editingId, payload);
        if (res.data.success) {
          toast.success("Concept updated");
        }
      } else {
        const res = await cotdAPI.createConcept(payload);
        if (res.data.success) {
          toast.success("Concept created");
        }
      }

      resetForm();
      await loadConcepts(filterClass);
    } catch (err: any) {
      console.error("Save concept error:", err);
      toast.error(
        err.response?.data?.message || "Failed to save concept"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (concept: Concept) => {
    setEditingId(concept._id);
    setFormData({
      title: concept.title,
      formula: concept.formula,
      explanation: concept.explanation,
      example: concept.example || "",
      class: String(concept.class),
      chapter: concept.chapter,
      topic: concept.topic,
      scheduledDate: concept.scheduledDate.slice(0, 10), // yyyy-mm-dd
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this concept?")) return;
    try {
      await cotdAPI.deleteConcept(id);
      toast.success("Concept deleted");
      await loadConcepts(filterClass);
    } catch (err) {
      console.error("Delete concept error:", err);
      toast.error("Failed to delete concept");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>

        <h1 className="font-display text-3xl font-bold mb-2">
          Manage Concepts of the Day
        </h1>
        <p className="text-muted-foreground mb-6">
          Create, edit and delete daily formulas/concepts for each class.
        </p>

        {/* Form */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">
              {editingId ? "Edit Concept" : "Create New Concept"}
            </h2>
            {editingId && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetForm}
              >
                Cancel Edit
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Class *</Label>
              <Select
                value={formData.class}
                onValueChange={(value) =>
                  setFormData({ ...formData, class: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chapter *</Label>
              <Input
                value={formData.chapter}
                onChange={(e) =>
                  setFormData({ ...formData, chapter: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Topic *</Label>
              <Input
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Scheduled Date *</Label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduledDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Example (optional)</Label>
              <Input
                value={formData.example}
                onChange={(e) =>
                  setFormData({ ...formData, example: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Label>Formula / Concept (supports LaTeX)</Label>
              <Input
                value={formData.formula}
                onChange={(e) =>
                  setFormData({ ...formData, formula: e.target.value })
                }
                placeholder="e.g. a^2 + b^2 = c^2"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Explanation *</Label>
              <textarea
                className="w-full rounded-md border bg-background p-2 text-sm"
                rows={3}
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    explanation: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Update Concept" : "Create Concept"}
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="bg-card rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-lg">
                Scheduled Concepts
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Filter by Class:
              </span>
              <Select
                value={filterClass}
                onValueChange={setFilterClass}
              >
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : concepts.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No concepts scheduled yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {concepts.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                        Class {c.class}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(c.scheduledDate)}
                      </span>
                    </div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.chapter} • {c.topic}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(c)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(c._id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
