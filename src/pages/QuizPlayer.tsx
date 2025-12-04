import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { MathRenderer } from '@/components/MathRenderer';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

interface Answer {
  questionId: string;
  selectedOption: number | null;
  timeTaken: number;
}

// Mock quiz data
const mockQuiz = {
  id: '1',
  title: 'Weekly Trigonometry Test',
  duration: 30,
  questions: [
    {
      id: '1',
      questionText: 'What is the value of $\\sin^2\\theta + \\cos^2\\theta$?',
      options: ['$0$', '$1$', '$2$', '$\\tan\\theta$'],
      correctAnswer: 1,
      explanation: 'This is a fundamental trigonometric identity: $\\sin^2\\theta + \\cos^2\\theta = 1$',
      topic: 'Trigonometric Identities',
      difficulty: 'easy',
    },
    {
      id: '2',
      questionText: 'Find $\\frac{d}{dx}(x^3 + 2x^2 - 5x + 3)$',
      options: ['$3x^2 + 4x - 5$', '$3x^2 + 2x - 5$', '$x^2 + 4x - 5$', '$3x + 4$'],
      correctAnswer: 0,
      explanation: 'Using the power rule: $\\frac{d}{dx}(x^n) = nx^{n-1}$. So $\\frac{d}{dx}(x^3) = 3x^2$, $\\frac{d}{dx}(2x^2) = 4x$, $\\frac{d}{dx}(-5x) = -5$, and $\\frac{d}{dx}(3) = 0$.',
      topic: 'Derivatives',
      difficulty: 'medium',
    },
    {
      id: '3',
      questionText: 'If $\\tan\\theta = \\frac{3}{4}$, find $\\sin\\theta$ (assuming $\\theta$ is in the first quadrant)',
      options: ['$\\frac{3}{5}$', '$\\frac{4}{5}$', '$\\frac{3}{4}$', '$\\frac{5}{3}$'],
      correctAnswer: 0,
      explanation: 'Using $\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}} = \\frac{3}{4}$, the hypotenuse is $\\sqrt{3^2 + 4^2} = 5$. Therefore, $\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}} = \\frac{3}{5}$.',
      topic: 'Trigonometric Ratios',
      difficulty: 'medium',
    },
    {
      id: '4',
      questionText: 'Evaluate: $\\int x^2 \\, dx$',
      options: ['$\\frac{x^3}{3} + C$', '$2x + C$', '$\\frac{x^2}{2} + C$', '$x^3 + C$'],
      correctAnswer: 0,
      explanation: 'Using the power rule for integration: $\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$. For $n=2$: $\\int x^2 \\, dx = \\frac{x^3}{3} + C$.',
      topic: 'Integration',
      difficulty: 'easy',
    },
    {
      id: '5',
      questionText: 'Solve: $x^2 - 5x + 6 = 0$',
      options: ['$x = 2, 3$', '$x = -2, -3$', '$x = 1, 6$', '$x = -1, -6$'],
      correctAnswer: 0,
      explanation: 'Factoring: $x^2 - 5x + 6 = (x-2)(x-3) = 0$. Therefore $x = 2$ or $x = 3$.',
      topic: 'Quadratic Equations',
      difficulty: 'easy',
    },
  ],
};

export default function QuizPlayer() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(mockQuiz.duration * 60);
  const [startTime] = useState(new Date());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const questions = mockQuiz.questions;

  // Initialize answers
  useEffect(() => {
    setAnswers(
      questions.map((q) => ({
        questionId: q.id,
        selectedOption: null,
        timeTaken: 0,
      }))
    );
  }, [questions]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        if (prev === 300 && !showTimeWarning) {
          setShowTimeWarning(true);
          toast.warning('5 minutes remaining!', { duration: 5000 });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showTimeWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    // Record time spent on current question
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

  const handleSubmit = useCallback((autoSubmit: boolean = false) => {
    const endTime = new Date();
    const totalTimeTaken = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate score
    let score = 0;
    const detailedAnswers = answers.map((ans, idx) => {
      const isCorrect = ans.selectedOption === questions[idx].correctAnswer;
      if (isCorrect) score++;
      return {
        ...ans,
        isCorrect,
        question: questions[idx],
      };
    });

    // Save attempt to localStorage
    const attempt = {
      id: Date.now().toString(),
      quizId: mockQuiz.id,
      quizTitle: mockQuiz.title,
      userId: user?.id,
      answers: detailedAnswers,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalTimeTaken,
      createdAt: new Date().toISOString(),
    };

    const existingAttempts = JSON.parse(localStorage.getItem('mathquiz_attempts') || '[]');
    existingAttempts.push(attempt);
    localStorage.setItem('mathquiz_attempts', JSON.stringify(existingAttempts));

    if (autoSubmit) {
      toast.info('Time is up! Quiz submitted automatically.');
    } else {
      toast.success('Quiz submitted successfully!');
    }

    navigate(`/quiz/results/${attempt.id}`);
  }, [answers, questions, startTime, user, navigate]);

  const current = questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];
  const answeredCount = answers.filter((a) => a.selectedOption !== null).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Top Bar */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <h2 className="font-display font-semibold truncate">{mockQuiz.title}</h2>
            
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold ${
                timeLeft <= 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-secondary'
              }`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} / {questions.length}
              </span>

              <button
                onClick={() => setShowPalette(!showPalette)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary"
              >
                {showPalette ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    current.difficulty === 'easy' ? 'bg-success/10 text-success' :
                    current.difficulty === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    {current.difficulty}
                  </span>
                </div>

                {/* Question Text */}
                <div className="text-xl font-medium mb-8">
                  <span className="text-primary font-bold mr-2">Q{currentQuestion + 1}.</span>
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
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          currentAnswer?.selectedOption === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}>
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

                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={() => setShowSubmitDialog(true)}
                    className="btn-gradient"
                  >
                    Submit Quiz
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
                <h3 className="font-display font-semibold mb-4">Question Palette</h3>
                
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentQuestion === index
                          ? 'bg-success text-success-foreground ring-2 ring-success ring-offset-2'
                          : answers[index]?.selectedOption !== null
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
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
                    <div className="w-4 h-4 rounded bg-secondary" />
                    <span>Unanswered ({questions.length - answeredCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-success" />
                    <span>Current</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full mt-6 btn-gradient"
                >
                  Submit Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Palette */}
      {showPalette && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setShowPalette(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-card shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-semibold mb-4">Question Palette</h3>
            
            <div className="grid grid-cols-5 gap-2 mb-6">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentQuestion === index
                      ? 'bg-success text-success-foreground'
                      : answers[index]?.selectedOption !== null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowSubmitDialog(true)}
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
              You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-warning font-medium">
                  {questions.length - answeredCount} question(s) are unanswered!
                </span>
              )}
              <span className="block mt-2">
                Are you sure you want to submit?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(false)} className="btn-gradient">
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
