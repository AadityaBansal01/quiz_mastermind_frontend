import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SolutionCorner() {
  const [solutions, setSolutions] = useState<any[]>([]);
const [filterType, setFilterType] = useState("all");
  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/solutions/student`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then(setSolutions);
  }, []);

const filteredSolutions = solutions.filter(s =>
  filterType === "all" || s.type === filterType
);


  return (
  <div className="space-y-4">
    {/* 🔽 FILTER DROPDOWN */}
    <select
      value={filterType}
      onChange={(e) => setFilterType(e.target.value)}
      className="border rounded px-3 py-2 w-fit"
    >
      <option value="all">All Solutions</option>
      <option value="pyq">PYQ</option>
      <option value="ncert">NCERT</option>
      <option value="model-test">Model Test</option>
      <option value="practice">Practice</option>
    </select>

    {/* 📦 SOLUTION GRID */}
    <div className="grid md:grid-cols-2 gap-4">
      {filteredSolutions.map((s) => (
        <Card key={s._id}>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {s.type.toUpperCase()}
              {s.year && ` • ${s.year}`}
              {s.chapter && ` • ${s.chapter}`}
            </p>

            <Button asChild className="w-full">
              <a
                href={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/${s.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Download Solution
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

}
