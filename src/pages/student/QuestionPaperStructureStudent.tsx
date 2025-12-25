import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { paperStructureAPI } from "@/utils/api";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
export default function QuestionPaperStructureStudent() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [searchTerm, setSearchTerm] = useState("");
const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
const [expandedId, setExpandedId] = useState<string | null>(null);

const [filterClass, setFilterClass] = useState<"" | "11" | "12">("");
  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    try {
      const res = await paperStructureAPI.getForStudent();
      if (res.data.success) {
        setPapers(res.data.structures);
      }
    } catch {
      toast.error("Failed to load question paper structure");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading structures…</p>;
  }

const filteredPapers = papers
  .filter((paper) => {
    const matchesSearch =
      paper.examName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClass =
      filterClass === "" || String(paper.class) === filterClass;

    return matchesSearch && matchesClass;
  })
  .sort((a, b) => {
    if (sortOrder === "latest") {
      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    }

    return (
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime()
    );
  });





  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
     
            {/* Back to Dashboard */}
<Link
  to="/dashboard"
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
>
  <ArrowLeft size={16} />
  Back to Dashboard
</Link>
     
     
     
     
      <h1 className="text-2xl font-bold">Question Paper Structure</h1>

<div className="flex flex-col md:flex-row gap-4">
  {/* Search */}
  <input
    type="text"
    placeholder="Search by exam / board name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border rounded-md px-3 py-2 w-full md:w-2/3"
  />

  {/* Class Filter */}
  <select
    value={filterClass}
    onChange={(e) => setFilterClass(e.target.value as any)}
    className="border rounded-md px-3 py-2 w-full md:w-1/3"
  >
    <option value="">All Classes</option>
    <option value="11">Class 11</option>
    <option value="12">Class 12</option>
  </select>

<select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value as any)}
  className="border rounded-md px-3 py-2 w-full md:w-1/3"
>
  <option value="latest">Latest First</option>
  <option value="oldest">Oldest First</option>
</select>




</div>





     {filteredPapers.length === 0 && (
  <p className="text-sm text-muted-foreground mt-6">
    No matching question paper structure found.
  </p>
)}

{filteredPapers.map((paper) => (
  <Card key={paper._id} className="shadow-md">
    <CardHeader>
      <CardTitle className="flex justify-between items-center">
        <span>{paper.examName}</span>
        <span className="text-sm text-muted-foreground">
          Class {paper.class}
        </span>
      </CardTitle>
    </CardHeader>

    <CardContent className="space-y-4">
      <p className="font-medium">
        🧮 Total Marks:{" "}
        <span className="font-bold">{paper.totalMarks}</span>
      </p>

     <div className="bg-secondary/40 p-4 rounded-lg text-sm whitespace-pre-line">
  {expandedId === paper._id
    ? paper.structureText
    : paper.structureText.slice(0, 50)}

  {paper.structureText.length > 50 && (
    <button
      onClick={() =>
        setExpandedId(
          expandedId === paper._id ? null : paper._id
        )
      }
      className="block mt-2 text-primary text-sm font-medium hover:underline"
    >
      {expandedId === paper._id ? "Show Less ▲" : "Show More ▼"}
    </button>
  )}
</div>


      {paper.pdf && (
        <a
          href={`http://localhost:5000${paper.pdf}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
        >
          <FileText size={16} />
          View Question Paper PDF
        </a>
      )}
    </CardContent>
  </Card>
))}

    </div>
  );
}
