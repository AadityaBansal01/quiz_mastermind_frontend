import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { MathRenderer } from '@/components/MathRenderer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { quizAPI } from '@/utils/api';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  BookOpen,
  Filter,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  chapter: string;
  difficulty: string;
}

interface AvailableFilters {
  chapters: string[];
  topics: string[];
}

export default function Practice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
 const [allQuestions, setAllQuestions] = useState<Question[]>([]);
const [questions, setQuestions] = useState<Question[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showSummary, setShowSummary] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    chapter: 'all',
    topic: 'all',
    difficulty: 'all'
  });

  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
  chapters: [],
  topics: []
});


  useEffect(() => {
    fetchQuestions();
  }, [user?.class]);

  const fetchQuestions = async () => {
  if (!user?.class) return;

  try {
    setLoading(true);

    const response = await quizAPI.getPracticeQuestions(user.class);

    if (response.data.success) {
      const fetched = response.data.questions;

      setAllQuestions(fetched);
      setQuestions([...fetched].sort(() => Math.random() - 0.5));

      const chapters = [...new Set(fetched.map(q => q.chapter))];
      const topics = [...new Set(fetched.map(q => q.topic))];

      setAvailableFilters({ chapters, topics });
    }
  } catch (error) {
    console.error(error);
    toast.error('Failed to load practice questions');
  } finally {
    setLoading(false);
  }
};


 const applyFilters = () => {
  let filtered = [...allQuestions];


  if (filters.chapter !== 'all') {
    filtered = filtered.filter(q => q.chapter === filters.chapter);
  }

  if (filters.topic !== 'all') {
    filtered = filtered.filter(q => q.topic === filters.topic);
  }

  if (filters.difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === filters.difficulty);
  }

  setQuestions(filtered.sort(() => Math.random() - 0.5));
  setCurrentIndex(0);
  setSelectedAnswer(null);
  setShowExplanation(false);
  setScore({ correct: 0, total: 0 });
setShowSummary(false);
};

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;


 const resetPractice = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore({ correct: 0, total: 0 });
    setShowSummary(false);
  };


if (showSummary) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 container mx-auto px-4 max-w-xl text-center">
        <h2 className="text-3xl font-bold mb-4">
          Practice Complete 🎉
        </h2>

        <p className="text-lg mb-2">
          Score: <strong>{score.correct}</strong> / {score.total}
        </p>

        <p className="text-lg mb-6">
          Accuracy: <strong>{accuracy}%</strong>
        </p>

        <div className="flex justify-center gap-4">
          <Button onClick={resetPractice} className="btn-gradient">
            Practice Again
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

const currentQuestion =
  currentIndex < questions.length ? questions[currentIndex] : null;

  const handleAnswer = (optionIndex: number) => {
    if (showExplanation) return;
    
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setScore(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };


 const savePracticeAttempt = async () => {
  if (score.total === 0) return;
  try {
    const chapters = [...new Set(questions.map(q => q.chapter))];
    const topics = [...new Set(questions.map(q => q.topic))];

    const difficultyStats = {
      easy: questions.filter(q => q.difficulty === "easy").length,
      medium: questions.filter(q => q.difficulty === "medium").length,
      hard: questions.filter(q => q.difficulty === "hard").length,
    };

    await quizAPI.savePracticeAttempt({
      class: user?.class,
     totalQuestions: questions.length,
      correctAnswers: score.correct,
      accuracy,
      chapters,
      topics,
      difficultyStats,
    });
  } catch (err) {
    console.error("Failed to save practice attempt", err);
  }
};

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
  savePracticeAttempt();
  setShowSummary(true);   // 👈 show summary screen
}
  };

 
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No practice questions available</h3>
            <p className="text-muted-foreground">Check back later for new questions</p>
          </div>
        </div>
      </div>
    );
  }

if (!currentQuestion && !showSummary) {
  return null; // prevents white screen crash
}




  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-12 container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Practice Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Bar */}
            <div className="bg-card rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="font-semibold">{currentIndex + 1} / {questions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="font-semibold">{score.correct} / {score.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-semibold">{accuracy}%</p>
                </div>
                <Button onClick={resetPractice} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-card rounded-2xl shadow-lg p-8">
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {currentQuestion.topic}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentQuestion.difficulty === 'easy' ? 'bg-success/10 text-success' :
                  currentQuestion.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>

              <div className="text-xl font-medium mb-8">
                <MathRenderer text={currentQuestion.questionText} />
              </div>

              <div className="space-y-4 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showExplanation}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      showExplanation && index === currentQuestion.correctAnswer
                        ? 'border-success bg-success/10'
                        : showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer
                        ? 'border-destructive bg-destructive/10'
                        : selectedAnswer === index && !showExplanation
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        showExplanation && index === currentQuestion.correctAnswer
                          ? 'bg-success text-success-foreground'
                          : showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-secondary'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <MathRenderer text={option} />
                      </div>
                      {showExplanation && index === currentQuestion.correctAnswer && (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      )}
                      {showExplanation && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                        <XCircle className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <div className={`p-6 rounded-xl ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'bg-success/10'
                    : 'bg-destructive/10'
                } animate-fade-in`}>
                  <div className="flex items-center gap-2 mb-3">
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`font-semibold ${
                      selectedAnswer === currentQuestion.correctAnswer
                        ? 'text-success'
                        : 'text-destructive'
                    }`}>
                      {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                    </span>
                  </div>
                  <div className="text-sm mb-4">
                    <strong>Explanation:</strong>
                    <div className="mt-2">
                      <MathRenderer text={currentQuestion.explanation} />
                    </div>
                  </div>
                  <Button onClick={nextQuestion} className="btn-gradient">
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Filters */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Filters</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Chapter</label>
                  <Select value={filters.chapter} onValueChange={(value) => setFilters({...filters, chapter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Chapters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chapters</SelectItem>
                      {availableFilters.chapters.map(chapter => (
                        <SelectItem key={chapter} value={chapter}>{chapter}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <Select value={filters.topic} onValueChange={(value) => setFilters({...filters, topic: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {availableFilters.topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <Select value={filters.difficulty} onValueChange={(value) => setFilters({...filters, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={applyFilters} className="w-full btn-gradient">
                  Apply Filters
                </Button>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold mb-4">Session Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Attempted:</span>
                  <span className="font-semibold">{score.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct:</span>
                  <span className="font-semibold text-success">{score.correct}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Incorrect:</span>
                  <span className="font-semibold text-destructive">{score.total - score.correct}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-semibold">{accuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}