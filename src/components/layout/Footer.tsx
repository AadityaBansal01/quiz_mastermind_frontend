import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/50 py-12 mt-20">
  <div className="container mx-auto px-6">
    <div className="flex flex-col md:flex-row justify-between items-center gap-8">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Math Mastermind
          </span>
          <span className="text-xs text-muted-foreground">Master Math with AI</span>
        </div>
      </div>

      {/* Copyright */}
      <p className="text-sm text-muted-foreground text-center md:text-right">
  © {new Date().getFullYear()} Math Mastermind. All rights reserved.
  <span className="block md:inline md:ml-2 mt-1 md:mt-0">Empowering students to excel</span>
</p>
      
    </div>
  </div>
</footer>
  );
}
