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
import { bookAPI } from "@/utils/api";

interface Book {
  _id: string;
  class: number;
   bookName: string;
  title: string;
  chapter?: string;
  description?: string;
  fileUrl: string;
}

export default function BooksAdmin() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [uploading, setUploading] = useState(false);

 const [form, setForm] = useState({
  class: "",
  bookName: "",
  title: "",
  chapter: "",
  description: "",
  pdf: null as File | null,
});

  // Load books
  const fetchBooks = async () => {
    try {
      const res = await bookAPI.getAllForAdmin();
      setBooks(res.data);
    } catch {
      toast.error("Failed to load books");
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Upload
 const handleUpload = async () => {
 if (
  !form.class ||
  !form.bookName.trim() ||
  !form.title.trim() ||
  !form.pdf
) {
  toast.error("Missing required fields");
  return;
}

  const formData = new FormData();

 formData.append("class", form.class);
formData.append("bookName", form.bookName); // ✅ REQUIRED
formData.append("title", form.title);
formData.append("description", form.description || "");

  if (form.chapter.trim()) {
    formData.append("chapter", form.chapter);
  }

  // ✅ THIS IS THE KEY FIX
  formData.append("pdf", form.pdf);

  try {
    setUploading(true);
    await bookAPI.upload(formData);
    toast.success("Book uploaded successfully");

    setForm({
  class: "",
  bookName: "",
  title: "",
  chapter: "",
  description: "",
  pdf: null,
});

    if (fileRef.current) fileRef.current.value = "";

    fetchBooks();
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setUploading(false);
  }
};



  // Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    try {
      await bookAPI.delete(id);
      toast.success("Deleted");
      fetchBooks();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Book Section</h1>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Book / Chapter</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Select
            value={form.class}
            onValueChange={(v) => setForm((p) => ({ ...p, class: v }))}
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
            placeholder="Book Title (e.g. NCERT Mathematics)"
            value={form.title}
            onChange={(e) =>
              setForm((p) => ({ ...p, title: e.target.value }))
            }
          />

          <Input
            placeholder="Chapter (optional)"
            value={form.chapter}
            onChange={(e) =>
              setForm((p) => ({ ...p, chapter: e.target.value }))
            }
          />

          <Input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
<Input
  placeholder="Book Name (e.g. NCERT, RD Sharma)"
  value={form.bookName}
  onChange={(e) =>
    setForm((p) => ({ ...p, bookName: e.target.value }))
  }
/>



          <label className="border rounded-md px-4 py-2 cursor-pointer bg-muted text-sm flex items-center justify-center">
            {form.pdf ? form.pdf.name : "Choose PDF"}
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  pdf: e.target.files?.[0] || null,
                }))
              }
            />
          </label>

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="md:col-span-2"
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Uploaded Books</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {books.map((b) => (
            <div
              key={b._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-sm text-muted-foreground">
                  Class {b.class}
                  {b.chapter && ` • ${b.chapter}`}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(b._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
