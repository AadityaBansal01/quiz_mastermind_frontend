import { useEffect, useState } from "react";
import { announcementAPI } from "@/utils/api";

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const res = await announcementAPI.getActive();
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch {
      console.error("Announcement load failed");
    }
  };

  if (announcements.length === 0) return null;

  return (
    <div
      className="
        fixed top-16 left-0 right-0 z-40
        bg-gradient-to-r from-indigo-500 to-purple-600
        text-white overflow-hidden h-10
      "
    >
      <div
        className="
          flex items-center h-full whitespace-nowrap
          animate-marquee
          hover:[animation-play-state:paused]
        "
      >
        {/* Repeat announcements twice for seamless loop */}
        {[...announcements, ...announcements].map((a, index) => (
          <span
            key={index}
            className="mx-10 font-medium"
          >
            📢 {a.message}
          </span>
        ))}
      </div>
    </div>
  );
}
