import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";

export default function JobDetailPage({
  jobId,
  onApplied,
  onBack,
}: {
  jobId: number;
  onApplied: () => void;
  onBack: () => void;
}) {
  const [job, setJob] = useState<null | Awaited<ReturnType<typeof api.jobs.detail>>>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  async function load() {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.jobs.detail(jobId);
      setJob(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);



  async function handleApply(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    setApplying(true);
    setError(null);
    try {
      await api.applications.apply({ job_id: job.id, cover_letter: coverLetter });
      setCoverLetter("");
      onApplied();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Apply failed");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="page">
      <button className="linkbtn" onClick={onBack}>
        ← Back
      </button>

      {loading && <div className="muted">Loading opportunity details...</div>}
      {error && <div className="error">{error}</div>}

      {job && (
        <div className="detail-card">
          <div>
            <h2>{job.title}</h2>
            <div className="sub" style={{ marginTop: "6px" }}>
              <strong>{job.company}</strong> • {job.location} • <span className="card-type">{job.job_type}</span>
            </div>
            {job.deadline && (
              <div style={{ marginTop: "12px" }}>
                <span className="card-deadline">
                  ⏳ Application Deadline: {new Date(job.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} ({Math.max(1, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining)
                </span>
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f4f2eb", paddingTop: "16px" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700 }}>About this Opportunity</h3>
            <p className="desc">{job.description}</p>
          </div>

          <form onSubmit={handleApply} className="form" style={{ borderTop: "1px solid #f4f2eb", paddingTop: "20px" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700 }}>Apply for this Role</h3>
            <label>
              Why are you a good fit for this role? (Cover Note)
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Mention your college, skills, projects, and availability..."
                required
                rows={5}
              />
            </label>
            <button disabled={applying} style={{ alignSelf: "flex-start", minWidth: "160px" }}>
              {applying ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

