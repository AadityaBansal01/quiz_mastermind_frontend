import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { MathRenderer } from '@/components/MathRenderer';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Home,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DetailedAnswer {
  questionId: string;
  selectedOption: number | null;
  timeTaken: number;
  isCorrect: boolean;
  question: {
    id: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
    difficulty: string;
  };
}

interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  answers: DetailedAnswer[];
  score: number;
  totalQuestions: number;
  percentage: number;
  totalTimeTaken: number;
  createdAt: string;
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(0, 84%, 60%)', 'hsl(38, 92%, 50%)'];

export default function QuizResults() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const attempts = JSON.parse(localStorage.getItem('mathquiz_attempts') || '[]');
    const found = attempts.find((a: QuizAttempt) => a.id === attemptId);
    if (found) {
      setAttempt(found);
    }
  }, [attemptId]);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Result not found</p>
            <Link to="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const correctCount = attempt.answers.filter(a => a.isCorrect).length;
  const incorrectCount = attempt.answers.filter(a => !a.isCorrect && a.selectedOption !== null).length;
  const unansweredCount = attempt.answers.filter(a => a.selectedOption === null).length;

  // Topic-wise analysis
  const topicAnalysis = attempt.answers.reduce((acc, ans) => {
    const topic = ans.question.topic;
    if (!acc[topic]) {
      acc[topic] = { topic, correct: 0, total: 0 };
    }
    acc[topic].total++;
    if (ans.isCorrect) acc[topic].correct++;
    return acc;
  }, {} as Record<string, { topic: string; correct: number; total: number }>);

  const topicData = Object.values(topicAnalysis).map(t => ({
    topic: t.topic.length > 15 ? t.topic.slice(0, 15) + '...' : t.topic,
    fullTopic: t.topic,
    correct: t.correct,
    total: t.total,
    percentage: Math.round((t.correct / t.total) * 100),
  }));

  const pieData = [
    { name: 'Correct', value: correctCount },
    { name: 'Incorrect', value: incorrectCount },
    { name: 'Unanswered', value: unansweredCount },
  ].filter(d => d.value > 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreMessage = () => {
    if (attempt.percentage >= 90) return { text: 'Excellent!', color: 'text-success' };
    if (attempt.percentage >= 70) return { text: 'Good Job!', color: 'text-info' };
    if (attempt.percentage >= 50) return { text: 'Keep Practicing!', color: 'text-warning' };
    return { text: 'Need Improvement', color: 'text-destructive' };
  };

  const scoreMessage = getScoreMessage();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Quiz Results
            </h1>
            <p className="text-muted-foreground">{attempt.quizTitle}</p>
          </div>

          {/* Score Card */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card rounded-2xl shadow-lg overflow-hidden animate-fade-in">
              <div className="gradient-primary p-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  {/* Circular Progress */}
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="white"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * attempt.percentage) / 100}
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground">
                      <span className="text-4xl font-display font-bold">{attempt.percentage}%</span>
                      <span className="text-sm opacity-80">Score</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-center md:text-left text-primary-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-8 h-8" />
                      <span className={`text-3xl font-display font-bold ${scoreMessage.color === 'text-success' ? '' : ''}`}>
                        {scoreMessage.text}
                      </span>
                    </div>
                    <p className="text-2xl font-semibold mb-4">
                      {attempt.score} / {attempt.totalQuestions}
                    </p>
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(attempt.totalTimeTaken)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>{Math.round((correctCount / attempt.totalQuestions) * 100)}% Accuracy</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 divide-x divide-border">
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-success mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-2xl font-bold">{correctCount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-destructive mb-2">
                    <XCircle className="w-5 h-5" />
                    <span className="text-2xl font-bold">{incorrectCount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                    <span className="text-2xl font-bold">{unansweredCount}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Unanswered</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="max-w-4xl mx-auto mb-8 grid md:grid-cols-2 gap-6">
            {/* Topic Analysis Chart */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Topic-wise Performance
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="topic" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Score']}
                    labelFormatter={(label) => topicData.find(t => t.topic === label)?.fullTopic || label}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200">
              <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Answer Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                    <span>{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-300">
              <h3 className="font-display text-xl font-semibold mb-6">Question Review</h3>
              
              <div className="space-y-4">
                {attempt.answers.map((answer, index) => {
                  const isExpanded = expandedQuestions.has(answer.questionId);
                  const q = answer.question;
                  
                  return (
                    <div 
                      key={answer.questionId}
                      className={`rounded-xl border-2 overflow-hidden transition-all ${
                        answer.isCorrect ? 'border-success/30 bg-success/5' : 
                        answer.selectedOption === null ? 'border-border bg-secondary/30' :
                        'border-destructive/30 bg-destructive/5'
                      }`}
                    >
                      {/* Question Header */}
                      <button
                        onClick={() => toggleQuestion(answer.questionId)}
                        className="w-full p-4 flex items-start gap-4 text-left"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          answer.isCorrect ? 'bg-success text-success-foreground' :
                          answer.selectedOption === null ? 'bg-muted text-muted-foreground' :
                          'bg-destructive text-destructive-foreground'
                        }`}>
                          {answer.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : answer.selectedOption === null ? (
                            <span className="text-sm font-medium">-</span>
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">Q{index + 1}</span>
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                              {q.topic}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(answer.timeTaken)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            <MathRenderer text={q.questionText} />
                          </div>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border/50">
                          <div className="pt-4">
                            <p className="font-medium mb-4">
                              <MathRenderer text={q.questionText} />
                            </p>
                            
                            <div className="grid gap-2 mb-4">
                              {q.options.map((option, optIndex) => {
                                const isUserAnswer = answer.selectedOption === optIndex;
                                const isCorrectAnswer = q.correctAnswer === optIndex;
                                
                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-3 rounded-lg border-2 ${
                                      isCorrectAnswer
                                        ? 'border-success bg-success/10'
                                        : isUserAnswer && !isCorrectAnswer
                                        ? 'border-destructive bg-destructive/10'
                                        : 'border-border'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                                        isCorrectAnswer
                                          ? 'bg-success text-success-foreground'
                                          : isUserAnswer
                                          ? 'bg-destructive text-destructive-foreground'
                                          : 'bg-secondary'
                                      }`}>
                                        {String.fromCharCode(65 + optIndex)}
                                      </span>
                                      <div className="flex-1">
                                        <MathRenderer text={option} />
                                      </div>
                                      {isCorrectAnswer && (
                                        <span className="text-xs font-medium text-success">Correct</span>
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <span className="text-xs font-medium text-destructive">Your Answer</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div className="p-4 rounded-lg bg-secondary/50">
                              <h4 className="font-semibold mb-2 text-sm">Explanation:</h4>
                              <div className="text-sm text-muted-foreground">
                                <MathRenderer text={q.explanation} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/quiz/1')}
              variant="outline"
              className="rounded-xl"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Quiz
            </Button>
            <Link to="/dashboard">
              <Button className="btn-gradient w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
