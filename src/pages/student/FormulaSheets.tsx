import { useEffect, useMemo, useState } from "react";
import { formulaAPI } from "@/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface FormulaSheet {
  _id: string;
  class: number;
  chapter: string;
  title: string;
  description?: string;
  fileUrl: string;
}

export default function FormulaSheetsStudent() {
  const [allSheets, setAllSheets] = useState<FormulaSheet[]>([]);
  const [chapter, setChapter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSheets();
  }, []);


const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/formulas/download/${id}`,
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




  const loadSheets = async () => {
    try {
      const res = await formulaAPI.getForStudent();
      setAllSheets(res.data);
    } catch {
      console.error("Failed to load formula sheets");
    }
  };

  // Unique chapters
  const chapters = useMemo(() => {
    return Array.from(new Set(allSheets.map((s) => s.chapter)));
  }, [allSheets]);

  // Filtered data
  const filteredSheets = useMemo(() => {
    let data = allSheets;

    if (chapter !== "all") {
      data = data.filter((s) => s.chapter === chapter);
    }

    if (search.trim()) {
      data = data.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    return data;
  }, [allSheets, chapter, search]);

  return (

 
  <div className="container mx-auto px-4 py-6 space-y-6">
     <div className="space-y-1">
 
 {/* Back to Dashboard */}
<Link
  to="/"
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
>
  <ArrowLeft size={16} />
  Back to Dashboard
</Link>
 
 
  <h1 className="text-2xl md:text-3xl font-semibold">
    Formula Sheets
  </h1>
  <p className="text-muted-foreground text-sm md:text-base">
    Chapter-wise formula sheets for quick revision
  </p>
</div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-2">
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

        <Input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredSheets.map((sheet) => (
          <Card key={sheet._id}>
            <CardHeader>
              <CardTitle className="text-lg">{sheet.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {sheet.chapter}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {sheet.description && (
                <p className="text-sm text-muted-foreground">
                  {sheet.description}
                </p>
              )}

             <Button
  className="w-full flex items-center gap-2"
  onClick={() => handleDownload(sheet._id, sheet.title)}
>
  <Download className="w-4 h-4" />
  Download PDF
</Button>
            </CardContent>
          </Card>
        ))}

        {filteredSheets.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No formula sheets found.
          </p>
        )}
      </div>
    </div>
  );
}
