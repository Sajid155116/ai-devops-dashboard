"use client";

import ProtectedLayout from "../../components/ProtectedLayout";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../lib/api";

function normalizeStatus(value) {
  const text = String(value || "").toLowerCase();
  return text === "success" ? "success" : "failed";
}

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

function getRawLogs(log) {
  const candidate = log.rawLogs || log.raw || log.logs || log.output;

  if (Array.isArray(candidate)) {
    return candidate.join("\n");
  }

  if (typeof candidate === "string") {
    return candidate;
  }

  if (candidate && typeof candidate === "object") {
    return JSON.stringify(candidate, null, 2);
  }

  return "No raw logs available.";
}

function isErrorLine(line) {
  return /(error|exception|failed|fatal|traceback)/i.test(line);
}

function splitLines(rawText) {
  if (!rawText) {
    return [];
  }

  return String(rawText).split(/\r?\n/);
}

export default function LogPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const logId = params?.id;
  const [logData, setLogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleBack = () => {
    const projectFromQuery = searchParams.get("projectId");
    const projectFromLog = logData?.projectId || logData?.project_id;
    const targetProjectId = projectFromQuery || projectFromLog;

    if (targetProjectId) {
      router.push(`/project/${targetProjectId}`);
      return;
    }

    router.push("/dashboard");
  };

  useEffect(() => {
    const fetchLog = async () => {
      if (!logId) {
        setError("Log ID is missing.");
        setLoading(false);
        return;
      }

      setError("");
      setLoading(true);

      try {
        const encodedId = encodeURIComponent(String(logId));
        const data = await apiRequest(`/logs/${encodedId}`);

        setLogData(data?.log || data || null);
      } catch (requestError) {
        setError(requestError.message || "Failed to load log details.");
        setLogData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [logId]);

  const status = normalizeStatus(logData?.status);
  const rawLogLines = useMemo(() => splitLines(getRawLogs(logData || {})), [logData]);
  const summary = logData?.summary || logData?.shortSummary || "No summary available.";
  const rootCause = logData?.rootCause || logData?.root_cause || "No root cause provided.";
  const fixSuggestion =
    logData?.fixSuggestion || logData?.fix_suggestion || "No fix suggestion provided.";

  return (
    <ProtectedLayout>
      <section className="dashboard-wrap log-detail-wrap">
        <button type="button" className="back-btn" onClick={handleBack} disabled={loading}>
          Back to Project
        </button>

        <header className="dashboard-head log-detail-head">
          <div>
            <h1>Log {logId}</h1>
            <p className="auth-subtitle">Detailed execution information</p>
          </div>
          <div className="log-meta">
            <span className={`log-status log-status-${status}`}>{status}</span>
            <span className="log-time">{formatTimestamp(logData?.timestamp || logData?.createdAt)}</span>
          </div>
        </header>

        {error ? <p className="dashboard-error">{error}</p> : null}

        {loading ? (
          <div className="dashboard-loading">Loading log...</div>
        ) : (
          <div className="log-detail-grid">
            <section className="detail-card ai-analysis-card">
              <h2>AI Analysis</h2>
              <p className="detail-line">
                <span>Summary:</span> {summary}
              </p>

              {status === "failed" ? (
                <>
                  <p className="detail-line">
                    <span>Root Cause:</span> {rootCause}
                  </p>
                  <p className="detail-line">
                    <span>Fix Suggestion:</span> {fixSuggestion}
                  </p>
                </>
              ) : null}
            </section>

            <section className="detail-card raw-logs-card">
              <h2>Raw Logs</h2>
              <div className="raw-log-box" role="region" aria-label="Raw logs">
                {rawLogLines.map((line, index) => (
                  <div key={`${index}-${line.slice(0, 16)}`} className={isErrorLine(line) ? "raw-log-line raw-log-error" : "raw-log-line"}>
                    {line || " "}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </section>
    </ProtectedLayout>
  );
}