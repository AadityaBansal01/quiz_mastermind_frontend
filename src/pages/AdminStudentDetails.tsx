import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { adminAPI } from "@/utils/api";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


interface Student {
  name: string;
  email: string;
  class: number;
  rollNumber: string;
  qodStreak: number;
  totalPoints: number;
  createdAt: string;
  isActive: boolean;  
}

export default function AdminStudentDetails() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
const navigate = useNavigate();


  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await adminAPI.getStudentById(id!);
        if (res.data.success) {
          setStudent(res.data.student);
          setAttempts(res.data.attempts);
        }
      } catch (error) {
        console.error("Failed to load student", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return <p className="text-center mt-20">Student not found</p>;
  }
const totalAttempts = attempts.length;

const averageScore =
  totalAttempts > 0
    ? Math.round(
        attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
      )
    : 0;

const bestScore =
  totalAttempts > 0
    ? Math.max(...attempts.map((a) => a.percentage))
    : 0;



  return (
    <div className="min-h-screen bg-background">
      <Navbar />

    <div className="pt-20 container mx-auto px-4">
  <div className="flex items-center gap-3 mb-6">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
  >
    <ArrowLeft className="w-4 h-4" />
    Back
  </button>
</div>

<h1 className="text-3xl font-bold">{student.name}</h1>
<p className="text-muted-foreground">{student.email}</p>

<div className="mt-4">
  <button
    className={`px-4 py-2 rounded-xl text-white font-medium transition ${
      student.isActive
        ? "bg-red-500 hover:bg-red-600"
        : "bg-green-500 hover:bg-green-600"
    }`}
    onClick={async () => {
  try {
    const res = await adminAPI.toggleStudentStatus(id!);

    setStudent(prev =>
      prev
        ? { ...prev, isActive: res.data.isActive }
        : prev
    );
  } catch (err) {
    console.error("Failed to toggle status");
  }
}}

  >
    {student.isActive ? "Deactivate Student" : "Activate Student"}
  </button>
</div>


        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <div className="bg-card p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Class</p>
            <p className="font-semibold">Class {student.class}</p>
          </div>

          <div className="bg-card p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Roll No</p>
            <p className="font-semibold">#{student.rollNumber}</p>
          </div>

          <div className="bg-card p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">QOD Streak</p>
            <p className="font-semibold">{student.qodStreak}</p>
          </div>

          <div className="bg-card p-4 rounded-xl">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="font-semibold">{student.totalPoints}</p>
          </div>
        </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
  <div className="bg-card rounded-xl p-4 text-center shadow">
    <p className="text-sm text-muted-foreground">Quizzes Attempted</p>
    <p className="text-2xl font-bold">{totalAttempts}</p>
  </div>

  <div className="bg-card rounded-xl p-4 text-center shadow">
    <p className="text-sm text-muted-foreground">Average Score</p>
    <p className="text-2xl font-bold">{averageScore}%</p>
  </div>

  <div className="bg-card rounded-xl p-4 text-center shadow">
    <p className="text-sm text-muted-foreground">Best Score</p>
    <p className="text-2xl font-bold text-success">{bestScore}%</p>
  </div>
</div>



        <h2 className="text-xl font-bold mt-10 mb-4">Recent Quiz Attempts</h2>

        {attempts.length === 0 ? (
          <p className="text-muted-foreground">No attempts yet</p>
        ) : (
          <div className="space-y-3">
            {attempts.map((a) => (
  <div key={a._id} className="bg-card p-4 rounded-xl">
    <p className="font-medium">
      {a.quizId?.title ?? "Practice / Deleted Quiz"}
    </p>

    <p className="text-sm text-muted-foreground">
      Score: {a.percentage}% • {new Date(a.createdAt).toDateString()}
    </p>
  </div>
))}

          </div>
        )}
      </div>
    </div>
  );
}
