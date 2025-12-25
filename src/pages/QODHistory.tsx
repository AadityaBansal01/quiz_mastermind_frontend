import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { qodAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

import { MathPreview } from "@/components/MathPreview";
import { Link } from "react-router-dom";
export default function QODHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

const fetchHistory = async () => {
  try {
    const res = await qodAPI.getQODHistory();

    if (res.data.success) {
      setHistory(res.data.history || []);
    }
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

 return (
  <div className="min-h-screen bg-background">
    <Navbar />

    <div className="pt-20 container mx-auto px-4 max-w-5xl">
      <Link
        to="/dashboard"
        className="inline-block mb-6 text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to Dashboard
      </Link>
      
      
      
      <h1 className="text-3xl font-bold mb-6">
        Question of the Day – History
      </h1>

      

      {history.length === 0 ? (
        <p className="text-muted-foreground">
          You haven’t attempted any Question of the Day yet.
        </p>
      ) : (
        <div className="space-y-6">
          {history.map((item) => {
            const q = item.questionId;

            return (
              <div
                key={item._id}
                className="border rounded-2xl p-6 bg-card shadow-sm"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-muted-foreground">
                    📅 {new Date(item.attemptDate).toDateString()}
                  </p>

                  {item.isCorrect ? (
                    <span className="flex items-center gap-1 text-success font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Correct
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-destructive font-medium">
                      <XCircle className="w-4 h-4" /> Incorrect
                    </span>
                  )}
                </div>

                {/* QUESTION */}
                <div className="text-lg font-medium mb-4">
                  <MathPreview content={q?.questionText} />
                </div>

                {/* OPTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {q?.options?.map((opt: string, idx: number) => {
                    const isSelected = idx === item.selectedOption;
                    const isCorrectOpt = idx === q.correctAnswer;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border ${
                          isCorrectOpt
                            ? "border-success bg-success/10"
                            : isSelected
                            ? "border-destructive bg-destructive/10"
                            : "border-border"
                        }`}
                      >
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <MathPreview content={opt} />
                      </div>
                    );
                  })}
                </div>

                {/* EXPLANATION */}
                <div className="bg-muted/40 p-4 rounded-xl text-sm">
                  <p className="font-semibold mb-1">Explanation:</p>
                  <MathPreview content={q?.explanation} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
}