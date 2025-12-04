import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
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
  Calendar
} from 'lucide-react';

// Mock data
const mockQOD = {
  id: '1',
  questionText: 'If sin θ = 3/5, what is the value of cos θ?',
  options: ['4/5', '3/4', '5/4', '5/3'],
  correctAnswer: 0,
  explanation: 'Using the identity sin²θ + cos²θ = 1, we get cos²θ = 1 - 9/25 = 16/25. Therefore cos θ = 4/5.',
  topic: 'Trigonometry',
  difficulty: 'medium',
};

const mockUpcomingQuizzes = [
  { id: '1', title: 'Weekly Trigonometry Test', type: 'weekly', date: 'Dec 8, 2024', duration: 30, questions: 15 },
  { id: '2', title: 'Calculus Fundamentals', type: 'biweekly', date: 'Dec 15, 2024', duration: 45, questions: 20 },
  { id: '3', title: 'Algebra Competency', type: 'competency', date: 'Dec 20, 2024', duration: 60, questions: 30 },
];

const mockRecentAttempts = [
  { id: '1', title: 'Trigonometry Basics', score: 85, total: 100, date: 'Dec 2, 2024' },
  { id: '2', title: 'Calculus Introduction', score: 72, total: 100, date: 'Nov 28, 2024' },
  { id: '3', title: 'Linear Equations', score: 90, total: 100, date: 'Nov 25, 2024' },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [qodSubmitted, setQodSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleQODSubmit = () => {
    if (selectedOption !== null) {
      setIsCorrect(selectedOption === mockQOD.correctAnswer);
      setQodSubmitted(true);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-info';
    return 'bg-warning';
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-primary/10 text-primary';
      case 'biweekly': return 'bg-accent/10 text-accent';
      case 'competency': return 'bg-success/10 text-success';
      default: return 'bg-secondary text-secondary-foreground';
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
              Welcome back, {user?.name?.split(' ')[0]}! 👋
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
                    <p className="text-3xl font-display font-bold text-primary-foreground">{user?.qodStreak || 5}</p>
                    <p className="text-sm text-primary-foreground/70">Day Streak</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">{user?.totalPoints || 250}</p>
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
                    <p className="text-3xl font-display font-bold text-primary-foreground">12</p>
                    <p className="text-sm text-primary-foreground/70">Quizzes Taken</p>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5 bg-white/10 backdrop-blur-sm border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-3xl font-display font-bold text-primary-foreground">78%</p>
                    <p className="text-sm text-primary-foreground/70">Avg Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Question of the Day */}
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileQuestion className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white">Question of the Day</h2>
                    <p className="text-white/80 text-sm">Solve daily to maintain your streak!</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {mockQOD.topic}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium capitalize">
                    {mockQOD.difficulty}
                  </span>
                </div>

                <p className="text-lg font-medium mb-6">{mockQOD.questionText}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {mockQOD.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !qodSubmitted && setSelectedOption(index)}
                      disabled={qodSubmitted}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        qodSubmitted
                          ? index === mockQOD.correctAnswer
                            ? 'border-success bg-success/10 text-success'
                            : selectedOption === index
                            ? 'border-destructive bg-destructive/10 text-destructive'
                            : 'border-border'
                          : selectedOption === index
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>

                {!qodSubmitted ? (
                  <Button 
                    onClick={handleQODSubmit}
                    disabled={selectedOption === null}
                    className="w-full btn-gradient"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <div className={`p-4 rounded-xl ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">{mockQOD.explanation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Quizzes */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Upcoming Quizzes</h2>
                <Link to="/quizzes" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {mockUpcomingQuizzes.map((quiz) => (
                  <Link 
                    key={quiz.id}
                    to="/quiz/1"
                    className="block p-4 rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer card-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(quiz.type)}`}>
                          {quiz.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {quiz.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="w-4 h-4" />
                        {quiz.questions} questions
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Attempts */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold">Recent Attempts</h2>
                <Link to="/history" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="space-y-4">
                {mockRecentAttempts.map((attempt) => {
                  const percentage = (attempt.score / attempt.total) * 100;
                  return (
                    <div key={attempt.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{attempt.title}</h3>
                        <span className="font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-border overflow-hidden mb-2">
                        <div 
                          className={`h-full rounded-full ${getScoreColor(percentage)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{attempt.date}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl overflow-hidden animate-fade-in delay-300">
              <div className="gradient-primary p-6">
                <h2 className="font-display text-xl font-bold text-primary-foreground mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/practice" className="block">
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                      <div className="flex items-center gap-3 text-primary-foreground">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">Practice Questions</span>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
