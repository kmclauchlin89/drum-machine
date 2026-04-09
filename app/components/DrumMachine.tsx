"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type Sound = {
  id: string;
  name: string;
  bg: string;
  glowColor: string;
};

const SOUNDS: Sound[] = [
  { id: "kick",    name: "KICK",    bg: "linear-gradient(135deg,#ff2d55,#8b0000)", glowColor: "#ff2d55" },
  { id: "snare",   name: "SNARE",   bg: "linear-gradient(135deg,#ff9500,#8b4500)", glowColor: "#ff9500" },
  { id: "hihat-c", name: "HH CL",   bg: "linear-gradient(135deg,#ffcc00,#8b7000)", glowColor: "#ffcc00" },
  { id: "hihat-o", name: "HH OP",   bg: "linear-gradient(135deg,#a8ff3e,#3a6b00)", glowColor: "#a8ff3e" },
  { id: "clap",    name: "CLAP",    bg: "linear-gradient(135deg,#4cd964,#005c1f)", glowColor: "#4cd964" },
  { id: "tom-hi",  name: "TOM HI",  bg: "linear-gradient(135deg,#5ac8fa,#004a6b)", glowColor: "#5ac8fa" },
  { id: "tom-lo",  name: "TOM LO",  bg: "linear-gradient(135deg,#0a84ff,#002d6b)", glowColor: "#0a84ff" },
  { id: "crash",   name: "CRASH",   bg: "linear-gradient(135deg,#32ade6,#003f5c)", glowColor: "#32ade6" },
  { id: "rimshot", name: "RIM",     bg: "linear-gradient(135deg,#636def,#1c1f8a)", glowColor: "#636def" },
  { id: "cowbell", name: "COWBELL", bg: "linear-gradient(135deg,#7c3aed,#2e1065)", glowColor: "#7c3aed" },
  { id: "shaker",  name: "SHAKER",  bg: "linear-gradient(135deg,#d946ef,#6b0074)", glowColor: "#d946ef" },
  { id: "bass",    name: "BASS",    bg: "linear-gradient(135deg,#ec4899,#700042)", glowColor: "#ec4899" },
  { id: "synth",   name: "SYNTH",   bg: "linear-gradient(135deg,#fb923c,#7c2d00)", glowColor: "#fb923c" },
  { id: "noise",   name: "NOISE",   bg: "linear-gradient(135deg,#94a3b8,#334155)", glowColor: "#94a3b8" },
  { id: "hey",     name: "HEY!",    bg: "linear-gradient(135deg,#f97316,#7c2d12)", glowColor: "#f97316" },
  { id: "sub",     name: "SUB",     bg: "linear-gradient(135deg,#dc2626,#450a0a)", glowColor: "#dc2626" },
];

const STEPS = 8;
const STORAGE_KEY = "drum-machine-patterns";

type SavedPattern = {
  sequence: boolean[][];
  bpm: number;
};

function playSound(ctx: AudioContext, id: string): void {
  const now = ctx.currentTime;

  switch (id) {
    case "kick": {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
      gain.gain.setValueAtTime(1.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    }
    case "snare": {
      const bufLen = Math.floor(ctx.sampleRate * 0.2);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.8, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      ns.connect(ng);
      ng.connect(ctx.destination);
      ns.start(now);
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.frequency.setValueAtTime(200, now);
      og.gain.setValueAtTime(0.5, now);
      og.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      o.connect(og);
      og.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.1);
      break;
    }
    case "hihat-c": {
      const len = Math.floor(ctx.sampleRate * 0.05);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 8000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.7, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      ns.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      ns.start(now);
      break;
    }
    case "hihat-o": {
      const len = Math.floor(ctx.sampleRate * 0.35);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 7000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.55, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      ns.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      ns.start(now);
      break;
    }
    case "clap": {
      [0, 0.01, 0.025].forEach(offset => {
        const len = Math.floor(ctx.sampleRate * 0.06);
        const buf2 = ctx.createBuffer(1, len, ctx.sampleRate);
        const d2 = buf2.getChannelData(0);
        for (let i = 0; i < len; i++) d2[i] = Math.random() * 2 - 1;
        const ns2 = ctx.createBufferSource();
        ns2.buffer = buf2;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.7, now + offset);
        g2.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        ns2.connect(g2);
        g2.connect(ctx.destination);
        ns2.start(now + offset);
      });
      break;
    }
    case "tom-hi": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(280, now);
      o.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      g.gain.setValueAtTime(1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.25);
      break;
    }
    case "tom-lo": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(35, now + 0.4);
      g.gain.setValueAtTime(1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.4);
      break;
    }
    case "crash": {
      const len = Math.floor(ctx.sampleRate * 1.5);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = 4000;
      f.Q.value = 0.3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      ns.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      ns.start(now);
      break;
    }
    case "rimshot": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(900, now);
      o.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      g.gain.setValueAtTime(0.9, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.04);
      break;
    }
    case "cowbell": {
      [562, 845].forEach(freq => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.35, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now);
        o.stop(now + 0.6);
      });
      break;
    }
    case "shaker": {
      const len = Math.floor(ctx.sampleRate * 0.04);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 10000;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      ns.connect(f);
      f.connect(g);
      g.connect(ctx.destination);
      ns.start(now);
      break;
    }
    case "bass": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sawtooth";
      o.frequency.value = 80;
      g.gain.setValueAtTime(0.8, now);
      g.gain.linearRampToValueAtTime(0.8, now + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.4);
      break;
    }
    case "synth": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "square";
      o.frequency.value = 440;
      g.gain.setValueAtTime(0.35, now);
      g.gain.linearRampToValueAtTime(0.35, now + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.25);
      break;
    }
    case "noise": {
      const len = Math.floor(ctx.sampleRate * 0.15);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource();
      ns.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.5, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      ns.connect(g);
      g.connect(ctx.destination);
      ns.start(now);
      break;
    }
    case "hey": {
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      const g = ctx.createGain();
      modulator.frequency.value = 120;
      carrier.frequency.value = 240;
      modGain.gain.setValueAtTime(400, now);
      modGain.gain.exponentialRampToValueAtTime(10, now + 0.3);
      g.gain.setValueAtTime(0.6, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(g);
      g.connect(ctx.destination);
      modulator.start(now);
      modulator.stop(now + 0.3);
      carrier.start(now);
      carrier.stop(now + 0.3);
      break;
    }
    case "sub": {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(55, now);
      o.frequency.exponentialRampToValueAtTime(0.01, now + 0.8);
      g.gain.setValueAtTime(1.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.8);
      break;
    }
  }
}

