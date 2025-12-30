import { useEffect, useState, useRef } from "react";
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
import { pyqAPI } from "@/utils/api";


interface PYQ {
  _id: string;
  class: number;
  year: number;
  title: string;
  chapter?: string;
  fileUrl: string;
}

export default function PYQAdmin() {
  const fileRef = useRef<HTMLInputElement | null>(null);
    const [isUploading, setIsUploading] = useState(false);
  const [pyqs, setPyqs] = useState<PYQ[]>([]);
  const [formData, setFormData] = useState({
    class: "",
    year: "",
    title: "",
    chapter: "",
    pdf: null as File | null,
  });

 const fetchPYQs = async () => {
  try {
    const res = await pyqAPI.getAllForAdmin();
   setPyqs(res.data);
  } catch {
    toast.error("Failed to load PYQs");
  }
};

  useEffect(() => {
    fetchPYQs();
  }, []);

  const handleUpload = async () => {
  if (isUploading) return;

  if (
    !formData.class?.trim() ||
    !formData.year?.trim() ||
    !formData.title?.trim() ||
    !formData.pdf
  ) {
    toast.error("Please fill all required fields");
    return;
  }

  setIsUploading(true);

    const data = new FormData();
    data.append("class", formData.class);
    data.append("year", formData.year);
    data.append("title", formData.title);
    if (formData.chapter) data.append("chapter", formData.chapter);
    data.append("pdf", formData.pdf);

try {
  const token = localStorage.getItem("mathquiz_token");

const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/pyqs/upload`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: data,
  }
);

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Upload failed");
  }

toast.success("PYQ uploaded successfully");

setFormData({
  class: "",
  year: "",
  title: "",
  chapter: "",
  pdf: null,
});

// ✅ CLEAR FILE INPUT PROPERLY
if (fileRef.current) {
  fileRef.current.value = "";
}

await fetchPYQs();
setIsUploading(false);

} catch (err: any) {
  toast.error(err.message || "Upload failed");
  setIsUploading(false);  // ✅ MUST be false
}


  };


const handleDelete = async (id: string) => {
  if (!confirm("Delete this PYQ?")) return;

  try {
    await fetch( `${import.meta.env.VITE_API_BASE_URL}/pyqs/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
      },
    });

    toast.success("PYQ deleted");
    fetchPYQs();
  } catch {
    toast.error("Failed to delete PYQ");
  }
};


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Manage PYQs</h1>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Upload PYQ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select
  onValueChange={(v) =>
    setFormData((prev) => ({ ...prev, class: v }))
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
  type="number"
  placeholder="Year (e.g. 2024)"
  value={formData.year}
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      year: e.target.value.trim(),
    }))
  }
/>

          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <Input
            placeholder="Chapter (optional)"
            value={formData.chapter}
            onChange={(e) =>
              setFormData({ ...formData, chapter: e.target.value })
            }
          />

         <label className="border rounded-md px-4 py-2 cursor-pointer text-sm bg-muted hover:bg-muted/80 flex items-center justify-center">
  {formData.pdf ? formData.pdf.name : "Choose PDF"}
  <input
    ref={fileRef}
    type="file"
    accept="application/pdf"
    className="hidden"
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        pdf: e.target.files?.[0] || null,
      }))
    }
  />
</label>

          <Button onClick={handleUpload} disabled={isUploading}>
  {isUploading ? "Uploading..." : "Upload PYQ"}
</Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded PYQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pyqs.map((pyq) => (
            <div
              key={pyq._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">{pyq.title}</p>
                <p className="text-sm text-muted-foreground">
                  Class {pyq.class} • {pyq.year}
                  {pyq.chapter && ` • ${pyq.chapter}`}
                </p>
              </div>
              <div className="flex gap-2">
  <Button variant="outline" asChild>
   <a
  href={`${import.meta.env.VITE_API_BASE_URL.replace("/api", "")}/${pyq.fileUrl}`}
  target="_blank"
  rel="noreferrer"
>
  Download
</a>
  </Button>

  <Button
    variant="destructive"
    onClick={() => handleDelete(pyq._id)}
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
