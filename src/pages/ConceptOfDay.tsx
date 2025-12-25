import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cotdAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen, Lightbulb, PenTool, Calendar, GraduationCap } from "lucide-react";
import { MathRenderer } from "@/components/MathRenderer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ConceptOfDay() {
  const { user } = useAuth();
   const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [concept, setConcept] = useState<any>(null);

  useEffect(() => {
    loadConcept();
  }, []);

  const loadConcept = async () => {
    try {
      const res = await cotdAPI.getTodayConcept(user.class);
      if (res.data.success) {
        setConcept(res.data.concept);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading today’s concept…
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- No Concept ---------------- */
  if (!concept) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 px-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">📚</div>
            <h1 className="text-2xl font-bold">
              No Concept Available Today
            </h1>
            <p className="text-muted-foreground">
              Check back tomorrow for a new concept
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- Main UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />
{/* Back to Dashboard */}
<div className="container mx-auto px-4 pt-20 max-w-5xl">
  <button
    onClick={() => navigate("/dashboard")}
    className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-6"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Dashboard
  </button>
</div>
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl">

              {/* Header Card */}
<div className="bg-card rounded-2xl shadow-lg p-6 md:p-8 mb-10 border">
  <div className="flex flex-col gap-4">

    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Concept of the Day
        </h1>
        <p className="text-muted-foreground text-sm">
          One important idea to strengthen your fundamentals
        </p>
      </div>
    </div>

    <h2 className="text-2xl md:text-3xl font-semibold mt-2">
      {concept.title}
    </h2>

    <div className="flex flex-wrap gap-3 text-sm">
      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
        Class {concept.class}
      </span>
      <span className="px-3 py-1 rounded-full bg-secondary">
        {concept.chapter}
      </span>
      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent">
        {concept.topic}
      </span>
    </div>

    <p className="text-sm text-muted-foreground flex items-center gap-2">
      <Calendar className="w-4 h-4" />
      {new Date(concept.scheduledDate).toDateString()}
    </p>
  </div>
</div>


        {/* Content Cards */}
        <div className="space-y-6">

          {/* Formula */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Formula / Concept
              </h2>
            </div>
            <div className="p-6 md:p-8 text-base md:text-lg leading-relaxed">
              <MathRenderer text={concept.formula} />
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
              <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Explanation
              </h2>
            </div>
            <div className="p-6 md:p-8 text-base md:text-lg leading-relaxed">
              <MathRenderer text={concept.explanation} />
            </div>
          </div>

          {/* Example */}
          {concept.example && (
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                <h2 className="font-bold text-lg text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5" />
                  Example
                </h2>
              </div>
              <div className="p-6 md:p-8 text-base md:text-lg leading-relaxed">
                <MathRenderer text={concept.example} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Motivation */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-2xl shadow-lg px-8 py-6 border">
            <div className="text-2xl mb-2">⭐</div>
            <p className="font-medium">
              Revise this concept before attempting today’s quiz
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Understanding builds confidence
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
