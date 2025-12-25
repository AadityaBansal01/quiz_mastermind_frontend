import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Search,
  Users,
  Loader2,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { adminAPI } from "@/utils/api";
import { Trash2 } from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  class: number;
  rollNumber: string;
  qodStreak: number;
  totalPoints: number;
  createdAt: string;
  isActive: boolean; 
}

export default function ManageStudents() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    fetchStudents();
  }, []);

 useEffect(() => {
  filterStudents();
}, [students, searchQuery, classFilter, statusFilter]);


  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await adminAPI.getStudents();

      if (response.data.success) {
        setStudents(response.data.students);
      } else {
        toast.error("Failed to load students");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await adminAPI.deleteStudent(id);
      toast.success("Student deleted successfully");

      // remove from UI instantly
      setStudents((prev) => prev.filter((s) => s._id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete student");
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (classFilter !== "all") {
      filtered = filtered.filter((s) => s.class.toString() === classFilter);
    }
if (statusFilter !== "all") {
  filtered = filtered.filter((s) =>
    statusFilter === "active" ? s.isActive : !s.isActive
  );
}

    setFilteredStudents(filtered);
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
            <p className="text-lg text-muted-foreground">Loading students...</p>
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
              <h1 className="font-display text-3xl font-bold">
                Manage Students
              </h1>
              <p className="text-muted-foreground">
                View and monitor student progress
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or roll number..."
                  className="pl-10 rounded-xl"
                />
              </div>

              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="11">Class 11</SelectItem>
                  <SelectItem value="12">Class 12</SelectItem>
                </SelectContent>
              </Select>


<Select value={statusFilter} onValueChange={setStatusFilter}>
  <SelectTrigger className="rounded-xl">
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Students</SelectItem>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Deactivated</SelectItem>
  </SelectContent>
</Select>





            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>

          {/* Students List */}
          <div className="grid gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="bg-card rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">
                        {getInitials(student.name)}
                      </span>
                    </div>

                    <div className="flex-1 grid md:grid-cols-4 gap-4">
                      <div>
  <p className="font-semibold text-lg flex items-center gap-2">
    {student.name}

    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        student.isActive
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {student.isActive ? "Active" : "Deactivated"}
    </span>
  </p>

  <p className="text-sm text-muted-foreground">
    {student.email}
  </p>
</div>


                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Class & Roll No
                        </p>
                        <p className="font-medium">Class {student.class}</p>
                        <p className="text-sm text-muted-foreground">
                          #{student.rollNumber}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Performance
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-warning" />
                            <span className="text-sm font-medium">
                              {student.qodStreak} streak
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium">
                              {student.totalPoints} pts
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
  navigate(`/admin/student/${student._id}`, {
    state: { from: "students" },
  })
}

                          className="rounded-xl"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStudent(student._id)}
                          className="rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-card rounded-2xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-semibold text-lg mb-2">
                  No students found
                </h3>
                <p className="text-muted-foreground">
                  {students.length === 0
                    ? "No students have registered yet"
                    : "Try adjusting your search or filters"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
