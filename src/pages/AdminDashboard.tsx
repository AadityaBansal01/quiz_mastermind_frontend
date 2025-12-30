import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { adminAPI } from "@/utils/api";
import { FolderOpen } from "lucide-react";
import { FileText } from "lucide-react";
import { BookOpenText } from "lucide-react";
import {
  Users,
  FileQuestion,
  BookOpen,
  TrendingUp,
  Plus,
  Calendar,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  totalStudents: number;
  totalQuestions: number;
  activeQuizzes: number;
  totalAttempts: number;
}

interface RecentStudent {
  _id: string;
  name: string;
  email: string;
  class: number;
  rollNumber: string;
  createdAt: string;
}

interface QuizPerformance {
  _id: string;
  title: string;
  class: number;
  totalAttempts: number;
  averageScore: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalQuestions: 0,
    activeQuizzes: 0,
    totalAttempts: 0,
  });
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch analytics data from backend
      const response = await adminAPI.getAnalytics();

      if (response.data.success) {
        const data = response.data.data;

        setStats({
          totalStudents: data.totalStudents || 0,
          totalQuestions: data.totalQuestions || 0,
          activeQuizzes: data.activeQuizzes || 0,
          totalAttempts: data.totalAttempts || 0,
        });

        setRecentStudents(data.recentStudents || []);
        setQuizPerformance(data.quizPerformance || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="pt-16">
        <div className="gradient-primary">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-primary-foreground/80 text-lg">
                  Manage questions, quizzes, and monitor student progress
                </p>
              </div>

              <div className="flex gap-3">
                <Link to="/admin/add-question">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </Link>
                <Link to="/admin/create-quiz">
                  <Button className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Quiz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-primary animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-display font-bold">
                  {stats.totalStudents}
                </p>
                <p className="text-xs text-success mt-1">Active users</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-accent animate-fade-in delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Questions
                </p>
                <p className="text-3xl font-display font-bold">
                  {stats.totalQuestions}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  In question bank
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <FileQuestion className="w-6 h-6 text-accent" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-info animate-fade-in delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Quizzes
                </p>
                <p className="text-3xl font-display font-bold">
                  {stats.activeQuizzes}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently available
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-success animate-fade-in delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Attempts
                </p>
                <p className="text-3xl font-display font-bold">
                  {stats.totalAttempts}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Quiz submissions
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Students */}
          <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-400">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">
                Recent Students
              </h2>
              <Link
                to="/admin/students"
                className="text-primary hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {recentStudents.length > 0 ? (
              <div className="space-y-4">
                {recentStudents.slice(0, 5).map((student) => (
                  <div
                    key={student._id}
                    onClick={() =>
                      navigate(`/admin/student/${student._id}`, {
                        state: { from: "dashboard" },
                      })
                    }
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {getInitials(student.name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Class {student.class} • Roll #{student.rollNumber}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(student.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No students registered yet</p>
              </div>
            )}
          </div>

          {/* Quiz Performance */}
          <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">
                Quiz Performance
              </h2>
              <Link
                to="/admin/quizzes"
                className="text-primary hover:underline text-sm font-medium"
              >
                View All
              </Link>
            </div>

            {quizPerformance.length > 0 ? (
              <div className="space-y-4">
                {quizPerformance.slice(0, 5).map((quiz) => (
                  <div
                    key={quiz._id}
                    onClick={() => navigate("/admin/quizzes")}
                    className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold truncate">{quiz.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Class {quiz.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {quiz.totalAttempts} attempts
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-success" />
                        {quiz.averageScore}% avg score
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No quiz performance data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-2xl overflow-hidden animate-fade-in delay-600">
          <div className="gradient-primary p-8">
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-6 text-center">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Link to="/admin/add-question" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <Plus className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Add Questions
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Add new practice questions
                  </p>
                </div>
              </Link>

              <Link to="/admin/create-quiz" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Create Quiz
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Schedule a new quiz
                  </p>
                </div>
              </Link>

              <Link to="/admin/students" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <Users className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Manage Students
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    View and manage student profiles
                  </p>
                </div>
              </Link>
              <Link to="/admin/questions" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <FileQuestion className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Question Bank
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    View and manage all questions
                  </p>
                </div>
              </Link>
<Link to="/admin/pyqs" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FolderOpen className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Manage PYQs
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload year-wise PDFs
    </p>
  </div>
</Link>




              <Link to="/admin/concepts" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Concept of the Day
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Create & manage daily concepts
                  </p>
                </div>
              </Link>

              <Link to="/admin/qod-manager" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Question of the Day
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Assign & manage daily QOD
                  </p>
                </div>
              </Link>

              <Link to="/admin/quizzes" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
                  <BookOpen className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
                  <h3 className="font-semibold text-primary-foreground mb-1">
                    Manage Quizzes
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    View, edit & delete quizzes
                  </p>
                </div>
              </Link>

<Link to="/admin/formula-sheets" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FileText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Formula Sheets
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload chapter-wise PDFs
    </p>
  </div>
</Link>

<Link to="/admin/books" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <BookOpenText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Book Corner
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload full books or chapter-wise PDFs
    </p>
  </div>
</Link>

<Link to="/admin/important-letters" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FileText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Important Letters
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload circulars & notices
    </p>
  </div>
</Link>

<Link to="/admin/question-paper-structure" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FileText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Question Paper Structure
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Manage exam pattern & marking scheme
    </p>
  </div>
</Link>


<Link to="/admin/model-test-papers" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FileText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Model Test Papers
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload full-length & mock test PDFs
    </p>
  </div>
</Link>


<Link to="/admin/solution-corner" className="block">
  <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center">
    <FileText className="w-8 h-8 mx-auto mb-3 text-primary-foreground" />
    <h3 className="font-semibold text-primary-foreground mb-1">
      Solution Corner
    </h3>
    <p className="text-sm text-primary-foreground/70">
      Upload & manage solutions
    </p>
  </div>
</Link>




            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
