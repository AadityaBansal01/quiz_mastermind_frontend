import { useEffect, useState } from "react";
import { announcementAPI } from "@/utils/api";

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 6000); // rotate every 6 seconds

    return () => clearInterval(timer);
  }, [announcements]);

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

  const announcement = announcements[index];

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
        <span className="mx-8 font-medium">
          📢 {announcement.message}
        </span>
      </div>
    </div>
  );
}
