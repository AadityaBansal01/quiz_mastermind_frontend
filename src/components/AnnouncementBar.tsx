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
  <div className="w-full bg-yellow-100 border-b border-yellow-300 overflow-hidden">
    <div className="animate-marquee py-2 px-4 text-yellow-900 font-medium">
      📢 {announcement.message}
    </div>
  </div>
);
}