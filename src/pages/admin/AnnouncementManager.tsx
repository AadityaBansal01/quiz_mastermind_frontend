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
  isEnabled: boolean;
}

export default function AnnouncementManager() {
  const [message, setMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
const [selectedClass, setSelectedClass] = useState<string>("");

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
  try {
    const res = await announcementAPI.getAllForAdmin();
    if (res.data.success) {
      setAnnouncements(res.data.announcements);
    }
  } catch {
    toast.error("Failed to load announcements");
  }
};

  const handleCreate = async () => {
  if (!message || !startDate || !endDate) {
    toast.error("All fields are required");
    return;
  }

  try {
    setLoading(true);

    const payload = {
  message,
  startDate: new Date(startDate + "T00:00:00"),
  endDate: new Date(endDate + "T23:59:59"),
  class: selectedClass ? Number(selectedClass) : null,
};

    await announcementAPI.create(payload);

    toast.success("Announcement created");

    setMessage("");
    setStartDate("");
    setEndDate("");
setSelectedClass("");

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


const handleToggle = async (id: string) => {
  try {
    await announcementAPI.toggle(id);
    toast.success("Announcement status updated");
    loadAnnouncements(); // refresh list
  } catch {
    toast.error("Failed to update status");
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

<select
  value={selectedClass}
  onChange={(e) => setSelectedClass(e.target.value)}
  className="w-full mb-4 px-3 py-2 rounded-md border border-input bg-background"
>
  <option value="">All Classes</option>
  <option value="11">Class 11</option>
  <option value="12">Class 12</option>
</select>


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

  <p className="text-xs mt-1">
    {new Date(a.startDate) <= new Date() &&
    new Date(a.endDate) >= new Date() ? (
      <span className="text-green-600 font-semibold">● Active</span>
    ) : new Date(a.startDate) > new Date() ? (
      <span className="text-blue-600 font-semibold">● Upcoming</span>
    ) : (
      <span className="text-red-600 font-semibold">● Expired</span>
    )}
  </p>

  <p className="text-sm text-muted-foreground mt-1">
    {new Date(a.startDate).toDateString()} →{" "}
    {new Date(a.endDate).toDateString()}
  </p>
</div>

              <div className="flex gap-2">
  <Button
    variant="outline"
    onClick={() => handleToggle(a._id)}
    className={
      a.isEnabled
        ? "border-yellow-400 text-yellow-700"
        : "border-green-400 text-green-700"
    }
  >
    {a.isEnabled ? "Disable" : "Enable"}
  </Button>

  <Button
    variant="destructive"
    onClick={() => handleDelete(a._id)}
  >
    Delete
  </Button>
</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
