import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { qodAPI, quizAPI } from "@/utils/api";
import { MathPreview } from "@/components/MathPreview";

import { cotdAPI } from "@/utils/api";
import { Lightbulb } from "lucide-react";
import { BookOpenCheck } from "lucide-react";
import { importantLetterAPI } from "@/utils/api";
import { FileText } from "lucide-react";
import { ClipboardList } from "lucide-react";
import { Star } from "lucide-react";

import {
  Flame,
  Award,
  Target,
  TrendingUp,
  Clock,
  FileQuestion,
  ChevronRight,
  CheckCircle2,
  XCircle,
  BookOpen,
  BarChart3,
  User,
  Calendar,
  Loader2,
  RotateCcw,
} from "lucide-react";

interface QODQuestion {
  _id: string;
  questionText: string;
  options: string[];
  topic: string;
  difficulty: string;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  quizType: string;
  scheduledDate: string;
  duration: number;
  questionCount: number;
}

interface Attempt {
  _id: string;
  quizId: {
    title: string;
  };
  percentage: number;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user } = useAuth();

  // QOD State
  const [qodQuestion, setQodQuestion] = useState<QODQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [qodSubmitted, setQodSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [qodExplanation, setQodExplanation] = useState("");
  const [qodLoading, setQodLoading] = useState(true);

  // Quizzes State
  const [upcomingQuizzes, setUpcomingQuizzes] = useState<Quiz[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);

  // Attempts State
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);

  const [bookmarkSummary, setBookmarkSummary] = useState({
    pyqs: 0,
    modelTests: 0,
  });

  useEffect(() => {
    const fetchBookmarksSummary = async () => {
      try {
        const res = await bookmarkAPI.getAll();
        setBookmarkSummary({
          pyqs: res.data.bookmarks?.pyqs?.length || 0,
          modelTests: res.data.bookmarks?.modelTestPapers?.length || 0,
        });
      } catch {
        // silent fail – dashboard should never break
      }
    };

    fetchBookmarksSummary();
  }, []);

  // Fetch Today's QOD
  useEffect(() => {
    const fetchQOD = async () => {
      if (!user?.class) return;

      try {
        setQodLoading(true);
        const response = await qodAPI.getTodayQOD(user.class);

        if (response.data.success) {
          // Case 1: already attempted
          if (response.data.alreadyAttempted && response.data.attempt) {
            const attempt = response.data.attempt;

            setQodQuestion(attempt.questionId || null);
            setSelectedOption(attempt.selectedOption);
            setQodSubmitted(true); // ✅ only here
            setIsCorrect(attempt.isCorrect);
            setQodExplanation(attempt.questionId?.explanation || "");
          }

          // Case 2: fresh question
          else if (response.data.question) {
            setQodQuestion(response.data.question);
            setQodSubmitted(false); // ✅ fresh attempt
            setSelectedOption(null);
            setIsCorrect(false);
            setQodExplanation("");
          }
        }
      } catch (error: any) {
        console.error("Failed to fetch QOD:", error);
        // Don't show error to user, just log it
      } finally {
        setQodLoading(false);
      }
    };

    fetchQOD();
  }, [user?.class]);

  // Fetch Upcoming Quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user?.class) return;

      try {
        setQuizzesLoading(true);
        const response = await quizAPI.getQuizzesByClass(user.class);
        if (response.data.success) {
          setUpcomingQuizzes(response.data.quizzes);
        }
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      } finally {
        setQuizzesLoading(false);
      }
    };

    fetchQuizzes();
  }, [user?.class]);

  // Fetch Recent Attempts
  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setAttemptsLoading(true);
        const response = await quizAPI.getMyAttempts(5);
        if (response.data.success) {
          setRecentAttempts(response.data.attempts);
        }
      } catch (error) {
        console.error("Failed to fetch attempts:", error);
      } finally {
        setAttemptsLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const handleQODSubmit = async () => {
    if (selectedOption === null || !qodQuestion) return;

    try {
      const response = await qodAPI.submitQOD({
        questionId: qodQuestion._id,
        selectedOption,
      });

      if (response.data.success) {
        setIsCorrect(response.data.result.isCorrect);

        setQodExplanation(response.data.result.explanation || "");
        setQodSubmitted(true);

        // Refresh user data to update streak
        if (user) {
          user.qodStreak = response.data.result.streak;
          user.totalPoints = response.data.result.totalPoints;
        }
      }
    } catch (error: any) {
      console.error("Failed to submit QOD:", error);
      alert(error.response?.data?.message || "Failed to submit answer");
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-info";
    return "bg-warning";
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "weekly":
        return "bg-primary/10 text-primary";
      case "biweekly":
        return "bg-accent/10 text-accent";
      case "competency":
        return "bg-success/10 text-success";
      case "practice":
        return "bg-info/10 text-info";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const [cotd, setCotd] = useState<any>(null);
  const [cotdLoading, setCotdLoading] = useState(true);

  useEffect(() => {
    fetchTodayCOTD();
  }, []);

  const fetchTodayCOTD = async () => {
    try {
      if (!user?.class) return;

      const res = await cotdAPI.getTodayConcept(user.class);

      if (res.data.success) {
        setCotd(res.data.concept);
      }
    } finally {
      setCotdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header Banner */}
      <div className="pt-16">
        <div className="gradient-primary">
          <div className="container mx-auto px-4 py-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Keep up the great work! You're on a roll.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">
                      {user?.qodStreak || 0}
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      Day Streak
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">
                      {user?.totalPoints || 0}
                    </p>
                    <p className="text-sm text-primary-foreground/70">Points</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-info/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-info" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">
                      {recentAttempts.length}
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      Quizzes Taken
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">
                      {recentAttempts.length > 0
                        ? Math.round(
                            recentAttempts.reduce(
                              (sum, a) => sum + a.percentage,
                              0
                            ) / recentAttempts.length
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-primary-foreground/70">
                      Avg Score
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[95vw] mx-auto px-6 py-8">
  <div className="grid lg:grid-cols-[320px_1fr_320px] gap-6">
    {/* Left Column - Quick Actions */}
    <div className="space-y-8">
      {/* Quick Actions - Move here from right column */}
      <div className="rounded-2xl overflow-hidden animate-fade-in delay-300">
        <div className="gradient-primary p-6">
          <h2 className="font-display text-xl font-bold text-primary-foreground mb-4">
            Quick Actions
          </h2>
           <div className="space-y-3">
                  <Link to="/pyqs" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BookOpenCheck className="w-5 h-5" />
                        <span className="font-medium">
                          Previous Year Questions
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/student/model-test-papers" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <ClipboardList className="w-5 h-5" />
                        <span className="font-medium">Model Test Papers</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/practice" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Practice Questions</span>
                      </div>
                    </div>
                  </Link>
                  <Link to="/concept-of-day" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Concept of the Day</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/formula-sheets" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Formula Sheets</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/analytics" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BarChart3 className="w-5 h-5" />
                        <span className="font-medium">View Analytics</span>
                      </div>
                    </div>
                  </Link>
                  <Link to="/profile" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Edit Profile</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/qod-history" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <RotateCcw className="w-5 h-5" />
                        <span className="font-medium">
                          Question of the Day History
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/books" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Books Corner</span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/important-letters" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">Important Letters</span>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/student/question-paper-structure"
                    className="block"
                  >
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">
                          Question Paper Structure
                        </span>
                      </div>
                    </div>
                  </Link>

                  <Link to="/student/bookmarks" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <Star className="w-5 h-5" />
                        <span className="font-medium">My Bookmarks</span>
                      </div>
                    </div>
                  </Link>
                </div>
        </div>
      </div>
    </div>

         {/* Middle Column */}
<div className="space-y-8">
            {/* Question of the Day */}
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Question of the Day
                    </h2>
                    <p className="text-white/80 text-sm">
                      Solve daily to maintain your streak!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {qodLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : qodQuestion ? (
                  <>
                    {/* Topic + Difficulty + Attempted Badge */}
                    <div className="flex gap-2 mb-4 items-center">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        {qodQuestion.topic}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium capitalize">
                        {qodQuestion.difficulty}
                      </span>

                      {qodSubmitted && (
                        <span className="ml-auto text-sm font-semibold text-success">
                          Attempted Today ✓
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <div className="text-lg font-medium mb-6">
                      <MathPreview content={qodQuestion.questionText} />
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {qodQuestion?.options?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            !qodSubmitted && setSelectedOption(index)
                          }
                          disabled={qodSubmitted}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            qodSubmitted &&
                            isCorrect &&
                            selectedOption === index
                              ? "border-success bg-success/10 text-success"
                              : qodSubmitted &&
                                !isCorrect &&
                                selectedOption === index
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : selectedOption === index
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-semibold mr-2">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <MathPreview content={option} />
                        </button>
                      ))}
                    </div>

                    {/* Submit / Info */}
                    {!qodSubmitted ? (
                      <Button
                        onClick={handleQODSubmit}
                        disabled={selectedOption === null}
                        className="w-full btn-gradient"
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground mb-4">
                        You have already attempted today’s Question of the Day.
                        Come back tomorrow for a new question 🌅
                      </p>
                    )}

                    {/* Result */}
                    {qodSubmitted && (
                      <div
                        className={`p-4 rounded-xl ${
                          isCorrect ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                          <span
                            className={`font-semibold ${
                              isCorrect ? "text-success" : "text-destructive"
                            }`}
                          >
                            {isCorrect ? "Correct! +10 points" : "Incorrect"}
                          </span>
                        </div>

                        {qodExplanation && (
                          <div className="text-muted-foreground text-sm">
                            <MathPreview content={qodExplanation} />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No question available for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== CONCEPT OF THE DAY ===== */}
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">
                      Concept of the Day
                    </h2>
                    <p className="text-white/80 text-sm">
                      Learn one key idea every day
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {cotdLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    Loading today’s concept…
                  </div>
                ) : !cotd ? (
                  <p className="text-muted-foreground text-sm">
                    No concept published today.
                  </p>
                ) : (
                  <>
                    {/* Meta Badges */}
                    <div className="flex gap-2 mb-4 items-center">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        Class {cotd.class}
                      </span>

                      <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                        {cotd.chapter}
                      </span>

                      <span className="ml-auto text-sm font-semibold text-success">
                        Available Today 📘
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium mb-4">{cotd.topic}</h3>

                    {/* Date */}
                    <p className="text-sm text-muted-foreground mb-6">
                      📅 {new Date(cotd.scheduledDate).toDateString()}
                    </p>

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <Link
                        to="/concept-of-day/history"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        View Previous Concepts →
                      </Link>

                      <Button asChild className="btn-gradient">
                        <Link to="/concept-of-day">Read Today’s Concept</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upcoming Quizzes */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">
                  Upcoming Quizzes
                </h2>
              </div>

              {quizzesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : upcomingQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {upcomingQuizzes.map((quiz) => {
                    const quizLink =
                      quiz.quizType === "practice"
                        ? "/practice"
                        : `/quiz/${quiz._id}`;

                    return (
                      <Link
                        key={quiz._id}
                        to={quizLink}
                        className="block p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer card-hover"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{quiz.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quiz.description}
                            </p>
                            <span
                              className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(
                                quiz.quizType
                              )}`}
                            >
                              {quiz.quizType}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(quiz.scheduledDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {quiz.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <FileQuestion className="w-4 h-4" />
                            {quiz.questionCount} questions
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileQuestion className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No quizzes available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Attempts */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">
                  Recent Attempts
                </h2>
              </div>

              {attemptsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : recentAttempts.length > 0 ? (
                <div className="space-y-4">
                  {recentAttempts.map((attempt) => (
                    <div
                      key={attempt._id}
                      className="p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">
                          {attempt.quizId?.title || "Practice Session"}
                        </h3>
                        <span className="font-semibold">
                          {attempt.percentage}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-border overflow-hidden mb-2">
                        <div
                          className={`h-full rounded-full ${getScoreColor(
                            attempt.percentage
                          )}`}
                          style={{ width: `${attempt.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attempt.createdAt)} • {attempt.score}/
                        {attempt.totalQuestions}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No attempts yet</p>
                  <p className="text-sm mt-1">
                    Take your first quiz to see results here
                  </p>
                </div>
              )}
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
}
