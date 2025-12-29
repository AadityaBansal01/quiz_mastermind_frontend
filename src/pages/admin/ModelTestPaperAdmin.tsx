import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { modelPaperAPI } from "@/utils/api";

export default function ModelTestPaperAdmin() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [classValue, setClassValue] = useState<"" | "11" | "12">("");
  const [title, setTitle] = useState("");
  const [syllabusType, setSyllabusType] = useState<
  "" | "full" | "chapter"
>("");
  const [chapters, setChapters] = useState("");
  const [difficulty, setDifficulty] = useState<
  "" | "Easy" | "Moderate" | "Hard"
>("");
  const [marks, setMarks] = useState("");
  const [duration, setDuration] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    const res = await modelPaperAPI.getAllForAdmin();
    if (res.data.success) setPapers(res.data.papers);
  };



const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/model-paper/download/${id}`,
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
  } catch (err) {
    toast.error("Failed to download PDF");
  }
};



  const handleSubmit = async () => {
    if (!classValue || !title || !syllabusType || !difficulty || !marks || !duration || !file) {
      toast.error("All required fields must be filled");
      return;
    }

    const formData = new FormData();
    formData.append("class", classValue);
    formData.append("title", title);
    formData.append("syllabusType", syllabusType);
    formData.append("difficulty", difficulty);
    formData.append("totalMarks", marks);
    formData.append("duration", duration);
    formData.append("pdf", file);

    if (chapters.trim()) {
      formData.append(
        "chapters",
        JSON.stringify(chapters.split(",").map(c => c.trim()))
      );
    }

    try {
      setLoading(true);
      await modelPaperAPI.upload(formData);
      toast.success("Model test paper uploaded");
      setTitle("");
      setChapters("");
      setMarks("");
      setDuration("");
      setFile(null);
      loadPapers();
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this model test paper?")) return;
    await modelPaperAPI.delete(id);
    toast.success("Deleted");
    loadPapers();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Model Test Paper</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={classValue} onValueChange={setClassValue}>
            <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Test Title" value={title} onChange={e => setTitle(e.target.value)} />

          <Select value={syllabusType} onValueChange={setSyllabusType}>
            <SelectTrigger><SelectValue placeholder="Syllabus Type" /></SelectTrigger>
            <SelectContent>
            <SelectItem value="full">Full Syllabus</SelectItem>
<SelectItem value="chapter">Chapter-wise</SelectItem>
            </SelectContent>
          </Select>

          {syllabusType === "chapter" && (
            <Input
              placeholder="Chapters (comma separated)"
              value={chapters}
              onChange={e => setChapters(e.target.value)}
            />
          )}

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
             <SelectItem value="Easy">Easy</SelectItem>
<SelectItem value="Moderate">Moderate</SelectItem>
<SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Input placeholder="Total Marks" value={marks} onChange={e => setMarks(e.target.value)} />
          <Input
  type="number"
  placeholder="Duration (minutes)"
  value={duration}
  onChange={e => setDuration(e.target.value)}
/>

          <Input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : <Upload />} Upload Paper
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Model Test Papers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {papers.map(p => (
            <div key={p._id} className="border rounded-lg p-4 flex justify-between">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  Class {p.class} • {p.difficulty}
                </p>
              </div>
            <div className="flex items-center gap-4">
<button
  onClick={() => handleDownload(p._id, p.title)}
  className="text-primary hover:text-primary/80 transition"
  title="View PDF"
>
  <FileText className="w-5 h-5" />
</button>

  <button
    onClick={() => handleDelete(p._id)}
    className="text-red-500 hover:text-red-600 transition"
    title="Delete Paper"
  >
    <Trash2 className="w-5 h-5" />
  </button>
</div>

            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
