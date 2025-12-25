import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { bookmarkAPI } from "@/utils/api";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";



export default function StudentBookmarks() {
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [modelPapers, setModelPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    try {
      const res = await bookmarkAPI.getAll();
      setPyqs(res.data.bookmarks?.pyqs || []);
      setModelPapers(res.data.bookmarks?.modelTestPapers || []);
    } catch {
      toast.error("Failed to load bookmarks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-muted-foreground">Loading bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
  <Link
    to="/"
    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
  >
    <ArrowLeft className="w-4 h-4" />
    Back to Dashboard
  </Link>

  <div>
    <h1 className="text-2xl font-semibold">My Bookmarks</h1>
    <p className="text-muted-foreground">
      Quick access to your saved study resources
    </p>
  </div>
</div>

      {/* ================= PYQs ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">⭐ Bookmarked PYQs</h2>

        {pyqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookmarked PYQs yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pyqs.map((pyq) => (
              <Card key={pyq._id} className="hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="text-base">{pyq.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Year: {pyq.year}
                    {pyq.chapter && ` • ${pyq.chapter}`}
                  </p>

                  <Button asChild className="w-full">
                    <a
                      href={`http://localhost:5000/${pyq.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ================= MODEL TEST PAPERS ================= */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">
          ⭐ Bookmarked Model Test Papers
        </h2>

        {modelPapers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bookmarked model test papers yet.
          </p>
        ) : (
          <div className="space-y-4">
            {modelPapers.map((paper) => (
              <Card
                key={paper._id}
                className="rounded-xl border hover:shadow-md transition"
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {paper.title}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        {paper.syllabusType === "chapter"
                          ? `Chapter-wise • ${paper.chapters?.join(", ")}`
                          : "Full Syllabus"}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {paper.difficulty}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-muted-foreground">
                      📄 Model Test Paper
                    </p>

                    <a
                      href={`http://localhost:5000${paper.pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary font-medium hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      View PDF
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
