import React, { useState, useEffect } from "react";
import { getExperience, createExperience, updateExperience, deleteExperience } from "../services/api";
import "./Experience.css";

function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    description: "",
    start_date: "",
    end_date: "",
    currently_working: false,
    company_url: "",
  });

  const fetchExperiences = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getExperience();
      if (response.data && response.data.success) {
        setExperiences(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setExperiences([]);
      }
    } catch (error) {
      console.error("Error fetching experience data:", error);
      let msg = "Failed to fetch experience records.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "currently_working") {
      setFormData((prev) => ({
        ...prev,
        currently_working: checked,
        end_date: checked ? "" : prev.end_date,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      company: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      company_url: "",
    });
    setEditingId(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleOpenEditModal = (item) => {
    setFormData({
      company: item.company || "",
      position: item.position || "",
      description: item.description || "",
      start_date: item.start_date ? item.start_date.slice(0, 10) : "",
      end_date: item.end_date ? item.end_date.slice(0, 10) : "",
      currently_working: Boolean(item.currently_working),
      company_url: item.company_url || "",
    });
    setEditingId(item.id);
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
      company: "",
      position: "",
      description: "",
      start_date: "",
      end_date: "",
      currently_working: false,
      company_url: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.company.trim() || !formData.position.trim()) {
      setErrorMessage("Company name and position title are required.");
      return;
    }

    const payload = {
      company: formData.company.trim(),
      position: formData.position.trim(),
      description: formData.description.trim(),
      start_date: formData.start_date || null,
      end_date: formData.currently_working ? null : formData.end_date || null,
      currently_working: Boolean(formData.currently_working),
      company_url: formData.company_url.trim(),
    };

    setActionLoading(true);

    try {
      if (isEditing && editingId) {
        const response = await updateExperience(editingId, payload);
        setSuccessMessage(response.data?.message || "Experience record updated successfully.");
      } else {
        const response = await createExperience(payload);
        setSuccessMessage(response.data?.message || "Experience record created successfully.");
      }
      handleCloseModal();
      fetchExperiences();
    } catch (error) {
      console.error("Error saving experience:", error);
      let msg = "Failed to save experience record.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this experience record?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteExperience(id);
      setSuccessMessage(response.data?.message || "Experience record deleted successfully.");
      fetchExperiences();
    } catch (error) {
      console.error("Error deleting experience:", error);
      let msg = "Failed to delete experience record.";
      if (error.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error.request) {
        msg = "Network Error: Could not connect to backend server at http://localhost:5000";
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="exp-container">
      <div className="exp-wrapper">
        {/* Header Bar */}
        <div className="exp-header-bar">
          <div className="exp-header">
            <span className="exp-badge">CMS Panel</span>
            <h1 className="exp-title">Work Experience Management</h1>
            <p className="exp-subtitle">
              Manage your career milestones, job roles, company links, and employment dates.
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Experience</span>
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
        <div className="exp-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading experience records...</span>
            </div>
          ) : experiences.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <h2 className="empty-title">No Work Experience Records Found</h2>
              <p className="empty-description">
                You haven't added any work history or experience details yet. Click below to add your first role.
              </p>
              <button className="btn-primary" onClick={handleOpenAddModal}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Your First Experience</span>
              </button>
            </div>
          ) : (
            /* Experience List */
            <div className="exp-list">
              {experiences.map((exp) => (
                <div key={exp.id || exp.company} className="exp-item-card">
                  <div className="exp-item-header">
                    <div className="exp-main-title">
                      <h3 className="exp-position">{exp.position}</h3>
                      <div className="exp-company-row">
                        {exp.company_url ? (
                          <a
                            href={exp.company_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="exp-company-link"
                          >
                            <span>{exp.company}</span>
                            <svg className="link-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        ) : (
                          <span>{exp.company}</span>
                        )}
                      </div>
                    </div>

                    <div className="exp-date-badge">
                      <span>
                        {formatDateLabel(exp.start_date) || "N/A"} -{" "}
                        {exp.currently_working
                          ? "Present"
                          : formatDateLabel(exp.end_date) || "N/A"}
                      </span>
                      {exp.currently_working && (
                        <span className="current-tag">Present</span>
                      )}
                    </div>
                  </div>

                  {exp.description && (
                    <p className="exp-description">{exp.description}</p>
                  )}

                  {/* Card Actions Footer */}
                  <div className="exp-card-actions">
                    <button
                      className="btn-danger btn-sm"
                      onClick={() => handleDelete(exp.id)}
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
                      onClick={() => handleOpenEditModal(exp)}
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
                {isEditing ? "Edit Work Experience" : "Add Work Experience"}
              </h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="exp-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="exp-position">Position Title *</label>
                  <input
                    id="exp-position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                    disabled={actionLoading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="exp-company">Company Name *</label>
                  <input
                    id="exp-company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g. Acme Corp"
                    disabled={actionLoading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="exp-company-url">Company Website URL</label>
                <input
                  id="exp-company-url"
                  name="company_url"
                  type="url"
                  value={formData.company_url}
                  onChange={handleInputChange}
                  placeholder="https://company.com"
                  disabled={actionLoading}
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="exp-start-date">Start Date</label>
                  <input
                    id="exp-start-date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    disabled={actionLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="exp-end-date">End Date</label>
                  <input
                    id="exp-end-date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    disabled={actionLoading || formData.currently_working}
                  />
                </div>
              </div>

              <label className="checkbox-group">
                <input
                  type="checkbox"
                  name="currently_working"
                  checked={formData.currently_working}
                  onChange={handleInputChange}
                  disabled={actionLoading}
                />
                <span className="checkbox-label">I am currently working in this role</span>
              </label>

              <div className="form-group">
                <label htmlFor="exp-description">Description / Key Responsibilities</label>
                <textarea
                  id="exp-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your achievements, responsibilities, technologies used..."
                  disabled={actionLoading}
                />
              </div>

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
                    <span>{isEditing ? "Update Experience" : "Save Experience"}</span>
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

export default Experience;
