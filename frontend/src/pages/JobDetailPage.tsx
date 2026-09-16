import { useEffect, useRef, useState } from "react";
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
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileChange(file: File | null) {
    setResumeError(null);
    if (!file) { setResume(null); return; }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx"].includes(ext ?? "")) {
      setResumeError("Only PDF, DOC, or DOCX files are allowed.");
      setResume(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File is too large. Maximum size is 5 MB.");
      setResume(null);
      return;
    }
    setResume(file);
  }

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    setApplying(true);
    setError(null);
    try {
      await api.applications.apply({ job_id: job.id, cover_letter: coverLetter, resume });
      setCoverLetter("");
      setResume(null);
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
          {job.apply_url && (
            <div style={{ background: "var(--blue-tint)", border: "1px solid var(--blue-tint-border)", borderRadius: "12px", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <strong style={{ color: "var(--royal-blue)", display: "block", fontSize: "15px" }}>🌐 Live External Opening (LinkedIn / Indeed)</strong>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>Direct official listing from the web. You can apply directly on the company site.</span>
              </div>
              <a
                href={job.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "var(--royal-blue)",
                  color: "#ffffff",
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: "10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(30,64,175,0.25)"
                }}
              >
                Apply on Official Site ↗
              </a>
            </div>
          )}

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

            {/* Resume Upload */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                📄 Upload Resume / CV <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(Optional · PDF, DOC, DOCX · Max 5 MB)</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: "none" }}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${resume ? "var(--royal-blue)" : "var(--panel-border)"}`,
                  borderRadius: "12px",
                  padding: "18px 20px",
                  cursor: "pointer",
                  background: resume ? "var(--blue-tint)" : "var(--bg-subtle)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ fontSize: "22px" }}>{resume ? "✅" : "📎"}</span>
                <div>
                  {resume ? (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--royal-blue)" }}>{resume.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {(resume.size / 1024).toFixed(1)} KB · Click to change
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>Click to upload your Resume / CV</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>PDF, DOC, or DOCX · Max 5 MB</div>
                    </>
                  )}
                </div>
                {resume && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setResume(null); }}
                    style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#ef4444" }}
                    title="Remove file"
                  >✕</button>
                )}
              </div>
              {resumeError && <div className="error" style={{ marginTop: "8px" }}>{resumeError}</div>}
            </div>

            <button disabled={applying} style={{ alignSelf: "flex-start", minWidth: "160px" }}>
              {applying ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>

        </div>
      )}
    </div>
  );
}

