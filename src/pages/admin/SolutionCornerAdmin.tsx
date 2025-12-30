import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SolutionCornerAdmin() {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);
const [filterType, setFilterType] = useState("all");
const [filterYear, setFilterYear] = useState("all");

const [solutionClass, setSolutionClass] = useState("12");
const [type, setType] = useState("pyq");
const [year, setYear] = useState("");
const [chapter, setChapter] = useState("");
const [title, setTitle] = useState("");



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

const filteredSolutions = solutions.filter((s) =>
  (filterType === "all" || s.type === filterType) &&
  (filterYear === "all" || String(s.year) === filterYear)
);


  const uploadSolution = async () => {
    if (!pdf) return toast.error("Select PDF");

    const fd = new FormData();
fd.append("class", solutionClass);
fd.append("type", type);
if (year) fd.append("year", year);
if (chapter) fd.append("chapter", chapter);
fd.append(
  "title",
  title || pdf.name.replace(".pdf", "")
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
setYear("");
setChapter("");
setTitle("");

// ✅ Reload list
fetchSolutions();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solution Corner (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 flex-wrap">

  <select
    className="border rounded px-3 py-2"
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
  >
    <option value="all">All Types</option>
    <option value="pyq">PYQ</option>
    <option value="model-test">Model Test</option>
    <option value="practice">Practice</option>
  </select>

  <select
    className="border rounded px-3 py-2"
    value={filterYear}
    onChange={(e) => setFilterYear(e.target.value)}
  >
    <option value="all">All Years</option>
    {[...new Set(solutions.map((s) => s.year).filter(Boolean))].map(
      (y) => (
        <option key={y} value={String(y)}>
          {y}
        </option>
      )
    )}
  </select>

</div>

        <div className="grid gap-3 md:grid-cols-2">

  <select
    className="border rounded px-3 py-2"
    value={solutionClass}
    onChange={(e) => setSolutionClass(e.target.value)}
  >
    <option value="11">Class 11</option>
    <option value="12">Class 12</option>
  </select>

  <select
    className="border rounded px-3 py-2"
    value={type}
    onChange={(e) => setType(e.target.value)}
  >
    <option value="pyq">PYQ Solution</option>
    <option value="model-test">Model Test Solution</option>
    <option value="practice">Practice Solution</option>
  </select>

  <input
    className="border rounded px-3 py-2"
    placeholder="Year (optional)"
    value={year}
    onChange={(e) => setYear(e.target.value)}
  />

  <input
    className="border rounded px-3 py-2"
    placeholder="Chapter (optional)"
    value={chapter}
    onChange={(e) => setChapter(e.target.value)}
  />

  <input
    className="border rounded px-3 py-2 md:col-span-2"
    placeholder="Title (leave empty = auto)"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />

  <input
    type="file"
    accept="application/pdf"
    onChange={(e) => setPdf(e.target.files?.[0] || null)}
    className="md:col-span-2"
  />

</div>

<Button onClick={uploadSolution}>Upload Solution</Button>
{filteredSolutions.map((s) => (
  <div
    key={s._id}
    className="flex justify-between items-center border p-3 rounded"
  >
    <div>
      <p className="font-medium">{s.title}</p>
      <p className="text-sm text-muted-foreground">
  Class {s.class} • {s.type.toUpperCase()}
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
