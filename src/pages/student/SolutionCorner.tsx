import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

  const filteredSolutions = solutions.filter(
    (s) => filterType === "all" || s.type === filterType
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* 🔙 Back to Dashboard */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* 🧠 Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Solution Corner</h1>
        <p className="text-muted-foreground">
          Download PYQ, NCERT, Model Test and Practice solutions
        </p>
      </div>

      {/* 🔽 Filter */}
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="border rounded-md px-3 py-2 w-fit"
      >
        <option value="all">All Solutions</option>
        <option value="pyq">PYQ</option>
        <option value="ncert">NCERT</option>
        <option value="model-test">Model Test</option>
        <option value="practice">Practice</option>
      </select>

      {/* 📦 Solutions Grid */}
      {filteredSolutions.length === 0 ? (
        <p className="text-muted-foreground">No solutions available.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSolutions.map((s) => (
            <Card
              key={s._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
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
      )}
    </div>
  );
}
