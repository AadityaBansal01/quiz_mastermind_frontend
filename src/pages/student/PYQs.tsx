import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { pyqAPI } from "@/utils/api";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { bookmarkAPI } from "@/utils/api";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
interface PYQ {
  _id: string;
  year: number;
  title: string;
  chapter?: string;
  fileUrl: string;
}

export default function StudentPYQs() {
  const [allPyqs, setAllPyqs] = useState<PYQ[]>([]);
  const [filteredPyqs, setFilteredPyqs] = useState<PYQ[]>([]);
  const [year, setYear] = useState<string>("all");
  const [search, setSearch] = useState("");
const [bookmarkedPYQs, setBookmarkedPYQs] = useState<string[]>([]);
  // 🔹 Fetch ONCE
  const fetchPYQs = async () => {
    try {
      const res = await pyqAPI.getForStudent();
      setAllPyqs(res.data as PYQ[]);
      setFilteredPyqs(res.data as PYQ[]);
    } catch {
      toast.error("Failed to load PYQs");
    }
  };

const loadBookmarks = async () => {
  try {
    const res = await bookmarkAPI.getAll();
    setBookmarkedPYQs(
      res.data.bookmarks?.pyqs?.map((p: any) => p._id) || []
    );
  } catch {
    // silently fail – bookmarks should not block PYQs
  }
};


  useEffect(() => {
    fetchPYQs();
    loadBookmarks();
  }, []);

  // 🔹 Apply filters locally
  useEffect(() => {
    let data = [...allPyqs];

    if (year !== "all") {
      data = data.filter(p => String(p.year) === year);
    }

    if (search.trim()) {
      data = data.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredPyqs(data);
  }, [year, search, allPyqs]);

  // 🔹 Years list
  const years = Array.from(new Set(allPyqs.map(p => p.year))).sort(
    (a, b) => b - a
  );


const toggleBookmark = async (pyqId: string) => {
  try {
    const res = await bookmarkAPI.togglePYQ(pyqId);

    setBookmarkedPYQs((prev) =>
      res.data.bookmarked
        ? [...prev, pyqId]
        : prev.filter((id) => id !== pyqId)
    );
  } catch {
    toast.error("Failed to update bookmark");
  }
};






  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
       <Link
  to="/"
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2"
>
  <ArrowLeft size={16} />
  Back to Dashboard
</Link>
        <h1 className="text-2xl font-semibold">Previous Year Questions</h1>
        <p className="text-muted-foreground">
          Download class-wise PYQs for exam practice
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
        {/* Year Filter */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger>
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Title Search */}
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-2 w-full"
        />
      </div>

      {/* List */}
      {filteredPyqs.length === 0 ? (
        <p className="text-muted-foreground">No PYQs available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPyqs.map((pyq) => (
            <Card key={pyq._id} className="hover:shadow-md transition">
              <CardHeader className="flex flex-row items-start justify-between">
  <CardTitle className="text-base">{pyq.title}</CardTitle>

  <button
    onClick={() => toggleBookmark(pyq._id)}
    className="text-yellow-500 hover:scale-110 transition"
    title="Bookmark"
  >
    <Star
      size={18}
      fill={bookmarkedPYQs.includes(pyq._id) ? "currentColor" : "none"}
    />
  </button>
</CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Year: {pyq.year}
                  {pyq.chapter && ` • ${pyq.chapter}`}
                </p>

               <Button asChild className="w-full">
  <a
    href={`${import.meta.env.VITE_API_BASE_URL.replace(
      "/api",
      ""
    )}/${pyq.fileUrl}`}
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
    </div>
  );
}
