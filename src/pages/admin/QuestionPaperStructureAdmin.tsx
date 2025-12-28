
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Trash2 } from "lucide-react";
import { paperStructureAPI } from "@/utils/api";

export default function QuestionPaperStructureAdmin() {
  const [classValue, setClassValue] = useState<"11" | "12" | "">("");
  const [examName, setExamName] = useState("");
  const [structure, setStructure] = useState("");
  const [marks, setMarks] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState<any[]>([]);

  useEffect(() => {
    loadPapers();
  }, []);

const loadPapers = async () => {
  try {
   const res = await paperStructureAPI.getAllForAdmin();

if (res.data.success && Array.isArray(res.data.structures)) {
  setPapers(res.data.structures);
} else {
  setPapers([]);
}
  } catch {
    toast.error("Failed to load structures");
    setPapers([]);
  }
};

  const handleSubmit = async () => {
    if (!classValue || !examName || !structure || !marks) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("class", classValue);
    formData.append("examName", examName);
    formData.append("structure", structure);
    formData.append("marks", marks);
    if (file) formData.append("pdf", file);

    try {
      setLoading(true);
      await paperStructureAPI.upload(formData);
      toast.success("Question paper structure added");
      setClassValue("");
      setExamName("");
      setStructure("");
      setMarks("");
      setFile(null);
      loadPapers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this structure?")) return;
    try {
      await paperStructureAPI.delete(id);
      toast.success("Deleted");
      loadPapers();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Add Question Paper Structure</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select value={classValue} onValueChange={setClassValue}>
            <SelectTrigger>
              <SelectValue placeholder="Select Class *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Exam Name (Board / JEE / School Test)"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
          />

          <Textarea
            placeholder="Section-wise structure (A, B, C with marks)"
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            rows={4}
          />

          <Input
  type="number"
  placeholder="Total Marks (e.g. 80)"
  value={marks}
  onChange={(e) => setMarks(e.target.value)}
/>

          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Save Structure
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Structures</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {papers.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No structures added yet.
            </p>
          )}

          {papers.map((p) => (
            <div
              key={p._id}
              className="border rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">{p.examName}</p>
                <p className="text-sm text-muted-foreground">
                  Class {p.class}
                </p>
              </div>

              <div className="flex gap-4">
                {p.pdf && (
  <a
    href={`${import.meta.env.VITE_API_BASE_URL}/question-paper-structure/download/${p._id}`}
    className="text-primary underline text-sm"
  >
    Download PDF
  </a>
)}


                <button
                  onClick={() => handleDelete(p._id)}
                  className="text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
