"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Grid, Sparkles, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: Grid },
  { label: "New Presentation", href: "/ppt/new", icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "?";

  return (
    <nav className="fixed left-0 top-0 h-screen flex flex-col p-4 gap-2 w-64 z-40 bg-gray-950/60 backdrop-blur-xl border-r border-white/5 select-none font-dm-sans">
      <div className="flex items-center gap-3 mb-6 px-2 pt-2">
        <div className="w-9 h-9 bg-violet-600/20 border border-violet-600/30 rounded-xl flex items-center justify-center text-violet-400">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-gray-100 text-base leading-tight tracking-tight font-syne">Ritey AI</div>
          <div className="text-[9px] text-violet-400 font-bold uppercase tracking-widest opacity-80">Pro Workspace</div>
        </div>
      </div>

      <Link
        href="/ppt/new"
        className="mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 px-4 rounded-xl shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:scale-[1.02] transition-all duration-200"
      >
        <Sparkles className="w-4 h-4" />
        <span className="font-bold text-sm">Magic Create</span>
      </Link>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-sm",
              pathname === item.href
                ? "bg-white/5 text-white font-semibold ring-1 ring-white/10"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-4 h-4", pathname === item.href ? "text-violet-400" : "text-gray-500")} />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="border-t border-white/5 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02]">
          <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-bold text-violet-300 font-syne shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-200 truncate">{user?.username ?? "Loading..."}</p>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Pro account</p>
          </div>
        </div>
        <button
          id="sidebar-logout"
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 rounded-lg text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
