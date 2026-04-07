"use client";

import AuthGuard from "../components/AuthGuard";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function formatCreatedDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/projects");

      if (Array.isArray(data)) {
        setProjects(data);
        return;
      }

      if (Array.isArray(data?.projects)) {
        setProjects(data.projects);
        return;
      }

      setProjects([]);
    } catch (requestError) {
      setError(requestError.message || "Failed to load projects.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleAddProject = async () => {
    setError("");
    setCreating(true);

    try {
      await fetchProjects();
    } catch (requestError) {
      setError(requestError.message || "Failed to load projects.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AuthGuard>
      <main className="dashboard-shell">
        <section className="dashboard-wrap">
          <header className="dashboard-head">
            <div>
              <h1>Projects</h1>
              <p className="auth-subtitle">Manage your DevOps projects</p>
            </div>

            <button
              type="button"
              className="add-project-btn"
              onClick={handleAddProject}
              disabled={creating}
            >
              {creating ? "Refreshing..." : "Refresh Projects"}
            </button>
          </header>

          {error ? <p className="dashboard-error">{error}</p> : null}

          {loading ? (
            <div className="dashboard-loading">Loading projects...</div>
          ) : (
            <div className="project-grid">
              {projects.length === 0 ? (
                <article className="project-card project-card-empty">
                  <h3>No projects yet</h3>
                  <p>Create your first project to get started.</p>
                </article>
              ) : (
                projects.map((project) => {
                  const projectId = project.id || project._id;

                  return (
                    <button
                      key={projectId}
                      type="button"
                      className="project-card"
                      onClick={() => router.push(`/project/${projectId}`)}
                    >
                      <h3>{project.name || "Untitled project"}</h3>
                      <p>Created {formatCreatedDate(project.createdAt || project.created_date)}</p>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}