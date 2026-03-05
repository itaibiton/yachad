"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Plane,
  Newspaper,
  Users,
  MessageSquare,
  Hotel,
  Map,
  ChevronDown,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LocationSearch,
  type LocationResult,
} from "@/shared/components/LocationSearch";
import { ProfileMenu } from "@/shared/components/topbar/ProfileMenu";

// ---------------------------------------------------------------------------
// Mosaic Globe — squares only, pulsing tiles, floating 3D squares outside
// ---------------------------------------------------------------------------

function MosaicGlobe() {
  const palette = [
    "#0038b8", "#0044cc", "#1a4fd6", "#2563eb", "#3b69e8",
    "#1d4ed8", "#6487f0", "#93b4f5", "#b0ccfa", "#c7dafb",
    "#dbeafe", "#1e3a8a", "#1e40af", "#2d5fce", "#0a2e7a",
  ];

  function prng(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  const COLS = 24;
  const ROWS = 24;

  const tiles = useMemo(() => {
    const result: { key: string; color: string; opacity: number; pulseDelay: number }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const seed = row * COLS + col;
        const colorIdx = Math.floor(prng(seed * 3.7) * palette.length);
        const opacity = Math.round((0.45 + prng(seed * 1.3) * 0.55) * 100) / 100;
        const pulseDelay = Math.round(prng(seed * 2.1) * 600) / 100;
        result.push({ key: `${row}-${col}`, color: palette[colorIdx], opacity, pulseDelay });
      }
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Floating squares — depth via size, blur, opacity (no rotation)
  // z: 0 = far back (small, blurred, faint), 1 = mid, 2 = foreground (big, sharp, vivid)
  const floatingSquares = useMemo(() => [
    // Far back (z=0) — tiny, blurred, faint
    { top: "4%", left: "10%", size: 6, color: "#dbeafe", z: 0, delay: 0, dur: 8 },
    { top: "12%", left: "78%", size: 5, color: "#c7dafb", z: 0, delay: 1.5, dur: 9 },
    { top: "30%", left: "3%", size: 7, color: "#b0ccfa", z: 0, delay: 3, dur: 7 },
    { top: "58%", left: "95%", size: 5, color: "#dbeafe", z: 0, delay: 0.8, dur: 10 },
    { top: "76%", left: "16%", size: 6, color: "#c7dafb", z: 0, delay: 2.2, dur: 8.5 },
    { top: "86%", left: "73%", size: 7, color: "#b0ccfa", z: 0, delay: 4, dur: 7.5 },
    { top: "3%", left: "53%", size: 4, color: "#dbeafe", z: 0, delay: 1, dur: 9 },
    { top: "46%", left: "2%", size: 5, color: "#c7dafb", z: 0, delay: 3.5, dur: 8 },
    { top: "22%", left: "92%", size: 6, color: "#dbeafe", z: 0, delay: 0.4, dur: 7 },
    { top: "68%", left: "98%", size: 4, color: "#b0ccfa", z: 0, delay: 2.6, dur: 9.5 },
    { top: "40%", left: "6%", size: 5, color: "#dbeafe", z: 0, delay: 1.8, dur: 8 },
    { top: "94%", left: "35%", size: 6, color: "#c7dafb", z: 0, delay: 4.5, dur: 7.5 },
    // Far back — new additions
    { top: "8%", left: "38%", size: 5, color: "#dbeafe", z: 0, delay: 0.6, dur: 8.5 },
    { top: "16%", left: "60%", size: 4, color: "#c7dafb", z: 0, delay: 2.8, dur: 9 },
    { top: "25%", left: "18%", size: 6, color: "#b0ccfa", z: 0, delay: 1.3, dur: 7.5 },
    { top: "35%", left: "85%", size: 5, color: "#dbeafe", z: 0, delay: 3.8, dur: 8 },
    { top: "50%", left: "14%", size: 4, color: "#c7dafb", z: 0, delay: 0.2, dur: 10 },
    { top: "62%", left: "42%", size: 6, color: "#b0ccfa", z: 0, delay: 4.2, dur: 7 },
    { top: "72%", left: "62%", size: 5, color: "#dbeafe", z: 0, delay: 1.7, dur: 9.5 },
    { top: "82%", left: "88%", size: 4, color: "#c7dafb", z: 0, delay: 3.3, dur: 8 },
    { top: "90%", left: "55%", size: 6, color: "#b0ccfa", z: 0, delay: 0.9, dur: 7.5 },
    { top: "15%", left: "4%", size: 5, color: "#dbeafe", z: 0, delay: 5, dur: 9 },
    { top: "45%", left: "90%", size: 4, color: "#c7dafb", z: 0, delay: 2.1, dur: 8.5 },
    { top: "70%", left: "8%", size: 7, color: "#b0ccfa", z: 0, delay: 3.6, dur: 7 },
    // Mid layer (z=1) — medium, slight blur
    { top: "2%", left: "28%", size: 12, color: "#93b4f5", z: 1, delay: 0.5, dur: 7 },
    { top: "8%", left: "86%", size: 14, color: "#6487f0", z: 1, delay: 2, dur: 8 },
    { top: "23%", left: "95%", size: 11, color: "#2d5fce", z: 1, delay: 1.2, dur: 6.5 },
    { top: "40%", left: "97%", size: 13, color: "#3b69e8", z: 1, delay: 3.5, dur: 9 },
    { top: "53%", left: "4%", size: 10, color: "#93b4f5", z: 1, delay: 0.3, dur: 7.5 },
    { top: "68%", left: "5%", size: 15, color: "#6487f0", z: 1, delay: 2.8, dur: 8 },
    { top: "80%", left: "90%", size: 12, color: "#2d5fce", z: 1, delay: 1.8, dur: 6 },
    { top: "90%", left: "45%", size: 11, color: "#3b69e8", z: 1, delay: 4.2, dur: 7 },
    { top: "18%", left: "2%", size: 10, color: "#93b4f5", z: 1, delay: 0.7, dur: 8.5 },
    { top: "35%", left: "8%", size: 9, color: "#6487f0", z: 1, delay: 3.2, dur: 6.5 },
    { top: "62%", left: "92%", size: 13, color: "#2563eb", z: 1, delay: 1.4, dur: 7 },
    { top: "92%", left: "18%", size: 10, color: "#3b69e8", z: 1, delay: 5, dur: 8 },
    { top: "5%", left: "65%", size: 11, color: "#6487f0", z: 1, delay: 2.4, dur: 7.5 },
    { top: "48%", left: "94%", size: 9, color: "#93b4f5", z: 1, delay: 0.9, dur: 9 },
    // Mid layer — new additions
    { top: "7%", left: "42%", size: 10, color: "#93b4f5", z: 1, delay: 1.6, dur: 7 },
    { top: "14%", left: "72%", size: 12, color: "#6487f0", z: 1, delay: 3.8, dur: 8.5 },
    { top: "28%", left: "12%", size: 11, color: "#2d5fce", z: 1, delay: 0.4, dur: 6.5 },
    { top: "32%", left: "88%", size: 9, color: "#3b69e8", z: 1, delay: 2.2, dur: 7.5 },
    { top: "44%", left: "5%", size: 13, color: "#93b4f5", z: 1, delay: 4.6, dur: 8 },
    { top: "56%", left: "88%", size: 10, color: "#6487f0", z: 1, delay: 1.1, dur: 6 },
    { top: "72%", left: "94%", size: 11, color: "#2563eb", z: 1, delay: 3.4, dur: 7 },
    { top: "78%", left: "12%", size: 14, color: "#3b69e8", z: 1, delay: 0.6, dur: 9 },
    { top: "84%", left: "68%", size: 9, color: "#93b4f5", z: 1, delay: 2.9, dur: 6.5 },
    { top: "96%", left: "62%", size: 12, color: "#6487f0", z: 1, delay: 4.8, dur: 7.5 },
    { top: "10%", left: "18%", size: 10, color: "#2d5fce", z: 1, delay: 1.9, dur: 8 },
    { top: "38%", left: "92%", size: 11, color: "#3b69e8", z: 1, delay: 3.1, dur: 6.5 },
    { top: "60%", left: "2%", size: 13, color: "#93b4f5", z: 1, delay: 0.8, dur: 7 },
    { top: "88%", left: "82%", size: 10, color: "#6487f0", z: 1, delay: 5.2, dur: 8.5 },
    // Foreground (z=2) — large, crisp, vivid
    { top: "1%", left: "7%", size: 24, color: "#0038b8", z: 2, delay: 0, dur: 6 },
    { top: "6%", left: "83%", size: 20, color: "#1d4ed8", z: 2, delay: 1.5, dur: 7 },
    { top: "33%", left: "96%", size: 28, color: "#1a4fd6", z: 2, delay: 2.5, dur: 8 },
    { top: "48%", left: "0%", size: 22, color: "#2563eb", z: 2, delay: 0.8, dur: 6.5 },
    { top: "66%", left: "3%", size: 26, color: "#1e40af", z: 2, delay: 3, dur: 7.5 },
    { top: "73%", left: "93%", size: 20, color: "#0038b8", z: 2, delay: 1, dur: 9 },
    { top: "88%", left: "58%", size: 18, color: "#1a4fd6", z: 2, delay: 4, dur: 6 },
    { top: "10%", left: "46%", size: 16, color: "#2563eb", z: 2, delay: 2, dur: 7 },
    { top: "15%", left: "15%", size: 18, color: "#1e3a8a", z: 2, delay: 3.8, dur: 8 },
    { top: "55%", left: "96%", size: 22, color: "#0a2e7a", z: 2, delay: 1.2, dur: 6.5 },
    { top: "85%", left: "10%", size: 16, color: "#0044cc", z: 2, delay: 2.6, dur: 7 },
    { top: "95%", left: "80%", size: 14, color: "#1d4ed8", z: 2, delay: 0.5, dur: 8.5 },
    // Foreground — new additions
    { top: "3%", left: "32%", size: 18, color: "#1e3a8a", z: 2, delay: 1.8, dur: 7 },
    { top: "8%", left: "68%", size: 16, color: "#0038b8", z: 2, delay: 3.2, dur: 6 },
    { top: "20%", left: "90%", size: 20, color: "#1d4ed8", z: 2, delay: 0.4, dur: 8 },
    { top: "25%", left: "4%", size: 22, color: "#1a4fd6", z: 2, delay: 2.8, dur: 7.5 },
    { top: "38%", left: "2%", size: 18, color: "#2563eb", z: 2, delay: 4.5, dur: 6.5 },
    { top: "42%", left: "95%", size: 24, color: "#1e40af", z: 2, delay: 1.6, dur: 8 },
    { top: "58%", left: "6%", size: 20, color: "#0038b8", z: 2, delay: 3.6, dur: 7 },
    { top: "62%", left: "94%", size: 16, color: "#0a2e7a", z: 2, delay: 0.2, dur: 6.5 },
    { top: "78%", left: "4%", size: 22, color: "#1a4fd6", z: 2, delay: 2.4, dur: 8.5 },
    { top: "82%", left: "92%", size: 18, color: "#0044cc", z: 2, delay: 4.2, dur: 7 },
    { top: "92%", left: "28%", size: 14, color: "#1e3a8a", z: 2, delay: 1.4, dur: 6 },
    { top: "96%", left: "72%", size: 16, color: "#1d4ed8", z: 2, delay: 3.4, dur: 8 },
    { top: "12%", left: "56%", size: 14, color: "#2563eb", z: 2, delay: 5, dur: 7.5 },
    { top: "70%", left: "8%", size: 20, color: "#1e40af", z: 2, delay: 0.6, dur: 6.5 },
    { top: "50%", left: "92%", size: 16, color: "#0038b8", z: 2, delay: 2.2, dur: 7 },
    { top: "30%", left: "6%", size: 18, color: "#0a2e7a", z: 2, delay: 4.8, dur: 8 },
  ], []);

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: "100%", maxWidth: 1100, aspectRatio: "1" }}
      aria-hidden="true"
    >
      {/* Soft glow behind globe */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle, rgba(0,56,184,0.12) 0%, rgba(79,70,229,0.06) 40%, transparent 65%)",
          filter: "blur(30px)",
          transform: "scale(1.2)",
        }}
      />

      {/* Floating squares — depth via size/blur/opacity */}
      {floatingSquares.map((sq, i) => {
        // z=0: far, z=1: mid, z=2: near
        const blur = sq.z === 0 ? 3 : sq.z === 1 ? 1 : 0;
        const opacity = sq.z === 0 ? 0.2 : sq.z === 1 ? 0.35 : 0.55;
        const shadow = sq.z === 2
          ? `0 ${sq.size * 0.3}px ${sq.size * 0.8}px rgba(0,56,184,0.15)`
          : sq.z === 1
          ? `0 ${sq.size * 0.15}px ${sq.size * 0.4}px rgba(0,56,184,0.08)`
          : "none";
        return (
          <div
            key={`float-${i}`}
            className="absolute pointer-events-none"
            style={{
              top: sq.top,
              left: sq.left,
              width: sq.size,
              height: sq.size,
              backgroundColor: sq.color,
              borderRadius: Math.max(2, sq.size * 0.15),
              opacity,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
              boxShadow: shadow,
              animation: `tileFloat ${sq.dur}s ease-in-out ${sq.delay}s infinite alternate`,
            }}
          />
        );
      })}

      {/* Globe: circular mask with tile grid */}
      <div className="absolute inset-[4%] rounded-full overflow-hidden">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            width: "100%",
            height: "100%",
            gap: "2px",
            padding: "2px",
            background: "rgba(245,245,248,0.6)",
          }}
        >
          {tiles.map((tile) => (
            <div
              key={tile.key}
              style={{
                backgroundColor: tile.color,
                opacity: tile.opacity,
                borderRadius: 2,
                animation: `tilePulse 4s ease-in-out ${tile.pulseDelay}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Radial fade at edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle, transparent 35%, rgba(250,250,250,0.35) 60%, rgba(250,250,250,0.92) 100%)",
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feature illustrations — warm white / pastel style
// ---------------------------------------------------------------------------

function FlightIllustration() {
  return (
    <div className="relative h-20 w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
      <svg viewBox="0 0 240 60" className="h-full w-full" aria-hidden="true">
        <path
          d="M15,45 Q60,5 120,30 T225,12"
          fill="none"
          stroke="rgba(0,56,184,0.2)"
          strokeWidth="1.5"
          strokeDasharray="5,4"
        />
        <circle cx="15" cy="45" r="4" fill="rgba(0,56,184,0.15)" stroke="rgba(0,56,184,0.3)" strokeWidth="1" />
        <circle cx="225" cy="12" r="4" fill="rgba(0,56,184,0.15)" stroke="rgba(0,56,184,0.3)" strokeWidth="1" />
        <g>
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M15,45 Q60,5 120,30 T225,12" />
          <polygon points="0,-5 10,0 0,5" fill="rgba(0,56,184,0.5)" />
        </g>
        <text x="15" y="58" fontSize="6" fill="rgba(0,56,184,0.3)" fontFamily="system-ui">TLV</text>
        <text x="215" y="8" fontSize="6" fill="rgba(0,56,184,0.3)" fontFamily="system-ui">JFK</text>
      </svg>
    </div>
  );
}

function NewsIllustration() {
  return (
    <div className="flex flex-col gap-1.5">
      {[
        { w: "85%", opacity: 1, dot: "bg-amber-400" },
        { w: "70%", opacity: 0.7, dot: "bg-amber-300" },
        { w: "60%", opacity: 0.45, dot: "bg-amber-200" },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2"
          style={{ opacity: row.opacity }}
        >
          <div className={`size-2 shrink-0 rounded-full ${row.dot} animate-pulse`} style={{ animationDelay: `${i * 0.4}s` }} />
          <div className="h-2 rounded-full bg-amber-200/60" style={{ width: row.w }} />
          <div className="ms-auto h-2 w-8 rounded-full bg-amber-100" />
        </div>
      ))}
    </div>
  );
}

function CommunityIllustration() {
  return (
    <div className="rounded-xl bg-emerald-50/60 border border-emerald-200/40 p-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="size-5 shrink-0 rounded-full bg-emerald-300/50" />
          <div className="rounded-lg bg-white border border-emerald-200/60 px-2.5 py-1.5 shadow-sm">
            <div className="h-2 w-20 rounded-full bg-emerald-300/40" />
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <div className="rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 shadow-sm">
            <div className="h-2 w-24 rounded-full bg-gray-200" />
          </div>
          <div className="size-5 shrink-0 rounded-full bg-gray-300/50" />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-5 shrink-0 rounded-full bg-emerald-300/50" />
          <div className="rounded-lg bg-white border border-emerald-200/60 px-2.5 py-1.5 shadow-sm">
            <div className="h-2 w-14 rounded-full bg-emerald-300/40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelIllustration() {
  return (
    <div className="rounded-xl bg-violet-50 border border-violet-200/50 p-3">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-violet-200/60 flex items-center justify-center">
          <Hotel className="size-5 text-violet-400" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-24 rounded-full bg-violet-200/50" />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-14 rounded-full bg-red-200/50 line-through" />
            <span className="text-[8px] text-emerald-500 font-medium">NEW</span>
            <div className="h-2 w-16 rounded-full bg-emerald-300/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MapIllustration() {
  return (
    <div className="relative h-20 overflow-hidden rounded-xl bg-cyan-50 border border-cyan-200/40">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,180,216,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,180,216,0.06)_1px,transparent_1px)] bg-[size:16px_16px]" />
      {[
        { top: "18%", left: "22%", size: 8, color: "bg-cyan-400" },
        { top: "55%", left: "48%", size: 10, color: "bg-brand" },
        { top: "30%", left: "72%", size: 7, color: "bg-cyan-400" },
        { top: "65%", left: "28%", size: 6, color: "bg-cyan-300" },
        { top: "40%", left: "88%", size: 8, color: "bg-cyan-400" },
      ].map((pin, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${pin.color} shadow-sm`}
          style={{ top: pin.top, left: pin.left, width: pin.size, height: pin.size }}
        >
          <div className={`absolute inset-0 animate-ping rounded-full ${pin.color}/30`} style={{ animationDuration: `${2 + i * 0.4}s` }} />
        </div>
      ))}
    </div>
  );
}

