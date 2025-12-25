import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { quizAPI } from '@/utils/api';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target,
  Trophy,
  Clock,
  Loader2,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface PracticeAttempt {
  _id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: string;
}


export default function Analytics() {
  const navigate = useNavigate();
 
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
     const response = await quizAPI.getPracticeSummary();
      if (response.data.success) {
        setAttempts(response.data.attempts || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
 const totalSessions = attempts.length;
  const avgScore = totalSessions > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalSessions)
    : 0;
  const bestScore = totalSessions > 0
    ? Math.max(...attempts.map(a => a.percentage))
    : 0;
  const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const correctAnswers = attempts.reduce((sum, a) => sum + a.score, 0);

  // Performance over time
  const performanceData = attempts
    .slice(0, 10)
    .reverse()
    .map((attempt, index) => ({
      name: `Quiz ${index + 1}`,
      score: attempt.percentage,
      date: new Date(attempt.createdAt).toLocaleDateString()
    }));

  // Score distribution
  const scoreRanges = [
    { range: '0-40%', count: 0 },
    { range: '41-60%', count: 0 },
    { range: '61-80%', count: 0 },
    { range: '81-100%', count: 0 }
  ];

  attempts.forEach(attempt => {
    if (attempt.percentage <= 40) scoreRanges[0].count++;
    else if (attempt.percentage <= 60) scoreRanges[1].count++;
    else if (attempt.percentage <= 80) scoreRanges[2].count++;
    else scoreRanges[3].count++;
  });

  

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

       <h1 className="font-display text-3xl font-bold mb-8">
  Practice Analytics
</h1>

        {totalSessions === 0 ? (
          <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No data yet</h3>
            <p className="text-muted-foreground mb-4">
  Complete some practice sessions to see your analytics
</p>
            <Button onClick={() => navigate('/dashboard')} className="btn-gradient">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-primary">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-primary" />
                  <span className="text-3xl font-bold">{totalSessions}</span>
                </div>
                <p className="text-muted-foreground">Practice Sessions</p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-success">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-8 h-8 text-success" />
                  <span className="text-3xl font-bold">{avgScore}%</span>
                </div>
                <p className="text-muted-foreground">Average Score</p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-warning">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-8 h-8 text-warning" />
                  <span className="text-3xl font-bold">{bestScore}%</span>
                </div>
                <p className="text-muted-foreground">Best Score</p>
              </div>

              <div className="bg-card rounded-2xl shadow-lg p-6 border-l-4 border-info">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-8 h-8 text-info" />
                  <span className="text-3xl font-bold">
                    {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <p className="text-muted-foreground">Overall Accuracy</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Performance Over Time */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
               <h3 className="font-semibold text-lg mb-4">
  Performance Trend (Last 10 Practice Sessions)
</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Score Distribution */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-lg mb-4">Score Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

         

            {/* Recent Performance */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Practice Sessions</h3>
              <div className="space-y-3">
                {attempts.slice(0, 5).map((attempt) => (
                  <div 
                    key={attempt._id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">Practice Session</p>
<p className="text-sm text-muted-foreground">
  {new Date(attempt.createdAt).toLocaleDateString()}
</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{attempt.percentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {attempt.score}/{attempt.totalQuestions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Insights & Recommendations</h3>
              <div className="space-y-4">
                {avgScore >= 80 && (
                  <div className="p-4 rounded-xl bg-success/10 border-l-4 border-success">
                    <p className="font-medium text-success mb-1">Excellent Performance!</p>
                    <p className="text-sm text-muted-foreground">
                      You're scoring above 80% on average. Keep up the great work!
                    </p>
                  </div>
                )}
                {avgScore >= 60 && avgScore < 80 && (
                  <div className="p-4 rounded-xl bg-info/10 border-l-4 border-info">
                    <p className="font-medium text-info mb-1">Good Progress</p>
                    <p className="text-sm text-muted-foreground">
                      You're doing well! Practice more to reach 80%+ consistently.
                    </p>
                  </div>
                )}
                {avgScore < 60 && (
                  <div className="p-4 rounded-xl bg-warning/10 border-l-4 border-warning">
                    <p className="font-medium text-warning mb-1">Keep Practicing</p>
                    <p className="text-sm text-muted-foreground">
                      Focus on understanding concepts better. Use practice mode more often.
                    </p>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-primary/10 border-l-4 border-primary">
                  <p className="font-medium text-primary mb-1">Tip</p>
                  <p className="text-sm text-muted-foreground">
                    Try the daily Question of the Day to maintain your streak and earn bonus points!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}