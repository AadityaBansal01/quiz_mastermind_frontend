import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formulaAPI } from "@/utils/api";

interface FormulaSheet {
  _id: string;
  class: number;
  chapter: string;
  title: string;
  description?: string;
  fileUrl: string;
}

export default function FormulaSheetsAdmin() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [sheets, setSheets] = useState<FormulaSheet[]>([]);

  const [formData, setFormData] = useState({
    class: "",
    chapter: "",
    title: "",
    description: "",
    pdf: null as File | null,
  });

  // Fetch existing sheets
  const fetchSheets = async () => {
    try {
      const res = await formulaAPI.getAllForAdmin();
      setSheets(res.data);
    } catch {
      toast.error("Failed to load formula sheets");
    }
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  // Upload handler
  const handleUpload = async () => {
    if (
      !formData.class ||
      !formData.chapter.trim() ||
      !formData.title.trim() ||
      !formData.pdf
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = new FormData();
    data.append("class", formData.class);
    data.append("chapter", formData.chapter);
    data.append("title", formData.title);
    if (formData.description) {
      data.append("description", formData.description);
    }
    data.append("pdf", formData.pdf);

    try {
      setIsUploading(true);
      await formulaAPI.upload(data);

      toast.success("Formula sheet uploaded");

      setFormData({
        class: "",
        chapter: "",
        title: "",
        description: "",
        pdf: null,
      });

      if (fileRef.current) fileRef.current.value = "";

      fetchSheets();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };



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



  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this formula sheet?")) return;

    try {
      await formulaAPI.delete(id);
      toast.success("Deleted successfully");
      fetchSheets();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Formula Sheets</h1>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Formula Sheet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select
            value={formData.class}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, class: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Chapter (e.g. Trigonometry)"
            value={formData.chapter}
            onChange={(e) =>
              setFormData((p) => ({ ...p, chapter: e.target.value }))
            }
          />

          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
          />

          <Input
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({ ...p, description: e.target.value }))
            }
          />

          {/* File Input */}
          <label className="border rounded-md px-4 py-2 cursor-pointer bg-muted hover:bg-muted/80 text-sm flex items-center justify-center">
            {formData.pdf ? formData.pdf.name : "Choose PDF"}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  pdf: e.target.files?.[0] || null,
                }))
              }
            />
          </label>

          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="md:col-span-2"
          >
            {isUploading ? "Uploading..." : "Upload Formula Sheet"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Formula Sheets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sheets.map((s) => (
            <div
              key={s._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">
                  Class {s.class} • {s.chapter}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
  variant="outline"
  onClick={() => handleDownload(s._id, s.title)}
>
  View PDF
</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(s._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