function ChatIllustration() {
  return (
    <div className="flex flex-col gap-1">
      <div className="ms-auto w-fit rounded-xl rounded-ee-sm bg-brand/10 border border-brand/20 px-3 py-2">
        <div className="h-2 w-20 rounded-full bg-brand/20" />
      </div>
      <div className="w-fit rounded-xl rounded-es-sm bg-gray-100 border border-gray-200 px-3 py-2">
        <div className="h-2 w-28 rounded-full bg-gray-300/60" />
      </div>
      <div className="ms-auto w-fit rounded-xl rounded-ee-sm bg-brand/10 border border-brand/20 px-3 py-1.5">
        <div className="h-2 w-14 rounded-full bg-brand/20" />
        <div className="mt-1 flex justify-end gap-0.5">
          <div className="size-1 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="size-1 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="size-1 rounded-full bg-brand/40 animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

const MOSAIC_ILLUSTRATIONS: Record<string, React.FC> = {
  flights: FlightIllustration,
  news: NewsIllustration,
  community: CommunityIllustration,
  hotels: HotelIllustration,
  map: MapIllustration,
  chat: ChatIllustration,
};

// ---------------------------------------------------------------------------
// Bento feature card
// ---------------------------------------------------------------------------

interface BentoCardProps {
  icon: typeof Plane;
  title: string;
  description: string;
  accentColor: string;
  accentTextColor: string;
  illustrationKey?: string;
  colSpan?: "1" | "2" | "3";
  rowSpan?: "1" | "2";
  delay?: number;
  highlight?: boolean;
}

function BentoCard({
  icon: Icon,
  title,
  description,
  accentColor,
  accentTextColor,
  illustrationKey,
  colSpan = "1",
  rowSpan = "1",
  delay = 0,
  highlight = false,
}: BentoCardProps) {
  const Illustration = illustrationKey ? MOSAIC_ILLUSTRATIONS[illustrationKey] : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={[
        "group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 overflow-hidden",
        "hover:shadow-lg hover:-translate-y-0.5",
        highlight
          ? "border-brand/25 bg-indigo-50/60 shadow-sm shadow-brand/10"
          : "border-gray-200 bg-white shadow-sm",
        colSpan === "3" ? "lg:col-span-3" : colSpan === "2" ? "md:col-span-2" : "",
        rowSpan === "2" ? "md:row-span-2" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Decorative tile corner accent */}
      <div
        className="absolute top-0 end-0 w-20 h-20 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at top right, ${highlight ? "rgba(0,56,184,0.08)" : "rgba(0,0,0,0.03)"} 0%, transparent 70%)`,
        }}
      />
      {/* Mosaic-tile corner decoration: 3x3 micro-grid */}
      <div
        className="absolute top-3 end-3 grid grid-cols-3 gap-0.5 opacity-30 group-hover:opacity-50 transition-opacity"
        aria-hidden="true"
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-[1px]"
            style={{
              backgroundColor: highlight
                ? `rgba(0,56,184,${0.3 + (i % 3) * 0.2})`
                : `rgba(100,116,139,${0.2 + (i % 4) * 0.15})`,
            }}
          />
        ))}
      </div>

      {/* Icon badge */}
      <div
        className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${accentColor}`}
      >
        <Icon className={`size-5 ${accentTextColor}`} />
      </div>

      <h3 className="mb-2 text-base font-semibold text-gray-900 leading-snug">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-500">{description}</p>

      {/* Feature illustration — pinned to bottom */}
      {Illustration && (
        <div className="mt-auto pt-4">
          <Illustration />
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LandingMosaic() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const heroRef = useRef<HTMLElement>(null);

  const isMobile = useIsMobile();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();

  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult | null>(null);
  const [showSignIn, setShowSignIn] = useState(false);
  const [postAuthRedirect, setPostAuthRedirect] = useState("/feed");

  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  const handleGoogleSignIn = useCallback(async () => {
    if (!signIn) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: postAuthRedirect,
      });
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  }, [signIn, postAuthRedirect]);

  const handleAgentSignIn = useCallback(() => {
    if (isSignedIn) {
      router.push("/agent-onboarding");
    } else {
      setPostAuthRedirect("/agent-onboarding");
      sessionStorage.setItem("yachad-post-auth-redirect", "/agent-onboarding");
      setShowSignIn(true);
    }
  }, [isSignedIn, router]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const globeY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const handleLocationSelect = useCallback((result: LocationResult) => {
    setSelectedLocation(result);
    if (isSignedIn) {
      // Already authenticated — go straight to dashboard
      router.push("/feed");
    } else {
      setTimeout(() => setShowSignIn(true), 400);
    }
  }, [isSignedIn, router]);

  const features: BentoCardProps[] = useMemo(
    () => [
      {
        icon: Plane,
        title: locale === "he" ? "טיסות חילוץ" : "Extraction Flights",
        description:
          locale === "he"
            ? "מצאו טיסות חירום, שתפו מושבים פנויים, וצרו קשר עם חברות תעופה בזמן אמת"
            : "Find emergency flights, share available seats, and connect with airlines in real time",
        accentColor: "bg-blue-100",
        accentTextColor: "text-blue-600",
        illustrationKey: "flights",
        colSpan: "2",
        delay: 0,
        highlight: true,
      },
      {
        icon: Newspaper,
        title: locale === "he" ? "חדשות בזמן אמת" : "Live Crisis News",
        description:
          locale === "he"
            ? "עדכונים מאומתים מהשטח, התראות בטיחות, ומידע קונסולרי ממקורות רשמיים"
            : "Verified ground updates, safety alerts, and consular information from official sources",
        accentColor: "bg-amber-100",
        accentTextColor: "text-amber-600",
        illustrationKey: "news",
        delay: 0.08,
      },
      {
        icon: Users,
        title: locale === "he" ? "פיד קהילתי" : "Community Feed",
        description:
          locale === "he"
            ? "ישראלים עוזרים לישראלים — שיתוף מידע, בקשות עזרה, והצעות סיוע מקהילה אמיתית"
            : "Israelis helping Israelis — share info, request help, and offer assistance in a real community",
        accentColor: "bg-emerald-100",
        accentTextColor: "text-emerald-600",
        illustrationKey: "community",
        delay: 0.16,
      },
      {
        icon: Hotel,
        title: locale === "he" ? "מלונות וביטולים" : "Hotels & Cancellations",
        description:
          locale === "he"
            ? "מצאו חדרים זמינים, שתפו ביטולי הזמנות, ועזרו אחד לשני עם לינה"
            : "Find available rooms, share booking cancellations, and help each other with accommodation",
        accentColor: "bg-violet-100",
        accentTextColor: "text-violet-600",
        illustrationKey: "hotels",
        delay: 0.24,
      },
      {
        icon: Map,
        title: locale === "he" ? "מפת שירותים" : "Services Map",
        description:
          locale === "he"
            ? "מצאו בתי כנסת, מרכזי חב״ד, שגרירויות, ושירותים יהודיים בכל מקום בעולם"
            : "Find synagogues, Chabad centers, embassies, and Jewish services anywhere in the world",
        accentColor: "bg-cyan-100",
        accentTextColor: "text-cyan-600",
        illustrationKey: "map",
        delay: 0.32,
      },
      {
        icon: MessageSquare,
        title: locale === "he" ? "צ׳אט בזמן אמת" : "Real-time Chat",
        description:
          locale === "he"
            ? "חדרי שיחה לפי מדינה, קבוצות חירום, והודעות ישירות לתיאום מהיר"
            : "Country-based chat rooms, emergency groups, and direct messages for rapid coordination",
        accentColor: "bg-rose-100",
        accentTextColor: "text-rose-600",
        illustrationKey: "chat",
        colSpan: "3",
        delay: 0.4,
      },
    ],
    [locale]
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#FAFAFA" }}>
      {/* ------------------------------------------------------------------ */}
      {/* HERO — 100vh */}
      {/* ------------------------------------------------------------------ */}
      <section
        ref={heroRef}
        className="relative h-screen flex flex-col overflow-hidden"
      >
        {/* Subtle warm gradient backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(224,231,255,0.55) 0%, transparent 70%)",
          }}
        />
        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,56,184,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* ---- Top bar ---- */}
        <motion.header
          style={{ opacity: heroOpacity }}
          className="relative z-20 flex items-center justify-between px-6 py-5 md:px-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            {/* Mosaic logo mark: a 3x3 grid of colored squares */}
            <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-lg bg-white border border-gray-200 shadow-sm">
              {[
                "#0038b8",
                "#1a4fd6",
                "#3b69e8",
                "#6487f0",
                "#0038b8",
                "#93a8f5",
                "#3b69e8",
                "#93a8f5",
                "#1a4fd6",
              ].map((color, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              יחד
            </span>
          </div>

          {/* Right: lang toggle + sign in / profile */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <ProfileMenu />
            ) : (
              <>
                <Link
                  href="/"
                  locale={locale === "he" ? "en" : "he"}
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors font-medium"
                >
                  {locale === "he" ? "English" : "עברית"}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                  onClick={() => setShowSignIn(true)}
                >
                  {t("auth.signIn")}
                </Button>
              </>
            )}
          </div>
        </motion.header>

        {/* ---- Hero content — top 60% ---- */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-[28vh]">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-5 flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 shadow-sm"
          >
            <Sparkles className="size-3.5 text-brand" />
            <span className="text-xs font-medium text-brand tracking-wide">
              {locale === "he"
                ? "פלטפורמת חירום קהילתית"
                : "Community Crisis Platform"}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-5 text-center text-4xl font-bold tracking-tight text-gray-900 md:text-6xl lg:text-7xl leading-tight"
          >
            <span
              style={{
                background: "linear-gradient(135deg, #0038b8 0%, #4f46e5 60%, #6487f0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {locale === "he" ? "יחד" : "Yachad"}
            </span>
            <span className="text-gray-200 mx-4">/</span>
            <span className="text-gray-800">
              {locale === "he" ? "Together" : "יחד"}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.48, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-10 max-w-lg text-center text-base text-gray-500 md:text-lg leading-relaxed"
          >
            {t("app.description")}
          </motion.p>

          {/* Location search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.64, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="w-full max-w-md"
          >
            <LocationSearch
              onSelect={handleLocationSelect}
              variant="mosaic"
            />
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-6 flex flex-col sm:flex-row items-center gap-3"
          >
            {isSignedIn ? (
              <Button
                size="lg"
                className="bg-brand hover:bg-brand/90 text-white px-8 shadow-md shadow-brand/20"
                onClick={() => router.push("/feed")}
              >
                {locale === "he" ? "כניסה לדשבורד" : "Go to Dashboard"}
                <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="bg-brand hover:bg-brand/90 text-white px-8 shadow-md shadow-brand/20"
                  onClick={() => {
                    setPostAuthRedirect("/feed");
                    setShowSignIn(true);
                  }}
                >
                  {t("auth.signIn")}
                  <ArrowRight className="ms-2 size-4 rtl:rotate-180" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
                  onClick={handleAgentSignIn}
                >
                  {t("agent.agentSignIn")}
                  <Plane className="ms-2 size-4 rtl:-scale-x-100" />
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* ---- Mosaic globe — wider, pushed further down ---- */}
        <motion.div
          style={{ y: globeY }}
          className="absolute bottom-0 inset-x-0 h-[60vh] flex items-end justify-center pointer-events-none"
        >
          <div
            className="translate-y-[20%] md:translate-y-[60%]"
            style={{ width: "min(1100px, 110vw)" }}
          >
            <MosaicGlobe />
          </div>
        </motion.div>

        {/* ---- Scroll indicator ---- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="absolute bottom-6 inset-x-0 z-20 flex justify-center"
        >
          <ChevronDown className="size-4 text-gray-400 animate-bounce" />
        </motion.div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURES SECTION — Bento grid */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative py-24 md:py-32">
        {/* Section bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 60%, #FAFAFA 100%)",
          }}
        />
        {/* Subtle mosaic tile bg pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,56,184,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,56,184,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-indigo-50 px-4 py-1.5">
              <Zap className="size-3.5 text-brand" />
              <span className="text-xs font-medium text-brand">
                {locale === "he" ? "הכל במקום אחד" : "Everything in one place"}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl leading-tight">
              {locale === "he" ? "כל מה שצריך, עכשיו" : "Everything you need, now"}
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-gray-500 text-base md:text-lg">
              {locale === "he"
                ? "פלטפורמה אחת שמחברת ישראלים תקועים עם כל המשאבים הדרושים"
                : "One platform connecting stranded Israelis with every resource they need"}
            </p>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto">
            {features.map((feature, i) => (
              <BentoCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {/* Mini mosaic logo */}
            <div className="grid grid-cols-2 gap-0.5 p-1 rounded bg-gray-100">
              {["#0038b8", "#3b69e8", "#6487f0", "#93a8f5"].map((c, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-[1px]"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              יחד &copy; {new Date().getFullYear()}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            {locale === "he"
              ? "נבנה באהבה עבור קהילת ישראל"
              : "Built with love for the Israeli community"}
          </p>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/* SIGN-IN — Desktop: Dialog / Mobile: Drawer */}
      {/* ------------------------------------------------------------------ */}
      {isMobile ? (
        /* ============ MOBILE DRAWER ============ */
        <Drawer open={showSignIn} onOpenChange={(open) => {
          setShowSignIn(open);
          if (!open) {
            setPostAuthRedirect("/feed");
          }
        }}>
          <DrawerContent className="border-none bg-white">
            <DrawerTitle className="sr-only">
              {locale === "he" ? "התחברות ליחד" : "Sign in to Yachad"}
            </DrawerTitle>

            {/* ---- Top: blue info strip ---- */}
            <div
              className="relative overflow-hidden px-5 pt-5 pb-4"
              style={{
                background: "linear-gradient(145deg, #0038b8 0%, #1a4fd6 50%, #2563eb 100%)",
              }}
            >
              {/* Mosaic overlay */}
              <div className="absolute inset-0 opacity-10" aria-hidden="true">
                <div className="grid grid-cols-10 gap-0.5 w-full h-full p-2">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-[1px]"
                      style={{
                        backgroundColor: "#fff",
                        opacity: 0.1 + (((i * 7 + 3) % 5) * 0.15),
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10">
                {/* Title row */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="grid grid-cols-3 gap-px p-1 rounded-md bg-white/20">
                    {["#fff", "#93b4f5", "#c7dafb", "#dbeafe", "#fff", "#b0ccfa", "#93b4f5", "#dbeafe", "#fff"].map(
                      (c, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: c, opacity: 0.8 }} />
                      )
                    )}
                  </div>
                  <span className="text-base font-bold text-white">
                    {locale === "he" ? "הצטרפו ליחד" : "Join Yachad"}
                  </span>
                </div>

                {/* Benefit pills — horizontal scroll */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                  {(locale === "he"
                    ? [
                        { icon: Plane, label: "טיסות חילוץ" },
                        { icon: MessageSquare, label: "צ׳אט קהילתי" },
                        { icon: Map, label: "שירותים" },
                        { icon: Hotel, label: "מלונות" },
                      ]
                    : [
                        { icon: Plane, label: "Flights" },
                        { icon: MessageSquare, label: "Chat" },
                        { icon: Map, label: "Services" },
                        { icon: Hotel, label: "Hotels" },
                      ]
                  ).map((item, i) => (
                    <span
                      key={i}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-white/90"
                    >
                      <item.icon className="size-3" />
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ---- Bottom: sign-in actions ---- */}
            <div className="px-5 pt-5 pb-8">
              {/* Location badge */}
              {selectedLocation && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2.5">
                  <span className="text-lg leading-none">{selectedLocation.flag}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {selectedLocation.name}
                    </p>
                    {selectedLocation.secondary && (
                      <p className="text-xs text-gray-400 truncate">
                        {selectedLocation.secondary}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Google button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <svg className="size-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                {locale === "he" ? "המשך עם Google" : "Continue with Google"}
              </button>

              {/* Trust note */}
              <div className="mt-5 flex items-center justify-center gap-1.5">
                <Shield className="size-3 text-gray-300" />
                <span className="text-[11px] text-gray-300">
                  {locale === "he"
                    ? "ללא תשלום · אבטחה מלאה"
                    : "Free · Fully secure"}
                </span>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* ============ DESKTOP DIALOG ============ */
        <Dialog open={showSignIn} onOpenChange={(open) => {
          setShowSignIn(open);
          if (!open) {
            setPostAuthRedirect("/feed");
          }
        }}>
          <DialogContent
            className="sm:max-w-[860px] border-none bg-white p-0 overflow-hidden shadow-2xl gap-0"
            showCloseButton={false}
          >
            <DialogTitle className="sr-only">
              {locale === "he" ? "התחברות ליחד" : "Sign in to Yachad"}
            </DialogTitle>

            {/* Close button */}
            <button
              onClick={() => setShowSignIn(false)}
              className="absolute top-3 end-3 z-10 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex flex-row min-h-[480px]">
              {/* ---- Left panel — benefits ---- */}
              <div
                className="relative flex w-[340px] flex-col justify-between p-8 overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, #0038b8 0%, #1a4fd6 50%, #2563eb 100%)",
                }}
              >
                {/* Mosaic pattern overlay */}
                <div className="absolute inset-0 opacity-10" aria-hidden="true">
                  <div className="grid grid-cols-8 gap-1 w-full h-full p-3">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-[2px]"
                        style={{
                          backgroundColor: "#fff",
                          opacity: 0.1 + (((i * 7 + 3) % 5) * 0.15),
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Logo */}
                  <div className="mb-8 flex items-center gap-2.5">
                    <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                      {["#fff", "#93b4f5", "#c7dafb", "#dbeafe", "#fff", "#b0ccfa", "#93b4f5", "#dbeafe", "#fff"].map(
                        (c, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-[2px]"
                            style={{ backgroundColor: c, opacity: 0.7 + (i % 3) * 0.1 }}
                          />
                        )
                      )}
                    </div>
                    <span className="text-lg font-bold text-white/90">יחד</span>
                  </div>

                  {/* Headline */}
                  <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                    {locale === "he"
                      ? "למה להתחבר?"
                      : "Why sign in?"}
                  </h3>
                  <p className="text-sm text-blue-100/80 mb-8 leading-relaxed">
                    {locale === "he"
                      ? "הצטרפו לקהילת ישראלים שעוזרים אחד לשני. חשבון אחד — גישה לכל המשאבים."
                      : "Join the community of Israelis helping each other. One account — access to everything."}
                  </p>

                  {/* Benefits list */}
                  <ul className="space-y-4">
                    {(locale === "he"
                      ? [
                          { icon: Plane, text: "התראות טיסות חילוץ בזמן אמת" },
                          { icon: MessageSquare, text: "צ׳אט עם ישראלים לפי מדינה" },
                          { icon: Users, text: "פרסום ובקשת עזרה בפיד הקהילתי" },
                          { icon: Map, text: "שירותים יהודיים ושגרירויות ליד המיקום שלך" },
                          { icon: Hotel, text: "שיתוף ומציאת חדרי מלון פנויים" },
                        ]
                      : [
                          { icon: Plane, text: "Real-time extraction flight alerts" },
                          { icon: MessageSquare, text: "Chat with Israelis by country" },
                          { icon: Users, text: "Post & request help in the community" },
                          { icon: Map, text: "Jewish services & embassies near you" },
                          { icon: Hotel, text: "Share & find available hotel rooms" },
                        ]
                    ).map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: locale === "he" ? 12 : -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.08 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex-shrink-0 mt-0.5 size-5 rounded-full bg-white/20 flex items-center justify-center">
                          <Check className="size-3 text-white" />
                        </div>
                        <span className="text-sm text-white/90 leading-snug">{item.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Bottom trust note */}
                <div className="relative z-10 mt-6 flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-3 py-2.5">
                  <Shield className="size-4 text-white/70 flex-shrink-0" />
                  <span className="text-xs text-white/70 leading-snug">
                    {locale === "he"
                      ? "ללא תשלום. ללא כרטיס אשראי. אבטחה מלאה."
                      : "Free forever. No credit card. Fully secure."}
                  </span>
                </div>
              </div>

              {/* ---- Right panel — sign-in actions ---- */}
              <div className="flex-1 flex flex-col p-8">
                {/* Selected location badge */}
                {selectedLocation && (
                  <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50/80 px-3.5 py-3">
                    <span className="text-xl leading-none">{selectedLocation.flag}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {selectedLocation.name}
                      </p>
                      {selectedLocation.secondary && (
                        <p className="text-xs text-gray-400 truncate">
                          {selectedLocation.secondary}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-center">
                    {/* Greeting */}
                    <div className="mb-8 text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {locale === "he" ? "ברוכים הבאים" : "Welcome"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {locale === "he"
                          ? "התחברו כדי לגשת לכל המשאבים"
                          : "Sign in to access all resources"}
                      </p>
                    </div>

                    {/* Google button */}
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow-md hover:border-gray-300 transition-all active:scale-[0.98]"
                    >
                      <svg className="size-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      {locale === "he" ? "המשך עם Google" : "Continue with Google"}
                    </button>
                  </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Global keyframes */}
      {/* ------------------------------------------------------------------ */}
      <style jsx global>{`
        @keyframes tilePulse {
          0%, 100% { opacity: var(--tw-opacity, 1); transform: scale(1); }
          50% { opacity: calc(var(--tw-opacity, 1) * 0.5); transform: scale(0.88); }
        }
        @keyframes tileFloat {
          from { transform: translateY(0px); }
          to   { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
