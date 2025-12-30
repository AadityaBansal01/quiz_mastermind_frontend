import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SolutionCornerAdmin() {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);



const deleteSolution = async (id: string) => {
  if (!confirm("Delete this solution?")) return;

  await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/solutions/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
      },
    }
  );

  toast.success("Deleted");
  fetchSolutions();
};


  const fetchSolutions = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/solutions/admin`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
        },
      }
    );
    setSolutions(await res.json());
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const uploadSolution = async () => {
    if (!pdf) return toast.error("Select PDF");

    const fd = new FormData();
    fd.append("class", "12");
    fd.append("type", "pyq");
   fd.append(
  "title",
  pdf.name.replace(".pdf", "") // 👈 unique title from filename
);
    fd.append("pdf", pdf);

    await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/solutions/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
        },
        body: fd,
      }
    );

    toast.success("Uploaded");
    // ✅ CLEAR FILE STATE AFTER SUCCESS
setPdf(null);

// ✅ Reload list
fetchSolutions();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solution Corner (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input type="file" onChange={(e) => setPdf(e.target.files?.[0] || null)} />
        <Button onClick={uploadSolution}>Upload Solution</Button>
{solutions.map((s) => (
  <div
    key={s._id}
    className="flex justify-between items-center border p-3 rounded"
  >
    <div>
      <p className="font-medium">{s.title}</p>
      <p className="text-sm text-muted-foreground">
        Class {s.class}
        {s.year && ` • ${s.year}`}
        {s.chapter && ` • ${s.chapter}`}
      </p>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <a
          href={`${import.meta.env.VITE_API_BASE_URL.replace(
            "/api",
            ""
          )}/${s.fileUrl}`}
          target="_blank"
          rel="noreferrer"
        >
          View / Download
        </a>
      </Button>

      <Button
        variant="destructive"
        onClick={() => deleteSolution(s._id)}
      >
        Delete
      </Button>
    </div>
  </div>
))}

      </CardContent>
    </Card>
  );
}
