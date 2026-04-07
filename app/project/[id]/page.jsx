"use client";

import ProtectedLayout from "../../components/ProtectedLayout";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";

function formatTimestamp(value) {
  if (!value) {
    return "Unknown time";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown time";
  }

  return parsed.toLocaleString();
}

function normalizeStatus(value) {
  const text = String(value || "").toLowerCase();
  return text === "success" ? "success" : "failed";
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const queryProjectId = encodeURIComponent(String(projectId));
      const data = await apiRequest(`/logs?projectId=${queryProjectId}`);

      if (Array.isArray(data)) {
        setLogs(data);
        return;
      }

      if (Array.isArray(data?.logs)) {
        setLogs(data.logs);
        return;
      }

      setLogs([]);
    } catch (requestError) {
      setError(requestError.message || "Failed to load logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [projectId]);

  const filteredLogs = useMemo(() => {
    if (statusFilter === "all") {
      return logs;
    }

    return logs.filter((log) => normalizeStatus(log.status) === statusFilter);
  }, [logs, statusFilter]);

  return (
    <ProtectedLayout>
      <section className="dashboard-wrap">
        <button
          type="button"
          className="back-btn"
          onClick={() => router.push("/dashboard")}
          disabled={loading}
        >
          Back to Dashboard
        </button>

        <header className="dashboard-head project-head">
          <div>
            <h1>Project {projectId}</h1>
            <p className="auth-subtitle">Execution logs</p>
          </div>

          <div className="log-controls">
            <label htmlFor="statusFilter">Status</label>
            <select
              id="statusFilter"
              className="status-filter-select"
              value={statusFilter}
              disabled={loading}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </header>

        {error ? <p className="dashboard-error">{error}</p> : null}

        {loading ? (
          <div className="dashboard-loading">Loading logs...</div>
        ) : (
          <div className="log-list">
            {filteredLogs.length === 0 ? (
              <article className="log-card log-card-empty">
                <h3>No logs found</h3>
                <p>Try a different status filter or run a new project job.</p>
              </article>
            ) : (
              filteredLogs.map((log) => {
                const status = normalizeStatus(log.status);
                const logId = log.id || log._id;
                const summary = log.summary || log.shortSummary || log.message;

                return (
                  <button
                    key={logId}
                    type="button"
                    className="log-card"
                    onClick={() => router.push(`/log/${logId}?projectId=${encodeURIComponent(String(projectId))}`)}
                  >
                    <div className="log-top">
                      <span className={`log-status log-status-${status}`}>{status}</span>
                      <span className="log-time">{formatTimestamp(log.timestamp || log.createdAt)}</span>
                    </div>
                    <p className="log-summary">{summary || "No summary available"}</p>
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>
    </ProtectedLayout>
  );
}