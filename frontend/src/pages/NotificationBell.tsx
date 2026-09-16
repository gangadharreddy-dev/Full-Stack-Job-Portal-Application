import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  created_at: string;
};

const SEEN_KEY = "jobetix_seen_notifications";

function getSeenIds(): Set<number> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function markAllSeen(ids: number[]) {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export default function NotificationBell({
  onSelectJob,
}: {
  onSelectJob: (jobId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function loadRecent() {
    setLoading(true);
    try {
      const all = await api.jobs.list();
      // Show the 8 most recent
      const sorted = all
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 8);
      setRecent(sorted);

      // Count unseen
      const seen = getSeenIds();
      const unseenCount = sorted.filter((j) => !seen.has(j.id)).length;
      setUnread(unseenCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecent();
    const interval = setInterval(loadRecent, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleOpen() {
    setOpen((o) => !o);
    if (!open) {
      // Mark all as seen when panel is opened
      markAllSeen(recent.map((j) => j.id));
      setUnread(0);
    }
  }

  function handleClickJob(id: number) {
    setOpen(false);
    onSelectJob(id);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
  }

  const typeColor = (type: string) => {
    if (type.toLowerCase().includes("intern"))
      return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button
        className="notif-bell-btn"
        onClick={handleOpen}
        aria-label={`Notifications – ${unread} unread`}
        title="Recent Opportunities"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-header-title">🔔 Recent Opportunities</span>
            <button
              className="notif-refresh"
              onClick={loadRecent}
              disabled={loading}
              title="Refresh"
            >
              {loading ? "⏳" : "↻"}
            </button>
          </div>

          {loading && recent.length === 0 && (
            <div className="notif-empty">Loading...</div>
          )}

          {!loading && recent.length === 0 && (
            <div className="notif-empty">
              No listings yet. Click <strong>Sync Real-Time Web Jobs</strong> on
              the main page!
            </div>
          )}

          <div className="notif-list">
            {recent.map((j) => {
              const tc = typeColor(j.job_type);
              return (
                <button
                  key={j.id}
                  className="notif-item"
                  onClick={() => handleClickJob(j.id)}
                >
                  <div className="notif-item-avatar">
                    {j.company.charAt(0).toUpperCase()}
                  </div>
                  <div className="notif-item-body">
                    <div className="notif-item-title">{j.title}</div>
                    <div className="notif-item-meta">
                      {j.company} • {j.location}
                    </div>
                    <div className="notif-item-footer">
                      <span
                        className="notif-type-pill"
                        style={{
                          background: tc.bg,
                          color: tc.color,
                          border: `1px solid ${tc.border}`,
                        }}
                      >
                        {j.job_type}
                      </span>
                      <span className="notif-time">{timeAgo(j.created_at)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {recent.length > 0 && (
            <div className="notif-footer">
              <a href="#/jobs" onClick={() => setOpen(false)}>
                View all opportunities →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
