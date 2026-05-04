"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// ── tiny countUp hook ──────────────────────────────────────────────
function useCountUp(
  ref: React.RefObject<HTMLSpanElement>,
  target: number,
  suffix: string,
  decimals: boolean,
  duration: number
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    let raf: number;
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      const val = p * target;
      el!.textContent = (decimals ? val.toFixed(1) : Math.floor(val).toString()) + suffix;
      if (p < 1) raf = requestAnimationFrame(step);
    }
    const timer = setTimeout(() => { raf = requestAnimationFrame(step); }, 400);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [ref, target, suffix, decimals, duration]);
}

// ── icons ──────────────────────────────────────────────────────────
function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2l1.8 5.5H17l-4.4 3.2 1.7 5.3L10 13l-4.3 3 1.7-5.3L3 7.5h5.2L10 2z" fill="#a78bfa" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="#93c5fd" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="#93c5fd" opacity=".5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="#93c5fd" opacity=".5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="#93c5fd" opacity=".3" />
    </svg>
  );
}
function IconBolt() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z" fill="#6ee7b7" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg
      width="15" height="15" viewBox="0 0 16 16" fill="none"
      style={{ display: "inline-block", transition: "transform .2s" }}
      className="arrow"
    >
      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowViolet() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", transition: "transform .2s" }} className="arrow">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── feature card ───────────────────────────────────────────────────
type CardColor = "v" | "b" | "e";

const cardGlow: Record<CardColor, string> = {
  v: "radial-gradient(ellipse 120% 80% at 0% 0%, rgba(124,58,237,.12), transparent 70%)",
  b: "radial-gradient(ellipse 120% 80% at 0% 0%, rgba(37,99,235,.10), transparent 70%)",
  e: "radial-gradient(ellipse 120% 80% at 0% 0%, rgba(5,150,105,.10), transparent 70%)",
};
const iconBoxStyle: Record<CardColor, React.CSSProperties> = {
  v: { background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)" },
  b: { background: "rgba(37,99,235,.15)", border: "1px solid rgba(37,99,235,.3)" },
  e: { background: "rgba(5,150,105,.15)", border: "1px solid rgba(5,150,105,.3)" },
};
const chipStyle: Record<CardColor, React.CSSProperties> = {
  v: { background: "rgba(124,58,237,.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,.25)" },
  b: { background: "rgba(37,99,235,.15)", color: "#93c5fd", border: "1px solid rgba(37,99,235,.25)" },
  e: { background: "rgba(5,150,105,.15)", color: "#6ee7b7", border: "1px solid rgba(5,150,105,.25)" },
};

interface FeatureCardProps {
  color: CardColor;
  icon: React.ReactNode;
  title: string;
  description: string;
  chip: string;
  delay: string;
}

function FeatureCard({ color, icon, title, description, chip, delay }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (glowRef.current) glowRef.current.style.opacity = "1";
    if (beamRef.current) {
      beamRef.current.style.opacity = "1";
      beamRef.current.style.animation = "none";
      void beamRef.current.offsetWidth;
      beamRef.current.style.animation = "beamSlide .8s ease forwards";
    }
    if (cardRef.current) cardRef.current.style.background = "rgba(15,12,30,.95)";
  };
  const handleMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = "0";
    if (beamRef.current) beamRef.current.style.opacity = "0";
    if (cardRef.current) cardRef.current.style.background = "rgba(10,10,20,.85)";
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "rgba(10,10,20,.85)",
        backdropFilter: "blur(16px)",
        padding: "36px 28px",
        position: "relative",
        overflow: "hidden",
        transition: "background .3s",
        animationDelay: delay,
      }}
      className="feat-card"
    >
      {/* border beam */}
      <div
        ref={beamRef}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg,transparent,rgba(167,139,250,0),rgba(167,139,250,.8),transparent)",
          transform: "translateX(-100%)",
          opacity: 0,
        }}
      />
      {/* radial glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute", inset: 0,
          background: cardGlow[color],
          opacity: 0,
          transition: "opacity .4s",
          pointerEvents: "none",
        }}
      />
      {/* icon */}
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
        ...iconBoxStyle[color],
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: "#e2e8f0", marginBottom: 10, letterSpacing: "-.3px", position: "relative", zIndex: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65, position: "relative", zIndex: 1 }}>
        {description}
      </div>
      <span style={{
        display: "inline-block", marginTop: 18,
        padding: "4px 12px", borderRadius: 100,
        fontSize: 11, fontWeight: 500, letterSpacing: ".04em",
        position: "relative", zIndex: 1,
        ...chipStyle[color],
      }}>
        {chip}
      </span>
    </div>
  );
}

