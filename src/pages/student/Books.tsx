import { useEffect, useMemo, useState } from "react";
import { bookAPI } from "@/utils/api";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, BookOpen } from "lucide-react";
import { toast } from "sonner";
interface Book {
  _id: string;
  class: number;
  title: string;
  chapter?: string;
  description?: string;
  fileUrl: string;
  isFullBook: boolean;
}

export default function BooksStudent() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [chapter, setChapter] = useState("all");
  const [type, setType] = useState("all"); // full / chapter
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/books/download/${id}`,
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
    toast.error("Failed to download PDF");
  }
};



  const loadBooks = async () => {
    try {
      const res = await bookAPI.getForStudent();
      setAllBooks(res.data);
    } catch {
      console.error("Failed to load books");
    }
  };

  /* 🔹 Unique chapters */
  const chapters = useMemo(() => {
    return Array.from(
      new Set(
        allBooks
          .filter((b) => b.chapter)
          .map((b) => b.chapter as string)
      )
    );
  }, [allBooks]);

  /* 🔹 Filter logic */
  const filteredBooks = useMemo(() => {
  let data = [...allBooks];

  if (type !== "all") {
    data = data.filter((b) =>
      type === "full" ? b.chapter === null : b.chapter !== null
    );
  }

  if (chapter !== "all") {
    data = data.filter((b) => b.chapter === chapter);
  }

  if (search.trim()) {
    data = data.filter((b) =>
      b.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  return data;
}, [allBooks, chapter, type, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        
        <Link
        to="/dashboard"
        className="inline-block mb-6 text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to Dashboard
      </Link>
        
        
        <h1 className="text-2xl md:text-3xl font-semibold">
          Book Section
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          NCERT & reference books – full books and chapter-wise PDFs
        </p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Type */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Book Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="full">Full Books</SelectItem>
            <SelectItem value="chapter">Chapter-wise</SelectItem>
          </SelectContent>
        </Select>

        {/* Chapter */}
        <Select value={chapter} onValueChange={setChapter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Chapter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chapters</SelectItem>
            {chapters.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredBooks.map((book) => (
          <Card key={book._id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {book.title}
              </CardTitle>

              <p className="text-sm text-muted-foreground">
                {book.isFullBook
                  ? "Full Book"
                  : `Chapter: ${book.chapter}`}
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {book.description && (
                <p className="text-sm text-muted-foreground">
                  {book.description}
                </p>
              )}

             <Button
  className="w-full flex items-center gap-2"
  onClick={() => handleDownload(book._id, book.title)}
>
  <Download className="w-4 h-4" />
  Download PDF
</Button>
            </CardContent>
          </Card>
        ))}

        {filteredBooks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No books found.
          </p>
        )}
      </div>
    </div>
  );
}
