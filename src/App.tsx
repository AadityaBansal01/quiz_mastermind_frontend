import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddQuestion from "./pages/AddQuestion";
import CreateQuiz from "./pages/CreateQuiz";
import ManageStudents from "./pages/ManageStudents";
import QuizPlayer from "./pages/QuizPlayer";
import QuizResults from "./pages/QuizResults";
import NotFound from "./pages/NotFound";
import Analytics from "@/pages/Analytics";
import Practice from "@/pages/Practice";
import Profile from "@/pages/Profile";
import QuestionBank from "./pages/QuestionBank";
import ConceptOfDay from '@/pages/ConceptOfDay';
import AdminConcepts from "./pages/AdminConcepts";
import AdminQuizList from "@/pages/AdminQuizList";
import EditQuiz from "./pages/EditQuiz";
import EditQuestion from "./pages/EditQuestion";
import useMathJax from "@/hooks/useMathJax";
import AppLayout from "@/components/layout/AppLayout";
import VerifyOtp from "@/pages/VerifyOtp";
import AdminStudentDetails from "./pages/AdminStudentDetails";
import PracticeAnalytics from "./pages/PracticeAnalytics";
import QODManager from "@/pages/QODManager";
import QODHistory from "@/pages/QODHistory";
import COTDHistory from "@/pages/COTDHistory";
import PYQAdmin from "@/pages/admin/PYQAdmin";
import PYQs from "@/pages/student/PYQs";
import FormulaSheetsAdmin from "@/pages/admin/FormulaSheets";
import FormulaSheets from "@/pages/student/FormulaSheets";
import BooksStudent from "@/pages/student/Books";
import AdminBooks from "@/pages/admin/Books";
import ImportantLettersAdmin from "@/pages/admin/ImportantLettersAdmin";
import ImportantLetters from "@/pages/student/ImportantLetters";
import QuestionPaperStructureAdmin from "@/pages/admin/QuestionPaperStructureAdmin";
import QuestionPaperStructureStudent from "@/pages/student/QuestionPaperStructureStudent";
import ModelTestPaperAdmin from "@/pages/admin/ModelTestPaperAdmin";
import ModelTestPapersStudent from "@/pages/student/ModelTestPapers";   
import StudentBookmarks from "@/pages/student/Bookmarks";


const queryClient = new QueryClient();

function AppRoutes() {
   useMathJax();
  const { user } = useAuth();

  return (
   <Routes>

  {/* ---------- PUBLIC ROUTES ---------- */}
  <Route
    path="/"
    element={
      user ? (
        <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} />
      ) : (
        <AppLayout><Landing /></AppLayout>
      )
    }
  />

  <Route
    path="/login"
    element={
      user ? (
        <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} />
      ) : (
        <AppLayout><Login /></AppLayout>
      )
    }
  />

  <Route
    path="/register"
    element={
      user ? (
        <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} />
      ) : (
        <AppLayout><Register /></AppLayout>
      )
    }
  />

  {/* OTP PAGE — public */}
  <Route
    path="/verify-otp"
    element={<AppLayout><VerifyOtp /></AppLayout>}
  />

  {/* ---------- STUDENT ROUTES ---------- */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute requiredRole="student">
        <AppLayout><StudentDashboard /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/quiz/:quizId"
    element={
      <ProtectedRoute requiredRole="student">
        <AppLayout><QuizPlayer /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/quiz/results/:attemptId"
    element={
      <ProtectedRoute requiredRole="student">
        <AppLayout><QuizResults /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/practice"
    element={
      <ProtectedRoute requiredRole="student">
        <AppLayout><Practice /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/concept-of-day"
    element={
      <ProtectedRoute requiredRole="student">
        <AppLayout><ConceptOfDay /></AppLayout>
      </ProtectedRoute>
    }
  />

  {/* ---------- ADMIN ROUTES ---------- */}

  {/* FIX: ALWAYS redirect /admin → /admin/dashboard */}
  <Route
    path="/admin"
    element={<Navigate to="/admin/dashboard" replace />}
  />

  <Route
    path="/admin/dashboard"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><AdminDashboard /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/add-question"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><AddQuestion /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/create-quiz"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><CreateQuiz /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/quizzes"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><AdminQuizList /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/edit-quiz/:id"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><EditQuiz /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/edit-question/:id"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><EditQuestion /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/students"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><ManageStudents /></AppLayout>
      </ProtectedRoute>
    }
  />

<Route
  path="/admin/student/:id"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <AdminStudentDetails />
      </AppLayout>
    </ProtectedRoute>
  }
/>


<Route
  path="/admin/formula-sheets"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <FormulaSheetsAdmin />
      </AppLayout>
    </ProtectedRoute>
  }
/>



<Route
  path="/admin/books"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <AdminBooks />
      </AppLayout>
    </ProtectedRoute>
  }
/>




<Route
  path="/practice-analytics"
  element={
    <ProtectedRoute>
      <AppLayout>
        <PracticeAnalytics />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/qod-manager"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <QODManager />
      </AppLayout>
    </ProtectedRoute>
  }
/>



  <Route
    path="/admin/concepts"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><AdminConcepts /></AppLayout>
      </ProtectedRoute>
    }
  />

<Route
  path="/admin/pyqs"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <PYQAdmin />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/model-test-papers"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <ModelTestPaperAdmin />
      </AppLayout>
    </ProtectedRoute>
  }
/>



<Route
  path="/admin/important-letters"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <ImportantLettersAdmin />
      </AppLayout>
    </ProtectedRoute>
  }
/>


<Route
  path="/admin/question-paper-structure"
  element={
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <QuestionPaperStructureAdmin />
      </AppLayout>
    </ProtectedRoute>
  }
/>

  {/* ---------- SHARED ROUTES ---------- */}

  <Route
    path="/analytics"
    element={
      <ProtectedRoute>
        <AppLayout><Analytics /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <AppLayout><Profile /></AppLayout>
      </ProtectedRoute>
    }
  />

  <Route
    path="/admin/questions"
    element={
      <ProtectedRoute requiredRole="admin">
        <AppLayout><QuestionBank /></AppLayout>
      </ProtectedRoute>
    }
  />

  


<Route
  path="/qod-history"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <QODHistory />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/concept-of-day/history"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <COTDHistory />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/pyqs"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <PYQs />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/formula-sheets"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <FormulaSheets />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/books"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <BooksStudent />
      </AppLayout>
    </ProtectedRoute>
  }
/>


<Route
  path="/important-letters"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <ImportantLetters />
      </AppLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/question-paper-structure"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <QuestionPaperStructureStudent />
      </AppLayout>
    </ProtectedRoute>
  }
/>



<Route
  path="/student/model-test-papers"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <ModelTestPapersStudent />
      </AppLayout>
    </ProtectedRoute>
  }
/>


<Route
  path="/student/bookmarks"
  element={
    <ProtectedRoute requiredRole="student">
      <AppLayout>
        <StudentBookmarks />
      </AppLayout>
    </ProtectedRoute>
  }
/>




{/* ---------- 404 ---------- */}
  <Route path="*" element={<NotFound />} />

</Routes>

  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
