import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Navbar from "../components/Navbar";
import FocusMode from "../components/FocusMode";
import { triggerConfetti } from "../utils/confetti";
import "./Home.css";
import "./Calendar.css";

type Task = { id: number; title: string; date: string; priority: "High" | "Medium" | "Low"; done: boolean };
type User = { name?: string; email: string };

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const today = isoDate(new Date());
const daysApart = (date: string) => Math.floor((new Date(`${date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000);

const PRESET_TEMPLATES = [
  "💼 Draft Client Onboarding Deck",
  "📄 Send Deliverables & Invoice",
  "📞 Schedule Weekly Sync",
  "🔍 Review Client Feedback",
];

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [showForm, setShowForm] = useState(false);
  const [showFocus, setShowFocus] = useState(false);
  const [report, setReport] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    const savedUser = sessionStorage.getItem("clientflow-user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as User;
      setUser(parsedUser);
      const savedTasks = localStorage.getItem(`clientflow-tasks-${parsedUser.email}`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    } else {
      // Default demo tasks if new
      setTasks([
        { id: 1, title: "Review client pitch deck feedback", date: today, priority: "High", done: false },
        { id: 2, title: "Send weekly progress summary", date: today, priority: "Medium", done: true },
        { id: 3, title: "Prepare Q4 roadmap presentation", date: today, priority: "Medium", done: false },
      ]);
    }
  }, []);

  useEffect(() => {
    if (user?.email) localStorage.setItem(`clientflow-tasks-${user.email}`, JSON.stringify(tasks));
  }, [tasks, user]);

  const firstName = user?.name?.split(" ")[0] || "Creator";
  const visibleTasks = useMemo(() => tasks.filter((task) => task.date === selectedDate).sort((a, b) => Number(a.done) - Number(b.done)), [tasks, selectedDate]);
  const pending = tasks.filter((task) => !task.done).length;
  const dueToday = tasks.filter((task) => task.date === today && !task.done).length;
  const reportTasks = tasks.filter((task) => {
    const difference = daysApart(task.date);
    return report === "Daily" ? difference === 0 : report === "Weekly" ? difference >= -6 && difference <= 0 : new Date(`${task.date}T00:00:00`).getMonth() === new Date().getMonth();
  });
  const completeCount = reportTasks.filter((task) => task.done).length;
  const completion = reportTasks.length ? Math.round((completeCount / reportTasks.length) * 100) : 0;

  const toggleTask = (id: number) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id === id) {
          const newDone = !task.done;
          if (newDone) triggerConfetti();
          return { ...task, done: newDone };
        }
        return task;
      })
    );
  };

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    setTasks((current) => [{ id: Date.now(), title: title.trim(), date, priority, done: false }, ...current]);
    setTitle(""); setDate(today); setPriority("Medium"); setShowForm(false);
  };

  const month = new Date();
  const monthName = month.toLocaleString("default", { month: "long", year: "numeric" });
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1);
  const selectedDateLabel = selectedDate === today ? "Today" : new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <>
      <Navbar />
      <main className="planner">
        <section className="planner-hero">
          <div>
            <p className="eyebrow">YOUR PERSONAL COMMAND CENTRE</p>
            <h1>
              Make today <em>feel lighter,</em>
              <br />
              {firstName}.
            </h1>
            <p className="planner-intro">A gentle place to remember, focus, and celebrate everything you get done.</p>
            <div className="hero-cta-group">
              <button className="new-task" onClick={() => setShowForm(true)}>
                <span>+</span> Add a task
              </button>
              <button className="focus-trigger-btn" onClick={() => setShowFocus(true)}>
                🎯 Enter Flow Mode ✦
              </button>
            </div>
          </div>
          <div className="hero-sun" aria-hidden="true">☼</div>
        </section>

        <section className="task-stats">
          <article>
            <span className="stat-icon indigo">✓</span>
            <div>
              <strong>{dueToday}</strong>
              <small>to do today</small>
            </div>
          </article>
          <article>
            <span className="stat-icon pink">⌛</span>
            <div>
              <strong>{pending}</strong>
              <small>tasks pending</small>
            </div>
          </article>
          <article>
            <span className="stat-icon lime">✦</span>
            <div>
              <strong>{tasks.filter((task) => task.done).length}</strong>
              <small>tasks completed</small>
            </div>
          </article>
          <div className="encouragement">
            Small steps still move you forward <span>→</span>
          </div>
        </section>

        <section className="planner-grid">
          <article className="today-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">YOUR TASK LIST</p>
                <h2>{selectedDateLabel}</h2>
              </div>
              <button onClick={() => { setDate(selectedDate); setShowForm(true); }}>+ Add</button>
            </div>
            <div className="task-list">
              {visibleTasks.length ? (
                visibleTasks.map((task) => (
                  <label className={`task-row ${task.done ? "done" : ""}`} key={task.id}>
                    <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                    <span className="fake-check">✓</span>
                    <span className="task-copy">
                      <strong>{task.title}</strong>
                      <small>
                        {task.date === today ? "Today" : new Date(`${task.date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </small>
                    </span>
                    <i className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</i>
                  </label>
                ))
              ) : (
                <p className="empty-tasks">Nothing scheduled for this day yet. Add a task to make a plan.</p>
              )}
            </div>
          </article>

          <article className="report-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">YOUR REPORT</p>
                <h2>Progress, at a glance</h2>
              </div>
            </div>
            <div className="report-tabs">
              {(["Daily", "Weekly", "Monthly"] as const).map((period) => (
                <button key={period} className={report === period ? "active" : ""} onClick={() => setReport(period)}>
                  {period}
                </button>
              ))}
            </div>
            <div className="report-body">
              <div className="completion-ring" style={{ "--completion": `${completion * 3.6}deg` } as CSSProperties}>
                <div>
                  <strong>{completion}%</strong>
                  <span>complete</span>
                </div>
              </div>
              <div>
                <strong className="report-number">
                  {completeCount}
                  <small> / {reportTasks.length}</small>
                </strong>
                <p>
                  tasks complete
                  <br />
                  this {report.toLowerCase().replace("ly", "")}
                </p>
              </div>
            </div>
            <div className="report-note">
              {completion >= 70 ? "You're on a beautiful roll. Keep going!" : "Every checked box is a win. You've got this."} <span>✦</span>
            </div>
          </article>

          <article className="calendar-card">
            <div className="section-head">
              <div>
                <p className="eyebrow">SCHEDULE</p>
                <h2>{monthName}</h2>
              </div>
              <span className="calendar-arrows">‹ &nbsp; ›</span>
            </div>
            <div className="weekdays">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <span key={`${day}-${index}`}>{day}</span>
              ))}
            </div>
            <div className="calendar-days">
              {calendarDays.map((day, index) => {
                const dateValue = day ? `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
                const count = tasks.filter((task) => task.date === dateValue).length;
                return day ? (
                  <button
                    type="button"
                    className={`${dateValue === today ? "current-day " : ""}${dateValue === selectedDate ? "selected-day" : ""}`}
                    onClick={() => setSelectedDate(dateValue)}
                    key={index}
                    aria-label={`View tasks for ${dateValue}`}
                  >
                    {day}
                    {count > 0 && <i>{count}</i>}
                  </button>
                ) : (
                  <span key={index} />
                );
              })}
            </div>
            <p className="calendar-footer">
              <span /> Select a day to see its tasks
            </p>
          </article>
        </section>
      </main>

      {showFocus && (
        <FocusMode
          tasks={tasks}
          onClose={() => setShowFocus(false)}
          onCompleteTask={(id) => toggleTask(id)}
        />
      )}

      {showForm && (
        <div className="task-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="new-task-title">
          <form className="task-modal" onSubmit={addTask}>
            <button className="close-modal" type="button" onClick={() => setShowForm(false)}>
              ×
            </button>
            <p className="eyebrow">A NEW LITTLE WIN</p>
            <h2 id="new-task-title">What needs your attention?</h2>

            <p className="preset-chips-label">QUICK TEMPLATES</p>
            <div className="preset-chips">
              {PRESET_TEMPLATES.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className="preset-chip"
                  onClick={() => setTitle(preset.replace(/^[^\s]+\s/, ""))}
                >
                  {preset}
                </button>
              ))}
            </div>

            <label>
              Task name
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Send the project update"
                required
              />
            </label>

            <div className="task-form-row">
              <label>
                When
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
              </label>
              <label>
                Priority
                <select value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
            </div>
            <button className="save-task" type="submit">
              Add to my list <span>→</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Home;
