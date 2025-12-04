import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  Clock, 
  FileQuestion,
  ArrowLeft,
  Search,
  X,
  GripVertical
} from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: string;
  questionText: string;
  topic: string;
  chapter: string;
  difficulty: string;
  class: string;
}

// Mock questions for demo
const mockQuestions: Question[] = [
  { id: '1', questionText: 'What is sin²θ + cos²θ?', topic: 'Trigonometric Identities', chapter: 'Trigonometry', difficulty: 'easy', class: '11' },
  { id: '2', questionText: 'Solve: d/dx (x³ + 2x)', topic: 'Derivatives', chapter: 'Calculus', difficulty: 'medium', class: '12' },
  { id: '3', questionText: 'Find the determinant of a 2x2 matrix', topic: 'Matrices', chapter: 'Linear Algebra', difficulty: 'medium', class: '12' },
  { id: '4', questionText: 'If A ∩ B = ∅, what are A and B?', topic: 'Set Theory', chapter: 'Sets', difficulty: 'easy', class: '11' },
  { id: '5', questionText: 'Find P(A|B) given P(A∩B) and P(B)', topic: 'Conditional Probability', chapter: 'Probability', difficulty: 'hard', class: '12' },
  { id: '6', questionText: 'Solve the quadratic equation x² - 5x + 6 = 0', topic: 'Quadratics', chapter: 'Algebra', difficulty: 'easy', class: '11' },
  { id: '7', questionText: 'Find the integral of sin(x)dx', topic: 'Integration', chapter: 'Calculus', difficulty: 'medium', class: '12' },
  { id: '8', questionText: 'What is the sum of an infinite GP with |r| < 1?', topic: 'Sequences', chapter: 'Sequences & Series', difficulty: 'hard', class: '11' },
];

interface QuizForm {
  title: string;
  description: string;
  class: string;
  duration: string;
  quizType: string;
  scheduledDate: string;
}

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    class: '',
    duration: '30',
    quizType: 'weekly',
    scheduledDate: '',
  });
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    class: '',
    chapter: '',
    difficulty: '',
  });

  useEffect(() => {
    // Load questions from localStorage or use mock
    const stored = localStorage.getItem('mathquiz_questions');
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuestions([...mockQuestions, ...parsed]);
    } else {
      setQuestions(mockQuestions);
    }
  }, []);

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = !filters.class || q.class === filters.class;
    const matchesDifficulty = !filters.difficulty || q.difficulty === filters.difficulty;
    const notSelected = !selectedQuestions.find(sq => sq.id === q.id);
    
    return matchesSearch && matchesClass && matchesDifficulty && notSelected;
  });

  const addQuestion = (question: Question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.id !== questionId));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }
    if (!form.class) {
      toast.error('Please select a class');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    const newQuiz = {
      ...form,
      id: Date.now().toString(),
      questions: selectedQuestions.map(q => q.id),
      totalMarks: selectedQuestions.length,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('mathquiz_quizzes') || '[]');
    existing.push(newQuiz);
    localStorage.setItem('mathquiz_quizzes', JSON.stringify(existing));

    toast.success('Quiz created successfully!');
    navigate('/admin');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold">Create Quiz</h1>
              <p className="text-muted-foreground">Set up a new quiz for students</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form & Question Selection */}
            <div className="space-y-6">
              {/* Quiz Details */}
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in">
                <h2 className="font-display text-xl font-bold mb-6">Quiz Details</h2>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., Weekly Trigonometry Test"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description of the quiz..."
                      rows={2}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Class *</Label>
                      <Select 
                        value={form.class} 
                        onValueChange={(value) => setForm({ ...form, class: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="11">Class 11</SelectItem>
                          <SelectItem value="12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration (minutes)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={form.duration}
                          onChange={(e) => setForm({ ...form, duration: e.target.value })}
                          className="pl-10 rounded-xl"
                          min={5}
                          max={180}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Quiz Type</Label>
                      <Select 
                        value={form.quizType} 
                        onValueChange={(value) => setForm({ ...form, quizType: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="competency">Competency</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Scheduled Date</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={form.scheduledDate}
                          onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Selection */}
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
                <h2 className="font-display text-xl font-bold mb-4">Select Questions</h2>
                
                {/* Search & Filters */}
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select 
                      value={filters.class} 
                      onValueChange={(value) => setFilters({ ...filters, class: value })}
                    >
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="11">Class 11</SelectItem>
                        <SelectItem value="12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.difficulty} 
                      onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                    >
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Question List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {filteredQuestions.map((question) => (
                    <div 
                      key={question.id}
                      className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => addQuestion(question)}
                    >
                      <p className="font-medium text-sm mb-2 line-clamp-2">{question.questionText}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {question.topic}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs">
                          Class {question.class}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {filteredQuestions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileQuestion className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No questions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Selected Questions */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">Selected Questions</h2>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {selectedQuestions.length} selected
                  </span>
                </div>

                {selectedQuestions.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6">
                      {selectedQuestions.map((question, index) => (
                        <div 
                          key={question.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50"
                        >
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{question.questionText}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.topic} • {question.difficulty}
                            </p>
                          </div>
                          <button 
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Total Questions:</span>
                        <span className="font-semibold">{selectedQuestions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Marks:</span>
                        <span className="font-semibold">{selectedQuestions.length}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      className="w-full btn-gradient"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Quiz
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No questions selected</p>
                    <p className="text-sm mt-1">Click on questions to add them</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
