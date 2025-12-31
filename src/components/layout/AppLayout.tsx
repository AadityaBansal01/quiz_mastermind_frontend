import { Navbar } from "./Navbar";
import Footer from "./Footer";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AnnouncementBar from "@/components/AnnouncementBar";
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">


 {/* 🔔 Announcement only for logged-in students */}
      {user?.role === "student" && <AnnouncementBar />}


      <Navbar />

      <main className="pt-16 flex-1">
        {children}
      </main>

      {/* Footer only for logged-out users */}
      {!user && <Footer />}
    </div>
  );
}
