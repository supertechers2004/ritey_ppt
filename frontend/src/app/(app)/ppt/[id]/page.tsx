"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Download,
  ChevronLeft,
  ChevronRight,
  Layout,
  Type,
  List,
  FileText,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface SlideData {
  slide_number: number;
  slide_title: string;
  layout: string;
  intro_line?: string;
  bullet_points?: string[];
  supporting_text?: string;
  paragraphs?: string[];
  image_query?: string;
}

interface ThreadData {
  thread: { thread_id: string; topic: string; theme: string | null };
  outline: string[];
  detailed_slides: SlideData[];
}

export default function PPTEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<ThreadData | null>(null);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [outline, setOutline] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();

  useEffect(() => { fetchThread(); }, [id]);

  const fetchThread = async () => {
    try {
      const res = await api.get(`/threads/${id}`);
      setData(res.data);
      setSlides(res.data.detailed_slides || []);
      setOutline(res.data.outline || []);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const saveOutlineAndGenerate = async () => {
    setGenerating(true);
    try {
      await api.put(`/threads/${id}/outline`, outline);
      await api.post("/states/", { thread_id: id, action: "continue_slide" });
      await fetchThread();
    } catch {
      alert("Failed to generate slides. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const updateSlide = (index: number, field: keyof SlideData, value: any) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const updateBullet = (slideIndex: number, bulletIndex: number, value: string) => {
    const newSlides = [...slides];
    const bullets = [...(newSlides[slideIndex].bullet_points || [])];
    bullets[bulletIndex] = value;
    newSlides[slideIndex] = { ...newSlides[slideIndex], bullet_points: bullets };
    setSlides(newSlides);
  };

  const downloadPPT = async () => {
    setDownloading(true);
    try {
      const response = await api.post(
        "/ppt/custom/",
        { title: data?.thread.topic || "Presentation", theme: data?.thread.theme || null, slides_data: slides, thread_id: id },
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${data?.thread.topic || "Presentation"}.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to download. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Full-page loading
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Loading workspace...</p>
      </div>
    );
  }

  // Generating overlay
  if (generating) {
    return (
      <LoadingScreen
        title="Generating All Slides"
        subtitle="Writing detailed content for each slide. This usually takes 30–90 seconds."
      />
    );
  }  // Outline review view
  if (!slides || slides.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-up font-dm-sans overflow-hidden">
        <div className="w-full max-w-2xl glass-panel rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-11 h-11 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 shrink-0">
              <List className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-syne tracking-tight">Review Outline</h2>
              <p className="text-gray-400 text-sm mt-0.5">Edit slide titles before generating.</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            {outline.map((title, index) => (
              <div key={index} className="group flex items-center gap-3 bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl transition-all hover:border-violet-500/30">
                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0 group-hover:text-violet-400 transition-colors">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    const newOutline = [...outline];
                    newOutline[index] = e.target.value;
                    setOutline(newOutline);
                  }}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-semibold text-gray-100 placeholder:text-gray-700 text-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-5 border-t border-white/5">
            <div className="flex items-center gap-2 text-gray-500">
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Ready to generate</span>
            </div>
            <button
              id="generate-slides-btn"
              onClick={saveOutlineAndGenerate}
              className="px-7 py-2.5 btn-primary text-white rounded-2xl font-bold transition-all flex items-center gap-2.5 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Build Presentation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSlide = slides[activeSlide];

  return (
    // h-full + overflow-hidden locks editor to the viewport, no page scroll
    <div className="flex flex-col h-full font-dm-sans animate-fade-up overflow-hidden">
      {/* Sticky header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-white truncate max-w-sm font-syne tracking-tight">
              {data?.thread.topic}
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1">
                <Layout className="w-3 h-3" /> {currentSlide.layout}
              </span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Synced
              </span>
            </div>
          </div>
        </div>

        <button
          id="download-pptx-btn"
          onClick={downloadPPT}
          disabled={downloading}
          className="px-5 py-2.5 btn-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 active:scale-95 transition-all"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Generating..." : "Export PPTX"}
        </button>
      </div>

      {/* Main editor grid — fills remaining height */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Slide navigator — scrolls independently */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-1 mb-3 shrink-0">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Slides</span>
            <span className="text-[10px] font-bold text-violet-400">{slides.length} total</span>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1">
            {slides.map((slide, sIndex) => (
              <button
                key={sIndex}
                onClick={() => setActiveSlide(sIndex)}
                className={cn(
                  "w-full p-3 rounded-2xl text-left transition-all border",
                  activeSlide === sIndex
                    ? "bg-violet-600/10 border-violet-500/50 shadow-lg"
                    : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <span className={cn("text-[9px] font-bold uppercase tracking-widest block mb-1", activeSlide === sIndex ? "text-violet-400" : "text-gray-600")}>
                  Slide {String(sIndex + 1).padStart(2, "0")}
                </span>
                <span className={cn("text-sm font-bold truncate block font-syne", activeSlide === sIndex ? "text-white" : "text-gray-400")}>
                  {slide.slide_title || "Untitled"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor panel — scrolls independently */}
        <div className="lg:col-span-9 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto no-scrollbar glass-panel rounded-3xl p-7 shadow-2xl relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.025] pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>

            {/* Slide title */}
            <input
              type="text"
              value={currentSlide.slide_title || ""}
              onChange={(e) => updateSlide(activeSlide, "slide_title", e.target.value)}
              className="text-3xl font-bold text-white bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-gray-800 font-syne tracking-tight mb-8 relative z-10"
              placeholder="Slide Title"
            />

            <div className="space-y-7 relative z-10">
              {/* Intro Line */}
              {currentSlide.intro_line !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <Type className="w-3.5 h-3.5 text-violet-400" /> Opening Line
                  </div>
                  <textarea
                    value={currentSlide.intro_line || ""}
                    onChange={(e) => updateSlide(activeSlide, "intro_line", e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 text-gray-300 text-base leading-relaxed resize-none min-h-[80px] font-light"
                    placeholder="Add an impactful opening statement..."
                  />
                </div>
              )}

              {/* Bullet Points */}
              {currentSlide.bullet_points && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <List className="w-3.5 h-3.5 text-violet-400" /> Key Points
                  </div>
                  <div className="space-y-2">
                    {currentSlide.bullet_points.map((bullet, bIndex) => (
                      <div key={bIndex} className="flex items-start gap-3 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/40 group-hover:bg-violet-400 transition-colors mt-3.5 shrink-0" />
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => updateBullet(activeSlide, bIndex, e.target.value)}
                          className="flex-1 bg-transparent border-b border-white/5 py-2.5 focus:outline-none focus:border-violet-500/50 text-gray-300 text-base font-light transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supporting Text */}
              {currentSlide.supporting_text !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    <FileText className="w-3.5 h-3.5 text-violet-400" /> Supporting Detail
                  </div>
                  <textarea
                    value={currentSlide.supporting_text || ""}
                    onChange={(e) => updateSlide(activeSlide, "supporting_text", e.target.value)}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30 text-gray-400 text-sm font-light leading-relaxed resize-none min-h-[80px]"
                    placeholder="Add context or citations..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Slide nav arrows — outside the scrollable panel */}
          <div className="flex items-center justify-between pt-4 shrink-0">
            <button
              disabled={activeSlide === 0}
              onClick={() => setActiveSlide(activeSlide - 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-white font-semibold text-sm disabled:opacity-20 transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
              <span className="text-sm font-bold text-white font-syne">{activeSlide + 1}</span>
              <span className="text-gray-600 text-xs">/</span>
              <span className="text-gray-500 text-xs font-medium">{slides.length}</span>
            </div>
            <button
              disabled={activeSlide === slides.length - 1}
              onClick={() => setActiveSlide(activeSlide + 1)}
              className="flex items-center gap-2 text-gray-500 hover:text-white font-semibold text-sm disabled:opacity-20 transition-all active:scale-95"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
