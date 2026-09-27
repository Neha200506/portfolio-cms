import React, { useState, useEffect } from "react";
import { getSkills, createSkill, updateSkill, deleteSkill } from "../services/api";
import "./Skills.css";

const CATEGORY_OPTIONS = [
  "Programming",
  "Frontend",
  "Backend",
  "Database",
  "Cloud",
  "DevOps",
  "AI / ML",
  "Tools",
  "Other"
];

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    category: "Programming",
    customCategory: "",
    proficiency: 80,
    icon_url: "",
  });

  const fetchSkills = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await getSkills();
      if (response.data && response.data.success) {
        setSkills(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      let msg = "Failed to fetch skills.";
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
    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "proficiency" ? Number(value) : value,
    }));
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      category: "Programming",
      customCategory: "",
      proficiency: 80,
      icon_url: "",
    });
    setEditingId(null);
    setIsEditing(false);
    setIsModalOpen(true);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleOpenEditModal = (skill) => {
    const isPredefined = CATEGORY_OPTIONS.filter((c) => c !== "Other").includes(skill.category);
    setFormData({
      name: skill.name || "",
      category: isPredefined ? skill.category : "Other",
      customCategory: isPredefined ? "" : skill.category || "",
      proficiency: skill.proficiency !== undefined ? Number(skill.proficiency) : 80,
      icon_url: skill.icon_url || "",
    });
    setEditingId(skill.id);
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
      name: "",
      category: "Programming",
      customCategory: "",
      proficiency: 80,
      icon_url: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Skill name is required.");
      return;
    }

    const finalCategory =
      formData.category === "Other"
        ? formData.customCategory.trim()
        : formData.category.trim();

    if (formData.category === "Other" && !finalCategory) {
      setErrorMessage("Please enter a custom category.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: finalCategory || "General",
      proficiency: Math.min(100, Math.max(0, Number(formData.proficiency) || 0)),
      icon_url: formData.icon_url.trim(),
    };

    setActionLoading(true);

    try {
      if (isEditing && editingId) {
        const response = await updateSkill(editingId, payload);
        setSuccessMessage(response.data?.message || "Skill updated successfully.");
      } else {
        const response = await createSkill(payload);
        setSuccessMessage(response.data?.message || "Skill created successfully.");
      }
      handleCloseModal();
      fetchSkills();
    } catch (error) {
      console.error("Error saving skill:", error);
      let msg = "Failed to save skill.";
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
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const response = await deleteSkill(id);
      setSuccessMessage(response.data?.message || "Skill deleted successfully.");
      fetchSkills();
    } catch (error) {
      console.error("Error deleting skill:", error);
      let msg = "Failed to delete skill.";
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

  // Categories extraction for filter pills
  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))];

  const filteredSkills = selectedCategoryFilter === "All"
    ? skills
    : skills.filter((s) => s.category === selectedCategoryFilter);

  return (
    <div className="skills-container">
      <div className="skills-wrapper">
        {/* Header Bar */}
        <div className="skills-header-bar">
          <div className="skills-header">
            <span className="skills-badge">CMS Panel</span>
            <h1 className="skills-title">Skills Management</h1>
            <p className="skills-subtitle">
              Add, edit, and organize your technical skills and proficiencies.
            </p>
          </div>
          <button className="btn-primary" onClick={handleOpenAddModal}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Skill</span>
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

        {/* Category Filter Pills (if skills exist) */}
        {!loading && skills.length > 0 && categories.length > 1 && (
          <div className="category-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-filter-btn ${selectedCategoryFilter === cat ? "active" : ""}`}
                onClick={() => setSelectedCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Main Card */}
        <div className="skills-card">
          {loading ? (
            /* Loading State */
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span>Loading skills...</span>
            </div>
          ) : skills.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <h2 className="empty-title">No Skills Found</h2>
              <p className="empty-description">
                You haven't added any technical skills yet. Click below to add your first skill.
              </p>
              <button className="btn-primary" onClick={handleOpenAddModal}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Add Your First Skill</span>
              </button>
            </div>
          ) : (
            /* Skills Display Grid */
            <div className="skills-grid">
              {filteredSkills.map((skill) => (
                <div key={skill.id || skill.name} className="skill-item-card">
                  <div className="skill-item-header">
                    <div className="skill-icon-wrapper">
                      {skill.icon_url ? (
                        <img
                          src={skill.icon_url}
                          alt={skill.name}
                          className="skill-icon-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "block";
                            }
                          }}
                        />
                      ) : null}
                      <svg
                        className="skill-icon-fallback"
                        style={{ display: skill.icon_url ? "none" : "block" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>

                    <div className="skill-info">
                      <h3 className="skill-name">{skill.name}</h3>
                      {skill.category && (
                        <span className="skill-category-badge">{skill.category}</span>
                      )}
                    </div>
                  </div>

                  {/* Proficiency Bar */}
                  <div className="skill-proficiency-wrapper">
                    <div className="proficiency-label-row">
                      <span>Proficiency</span>
                      <span className="proficiency-percent">{skill.proficiency || 0}%</span>
                    </div>
                    <div className="proficiency-track">
                      <div
                        className="proficiency-fill"
                        style={{ width: `${Math.min(100, Math.max(0, skill.proficiency || 0))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="skill-card-actions">
                    <button
                      className="btn-icon-action"
                      title="Edit Skill"
                      onClick={() => handleOpenEditModal(skill)}
                      disabled={actionLoading}
                    >
                      <svg className="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      className="btn-icon-action danger"
                      title="Delete Skill"
                      onClick={() => handleDelete(skill.id)}
                      disabled={actionLoading}
                    >
                      <svg className="action-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Skill Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? "Edit Skill" : "Add Skill"}</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="skills-form">
              <div className="form-group">
                <label htmlFor="skill-name">Skill Name *</label>
                <input
                  id="skill-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. React.js, Node.js, Python"
                  disabled={actionLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="skill-category">Category</label>
                <select
                  id="skill-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  disabled={actionLoading}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {formData.category === "Other" && (
                <div className="form-group">
                  <label htmlFor="skill-custom-category">Enter custom category *</label>
                  <input
                    id="skill-custom-category"
                    name="customCategory"
                    type="text"
                    value={formData.customCategory}
                    onChange={handleInputChange}
                    placeholder="Enter custom category"
                    disabled={actionLoading}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="skill-proficiency">Proficiency (0 - 100%)</label>
                <div className="proficiency-slider-row">
                  <input
                    id="skill-proficiency"
                    name="proficiency"
                    type="range"
                    min="0"
                    max="100"
                    value={formData.proficiency}
                    onChange={handleInputChange}
                    disabled={actionLoading}
                  />
                  <span className="slider-value-badge">{formData.proficiency}%</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="skill-icon">Icon URL</label>
                <input
                  id="skill-icon"
                  name="icon_url"
                  type="url"
                  value={formData.icon_url}
                  onChange={handleInputChange}
                  placeholder="e.g. https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"
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
                    <span>{isEditing ? "Update Skill" : "Add Skill"}</span>
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


export default Skills;
