import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { cotdAPI } from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { MathPreview } from "@/components/MathPreview";
import { Link } from "react-router-dom";

export default function COTDHistory() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      if (!user?.class) return;

      const res = await cotdAPI.getConceptHistory(user.class);

      if (res.data.success) {
        setHistory(res.data.concepts || []);
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
        <h1 className="text-3xl font-bold mb-6">
          Concept of the Day – History
        </h1>

        <Link
          to="/dashboard"
          className="inline-block mb-6 text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to Dashboard
        </Link>

        {history.length === 0 ? (
          <p className="text-muted-foreground">
            No Concepts of the Day available yet.
          </p>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div
                key={item._id}
                className="border rounded-2xl p-6 bg-card shadow-sm"
              >
                {/* DATE */}
                <p className="text-sm text-muted-foreground mb-2">
                  📅 {new Date(item.scheduledDate).toDateString()}
                </p>

                {/* TITLE */}
                <h2 className="text-xl font-semibold mb-3">
                  {item.title}
                </h2>

                {/* FORMULA */}
                {item.formula && (
                  <div className="mb-4">
                    <p className="font-semibold mb-1">Formula:</p>
                    <MathPreview content={item.formula} />
                  </div>
                )}

                {/* EXPLANATION */}
                <div className="mb-4">
                  <p className="font-semibold mb-1">Explanation:</p>
                  <MathPreview content={item.explanation} />
                </div>

                {/* EXAMPLE */}
                {item.example && (
                  <div className="bg-muted/40 p-4 rounded-xl text-sm">
                    <p className="font-semibold mb-1">Example:</p>
                    <MathPreview content={item.example} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
