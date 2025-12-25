import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminAPI } from '@/utils/api';
import { 
  Calendar, 
  Clock, 
  FileQuestion,
  ArrowLeft,
  Search,
  X,
  GripVertical,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { MathRenderer } from "@/components/MathRenderer";

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";



interface Question {
  _id: string;
  questionText: string;
  topic: string;
  chapter: string;
  difficulty: string;
  class: number;
}

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<QuizForm>({
    title: '',
    description: '',
    class: '',
    duration: '30',
    quizType: 'practice',
    scheduledDate: new Date().toISOString().split('T')[0],
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
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getQuestions();
      
      if (response.data.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.topic.toLowerCase().includes(searchQuery.toLowerCase());
   const matchesClass = !filters.class || filters.class === 'all' || q.class.toString() === filters.class;
const matchesDifficulty = !filters.difficulty || filters.difficulty === 'all' || q.difficulty === filters.difficulty;
    const notSelected = !selectedQuestions.find(sq => sq._id === q._id);
    
    return matchesSearch && matchesClass && matchesDifficulty && notSelected;
  });

  const addQuestion = (question: Question) => {
    setSelectedQuestions([...selectedQuestions, question]);
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q._id !== questionId));
  };

  const handleSubmit = async () => {
    // Validation
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
    if (!form.scheduledDate) {
      toast.error('Please select a scheduled date');
      return;
    }

    try {
      setSaving(true);

      const quizData = {
        title: form.title,
        description: form.description,
        class: parseInt(form.class),
        duration: parseInt(form.duration),
        quizType: form.quizType,
        questions: selectedQuestions.map(q => q._id),
        scheduledDate: new Date(form.scheduledDate).toISOString(),
      };

      const response = await adminAPI.createQuiz(quizData);

      if (response.data.success) {
        toast.success('Quiz created successfully!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      console.error('Failed to create quiz:', error);
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setSaving(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'hard': return 'bg-destructive/10 text-destructive';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

const handleDragEnd = (result: DropResult) => {
  if (!result.destination) return;

  const reordered = Array.from(selectedQuestions);
  const [moved] = reordered.splice(result.source.index, 1);
  reordered.splice(result.destination.index, 0, moved);

  setSelectedQuestions(reordered);
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold">Create Quiz</h1>
              <p className="text-muted-foreground">
                Set up a new quiz for students
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form & Question Selection */}
            <div className="space-y-6">
              {/* Quiz Details */}
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in">
                <h2 className="font-display text-xl font-bold mb-6">
                  Quiz Details
                </h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="title">Quiz Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g., Weekly Trigonometry Test"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
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
                        onValueChange={(value) =>
                          setForm({ ...form, class: value })
                        }
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
                      <Label>Duration (minutes) *</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={form.duration}
                          onChange={(e) =>
                            setForm({ ...form, duration: e.target.value })
                          }
                          className="pl-10 rounded-xl"
                          min={5}
                          max={180}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Quiz Type *</Label>
                      <Select
                        value={form.quizType}
                        onValueChange={(value) =>
                          setForm({ ...form, quizType: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Biweekly</SelectItem>
                          <SelectItem value="competency">Competency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Scheduled Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="date"
                          value={form.scheduledDate}
                          onChange={(e) =>
                            setForm({ ...form, scheduledDate: e.target.value })
                          }
                          className="pl-10 rounded-xl"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Selection */}
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
                <h2 className="font-display text-xl font-bold mb-4">
                  Select Questions
                </h2>

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
                      onValueChange={(value) =>
                        setFilters({ ...filters, class: value })
                      }
                    >
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
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
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue placeholder="Difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
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
                      key={question._id}
                      className="p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => addQuestion(question)}
                    >
                      <div className="font-medium text-sm mb-2 line-clamp-2">
                        <MathRenderer text={question.questionText} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {question.topic}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(
                            question.difficulty
                          )}`}
                        >
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
                      {questions.length === 0 && (
                        <p className="text-sm mt-2">
                          Add questions first to create a quiz
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Selected Questions */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">
                    Selected Questions
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {selectedQuestions.length} selected
                  </span>
                </div>

                {selectedQuestions.length > 0 ? (
                  <>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="selected-questions">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-3 max-h-96 overflow-y-auto pr-2 mb-6"
                          >
                            {selectedQuestions.map((question, index) => (
                              <Draggable
                                key={question._id}
                                draggableId={question._id}
                                index={index}
                              >
                                {(provided, snapshot) => (
  <div
    className={
      "flex items-start gap-3 p-3 rounded-xl bg-secondary/50 transition-shadow " +
      (snapshot.isDragging ? "shadow-xl ring-2 ring-primary/30" : "")
    }
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                  >
                                    {/* Drag Handle */}
                                    <div
                                      {...provided.dragHandleProps}
                                      className="flex items-center gap-2 cursor-grab"
                                    >
                                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-medium">
                                        {index + 1}
                                      </span>
                                    </div>

                                    {/* Question Text */}
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium line-clamp-2">
  <MathRenderer text={question.questionText} />
</div>

                                      <p className="text-xs text-muted-foreground mt-1">
                                        {question.topic} • {question.difficulty}
                                      </p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                      onClick={() =>
                                        removeQuestion(question._id)
                                      }
                                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div className="p-4 rounded-xl bg-primary/5 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Total Questions:</span>
                        <span className="font-semibold">
                          {selectedQuestions.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Total Marks:</span>
                        <span className="font-semibold">
                          {selectedQuestions.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Estimated Time:</span>
                        <span className="font-semibold">
                          {form.duration} min
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="w-full btn-gradient"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Quiz...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Create Quiz
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No questions selected</p>
                    <p className="text-sm mt-1">
                      Click on questions to add them
                    </p>
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