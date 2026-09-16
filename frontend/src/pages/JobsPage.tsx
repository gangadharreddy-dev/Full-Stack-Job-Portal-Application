import { useEffect, useState } from "react";
import { api } from "../api/client";

export type Job = Awaited<ReturnType<typeof api.jobs.list>> extends Array<infer J> ? J : never;

export default function JobsPage({
  onSelectJob,
}: {
  onSelectJob: (jobId: number) => void;
}) {
  const [category, setCategory] = useState<"internship" | "fresher" | "all">("internship");
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  async function handleSyncLive() {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await api.jobs.syncLive();
      setSyncMessage(`🎉 Live Sync Complete! Added ${res.added_jobs} fresh listings from LinkedIn & Indeed.`);
      await fetchJobs(category, q, location);
    } catch (err) {
      setSyncMessage(err instanceof Error ? err.message : "Live sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function fetchJobs(cat = category, searchQ = q, searchLoc = location) {
    setLoading(true);
    setError(null);
    try {
      const jobTypeParam =
        cat === "internship" ? "Internship" : cat === "fresher" ? "Full-time" : undefined;
      const data = await api.jobs.list({
        q: searchQ || undefined,
        location: searchLoc || undefined,
        job_type: jobTypeParam,
      });
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load opportunities");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs("internship", "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const internshipPills = ["All Internships", "Remote", "React / Frontend", "Python / ML", "Data Analyst", "Chennai", "Bangalore"];
  const fresherPills = ["All Freshers", "Remote", "Software Engineer", "Full Stack", "Data Analyst", "Chennai", "Hyderabad"];
  const currentPills = category === "internship" ? internshipPills : category === "fresher" ? fresherPills : ["All", "Internship", "Full-time", "Remote", "Chennai", "Bangalore"];

  return (
    <div className="page">
      <div className="hero-header">
        <div className="student-badge">
          🎓 Built for Students & College Freshers
        </div>
        <h1 className="hero-title">
          {category === "internship"
            ? "Kickstart Your Career with Top Internships"
            : category === "fresher"
            ? "Launch Your Journey with Fresher Roles"
            : "Explore All Internships & Jobs"}
        </h1>
        <p className="hero-subtitle">
          {category === "internship"
            ? "Finding your first internship shouldn't be hard. Discover verified tech, design, and software engineering internships with real stipends."
            : category === "fresher"
            ? "Hand-picked entry-level opportunities (0-1 years) for fresh graduates and early career developers."
            : "Explore all verified opportunities across top startups and tech companies on Jobetix."}
        </p>

        {/* Dedicated Category Tabs */}
        <div className="category-tabs">
          <button
            type="button"
            className={`category-tab ${category === "internship" ? "active" : ""}`}
            onClick={() => {
              setCategory("internship");
              setQ("");
              fetchJobs("internship", "", location);
            }}
          >
            🎓 Student Internships
          </button>
          <button
            type="button"
            className={`category-tab ${category === "fresher" ? "active" : ""}`}
            onClick={() => {
              setCategory("fresher");
              setQ("");
              fetchJobs("fresher", "", location);
            }}
          >
            💼 Fresher Jobs (0-1 Yrs)
          </button>
          <button
            type="button"
            className={`category-tab ${category === "all" ? "active" : ""}`}
            onClick={() => {
              setCategory("all");
              setQ("");
              fetchJobs("all", "", location);
            }}
          >
            ⚡ All Listings
          </button>
        </div>
      </div>

      <div className="filters">
        <label>
          Search {category === "internship" ? "Internships" : "Jobs"}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
            placeholder={
              category === "internship"
                ? "e.g. React Intern, Python, UI/UX..."
                : "e.g. Junior Developer, Trainee Engineer..."
            }
          />
        </label>
        <label>
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchJobs()}
            placeholder="City, State, or Remote..."
          />
        </label>
        <button onClick={() => fetchJobs()} disabled={loading}>
          {loading ? "Searching..." : "Search Opportunities"}
        </button>
      </div>

      <div className="filter-pills">
        {currentPills.map((pill) => {
          const isAll = pill.startsWith("All");
          const isActive = isAll ? !q && !location : q === pill || location === pill;

          return (
            <button
              key={pill}
              type="button"
              className={`filter-pill ${isActive ? "active" : ""}`}
              onClick={() => {
                let newQ = q;
                let newLoc = location;
                if (isAll) {
                  newQ = "";
                  newLoc = "";
                } else if (pill === "Remote" || pill === "Chennai" || pill === "Bangalore" || pill === "Hyderabad") {
                  newLoc = location === pill ? "" : pill;
                } else {
                  newQ = q === pill ? "" : pill;
                }
                setQ(newQ);
                setLocation(newLoc);
                fetchJobs(category, newQ, newLoc);
              }}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {error && <div className="error">{error}</div>}
      {syncMessage && <div className="success">{syncMessage}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", margin: "4px 0" }}>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 600 }}>
          Showing <strong>{jobs.length}</strong> active {category === "internship" ? "internships" : "opportunities"}
        </div>
        <button
          type="button"
          disabled={syncing}
          onClick={handleSyncLive}
          style={{
            background: "#ffffff",
            border: "1px solid var(--royal-blue)",
            color: "var(--royal-blue)",
            fontSize: "13px",
            padding: "8px 16px",
            borderRadius: "10px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "var(--shadow-sm)"
          }}
        >
          {syncing ? "⏳ Scraping LinkedIn & Indeed..." : "⚡ Sync Real-Time Web Jobs"}
        </button>
      </div>

      <div className="cards">
        {jobs.map((j) => (
          <div key={j.id} className="card" onClick={() => onSelectJob(j.id)}>
            <div className="card-top">
              <div className="card-avatar">
                {j.company ? j.company.charAt(0).toUpperCase() : "J"}
              </div>
              <div>
                <div className="card-title">{j.title}</div>
                <div className="card-meta">
                  <span>{j.company}</span> • <span>{j.location}</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                <span className="card-type">{j.job_type}</span>
                {j.apply_url && (
                  <span style={{ fontSize: "11px", fontWeight: 700, background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 8px", borderRadius: "9999px" }}>
                    🌐 Live Web
                  </span>
                )}
                {j.deadline && (
                  <span className="card-deadline">
                    ⏳ {Math.max(1, Math.ceil((new Date(j.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d left
                  </span>
                )}
              </div>
              <span className="card-action">Apply Now →</span>
            </div>
          </div>
        ))}
      </div>

      {!loading && jobs.length === 0 && !error && (
        <div className="muted" style={{ textAlign: "center", padding: "40px 0" }}>
          No jobs found matching your criteria. Try clearing filters or searching another keyword.
        </div>
      )}
    </div>
  );
}

