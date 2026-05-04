"use client";

import { Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function TopBar() {
  const { user } = useAuth();
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  return (
    <header className="fixed top-0 left-64 right-0 h-14 flex justify-between items-center px-6 z-50 bg-gray-950/40 backdrop-blur-md border-b border-white/5 select-none font-dm-sans">
      {/* Search */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 w-72 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <input
          className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-600 text-white outline-none"
          placeholder="Search presentations..."
          type="text"
        />
      </div>

      {/* Right side: user badge */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-gray-300 leading-none">{user?.username ?? ""}</p>
          <p className="text-[10px] text-violet-400 uppercase tracking-wider mt-0.5">Pro</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-bold text-violet-300 font-syne">
          {initials}
        </div>
      </div>
    </header>
  );
}
