import { useState, useEffect } from "react";
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
import { importantLetterAPI } from "@/utils/api";
import { Trash2 } from "lucide-react";
import { Loader2, Upload } from "lucide-react";

export default function ImportantLettersAdmin() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [classValue, setClassValue] = useState<"11" | "12" | "">("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
const [letters, setLetters] = useState<any[]>([]);



const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/important-letters/download/${id}`,
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




  const handleSubmit = async () => {
    if (!title || !classValue || !file) {
      toast.error("Title, Class and PDF are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("class", classValue);
    if (date) formData.append("date", date);
    formData.append("pdf", file);

    try {
      setLoading(true);
     await importantLetterAPI.upload(formData);
await loadLetters(); 
      // Reset
      setTitle("");
      setDescription("");
      setClassValue("");
      setDate("");
      setFile(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };



  const loadLetters = async () => {
  const res = await importantLetterAPI.getAllForAdmin();
  if (res.data.success) {
    setLetters(res.data.letters);
  }
};


const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this letter?")) return;

  try {
    await importantLetterAPI.delete(id);
    toast.success("Letter deleted");
    loadLetters(); // refresh list
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Delete failed");
  }
};


useEffect(() => {
  loadLetters();
}, []);



  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Important Letter / Notice</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

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
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button
  type="button"
  onClick={handleSubmit}
  disabled={loading}
  className="w-full"
>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Letter
              </>
            )}
          </Button>
        </CardContent>
      </Card>



      <Card>
  <CardHeader>
    <CardTitle>Uploaded Important Letters</CardTitle>
  </CardHeader>

  <CardContent className="space-y-3">
    {letters.length === 0 && (
      <p className="text-muted-foreground text-sm">
        No letters uploaded yet.
      </p>
    )}

    {letters.map((l) => (
      <div
        key={l._id}
        className="border rounded-lg p-4 flex justify-between items-center"
      >
        <div>
          <p className="font-semibold">{l.title}</p>
          <p className="text-sm text-muted-foreground">
            Class {l.class} • {l.type || "General"}
          </p>
        </div>

       <div className="flex gap-4 items-center">
 <button
  onClick={() => handleDownload(l._id, l.title)}
  className="text-primary underline"
>
  View PDF
</button>

  <button
    onClick={() => handleDelete(l._id)}
    className="text-red-500 hover:text-red-600"
    title="Delete"
  >
    <Trash2 size={18} />
  </button>
</div>

      </div>
    ))}
  </CardContent>
</Card>
    </div>
  );
}
