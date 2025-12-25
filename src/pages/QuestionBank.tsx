import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MathRenderer } from "@/components/MathRenderer";
import { adminAPI } from "@/utils/api";
import {
  ArrowLeft,
  Search,
  Edit,
  Trash2,
  Plus,
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

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  chapter: string;
  class: number;
  difficulty: string;
  questionType: string;
  createdAt: string;
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
 const [filters, setFilters] = useState({
  class: "all",
  difficulty: "all",
  questionType: "all",
});

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewQuestion, setViewQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [filters, page]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

     const response = await adminAPI.getQuestions({
  class: filters.class !== "all" ? filters.class : undefined,
  difficulty: filters.difficulty !== "all" ? filters.difficulty : undefined,
  questionType:
    filters.questionType !== "all" ? filters.questionType : undefined,
  search: searchQuery || undefined,
  page,
  limit: 10,
});


      if (response.data.success) {
        setQuestions(response.data.questions);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchQuestions();
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await adminAPI.deleteQuestion(deleteId);

      if (response.data.success) {
  toast.success("Question deleted successfully");
  setDeleteId(null);
  fetchQuestions();   // ✅ refresh page correctly
}
    } catch (error: any) {
      console.error("Failed to delete question:", error);
      toast.error(error.response?.data?.message || "Failed to delete question");
    } finally {
      setDeleting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/10 text-success";
      case "medium":
        return "bg-warning/10 text-warning";
      case "hard":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-secondary";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "qod":
        return "bg-accent/10 text-accent";
      case "practice":
        return "bg-primary/10 text-primary";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const duplicateQuestion = async (q: Question) => {
    try {
      const payload = {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        chapter: q.chapter,
        class: q.class,
        difficulty: q.difficulty,
        questionType: q.questionType,
      };

      const res = await adminAPI.createQuestion(payload);

      if (res.data.success) {
        toast.success("Question duplicated");
        setQuestions([res.data.question, ...questions]); // insert at top
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to duplicate question");
    }
  };

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
                  Question Bank
                </h1>
                <p className="text-muted-foreground">
                  Manage all your questions
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/admin/add-question")}
              className="btn-gradient"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Filters</h2>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select
                value={filters.class}
                onValueChange={(value) =>
                  setFilters({ ...filters, class: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.difficulty}
                onValueChange={(value) =>
                  setFilters({ ...filters, difficulty: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Select
  value={filters.questionType}
  onValueChange={(value) =>
    setFilters({ ...filters, questionType: value })
  }
>

                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="qod">Question of the Day</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Biweekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {questions.length} of {total} questions
              </span>
              {(searchQuery ||
                filters.class !== "all" ||
                filters.difficulty !== "all" ||
                filters.questionType !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      class: "all",
                      difficulty: "all",
                      type: "all",
                    });
                  }}
                  className="text-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length > 0 ? (
              questions.map((question) => (
                <div
                  key={question._id}
                  className="bg-card rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {question.topic}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                          {question.chapter}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
                          {question.difficulty}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            question.questionType
                          )}`}
                        >
                          {question.questionType}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-secondary text-xs font-medium">
                          Class {question.class}
                        </span>
                      </div>

                      <div className="mb-4">
                        <MathRenderer text={question.questionText} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-xl border-2 ${
                              question.correctAnswer === index
                                ? "border-success bg-success/5"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  question.correctAnswer === index
                                    ? "bg-success text-success-foreground"
                                    : "bg-secondary"
                                }`}
                              >
                                {String.fromCharCode(65 + index)}
                              </span>
                              <MathRenderer text={option} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                   <div className="flex gap-2 ml-4">
  {/* VIEW BUTTON */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => setViewQuestion(question)}
    className="rounded-xl text-primary"
  >
    View
  </Button>

  {/* EDIT BUTTON */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => navigate(`/admin/edit-question/${question._id}`)}
    className="rounded-xl"
  >
    <Edit className="w-4 h-4" />
  </Button>

  {/* DELETE BUTTON */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => setDeleteId(question._id)}
    className="rounded-xl text-destructive hover:text-destructive"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>

                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Explanation:</span>{" "}
                      <MathRenderer text={question.explanation} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Created:{" "}
                      {new Date(question.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg mb-2">
                  No questions found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {questions.length === 0
                    ? "You haven't added any questions yet"
                    : "Try adjusting your filters or search query"}
                </p>
                <Button
                  onClick={() => navigate("/admin/add-question")}
                  className="btn-gradient"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-4">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              variant="outline"
            >
              Previous
            </Button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

{/* Full Question Preview Modal */}
{viewQuestion && (
  <AlertDialog open={viewQuestion !== null} onOpenChange={() => setViewQuestion(null)}>
    <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <AlertDialogHeader>
        <AlertDialogTitle>Full Question Preview</AlertDialogTitle>
      </AlertDialogHeader>

      <div className="space-y-4">
        <div>
          <p className="font-semibold">Question:</p>
          <MathRenderer text={viewQuestion.questionText} />
        </div>

        <div>
          <p className="font-semibold">Options:</p>
          <div className="grid gap-2">
            {viewQuestion.options.map((opt, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg border ${
                  viewQuestion.correctAnswer === i
                    ? "border-success bg-success/10"
                    : "border-border"
                }`}
              >
                <MathRenderer text={opt} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="font-semibold">Explanation:</p>
          <MathRenderer text={viewQuestion.explanation} />
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogAction onClick={() => setViewQuestion(null)}>
          Close
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}


      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The question will be permanently
              deleted from the database.
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
