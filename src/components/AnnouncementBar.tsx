import { useEffect, useState } from "react";
import { authAPI } from "@/utils/api";

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    loadAnnouncement();
  }, []);

  const loadAnnouncement = async () => {
    try {
      const res = await fetch(
        "https://quiz-mastermind-backend.onrender.com/api/announcements/active",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("mathquiz_token")}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setAnnouncement(data.announcement);
      }
    } catch (error) {
      console.error("Announcement load failed");
    }
  };

  if (!announcement) return null;

  return (
    <div className="bg-yellow-100 border-b border-yellow-300 py-2 overflow-hidden">
      <div className="whitespace-nowrap animate-marquee text-yellow-900 font-medium px-4">
        📢 {announcement.message}
      </div>
    </div>
  );
}
