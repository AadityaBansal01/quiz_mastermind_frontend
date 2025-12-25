import { useEffect, useState } from "react";
import { adminAPI } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function QuestionSelectorDrawer({ open, onClose, onSelect }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadQuestions();
  }, [open, page]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getQuestions({ page, limit: 10 });
      setQuestions(res.data.questions);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    onSelect(selected);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      {/* Drawer */}
      <div className="bg-white w-full h-full p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Select Questions</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q._id}
                className="border rounded-xl p-4 flex items-start gap-3"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(q._id)}
                  onChange={() => toggleSelect(q._id)}
                />
                <div>
                  <p className="font-medium">{q.questionText}</p>
                  <p className="text-sm text-gray-500">
                    Topic: {q.topic} — Chapter: {q.chapter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between mt-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>

          <span className="px-4 py-2">Page {page} / {totalPages}</span>

          <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>

        {/* Bottom buttons */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>

          <Button onClick={handleAdd}>
            Add {selected.length} Selected Questions
          </Button>
        </div>
      </div>
    </div>
  );
}
