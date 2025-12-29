import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { modelPaperAPI } from "@/utils/api";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { bookmarkAPI } from "@/utils/api";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ModelTestPapersStudent() {
  const [papers, setPapers] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState("");
  const [syllabusType, setSyllabusType] = useState("");
const [bookmarkedPapers, setBookmarkedPapers] = useState<string[]>([]);

  useEffect(() => {
    loadPapers();
    loadBookmarks();
  }, []);

  const loadPapers = async () => {
    try {
      const res = await modelPaperAPI.getForStudent();
      if (res.data.success) {
        setPapers(res.data.papers);
      }
    } catch {
      toast.error("Failed to load model test papers");
    }
  };

  const filteredPapers = papers.filter((p) => {
    if (difficulty && p.difficulty !== difficulty) return false;
    if (syllabusType && p.syllabusType !== syllabusType) return false;
    return true;
  });

const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/model-papers/download/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
        },
      }
    );

    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.pdf`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch {
    toast.error("Failed to download model test paper");
  }
};


const loadBookmarks = async () => {
  try {
    const res = await bookmarkAPI.getAll();
    setBookmarkedPapers(
      res.data.bookmarks?.modelTestPapers?.map((p: any) => p._id) || []
    );
  } catch {
    // silent – should not block page
  }
};



const toggleBookmark = async (paperId: string) => {
  try {
    const res = await bookmarkAPI.toggleModelTest(paperId);

    setBookmarkedPapers((prev) =>
      res.data.bookmarked
        ? [...prev, paperId]
        : prev.filter((id) => id !== paperId)
    );
  } catch {
    toast.error("Failed to update bookmark");
  }
};



  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Back to Dashboard */}
  <Link
    to="/"
    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
  >
    <ArrowLeft size={16} />
    Back to Dashboard
  </Link>
      
      
      <h1 className="text-2xl font-bold">Model Test Papers</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Easy">Easy</SelectItem>
            <SelectItem value="Moderate">Moderate</SelectItem>
            <SelectItem value="Hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        <Select value={syllabusType} onValueChange={setSyllabusType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Syllabus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Syllabus</SelectItem>
            <SelectItem value="chapter">Chapter-wise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Papers */}
      {filteredPapers.length === 0 && (
        <p className="text-muted-foreground text-sm">
          No model test papers available.
        </p>
      )}

     {filteredPapers.map((paper) => (
  <Card
    key={paper._id}
    className="rounded-xl border hover:shadow-md transition-all"
  >
    <CardContent className="p-5">
      {/* Top Row */}
 <div className="flex justify-between items-start">
  <div>
    <h3 className="text-lg font-semibold">{paper.title}</h3>

    <p className="text-sm text-muted-foreground mt-1">
      {paper.syllabusType === "chapter"
        ? `Chapter-wise • ${paper.chapters?.join(", ")}`
        : "Full Syllabus"}
    </p>
  </div>

  <div className="flex items-center gap-2">
    {/* Bookmark */}
    <button
      onClick={() => toggleBookmark(paper._id)}
      className="text-yellow-500 hover:scale-110 transition"
      title="Bookmark"
    >
      <Star
        size={18}
        fill={
          bookmarkedPapers.includes(paper._id)
            ? "currentColor"
            : "none"
        }
      />
    </button>

    {/* Difficulty Badge */}
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
      {paper.difficulty}
    </span>
  </div>
</div>


    
      {/* Bottom Row */}
<div className="flex justify-between items-center mt-4">
  <p className="text-xs text-muted-foreground">
    📄 Model Test Paper • {paper.totalMarks} Marks • {paper.duration} min
  </p>

  <button
    onClick={() => handleDownload(paper._id, paper.title)}
    className="flex items-center gap-2 text-primary font-medium hover:underline"
  >
    <FileText className="w-4 h-4" />
    View PDF
  </button>
</div>
    </CardContent>
  </Card>
))}

    </div>
  );
}
