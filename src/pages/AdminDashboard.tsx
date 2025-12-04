import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileQuestion, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Calendar,
  ChevronRight,
  BarChart3
} from 'lucide-react';

// Mock data
const mockStudents = [
  { id: '1', name: 'Rahul Sharma', class: 11, rollNumber: '001', joinDate: 'Nov 15, 2024' },
  { id: '2', name: 'Priya Patel', class: 12, rollNumber: '002', joinDate: 'Nov 20, 2024' },
  { id: '3', name: 'Amit Kumar', class: 11, rollNumber: '003', joinDate: 'Nov 25, 2024' },
  { id: '4', name: 'Sneha Singh', class: 12, rollNumber: '004', joinDate: 'Nov 28, 2024' },
  { id: '5', name: 'Vikram Reddy', class: 11, rollNumber: '005', joinDate: 'Dec 1, 2024' },
];

const mockQuizPerformance = [
  { id: '1', title: 'Trigonometry Basics', class: 11, attempts: 45, avgScore: 78 },
  { id: '2', title: 'Calculus Introduction', class: 12, attempts: 38, avgScore: 72 },
  { id: '3', title: 'Linear Equations', class: 11, attempts: 52, avgScore: 85 },
  { id: '4', title: 'Probability & Stats', class: 12, attempts: 41, avgScore: 68 },
];

const stats = [
  { label: 'Total Students', value: 156, icon: Users, color: 'border-info', trend: '+12%' },
  { label: 'Total Questions', value: 428, icon: FileQuestion, color: 'border-primary', trend: '+8%' },
  { label: 'Active Quizzes', value: 24, icon: BookOpen, color: 'border-success', trend: '+3' },
  { label: 'Total Attempts', value: 1248, icon: TrendingUp, color: 'border-warning', trend: '+156' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <div className="pt-16">
        <div className="gradient-primary">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-1">
                  Admin Dashboard
                </h1>
                <p className="text-primary-foreground/80">
                  Manage questions, quizzes, and monitor student progress
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/admin/add-question">
                  <Button className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </Link>
                <Link to="/admin/create-quiz">
                  <Button className="bg-white text-primary hover:bg-white/90">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Quiz
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={stat.label}
              className={`bg-card rounded-2xl shadow-lg p-6 border-l-4 ${stat.color} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-display font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <span className="text-success font-medium">{stat.trend}</span>
                <span className="text-muted-foreground">this month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Students */}
          <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Recent Students</h2>
              <Link to="/admin/students" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {mockStudents.map((student) => (
                <div 
                  key={student.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-foreground">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Class {student.class} • Roll #{student.rollNumber}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{student.joinDate}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Performance */}
          <div className="bg-card rounded-2xl shadow-lg p-6 animate-fade-in delay-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Quiz Performance</h2>
              <Link to="/admin/analytics" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {mockQuizPerformance.map((quiz) => (
                <div 
                  key={quiz.id}
                  className="p-4 rounded-xl bg-secondary/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{quiz.title}</h3>
                    <span className="text-sm text-muted-foreground">Class {quiz.class}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.attempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                      <span>{quiz.avgScore}% avg score</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl overflow-hidden animate-fade-in delay-300">
          <div className="gradient-primary p-8">
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-6 text-center">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Link to="/admin/add-question" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center card-hover">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary-foreground mb-1">
                    Add Questions
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Add new practice questions
                  </p>
                </div>
              </Link>

              <Link to="/admin/create-quiz" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center card-hover">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary-foreground mb-1">
                    Create Quiz
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    Schedule a new quiz
                  </p>
                </div>
              </Link>

              <Link to="/admin/students" className="block">
                <div className="p-6 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all text-center card-hover">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-primary-foreground mb-1">
                    Manage Students
                  </h3>
                  <p className="text-sm text-primary-foreground/70">
                    View and manage student profiles
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
