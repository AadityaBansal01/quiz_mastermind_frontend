import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { importantLetterAPI } from "@/utils/api";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
interface ImportantLetter {
  _id: string;
  title: string;
  description?: string;
  date?: string;
  fileUrl: string;
}

export default function ImportantLetters() {
  const [letters, setLetters] = useState<ImportantLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

const handleDownload = async (id: string, title: string) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/important-letters/download/${id}`,
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




  const loadLetters = async () => {
    try {
      const res = await importantLetterAPI.getForStudent();
      if (res.data.success) {
        setLetters(res.data.letters);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }




  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
       
       {/* Back to Dashboard */}
<Link
  to="/dashboard"
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
>
  <ArrowLeft size={16} />
  Back to Dashboard
</Link>
       
        <h1 className="text-2xl font-bold">Important Letters & Notices</h1>
        <p className="text-muted-foreground">
          Official academic communications for your class
        </p>
      </div>

      {letters.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No important letters available
          </CardContent>
        </Card>
      ) : (
        letters.map((letter) => (
          <Card key={letter._id}>
            <CardHeader className="flex flex-row items-start gap-4">
              <FileText className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <CardTitle>{letter.title}</CardTitle>
                {letter.date && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(letter.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {letter.description && (
                <p className="text-sm">{letter.description}</p>
              )}

              <Button
  variant="outline"
  onClick={() => handleDownload(letter._id, letter.title)}
  className="flex items-center gap-2"
>
  <Download className="h-4 w-4" />
  View PDF
</Button>
              
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
