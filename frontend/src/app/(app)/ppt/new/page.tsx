"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, Zap, Wand2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// Index 0 = Auto, 1-12 = real themes
const AUTO_ENTRY = { id: "", name: "Auto Select", image: "" };
const THEME_ENTRIES = Array.from({ length: 12 }).map((_, i) => ({
  id: `designe${i + 1}.pptx`,
  name: `Theme ${String(i + 1).padStart(2, "0")}`,
  image: `/${i + 1}.png`,
}));
const ALL = [AUTO_ENTRY, ...THEME_ENTRIES]; // 13 total

export default function NewPPTPage() {
  const [topic, setTopic] = useState("");
  const [numSlide, setNumSlide] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [idx, setIdx] = useState(0);          // active theme index
  const [dir, setDir] = useState<"l" | "r">("r"); // last swipe direction for animation hint
  const router = useRouter();

  const total = ALL.length;
  const prevIdx = (idx - 1 + total) % total;
  const nextIdx = (idx + 1) % total;
  const current = ALL[idx];

  const go = (newIdx: number, direction: "l" | "r") => {
    setDir(direction);
    setIdx(newIdx);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) { setError("Please enter a presentation topic."); return; }
    setLoading(true);
    setError("");
    try {
      const threadRes = await api.post("/threads/", {
        topic,
        num_slide: numSlide,
        theme: current.id || null,
      });
      const threadId = threadRes.data.thread_id;
      await api.post("/states/", { thread_id: threadId, topic, num_slide: numSlide });
      router.push(`/ppt/${threadId}`);
    } catch (err: any) {
      if (err.response?.status === 401) { router.push("/login"); return; }
      setError(
        err.response?.data?.detail?.message ||
          err.response?.data?.detail ||
          "Failed to generate presentation. Please try again."
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen
        title="Building Your Presentation"
        subtitle="Our AI is crafting slides tailored to your topic. This takes 20–60 seconds."
      />
    );
  }

  /** Render a single theme card for use in the carousel */
  const ThemeCard = ({
    entry,
    active,
    onClick,
    position,
  }: {
    entry: typeof ALL[0];
    active: boolean;
    onClick?: () => void;
    position: "center" | "left" | "right";
  }) => {
    const isAuto = entry.id === "";
    return (
      <div
        onClick={onClick}
        className={cn(
          "relative rounded-2xl overflow-hidden border-2 transition-all duration-500 flex-shrink-0",
          "aspect-[16/9]",
          position === "center"
            ? "w-full border-violet-500/60 shadow-2xl shadow-violet-900/30 z-20"
            : cn(
                "cursor-pointer border-white/10 z-10",
                position === "left"
                  ? "opacity-40 hover:opacity-60 scale-[0.88] origin-right -mr-6"
                  : "opacity-40 hover:opacity-60 scale-[0.88] origin-left -ml-6"
              )
        )}
      >
        {isAuto ? (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-2">
            <Wand2 className={cn("text-violet-400/70 transition-all", active ? "w-12 h-12" : "w-7 h-7")} />
            {active && (
              <div className="text-center px-4">
                <p className="text-gray-300 font-semibold text-sm">AI picks the best theme</p>
                <p className="text-gray-600 text-xs mt-1">Based on your topic and content</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <Image
              src={entry.image}
              alt={entry.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                active ? "opacity-100" : "opacity-60"
              )}
              unoptimized
            />
            {/* Dark gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent pointer-events-none" />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto font-dm-sans animate-fade-up overflow-hidden">

      {/* Top nav */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-500 hover:text-white font-semibold text-sm transition-all group active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Link>
        <div className="flex items-center gap-2 text-violet-400 font-bold text-[10px] uppercase tracking-[0.3em] bg-violet-600/10 px-3 py-1.5 rounded-full border border-violet-600/20">
          <Sparkles className="w-3 h-3" /> AI Ready
        </div>
      </div>

      {/* Main card */}
      <div className="flex-1 glass-panel rounded-3xl px-8 py-5 shadow-2xl relative overflow-hidden flex flex-col min-h-0">
        <div className="absolute top-0 right-0 p-10 opacity-[0.025] pointer-events-none">
          <Zap className="w-48 h-48" />
        </div>

        {/* Page title */}
        <div className="mb-4 shrink-0 relative z-10">
          <h1 className="text-3xl font-bold text-white font-syne tracking-tight">New Presentation</h1>
          <p className="text-gray-400 text-sm font-light mt-1">Describe your topic and pick a theme — AI does the rest.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 gap-4 relative z-10">
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm text-center shrink-0">
              {error}
            </div>
          )}

          {/* Topic + Slides */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1">
                Presentation Topic
              </label>
              <input
                id="new-ppt-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 text-white transition-all placeholder:text-gray-700 text-base font-light"
                placeholder="e.g., The Future of Renewable Energy"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1">
                Number of Slides
              </label>
              <div className="relative">
                <input
                  id="new-ppt-slides"
                  type="number"
                  min={3}
                  max={5}
                  value={numSlide}
                  onChange={(e) => setNumSlide(parseInt(e.target.value))}
                  className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 text-white transition-all font-bold"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-[10px] uppercase tracking-widest">
                  slides
                </span>
              </div>
            </div>
          </div>

          {/* ── Theme Carousel ── */}
          <div className="flex-1 flex flex-col min-h-0 gap-2">

            {/* Section header: label + theme name + counter */}
            <div className="flex items-center justify-between shrink-0">
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest ml-1">
                Visual Theme
              </label>
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-white font-syne">{current.name}</span>
                <span className="text-[10px] font-bold text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  {idx}/{total - 1}
                </span>
              </div>
            </div>

            {/* Filmstrip + arrows */}
            <div className="flex-1 relative flex items-center min-h-0 overflow-hidden px-10">

              {/* Left arrow */}
              <button
                type="button"
                onClick={() => go(prevIdx, "l")}
                className="absolute left-0 z-30 w-9 h-9 rounded-full bg-gray-900/80 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 hover:border-white/20 transition-all active:scale-90 shadow-lg"
                aria-label="Previous theme"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Three-card filmstrip */}
              <div className="flex-1 flex items-center justify-center gap-0 h-full min-h-0 overflow-hidden">

                {/* Left peek — previous */}
                <div className="w-[22%] min-w-0 shrink-0">
                  <ThemeCard
                    entry={ALL[prevIdx]}
                    active={false}
                    position="left"
                    onClick={() => go(prevIdx, "l")}
                  />
                </div>

                {/* Center — active */}
                <div className="w-[56%] min-w-0 shrink-0 px-2">
                  <ThemeCard
                    entry={current}
                    active={true}
                    position="center"
                  />
                </div>

                {/* Right peek — next */}
                <div className="w-[22%] min-w-0 shrink-0">
                  <ThemeCard
                    entry={ALL[nextIdx]}
                    active={false}
                    position="right"
                    onClick={() => go(nextIdx, "r")}
                  />
                </div>
              </div>

              {/* Right arrow */}
              <button
                type="button"
                onClick={() => go(nextIdx, "r")}
                className="absolute right-0 z-30 w-9 h-9 rounded-full bg-gray-900/80 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 hover:border-white/20 transition-all active:scale-90 shadow-lg"
                aria-label="Next theme"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1 shrink-0 pb-1">
              {ALL.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i, i > idx ? "r" : "l")}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === idx
                      ? "w-5 h-1.5 bg-violet-500"
                      : "w-1.5 h-1.5 bg-white/15 hover:bg-white/35"
                  )}
                  aria-label={`Theme ${i}`}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="shrink-0 pt-3 border-t border-white/5">
            <button
              id="new-ppt-submit"
              type="submit"
              className="w-full flex items-center justify-center py-3.5 px-10 btn-primary text-white font-bold text-base transition-all active:scale-[0.99] font-syne tracking-tight"
            >
              <span className="flex items-center gap-3">
                Generate with AI <Sparkles className="w-4 h-4" />
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
