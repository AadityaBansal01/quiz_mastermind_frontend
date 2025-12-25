import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { MathRenderer } from "@/components/MathRenderer";
import { Button } from "@/components/ui/button";
import { quizAPI } from "@/utils/api";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Loader2,
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
  topic: string;
  difficulty: string;
}

interface Quiz {
  _id: string;
  title: string;
  duration: number;
  questions: Question[];
}

interface Answer {
  questionId: string;
  selectedOption: number | null;
  timeTaken: number;
}

export default function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle submit with useCallback to prevent dependency issues
  const handleSubmit = useCallback(
    async (autoSubmit: boolean = false) => {
      if (!quiz || submitting) return;

      try {
        setSubmitting(true);
        const endTime = new Date();

        const submissionData = {
          quizId: quiz._id,
          answers: answers.map((ans) => ({
  questionId: ans.questionId,
  selectedOption: ans.selectedOption,
  timeTaken: ans.timeTaken,
})),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };

        const response = await quizAPI.submitQuiz(submissionData);

        if (response.data.success) {
          if (autoSubmit) {
            toast.info("Time is up! Quiz submitted automatically.");
          } else {
            toast.success("Quiz submitted successfully!");
          }
          
          // Clear all quiz-related data
          localStorage.removeItem("active-quiz-attempt");
          localStorage.removeItem(`quiz-progress-${quiz._id}`);
          localStorage.removeItem(`violations-${quiz._id}`);

          // Navigate to results
          navigate(`/quiz/results/${response.data.result.attemptId}`);
        }
      } catch (error: any) {
        console.error("Failed to submit quiz:", error);
        toast.error(error.response?.data?.message || "Failed to submit quiz");
        setSubmitting(false);
      }
    },
    [quiz, answers, startTime, navigate, submitting]
  );

  // Keyboard navigation (Left / Right arrows)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showPalette || showSubmitDialog) return;

      if (e.key === "ArrowRight") {
        if (currentQuestion < (quiz?.questions.length || 0) - 1) {
          goToQuestion(currentQuestion + 1);
        }
      }

      if (e.key === "ArrowLeft") {
        if (currentQuestion > 0) {
          goToQuestion(currentQuestion - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentQuestion, quiz, showPalette, showSubmitDialog]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;

      try {
        setLoading(true);
        const response = await quizAPI.getQuizById(quizId);

        if (response.data.success) {
          const quizData = response.data.quiz;
          setQuiz(quizData);

          // Mark quiz attempt as active
          localStorage.setItem(
            "active-quiz-attempt",
            JSON.stringify({
              quizId: quizData._id,
              startedAt: Date.now(),
            })
          );

          setTimeLeft(quizData.duration * 60);

          // Check if saved progress exists
          const saved = localStorage.getItem(`quiz-progress-${quizData._id}`);

          if (saved) {
            const data = JSON.parse(saved);

            setAnswers(data.answers || []);
            setMarked(data.marked || []);
            setCurrentQuestion(data.currentQuestion || 0);

            const elapsed = Math.floor((Date.now() - data.savedAt) / 1000);
            const newTime = quizData.duration * 60 - elapsed;

            setTimeLeft(newTime > 0 ? newTime : 1);

            toast.info("Restored previous quiz progress.");
            return;
          }

          // Initialize answers
          setAnswers(
            quizData.questions.map((q: Question) => ({
              questionId: q._id,
              selectedOption: null,
              timeTaken: 0,
            }))
          );
          setMarked(new Array(quizData.questions.length).fill(false));
        }
      } catch (error: any) {
        console.error("Failed to fetch quiz:", error);
        toast.error(error.response?.data?.message || "Failed to load quiz");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        if (prev === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
          toast.warning("5 minutes remaining!", { duration: 5000 });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, showTimeWarning, timeLeft, handleSubmit]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!quiz) return;

    const interval = setInterval(() => {
      const data = {
        answers,
        marked,
        currentQuestion,
        timeLeft,
        savedAt: Date.now(),
      };
      localStorage.setItem(`quiz-progress-${quiz._id}`, JSON.stringify(data));
    }, 10000);

    return () => clearInterval(interval);
  }, [quiz, answers, marked, currentQuestion, timeLeft]);

  // Auto-save immediately when user closes the tab or refreshes
  useEffect(() => {
    if (!quiz) return;

    const handleBeforeUnload = () => {
      const data = {
        answers,
        marked,
        currentQuestion,
        timeLeft,
        savedAt: Date.now(),
      };
      localStorage.setItem(`quiz-progress-${quiz._id}`, JSON.stringify(data));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [quiz, answers, marked, currentQuestion, timeLeft]);

  // Auto-submit ONLY if quiz was left AND time actually expired
  useEffect(() => {
    if (!quiz) return;

    const active = localStorage.getItem("active-quiz-attempt");
    if (!active) return;

    const activeAttempt = JSON.parse(active);

    if (activeAttempt.quizId !== quiz._id) return;

    const saved = localStorage.getItem(`quiz-progress-${quiz._id}`);
    if (!saved) return;

    const data = JSON.parse(saved);

    const elapsed = Math.floor((Date.now() - data.savedAt) / 1000);
    const totalTime = quiz.duration * 60;

    if (elapsed >= totalTime) {
      console.log("Previous attempt expired — auto-submitting.");
      handleSubmit(true);
    }
  }, [quiz, handleSubmit]);

  // Warn user if they try to leave during quiz
  useEffect(() => {
    const warnBeforeLeave = (e: BeforeUnloadEvent) => {
      if (!quiz) return;

      e.preventDefault();
      e.returnValue =
        "Are you sure you want to leave? Your quiz progress may be lost.";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", warnBeforeLeave);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
    };
  }, [quiz]);

  // Anti-cheating: Detect tab switching / window losing focus
  useEffect(() => {
    if (!quiz) return;

    let violations = parseInt(
      localStorage.getItem(`violations-${quiz._id}`) || "0"
    );

    const handleBlur = () => {
      violations++;

      localStorage.setItem(`violations-${quiz._id}`, violations.toString());

      toast.warning(
        `Warning ${violations}: Do not switch tabs during the quiz!`
      );

      if (violations >= 3) {
        toast.error("Multiple tab switches detected. Auto-submitting quiz.");
        handleSubmit(true);
      }
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [quiz, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const updateAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    newAnswers[currentQuestion] = {
      ...newAnswers[currentQuestion],
      selectedOption: optionIndex,
      timeTaken: newAnswers[currentQuestion].timeTaken + timeSpent,
    };
    setAnswers(newAnswers);
    setQuestionStartTime(Date.now());
  };

  const goToQuestion = (index: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      ...newAnswers[currentQuestion],
      timeTaken: newAnswers[currentQuestion].timeTaken + timeSpent,
    };
    setAnswers(newAnswers);
    setQuestionStartTime(Date.now());
    setCurrentQuestion(index);
    setShowPalette(false);
  };

  const toggleMark = () => {
    const temp = [...marked];
    temp[currentQuestion] = !temp[currentQuestion];
    setMarked(temp);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Quiz not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              This quiz has no questions yet.
            </p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const current = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const answeredCount = answers.filter((a) => a.selectedOption !== null).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h2 className="font-display font-semibold truncate">
              {quiz.title}
            </h2>

            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
                  timeLeft <= 300
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "bg-secondary"
                }`}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>

              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {quiz.questions.length}
              </span>

              <button
                onClick={() => setShowPalette(!showPalette)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              >
                {showPalette ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {/* Main Question Area */}
            <div className="flex-1 max-w-3xl">
              <div className="bg-card rounded-2xl shadow-lg p-8 animate-fade-in">
                {/* Question Tags */}
                <div className="flex gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {current.topic}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      current.difficulty === "easy"
                        ? "bg-success/10 text-success"
                        : current.difficulty === "medium"
                        ? "bg-warning/10 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {current.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <div className="text-xl font-medium mb-8">
                  <span className="text-primary font-bold mr-2">
                    Q{currentQuestion + 1}.
                  </span>
                  <MathRenderer text={current.questionText} />
                </div>

                {/* Options */}
                <div className="space-y-4">
                  {current.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => updateAnswer(index)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                        currentAnswer?.selectedOption === index
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            currentAnswer?.selectedOption === index
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <div className="flex-1">
                          <MathRenderer text={option} />
                        </div>
                        {currentAnswer?.selectedOption === index && (
                          <CheckCircle2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mark for Review Button */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant={marked[currentQuestion] ? "destructive" : "outline"}
                  onClick={toggleMark}
                  className="rounded-xl"
                >
                  {marked[currentQuestion] ? "Unmark" : "Mark for Review"}
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    disabled={submitting}
                    className="btn-gradient"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Quiz"
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => goToQuestion(currentQuestion + 1)}
                    className="btn-gradient"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            {/* Question Palette - Desktop */}
            <div className="hidden lg:block w-72">
              <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-36">
                <h3 className="font-display font-semibold mb-4">
                  Question Palette
                </h3>

                <div className="grid grid-cols-5 gap-2 mb-6">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentQuestion === index
                          ? "bg-success text-success-foreground ring-2 ring-success ring-offset-2"
                          : marked[index]
                          ? "bg-purple-500 text-white"
                          : answers[index]?.selectedOption !== null
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span>Answered ({answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-purple-500" />
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-secondary" />
                    <span>
                      Unanswered ({quiz.questions.length - answeredCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success" />
                    <span>Current</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={submitting}
                  className="w-full mt-6 btn-gradient"
                >
                  {submitting ? "Submitting..." : "Submit Quiz"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Palette */}
      {showPalette && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowPalette(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-semibold mb-4">
              Question Palette
            </h3>

            <div className="grid grid-cols-5 gap-2 mb-6">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentQuestion === index
                      ? "bg-success text-success-foreground"
                      : marked[index]
                      ? "bg-purple-500 text-white"
                      : answers[index]?.selectedOption !== null
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
              className="w-full btn-gradient"
            >
              Submit Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Submit Quiz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {answeredCount} out of {quiz.questions.length}{" "}
              questions.
              {answeredCount < quiz.questions.length && (
                <span className="block mt-2 text-warning font-medium">
                  {quiz.questions.length - answeredCount} question(s) are
                  unanswered!
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="btn-gradient"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}