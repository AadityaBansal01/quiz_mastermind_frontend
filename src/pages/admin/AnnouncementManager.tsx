import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { announcementAPI } from "@/utils/api";
import { toast } from "sonner";

interface Announcement {
  _id: string;
  message: string;
  startDate: string;
  endDate: string;
}

export default function AnnouncementManager() {
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await announcementAPI.getActive();
      if (res.data.success && res.data.announcement) {
        setAnnouncements([res.data.announcement]);
      }
    } catch {
      // silent
    }
  };

  const handleCreate = async () => {
    if (!message || !startDate || !endDate) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await announcementAPI.create({ message, startDate, endDate });
      toast.success("Announcement created");
      setMessage("");
      setStartDate("");
      setEndDate("");
      loadAnnouncements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementAPI.delete(id);
      toast.success("Announcement deleted");
      setAnnouncements([]);
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">📢 Announcement Manager</h1>

      {/* Create */}
      <div className="bg-card p-6 rounded-xl shadow mb-8">
        <h2 className="font-semibold mb-4">Create Announcement</h2>

        <Textarea
          placeholder="Announcement message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mb-4"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} disabled={loading}>
          Create Announcement
        </Button>
      </div>

      {/* Existing */}
      <div className="bg-card p-6 rounded-xl shadow">
        <h2 className="font-semibold mb-4">Active Announcement</h2>

        {announcements.length === 0 ? (
          <p className="text-muted-foreground">No active announcements</p>
        ) : (
          announcements.map((a) => (
            <div
              key={a._id}
              className="border p-4 rounded-lg flex justify-between items-start"
            >
              <div>
                <p className="font-medium">{a.message}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(a.startDate).toDateString()} →{" "}
                  {new Date(a.endDate).toDateString()}
                </p>
              </div>

              <Button
                variant="destructive"
                onClick={() => handleDelete(a._id)}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
