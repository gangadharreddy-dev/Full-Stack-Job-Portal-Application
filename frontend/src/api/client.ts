const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export type ApiError = {
  detail?: string;
  message?: string;
};

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await res.json()) as ApiError;
    } catch {
      // ignore
    }
    const detail = payload?.detail ?? payload?.message ?? `Request failed (${res.status})`;
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

export const api = {
  auth: {
    async register(full_name: string, email: string, phone_number: string, password: string) {
      // backend expects form fields (not JSON)
      const body = new URLSearchParams({ full_name, email, phone_number, password });
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!res.ok) {
        let payload: ApiError | undefined;
        try {
          payload = (await res.json()) as ApiError;
        } catch {
          // ignore
        }
        const detail = payload?.detail ?? payload?.message ?? `Register failed (${res.status})`;
        throw new Error(detail);
      }

      return (await res.json()) as { id: number; email: string; phone_number: string };
    },

    async login(email: string, password: string) {
      const body = new URLSearchParams({ username: email, password });
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!res.ok) {
        let payload: ApiError | undefined;
        try {
          payload = (await res.json()) as ApiError;
        } catch {
          // ignore
        }
        const detail = payload?.detail ?? payload?.message ?? `Login failed (${res.status})`;
        throw new Error(detail);
      }

      const data = (await res.json()) as { access_token: string; token_type: "bearer" };
      try {
        localStorage.setItem("token", data.access_token);
      } catch {
        // ignore
      }
      return data;
    },

    async me() {
      return request<{
        id: number;
        email: string;
        phone_number: string;
        full_name: string;
        is_admin: boolean;
      }>(
        "/api/auth/me"
      );
    },
  },

  jobs: {
    async list(params?: { q?: string; location?: string; job_type?: string }) {
      const url = new URL(`${API_BASE}/api/jobs`);
      if (params?.q) url.searchParams.set("q", params.q);
      if (params?.location) url.searchParams.set("location", params.location);
      if (params?.job_type) url.searchParams.set("job_type", params.job_type);

      const token = getToken();
      const res = await fetch(url.toString(), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        let payload: ApiError | undefined;
        try {
          payload = (await res.json()) as ApiError;
        } catch {
          // ignore
        }
        const detail = payload?.detail ?? payload?.message ?? `Jobs list failed (${res.status})`;
        throw new Error(detail);
      }

      return (await res.json()) as Array<{
        id: number;
        title: string;
        company: string;
        location: string;
        description: string;
        job_type: string;
        deadline?: string | null;
        apply_url?: string | null;
        created_at: string;
      }>;
    },

    async detail(job_id: number) {
      return request<{
        id: number;
        title: string;
        company: string;
        location: string;
        description: string;
        job_type: string;
        deadline?: string | null;
        apply_url?: string | null;
        created_at: string;
      }>(`/api/jobs/${job_id}`);
    },

    async syncLive() {
      return request<{ status: string; added_jobs: number; skipped_duplicates: number }>(
        "/api/jobs/sync-live",
        { method: "POST" }
      );
    },

    async clearAll() {
      return request<{ deleted_jobs: number; deleted_applications: number }>(
        "/api/jobs/clear-all",
        { method: "POST" }
      );
    },

    async create(payload: {
      title: string;
      company: string;
      location: string;
      description: string;
      job_type?: string;
    }) {
      return request<{ id: number }>("/api/jobs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },

  applications: {
    async apply(payload: { job_id: number; cover_letter: string; resume?: File | null }) {
      const token = getToken();
      const form = new FormData();
      form.append("job_id", String(payload.job_id));
      form.append("cover_letter", payload.cover_letter);
      if (payload.resume) {
        form.append("resume", payload.resume);
      }

      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!res.ok) {
        let payload2: ApiError | undefined;
        try { payload2 = (await res.json()) as ApiError; } catch { /* ignore */ }
        const detail = payload2?.detail ?? payload2?.message ?? `Apply failed (${res.status})`;
        throw new Error(detail);
      }

      return (await res.json()) as { id: number; resume_uploaded: boolean };
    },

    async mine() {
      return request<Array<{ id: number; job_id: number; cover_letter: string; created_at: string }>>(
        "/api/applications/mine"
      );
    },
  },
};
