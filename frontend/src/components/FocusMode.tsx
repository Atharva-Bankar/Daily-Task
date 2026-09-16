import { useEffect, useRef, useState } from "react";
import "./FocusMode.css";
import { triggerConfetti } from "../utils/confetti";

type Task = { id: number; title: string; done: boolean };

interface FocusModeProps {
  tasks: Task[];
  onClose: () => void;
  onCompleteTask?: (id: number) => void;
}

const QUOTES = [
  "Deep focus is super energy for your mind.",
  "Single-tasking is the ultimate productivity hack.",
  "Small steps lead to extraordinary momentum.",
  "Your best work happens when distraction fades.",
];

export default function FocusMode({ tasks, onClose, onCompleteTask }: FocusModeProps) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(tasks.find((t) => !t.done)?.id || null);
  const [isSoundOn, setIsSoundOn] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const totalSeconds = 25 * 60;
  const progressOffset = 691 * (1 - secondsLeft / totalSeconds);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning && secondsLeft > 0) {
      interval = window.setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      triggerConfetti();
      setSessionCount((c) => c + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  // Ambient sound synth using Web Audio API
  useEffect(() => {
    if (isSoundOn) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.015; // soft pink noise volume
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(ctx.destination);
        whiteNoise.start();
      } catch {
        setIsSoundOn(false);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, [isSoundOn]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const randomQuote = QUOTES[sessionCount % QUOTES.length];
  const pendingTasks = tasks.filter((t) => !t.done);

  return (
    <div className="focus-overlay" role="dialog" aria-modal="true">
      <header className="focus-header">
        <div className="focus-brand">
          <span>ClientFlow</span>
          <span className="focus-badge">FLOW MODE ✦</span>
        </div>
        <button className="close-focus" onClick={onClose}>
          Exit Focus ✕
        </button>
      </header>

      <main className="focus-center">
        <div className="focus-task-pill">
          <span>🎯 Active Focus Objective:</span>
          {pendingTasks.length > 0 ? (
            <select
              value={activeTaskId || ""}
              onChange={(e) => setActiveTaskId(Number(e.target.value))}
              style={{
                background: "transparent",
                border: "none",
                color: "#d7df77",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                outline: "none",
                cursor: "pointer",
              }}
            >
              {pendingTasks.map((t) => (
                <option key={t.id} value={t.id} style={{ background: "#172242", color: "#fff" }}>
                  {t.title}
                </option>
              ))}
            </select>
          ) : (
            <span>General Deep Work Session</span>
          )}
        </div>

        <div className="focus-timer-container">
          <svg className="focus-ring-svg" viewBox="0 0 240 240">
            <circle className="focus-ring-bg" cx="120" cy="120" r="110" strokeWidth="6" fill="none" />
            <circle
              className="focus-ring-progress"
              cx="120"
              cy="120"
              r="110"
              strokeWidth="6"
              fill="none"
              style={{ strokeDashoffset: progressOffset }}
            />
          </svg>
          <div className="focus-time-display">{formattedTime}</div>
        </div>

        <div className="focus-controls">
          <button
            className="focus-btn focus-btn-primary"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "Pause Session" : "Start Focus Flow →"}
          </button>
          <button
            className="focus-btn focus-btn-secondary"
            onClick={() => {
              setIsRunning(false);
              setSecondsLeft(25 * 60);
            }}
          >
            Reset
          </button>
          <button
            className="focus-btn focus-btn-secondary"
            onClick={() => setSecondsLeft((s) => s + 5 * 60)}
          >
            +5 min
          </button>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <button
            type="button"
            className={`focus-sound-toggle ${isSoundOn ? "active" : ""}`}
            onClick={() => setIsSoundOn(!isSoundOn)}
          >
            {isSoundOn ? "🔊 Ambient Hum: ON" : "🔇 Ambient Hum: OFF"}
          </button>
        </div>

        {activeTask && onCompleteTask && (
          <button
            className="focus-btn focus-btn-secondary"
            style={{ borderColor: "#d7df77", color: "#d7df77" }}
            onClick={() => {
              onCompleteTask(activeTask.id);
              triggerConfetti();
            }}
          >
            ✓ Mark "{activeTask.title}" Completed
          </button>
        )}
      </main>

      <footer className="focus-footer">
        <p className="focus-quote">"{randomQuote}"</p>
        <p style={{ marginTop: "10px", fontSize: "11px", color: "#6a79a8" }}>
          Sessions completed today: {sessionCount} ✦
        </p>
      </footer>
    </div>
  );
}
