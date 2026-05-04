"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Loader2, Sparkles, Edit2, Trash2, ArrowRight, Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Thread {
  thread_id: string;
  topic: string;
  updated_at: string;
  last_update: string;
  theme: string | null;
  img_path: string | null;
}

export default function Dashboard() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await api.get("/threads/");
      setThreads(res.data);
    } catch (err: any) {
      setError("Failed to load presentations.");
    } finally {
      setLoading(false);
    }
  };

  const deleteThread = async (id: string) => {
    if (!confirm("Are you sure you want to delete this presentation?")) return;
    try {
      await api.delete(`/threads/${id}`);
      setThreads(threads.filter((t) => t.thread_id !== id));
    } catch (err) {
      alert("Failed to delete presentation.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-up max-w-7xl mx-auto pb-20">
      {/* Hero / Welcome */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-3 font-syne tracking-tight">
            Design Center
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-xl leading-relaxed">
            Your space for creating and managing high-impact presentation decks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-[0.2em] block w-full mb-2 opacity-70">
            Suggested Topics
          </span>
          {["Market Analysis", "Project Roadmap", "Product Launch"].map((tag) => (
            <div
              key={tag}
              className="bg-white/5 text-gray-300 px-5 py-2 rounded-full text-xs font-medium border border-white/10 hover:border-violet-500/50 hover:bg-violet-500/5 cursor-pointer transition-all"
            >
              {tag}
            </div>
          ))}
        </div>
      </section>

      {/* Creation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Large Create Card */}
        <Link 
          href="/ppt/new" 
          className="md:col-span-4 group relative"
        >
          <div className="relative h-full overflow-hidden rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-gradient-to-br from-violet-600 to-indigo-700">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Sparkles className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-white/30">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 font-syne tracking-tight">New Presentation</h2>
              <p className="text-violet-100 text-sm font-light leading-relaxed opacity-80">
                Start with a simple prompt and let AI architect your entire presentation sequence.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-white font-bold text-sm relative z-10 group-hover:gap-4 transition-all mt-12">
              Magic Create <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Featured Project */}
        {threads.length > 0 && (
          <div className="md:col-span-8 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row group transition-all duration-500 hover:border-white/20 shadow-2xl">
            <div className="w-full md:w-5/12 relative bg-gray-900 overflow-hidden min-h-[250px]">
               <img 
                 src={threads[0].img_path || `https://picsum.photos/seed/${encodeURIComponent(threads[0].topic)}/600/400`} 
                 alt="Preview" 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70"
                 onError={(e) => {
                   (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(threads[0].topic)}/600/400`;
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-transparent to-transparent opacity-80" />
            </div>
            <div className="w-full md:w-7/12 p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  Latest Design
                </span>
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-3 font-syne truncate tracking-tight">
                {threads[0].topic}
              </h3>
              
              <div className="flex items-center gap-4 text-gray-500 text-sm mb-10">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {new Date(threads[0].updated_at).toLocaleDateString()}
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-700" />
                <div className="text-violet-400 font-medium">AI Assisted</div>
              </div>
              
              <div className="flex items-center gap-4">
                <Link
                  href={`/ppt/${threads[0].thread_id}`}
                  className="px-8 py-3 btn-primary text-sm font-bold tracking-tight active:scale-95 flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Continue Editing
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projects List Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-2xl font-bold text-white font-syne tracking-tight">Project Library</h2>
          <div className="text-xs text-gray-500 font-medium">{threads.length} presentations</div>
        </div>

        {threads.length === 0 ? (
          <div className="text-center py-24 glass-panel border-dashed rounded-[2rem]">
            <p className="text-gray-500 font-light text-lg">Your project library is empty.</p>
            <Link href="/ppt/new" className="text-violet-400 font-bold mt-2 inline-block hover:underline underline-offset-4">
              Start your first creation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {threads.map((thread) => (
              <div 
                key={thread.thread_id}
                className="group glass-panel rounded-3xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-violet-900/10"
              >
                <div className="aspect-[16/10] bg-gray-900 relative overflow-hidden">
                  <img 
                    src={thread.img_path || `https://picsum.photos/seed/${encodeURIComponent(thread.topic)}/400/250`} 
                    alt="Preview" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(thread.topic)}/400/250`;
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm bg-gray-950/40">
                    <div className="flex gap-4 scale-90 group-hover:scale-100 transition-all duration-300">
                      <Link
                        href={`/ppt/${thread.thread_id}`}
                        className="w-12 h-12 bg-white text-gray-950 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </Link>
                      <button 
                        onClick={() => deleteThread(thread.thread_id)}
                        className="w-12 h-12 bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-white/[0.02]">
                  <h4 className="text-lg font-bold text-gray-100 truncate font-syne mb-1">
                    {thread.topic}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(thread.updated_at).toLocaleDateString()}
                    </span>
                    <div className="px-2.5 py-1 bg-violet-600/10 border border-violet-600/20 rounded-lg text-[9px] font-bold text-violet-400 uppercase tracking-tighter">
                      PPTX Ready
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
