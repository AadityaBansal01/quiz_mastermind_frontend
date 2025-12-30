import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SolutionCornerAdmin() {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [pdf, setPdf] = useState<File | null>(null);

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
    fd.append("title", "PYQ Solutions 2024");
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
          <p key={s._id}>{s.title}</p>
        ))}
      </CardContent>
    </Card>
  );
}
