import React, { useState, useEffect } from "react";
import API from "../services/api";
import "./Projects.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    technologies: "",
    github_url: "",
    live_url: "",
    featured: false,
  });

  const fetchProjects = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await API.get("/projects");
      if (response.data && response.data.success) {
        setProjects(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      let msg = "Failed to fetch projects.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      technologies: "",
      github_url: "",
      live_url: "",
      featured: false,
    });
    setEditingId(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleOpenEditModal = (project) => {
    let techStr = "";
    if (Array.isArray(project.technologies)) {
      techStr = project.technologies.join(", ");
    } else if (typeof project.technologies === "string") {
      techStr = project.technologies;
    }

    setFormData({
      title: project.title || "",
      description: project.description || "",
      image_url: project.image_url || "",
      technologies: techStr,
      github_url: project.github_url || "",
      live_url: project.live_url || "",
      featured: Boolean(project.featured),
    });
    setEditingId(project.id);
    setIsEditing(true);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      image_url: "",
      technologies: "",
      github_url: "",
      live_url: "",
      featured: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.title.trim()) {
      setErrorMessage("Project title is required.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url.trim(),
      technologies: formData.technologies.trim(),
      github_url: formData.github_url.trim(),
      live_url: formData.live_url.trim(),
      featured: Boolean(formData.featured),
    };

    setActionLoading(true);

    try {
      if (isEditing && editingId) {
        const response = await API.put(`/projects/${editingId}`, payload);
        setSuccessMessage(response.data?.message || "Project updated successfully.");
      } else {
        const response = await API.post("/projects", payload);
        setSuccessMessage(response.data?.message || "Project created successfully.");
      }
      handleCloseModal();
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      let msg = "Failed to save project.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await API.delete(`/projects/${id}`);
      setSuccessMessage(response.data?.message || "Project deleted successfully.");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      let msg = "Failed to delete project.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to render technologies as array/badges
  const renderTechBadges = (tech) => {
    if (!tech) return null;
    let list = [];
    if (Array.isArray(tech)) {
      list = tech;
    } else if (typeof tech === "string") {
      list = tech.split(",").map((t) => t.trim()).filter(Boolean);
    }
    return list.map((item, idx) => (
      <span key={idx} className="tech-badge">
        {item}
      </span>
    ));
  };

  return (
    <div className="projects-container">
      <div className="projects-wrapper">
        {/* Header Bar */}
        <div className="projects-header-bar">
          <div className="projects-header">
            <span className="projects-badge">CMS Panel</span>
            <h1 className="projects-title">Projects Management</h1>
            <p className="projects-subtitle">
              Showcase your portfolio projects, technologies, repositories, and live demos.
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Project</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="success-alert" role="status">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="error-alert" role="alert">
            <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="projects-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <h2 className="empty-title">No Projects Found</h2>
              <p className="empty-description">
                You haven't added any projects to your portfolio yet. Click below to add your first project.
              </p>
              <button className="btn-primary" onClick={handleOpenAddModal}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Your First Project</span>
              </button>
            </div>
          ) : (
            /* Projects Grid */
            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id || project.title} className="project-item-card">
                  {/* Banner Image */}
                  <div className="project-banner-container">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="project-banner-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="banner-fallback"
                      style={{ display: project.image_url ? "none" : "flex" }}
                    >
                      <svg className="banner-fallback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="banner-fallback-text">No Preview Image</span>
                    </div>

                    {project.featured && (
                      <span className="featured-badge">
                        ★ Featured
                      </span>
                    )}
                  </div>

                  {/* Card Content Body */}
                  <div className="project-card-body">
                    <h3 className="project-card-title">{project.title}</h3>
                    {project.description && (
                      <p className="project-card-description">{project.description}</p>
                    )}

                    {/* Technologies List */}
                    {project.technologies && (
                      <div className="project-tech-list">
                        {renderTechBadges(project.technologies)}
                      </div>
                    )}

                    {/* Links */}
                    <div className="project-links-row">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link-item"
                        >
                          <svg className="link-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                          </svg>
                          <span>Repository</span>
                        </a>
                      )}
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link-item"
                        >
                          <svg className="link-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          <span>Live Demo</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="project-card-footer">
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(project)}
                      disabled={actionLoading}
                    >
                      <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isEditing ? "Edit Project" : "Add New Project"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="projects-form">
              <div className="form-group">
                <label htmlFor="project-title">Project Title *</label>
                <input
                  id="project-title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. E-Commerce Platform"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe key features, architecture, and problem solved..."
                  disabled={actionLoading}
                />
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="project-image">Image URL</label>
                  <input
                    id="project-image"
                    name="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="e.g. https://example.com/project-screenshot.jpg"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="project-tech">Technologies (comma-separated)</label>
                  <input
                    id="project-tech"
                    name="technologies"
                    type="text"
                    value={formData.technologies}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, Express, PostgreSQL, Tailwind"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-github">GitHub Repository URL</label>
                  <input
                    id="project-github"
                    name="github_url"
                    type="url"
                    value={formData.github_url}
                    onChange={handleInputChange}
                    placeholder="https://github.com/username/repo"
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-live">Live Demo URL</label>
                  <input
                    id="project-live"
                    name="live_url"
                    type="url"
                    value={formData.live_url}
                    onChange={handleInputChange}
                    placeholder="https://myproject.com"
                    disabled={actionLoading}
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  disabled={actionLoading}
                />
                <span className="checkbox-label">Mark as Featured Project</span>
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>
                  {actionLoading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Update Project" : "Save Project"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