export default function DrumMachine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [activeRipples, setActiveRipples] = useState<Set<string>>(new Set());
  const [sequence, setSequence] = useState<boolean[][]>(
    () => SOUNDS.map(() => Array(STEPS).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);
  const [patterns, setPatterns] = useState<Record<string, SavedPattern>>({});
  const [patternName, setPatternName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPatterns(JSON.parse(stored));
    } catch {}
  }, []);

  const savePattern = () => {
    const name = patternName.trim();
    if (!name) return;
    const updated = { ...patterns, [name]: { sequence, bpm } };
    setPatterns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const loadPattern = (name: string) => {
    const p = patterns[name];
    if (!p) return;
    setSequence(p.sequence.map(row => {
      return Array(STEPS).fill(false).map((_, j) => row[j] ?? false);
    }));
    setBpm(p.bpm);
    setPatternName(name);
  };

  const deletePattern = (name: string) => {
    const updated = { ...patterns };
    delete updated[name];
    setPatterns(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (patternName === name) setPatternName("");
  };

  const getAudioCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const triggerPad = useCallback(
    (soundId: string) => {
      const ctx = getAudioCtx();
      playSound(ctx, soundId);
      setActiveRipples(prev => new Set([...prev, soundId]));
      setTimeout(() => {
        setActiveRipples(prev => {
          const next = new Set(prev);
          next.delete(soundId);
          return next;
        });
      }, 300);
    },
    [getAudioCtx]
  );

  const sequenceRef = useRef(sequence);
  sequenceRef.current = sequence;

  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!isPlaying) {
      setCurrentStep(-1);
      return;
    }

    stepRef.current = 0;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th-note steps

    timerRef.current = setInterval(() => {
      const step = stepRef.current % STEPS;
      setCurrentStep(step);
      const ctx = getAudioCtx();
      const seq = sequenceRef.current;
      SOUNDS.forEach((sound, i) => {
        if (seq[i][step]) playSound(ctx, sound.id);
      });
      stepRef.current++;
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, bpm, getAudioCtx]);

  const toggleStep = (si: number, step: number) => {
    setSequence(prev => {
      const next = prev.map(row => [...row]);
      next[si][step] = !next[si][step];
      return next;
    });
  };

  const clearAll = () => {
    setSequence(SOUNDS.map(() => Array(STEPS).fill(false)));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-6 select-none">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-black tracking-[0.2em] uppercase">
          <span style={{ color: "#ff2d55", textShadow: "0 0 24px #ff2d55, 0 0 48px #ff2d5566" }}>
            DRUM
          </span>
          {" "}
          <span style={{ color: "#5ac8fa", textShadow: "0 0 24px #5ac8fa, 0 0 48px #5ac8fa66" }}>
            MACHINE
          </span>
        </h1>
        <p className="text-gray-600 text-xs tracking-[0.25em] mt-2 uppercase">
          Web Audio API · No samples needed
        </p>
      </div>

      {/* 4×4 Pad Grid */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {SOUNDS.map(sound => {
          const active = activeRipples.has(sound.id);
          return (
            <button
              key={sound.id}
              onPointerDown={() => triggerPad(sound.id)}
              className="relative w-24 h-24 rounded-2xl font-bold text-xs tracking-widest uppercase overflow-hidden cursor-pointer"
              style={{
                background: sound.bg,
                boxShadow: active
                  ? `0 0 20px ${sound.glowColor}, 0 0 50px ${sound.glowColor}88, inset 0 0 24px rgba(255,255,255,0.18)`
                  : "0 4px 12px rgba(0,0,0,0.6)",
                transform: active ? "scale(0.92)" : "scale(1)",
                filter: active ? "brightness(1.4)" : "brightness(1)",
                transition: "box-shadow 0.18s ease, transform 0.08s ease, filter 0.18s ease",
              }}
            >
              {active && (
                <span
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    inset: "50% auto auto 50%",
                    width: "10px",
                    height: "10px",
                    marginLeft: "-5px",
                    marginTop: "-5px",
                    background: "rgba(255,255,255,0.6)",
                    animation: "padRipple 0.3s ease-out forwards",
                  }}
                />
              )}
              <span className="relative z-10 drop-shadow">{sound.name}</span>
            </button>
          );
        })}
      </div>

      {/* Step Sequencer Panel */}
      <div
        className="w-full max-w-3xl rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          <button
            onClick={() => setIsPlaying(p => !p)}
            className="px-6 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase"
            style={{
              background: isPlaying
                ? "linear-gradient(135deg,#ff2d55,#8b0000)"
                : "linear-gradient(135deg,#4cd964,#005c1f)",
              boxShadow: isPlaying ? "0 0 14px #ff2d55" : "0 0 14px #4cd964",
              transition: "background 0.2s, box-shadow 0.2s",
            }}
          >
            {isPlaying ? "■ STOP" : "▶ PLAY"}
          </button>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-xs tracking-widest uppercase">BPM</span>
            <input
              type="range"
              min={60}
              max={200}
              value={bpm}
              onChange={e => setBpm(Number(e.target.value))}
              className="w-28 accent-cyan-400"
            />
            <span
              className="font-mono font-bold text-sm w-8 text-right"
              style={{ color: "#5ac8fa", textShadow: "0 0 8px #5ac8fa" }}
            >
              {bpm}
            </span>
          </div>

          <button
            onClick={clearAll}
            className="ml-auto px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            CLEAR
          </button>
        </div>

        {/* Pattern Save/Load row */}
        <div
          className="flex flex-wrap items-center gap-3 mb-5 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <input
            type="text"
            placeholder="Pattern name…"
            value={patternName}
            onChange={e => setPatternName(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") savePattern(); }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono text-white placeholder-gray-600 focus:outline-none"
            style={{
              width: "148px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
          <button
            onClick={savePattern}
            disabled={!patternName.trim()}
            className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-opacity"
            style={{
              background: "rgba(92,200,250,0.12)",
              border: "1px solid rgba(92,200,250,0.3)",
              color: "#5ac8fa",
              opacity: patternName.trim() ? 1 : 0.3,
            }}
          >
            SAVE
          </button>

          {Object.keys(patterns).length > 0 && (
            <select
              value=""
              onChange={e => { if (e.target.value) loadPattern(e.target.value); }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 focus:outline-none cursor-pointer"
              style={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <option value="" disabled>Load pattern…</option>
              {Object.keys(patterns).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}

          {patternName && patterns[patternName] && (
            <button
              onClick={() => deletePattern(patternName)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
              style={{
                border: "1px solid rgba(255,45,85,0.25)",
                color: "rgba(255,45,85,0.6)",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#ff2d55")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,45,85,0.6)")}
            >
              DELETE
            </button>
          )}
        </div>

        {/* Beat number header */}
        <div className="flex items-center mb-2" style={{ paddingLeft: "88px", gap: "4px" }}>
          {Array.from({ length: STEPS }, (_, i) => (
            <div
              key={i}
              className="flex-1 text-center text-xs font-mono font-bold"
              style={{
                color: currentStep === i ? "#5ac8fa" : "#374151",
                textShadow: currentStep === i ? "0 0 8px #5ac8fa" : "none",
                transition: "color 0.08s, text-shadow 0.08s",
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Sequencer rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {SOUNDS.map((sound, si) => (
            <div key={sound.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {/* Label */}
              <div
                className="text-right text-xs font-bold tracking-wider uppercase shrink-0"
                style={{ width: "84px", paddingRight: "8px", color: sound.glowColor, opacity: 0.85 }}
              >
                {sound.name}
              </div>
              {/* Step buttons */}
              {sequence[si].map((stepActive, stepIdx) => {
                const isCurrent = currentStep === stepIdx;
                return (
                  <button
                    key={stepIdx}
                    onClick={() => toggleStep(si, stepIdx)}
                    className="flex-1 rounded cursor-pointer"
                    style={{
                      height: "28px",
                      background: stepActive
                        ? sound.bg
                        : isCurrent
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(255,255,255,0.03)",
                      boxShadow:
                        stepActive && isCurrent
                          ? `0 0 10px ${sound.glowColor}`
                          : stepActive
                          ? `0 0 5px ${sound.glowColor}55`
                          : "none",
                      border: isCurrent
                        ? "1px solid rgba(255,255,255,0.22)"
                        : "1px solid rgba(255,255,255,0.05)",
                      transform: stepActive && isCurrent ? "scaleY(1.18)" : "scaleY(1)",
                      transition: "background 0.08s, box-shadow 0.1s, transform 0.08s",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-5 text-gray-700 text-xs tracking-widest uppercase">
        Click pads to preview · Toggle steps to build your beat
      </p>
    </div>
  );
}
