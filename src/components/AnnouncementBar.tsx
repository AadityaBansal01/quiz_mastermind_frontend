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
  <div
    className="
      fixed
      top-16
      left-0
      right-0
      z-40
      bg-gradient-to-r from-indigo-500 to-purple-600
      text-white
      overflow-hidden
      h-10
    "
  >
    <div
      className="
        flex
        items-center
        h-full
        whitespace-nowrap
        animate-marquee
        hover:[animation-play-state:paused]
      "
    >
      <span className="mx-8 font-medium">
        📢 {announcement.message}
      </span>
    </div>
  </div>
);
}