// ── main page ──────────────────────────────────────────────────────
export default function Home() {
  const s1 = useRef<HTMLSpanElement>(null!);
  const s2 = useRef<HTMLSpanElement>(null!);
  const s3 = useRef<HTMLSpanElement>(null!);

  useCountUp(s1, 10, "k+", false, 1200);
  useCountUp(s2, 4.9, "★", true, 1400);
  useCountUp(s3, 25, "+", false, 1000);

  return (
    <>
      {/* global keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes drift {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(24px,-24px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          to { transform: translateX(100%); }
        }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:.3; }
        }
        @keyframes beamSlide {
          from { transform: translateX(-100%); }
          to   { transform: translateX(100%); }
        }

        .feat-card { animation: fadeUp .8s ease both; }

        .btn-glow:hover .arrow { transform: translateX(3px); }
        .btn-glow::after {
          content:''; position:absolute; inset:0;
          background:rgba(255,255,255,.12); opacity:0; transition:opacity .2s;
        }
        .btn-glow:hover::after { opacity:1; }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#030712", color: "#f8fafc", overflowX: "hidden", minHeight: "100vh", position: "relative" }}>

        {/* dot grid */}
        <div style={{
          position: "fixed", inset: 0, zIndex: 0,
          backgroundImage: "radial-gradient(rgba(124,58,237,0.25) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
        }} />

        {/* ambient blobs */}
        {[
          { w: 500, h: 500, bg: "rgba(124,58,237,0.2)", top: -180, left: -120, delay: "0s", dur: "14s" },
          { w: 380, h: 380, bg: "rgba(37,99,235,0.15)", bottom: -120, right: -80, delay: "3s", dur: "10s" },
          { w: 280, h: 280, bg: "rgba(5,150,105,0.1)", top: "40%", left: "55%", delay: "6s", dur: "12s" },
        ].map((b, i) => (
          <div key={i} style={{
            position: "fixed", borderRadius: "50%", filter: "blur(80px)",
            pointerEvents: "none", zIndex: 0,
            width: b.w, height: b.h, background: b.bg,
            top: b.top as any, left: b.left as any,
            bottom: (b as any).bottom, right: (b as any).right,
            animation: `drift ${b.dur} ${b.delay} ease-in-out infinite${i === 1 ? " reverse" : ""}`,
            opacity: 1,
          }} />
        ))}

        {/* page content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>

          {/* ── hero ── */}
          <section style={{ padding: "100px 0 72px", textAlign: "center", animation: "fadeUp .7s ease both" }}>

            {/* badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.35)",
              borderRadius: 100,
              fontSize: 12, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase",
              color: "#c4b5fd",
              marginBottom: 36,
              position: "relative", overflow: "hidden",
              animation: "fadeUp .7s .1s ease both",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.08) 50%,transparent 100%)",
                transform: "translateX(-100%)",
                animation: "shimmer 3s 1.5s infinite",
              }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", animation: "blink 2s infinite", display: "inline-block" }} />
              Now in public beta
            </div>

            {/* title */}
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: "clamp(38px, 6.5vw, 68px)",
              lineHeight: 1.04, letterSpacing: "-2.5px",
              color: "#f1f5f9", marginBottom: 24,
              animation: "fadeUp .7s .15s ease both",
            }}>
              Presentations<br />
              <span style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #818cf8 40%, #60a5fa 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                from the Future
              </span>
            </h1>

            {/* subtitle */}
            <p style={{
              fontSize: 17, fontWeight: 300, lineHeight: 1.75,
              color: "#94a3b8", maxWidth: 520, margin: "0 auto 52px",
              animation: "fadeUp .7s .2s ease both",
            }}>
              Ritey AI leverages intelligence to generate structured, high-quality presentation decks in seconds — AI-powered outlines, customizable slides, sleek templates.
            </p>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72, animation: "fadeUp .7s .25s ease both" }}>
              <Link href="/register" className="btn-glow" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 30px",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                color: "white", borderRadius: 100,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
                textDecoration: "none", border: "none", cursor: "pointer",
                boxShadow: "0 0 0 1px rgba(124,58,237,.4), 0 8px 32px rgba(124,58,237,.45)",
                transition: "all .25s", position: "relative", overflow: "hidden",
              }}>
                Get Started <IconArrow />
              </Link>
              <Link href="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 30px",
                background: "rgba(255,255,255,.04)",
                color: "#cbd5e1", borderRadius: 100,
                fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,.1)",
                cursor: "pointer", transition: "all .2s",
              }}>
                Login
              </Link>
            </div>

            {/* stats strip */}
            <div style={{
              display: "flex", justifyContent: "center", gap: 0,
              marginBottom: 80, flexWrap: "wrap",
              border: "1px solid rgba(255,255,255,.07)", borderRadius: 16,
              overflow: "hidden",
              background: "rgba(255,255,255,.02)",
              backdropFilter: "blur(12px)",
              animation: "fadeUp .7s .3s ease both",
            }}>
              {[
                { ref: s1, label: "Decks created", static: false },
                { ref: s2, label: "Avg. rating", static: false },
                { val: "<30s", label: "First deck time", static: true },
                { ref: s3, label: "Templates", static: false },
              ].map((s, i, arr) => (
                <div key={i} style={{
                  flex: 1, minWidth: 140,
                  padding: "24px 20px", textAlign: "center",
                  borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none",
                }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-1px", color: "#e2e8f0" }}>
                    {s.static ? s.val : <span ref={(s as any).ref}>0</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, letterSpacing: ".03em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── feature cards ── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1,
            background: "rgba(124,58,237,0.2)",
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(124,58,237,0.2)",
            marginBottom: 80,
          }}>
            <FeatureCard color="v" icon={<IconStar />} title="AI Outlining" description="Automatically generate logical presentation structures from a single topic prompt." chip="Powered by Claude" delay=".35s" />
            <FeatureCard color="b" icon={<IconGrid />} title="Custom Themes" description="Select from multiple futuristic templates or let the system choose for you." chip="20+ templates" delay=".45s" />
            <FeatureCard color="e" icon={<IconBolt />} title="Manual Editing" description="Fine-tune the AI generated content before exporting to standard PPTX format." chip="PPTX export" delay=".55s" />
          </div>

          {/* ── bottom CTA panel ── */}
          <div style={{
            position: "relative", overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(124,58,237,0.3)",
            background: "rgba(124,58,237,0.06)",
            backdropFilter: "blur(20px)",
            padding: "64px 40px", textAlign: "center",
            marginBottom: 60,
            animation: "fadeUp .8s .6s ease both",
          }}>
            {/* top beam line */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: "linear-gradient(90deg, transparent, rgba(167,139,250,.6), transparent)",
            }} />
            {/* glow orb */}
            <div style={{
              position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
              width: 300, height: 300, borderRadius: "50%",
              background: "rgba(124,58,237,0.12)", filter: "blur(60px)",
              pointerEvents: "none",
            }} />
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: "-1.5px", color: "#f1f5f9", marginBottom: 12, position: "relative", zIndex: 1 }}>
              Ready to impress?
            </div>
            <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 36, position: "relative", zIndex: 1 }}>
              Join thousands building better decks with Ritey AI.
            </div>
            <Link href="/register" className="btn-glow" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 30px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: "white", borderRadius: 100,
              fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500,
              textDecoration: "none", border: "none", cursor: "pointer",
              boxShadow: "0 0 0 1px rgba(124,58,237,.4), 0 8px 32px rgba(124,58,237,.45)",
              transition: "all .25s", position: "relative", zIndex: 1, overflow: "hidden",
            }}>
              Start for free <IconArrowViolet />
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}