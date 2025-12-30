import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SolutionCorner() {
  const [solutions, setSolutions] = useState<any[]>([]);

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

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {solutions.map((s) => (
        <Card key={s._id}>
          <CardHeader>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a
                href={`${import.meta.env.VITE_API_BASE_URL.replace(
                  "/api",
                  ""
                )}/${s.fileUrl}`}
                target="_blank"
              >
                Download Solution
              </a>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
