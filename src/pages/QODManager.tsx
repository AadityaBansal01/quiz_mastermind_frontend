import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { adminAPI } from "@/utils/api";
import { Link } from "react-router-dom";

export default function QODManager() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);

  const [date, setDate] = useState("");
  const [qClass, setQClass] = useState(11);
  const [questionId, setQuestionId] = useState("");
const [editingId, setEditingId] = useState<string | null>(null);

  // Load scheduled QODs
  const fetchQODList = async () => {
    const res = await adminAPI.getQODScheduleList();
    if (res.data.success) {
      setList(res.data.list || []);
    }
  };

  // Load Question Bank (only QOD type)
  const fetchQuestions = async () => {
    const res = await adminAPI.getQuestions({ questionType: "qod" });
    if (res.data.success) {
      setQuestions(res.data.questions || []);
    }
  };

  useEffect(() => {
    fetchQODList();
    fetchQuestions();
  }, []);

  const assignQOD = async () => {
    if (!date || !questionId) {
      alert("Please select date and question");
      return;
    }

    try {
      setLoading(true);
     const res = editingId
  ? await adminAPI.updateQOD(editingId, {
      date,
      questionId,
      class: qClass,
    })
  : await adminAPI.assignQOD({
      date,
      questionId,
      class: qClass,
    });


   if (res.data.success) {
  alert(editingId ? "QOD updated successfully" : "QOD assigned successfully");

  setDate("");
  setQuestionId("");
  setEditingId(null);   // 🔥 IMPORTANT
  fetchQODList();
}

    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };



const deleteQOD = async (id: string) => {
  if (!confirm("Delete this scheduled QOD?")) return;

  try {
    await adminAPI.deleteQODSchedule(id);
    fetchQODList();
  } catch (err) {
    alert("Failed to delete QOD");
  }
};


  return (
    <div className="min-h-screen bg-background">
      <Navbar />



      <div className="pt-20 container mx-auto px-4 max-w-5xl">
       
       <Link
  to="/"
  className="inline-block mb-6 text-sm text-muted-foreground hover:text-primary"
>
  ← Back to Dashboard
</Link>
       
       
        <h1 className="text-3xl font-bold mb-6">
          Question of the Day – Manager
        </h1>




        {/* ASSIGN FORM */}
        <div className="bg-card p-6 rounded-xl mb-8 border">
         <h2 className="text-xl font-semibold mb-4">
  {editingId ? "Edit Scheduled QOD" : "Assign New QOD"}
</h2>


          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-2"
            />

            <select
              value={qClass}
              onChange={(e) => setQClass(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              <option value={11}>Class 11</option>
              <option value={12}>Class 12</option>
            </select>

            <select
              value={questionId}
              onChange={(e) => setQuestionId(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select Question</option>
              {questions.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.topic} — {q.questionText.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={assignQOD} disabled={loading}>
  {editingId ? "Update QOD" : "Assign Question"}
</Button>

{editingId && (
    <Button
      variant="ghost"
      onClick={() => {
        setEditingId(null);
        setDate("");
        setQuestionId("");
      }}
    >
      Cancel
    </Button>
  )}
</div>

          </div>
  

        {/* LIST */}
        <h2 className="text-xl font-semibold mb-4">
          Scheduled QODs
        </h2>

        {list.length === 0 && (
          <p className="text-muted-foreground">
            No QOD scheduled yet
          </p>
        )}

        <div className="space-y-4">
     {list.map((item) => (
  <div
    key={item._id}
    className="p-4 border rounded-xl bg-card flex justify-between items-start"
  >
    {/* LEFT INFO */}
    <div>
      <p className="font-semibold">
        📅 {new Date(item.date).toDateString()}
      </p>
      <p>Class: {item.class}</p>
      <p className="text-sm text-muted-foreground">
        {item.questionId?.questionText}
      </p>
    </div>

    {/* RIGHT ACTIONS */}
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setDate(item.date.split("T")[0]);
          setQClass(item.class);
          setQuestionId(item.questionId?._id);
          setEditingId(item._id);
        }}
      >
        Edit
      </Button>

      <Button
        size="sm"
        variant="destructive"
        onClick={() => deleteQOD(item._id)}
      >
        Delete
      </Button>
    </div>
  </div>
))}

        </div>
      </div>
    </div>
  );
}
