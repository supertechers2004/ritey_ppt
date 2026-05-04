"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const MESSAGES = [
  { emoji: "🧠", text: "Waking up the AI neurons..." },
  { emoji: "🔍", text: "Deep-diving into your topic..." },
  { emoji: "✨", text: "Crafting your narrative arc..." },
  { emoji: "🎨", text: "Painting the slide layouts..." },
  { emoji: "📐", text: "Aligning visual hierarchy..." },
  { emoji: "💡", text: "Generating brilliant insights..." },
  { emoji: "🏗️", text: "Constructing slide structures..." },
  { emoji: "🎯", text: "Sharpening key talking points..." },
  { emoji: "🔥", text: "Making it absolutely stunning..." },
  { emoji: "🚀", text: "Almost ready for liftoff..." },
  { emoji: "💎", text: "Polishing the final touches..." },
  { emoji: "🎉", text: "Wrapping it all together..." },
];

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

export function LoadingScreen({
  title = "Generating Your Presentation",
  subtitle = "Our AI is working hard. Great things take a moment.",
}: LoadingScreenProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cycle messages with fade
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fake progress bar — never hits 100 while loading
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const step = p < 40 ? 4 : p < 70 ? 2 : 0.5;
        return Math.min(p + step, 92);
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const msg = MESSAGES[msgIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-2xl">
      {/* Ambient blobs */}
      <div className="absolute w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-900/15 rounded-full blur-[100px] pointer-events-none translate-x-48 translate-y-24" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full px-8">
        {/* Icon ring */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border border-violet-500/20 bg-violet-600/10 flex items-center justify-center shadow-[0_0_60px_rgba(124,58,237,0.3)]">
            <Sparkles className="w-10 h-10 text-violet-400" />
          </div>
          {/* Spinning ring */}
          <svg
            className="absolute inset-0 w-24 h-24 animate-spin"
            style={{ animationDuration: "3s" }}
            viewBox="0 0 96 96"
          >
            <circle
              cx="48" cy="48" r="44"
              fill="none"
              stroke="url(#grad)"
              strokeWidth="2"
              strokeDasharray="60 220"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white font-syne tracking-tight">{title}</h2>
          <p className="text-gray-500 text-sm font-light">{subtitle}</p>
        </div>

        {/* Rotating message */}
        <div
          className="text-center transition-all duration-400"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)" }}
        >
          <span className="text-3xl">{msg.emoji}</span>
          <p className="mt-2 text-gray-300 font-medium text-base">{msg.text}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Fun footer */}
        <p className="text-[10px] text-gray-700 font-medium uppercase tracking-[0.2em] text-center">
          AI is brewing something extraordinary ✦ Hold tight
        </p>
      </div>
    </div>
  );
}
