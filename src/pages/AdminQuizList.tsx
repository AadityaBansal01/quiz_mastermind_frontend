// src/pages/AdminQuizzes.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { adminAPI } from "@/utils/api";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileQuestion,
  Trash2,
  Loader2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  class: number;
  duration: number;
  quizType: string;
  scheduledDate?: string;
  isActive: boolean;
  questions?: any[];
}

export default function AdminQuizzes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [filters, setFilters] = useState({
    class: "all",
    type: "all",
    status: "all",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filters]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getQuizzes();
      if (response.data.success) {
        setQuizzes(response.data.quizzes || []);
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...quizzes];

    if (filters.class !== "all") {
      list = list.filter((q) => q.class.toString() === filters.class);
    }

    if (filters.type !== "all") {
      list = list.filter((q) => q.quizType === filters.type);
    }

    if (filters.status !== "all") {
      const active = filters.status === "active";
      list = list.filter((q) => q.isActive === active);
    }

    setFilteredQuizzes(list);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await adminAPI.deleteQuiz(deleteId);

      if (response.data.success) {
        toast.success("Quiz deleted successfully");
        setQuizzes((prev) => prev.filter((q) => q._id !== deleteId));
        setDeleteId(null);
      }
    } catch (error: any) {
      console.error("Failed to delete quiz:", error);
      toast.error(error.response?.data?.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "weekly":
        return "bg-primary/10 text-primary";
      case "biweekly":
        return "bg-accent/10 text-accent";
      case "competency":
        return "bg-success/10 text-success";
      case "practice":
      default:
        return "bg-info/10 text-info";
    }
  };

  const getStatusBadge = (isActive: boolean) =>
    isActive
      ? "bg-success/10 text-success"
      : "bg-destructive/10 text-destructive";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  Manage Quizzes
                </h1>
                <p className="text-muted-foreground">
                  View and manage all created quizzes
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/admin/create-quiz")}
              className="btn-gradient"
            >
              <FileQuestion className="w-4 h-4 mr-2" />
              Create New Quiz
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Filters</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <SelectFilter
                label="Class"
                value={filters.class}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, class: value }))
                }
                options={[
                  { value: "all", label: "All Classes" },
                  { value: "11", label: "Class 11" },
                  { value: "12", label: "Class 12" },
                ]}
              />

              <SelectFilter
                label="Quiz Type"
                value={filters.type}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, type: value }))
                }
                options={[
                  { value: "all", label: "All Types" },
                  { value: "practice", label: "Practice" },
                  { value: "weekly", label: "Weekly" },
                  { value: "biweekly", label: "Biweekly" },
                  { value: "competency", label: "Competency" },
                ]}
              />

              <SelectFilter
                label="Status"
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredQuizzes.length} of {quizzes.length} quizzes
              </span>
              {(filters.class !== "all" ||
                filters.type !== "all" ||
                filters.status !== "all") && (
                <button
                  onClick={() =>
                    setFilters({ class: "all", type: "all", status: "all" })
                  }
                  className="text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Quiz List */}
          <div className="space-y-4">
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="bg-card rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h2 className="font-semibold text-lg mb-1">
                        {quiz.title}
                      </h2>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-3 py-1 rounded-full bg-secondary">
                          Class {quiz.class}
                        </span>
                        <span
                          className={
                            "px-3 py-1 rounded-full " +
                            getTypeBadge(quiz.quizType)
                          }
                        >
                          {quiz.quizType}
                        </span>
                        <span
                          className={
                            "px-3 py-1 rounded-full " +
                            getStatusBadge(quiz.isActive)
                          }
                        >
                          {quiz.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(quiz.scheduledDate)}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {quiz.duration} min
                      </p>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <FileQuestion className="w-4 h-4" />
                        {quiz.questions?.length || 0} questions
                      </p>

                      <div className="flex gap-2 mt-2">
                        {/* EDIT BUTTON */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/edit-quiz/${quiz._id}`)
                          }
                          className="rounded-xl"
                        >
                          ✏️ Edit
                        </Button>

                        {/* DELETE BUTTON */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteId(quiz._id)}
                          className="rounded-xl text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
                <FileQuestion className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg mb-2">No quizzes found</h3>
                <p className="text-muted-foreground mb-4">
                  Create a new quiz to see it listed here.
                </p>
                <Button
                  onClick={() => navigate("/admin/create-quiz")}
                  className="btn-gradient"
                >
                  <FileQuestion className="w-4 h-4 mr-2" />
                  Create First Quiz
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The quiz and all its attempts will
              no longer be available to students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Small helper component for select filters (to keep code clean)
interface SelectFilterProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

function SelectFilter({ label, value, onChange, options }: SelectFilterProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <select
        className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
